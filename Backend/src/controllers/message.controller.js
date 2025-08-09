import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary, { uploadToCloudinary } from "../libs/cloudinary.js";
import { getReceiverSocketId, getIO } from "../libs/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).populate("senderId", "fullName profilePic");

        // Đánh dấu tin nhắn từ userToChatId là đã đọc
        await Message.updateMany(
            { senderId: userToChatId, receiverId: myId, readBy: { $ne: myId } },
            { $addToSet: { readBy: myId } }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, attachments, replyTo, emotion } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const messageData = {
            senderId,
            receiverId,
            text,
            replyTo,
            emotion: emotion || 'neutral'
        };

        // Handle file uploads
        if (attachments && attachments.length > 0) {
            const uploadedAttachments = [];
            for (const attachment of attachments) {
                const { type, filename, size } = attachment;
                const fileSrc = attachment.file || attachment.url;
                const isRemote = typeof fileSrc === "string" && /^https?:\/\//i.test(fileSrc);
                if (isRemote) {
                    uploadedAttachments.push({ type, url: fileSrc, filename, size });
                } else if (fileSrc) {
                    const uploadResponse = await uploadToCloudinary(fileSrc, `michat/${type || 'file'}`);
                    uploadedAttachments.push({
                        type,
                        url: uploadResponse.secure_url,
                        filename,
                        size
                    });
                }
            }
            messageData.attachments = uploadedAttachments;
        }

        const newMessage = new Message(messageData);
        await newMessage.save();

        // Populate sender info for real-time
        await newMessage.populate('senderId', 'fullName profilePic');

        const receiverSocketIds = getReceiverSocketId(receiverId);
        const io = getIO();
        if (io) {
            if (receiverSocketIds && receiverSocketIds.length > 0) {
                receiverSocketIds.forEach(socketId => {
                    io.to(socketId).emit("newMessage", newMessage);
                });
            }
            // Emit a light update for sidebar ordering
            io.emit("inboxActivity", {
                userIds: [senderId.toString(), receiverId.toString()],
                lastMessageAt: newMessage.createdAt
            });
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Add reaction to message
export const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Ensure array
        if (!Array.isArray(message.reactions)) message.reactions = [];

        // Toggle same emoji from same user; otherwise replace user's reaction
        const existing = message.reactions.find(r => r.userId.toString() === userId.toString());
        if (existing && existing.emoji === emoji) {
            // remove reaction
            message.reactions = message.reactions.filter(r => r.userId.toString() !== userId.toString());
        } else {
            message.reactions = message.reactions.filter(r => r.userId.toString() !== userId.toString());
            message.reactions.push({ userId, emoji });
        }
        await message.save();

        // Emit to all connected users
        const io = getIO();
        if (io) {
            const receiverId = message.receiverId ? message.receiverId.toString() : null;
            const senderId = message.senderId ? message.senderId.toString() : null;
            const receiverSocketIds = receiverId ? getReceiverSocketId(receiverId) : [];
            const senderSocketIds = senderId ? getReceiverSocketId(senderId) : [];
            const allSocketIds = [...(receiverSocketIds || []), ...(senderSocketIds || [])];
            allSocketIds.forEach(socketId => {
                io.to(socketId).emit("messageReaction", { messageId, reactions: message.reactions });
            });
            // If group message, also emit to group room
            if (message.groupId) {
                io.to(`group_${message.groupId.toString()}`).emit("messageReaction", { messageId, reactions: message.reactions });
            }
        }

        // Return populated reactions for client display
        const populated = await Message.findById(messageId).populate('reactions.userId', 'fullName profilePic');
        res.status(200).json(populated);
    } catch (error) {
        console.log("Error in addReaction controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Pin/Unpin message
export const togglePinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Check if user is sender or receiver
        if (message.senderId.toString() !== userId.toString() &&
            message.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        message.isPinned = !message.isPinned;
        await message.save();

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in togglePinMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Edit message
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Kiểm tra quyền chỉnh sửa
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only edit your own messages" });
        }

        message.text = text;
        message.isEdited = true;
        await message.save();

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in editMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Forward message to user or group
export const forwardMessage = async (req, res) => {
    try {
        const { messageId, targetType, targetId } = req.body;
        const senderId = req.user._id;

        // Get original message
        const originalMessage = await Message.findById(messageId).populate('senderId', 'fullName profilePic');
        if (!originalMessage) {
            return res.status(404).json({ error: "Original message not found" });
        }

        // Create forwarded message
        const forwardedMessageData = {
            senderId,
            text: `Forwarded: ${originalMessage.text || ''}`,
            attachments: originalMessage.attachments || [],
            forwardFrom: originalMessage._id,
            isForwarded: true
        };

        // Set receiver based on target type
        if (targetType === 'user') {
            forwardedMessageData.receiverId = targetId;
        } else if (targetType === 'group') {
            forwardedMessageData.groupId = targetId;
        } else {
            return res.status(400).json({ error: "Invalid target type" });
        }

        const newMessage = new Message(forwardedMessageData);
        await newMessage.save();

        // Populate sender info for real-time
        await newMessage.populate('senderId', 'fullName profilePic');

        // Send real-time notification
        const io = getIO();
        if (targetType === 'user' && io) {
            const receiverSocketIds = getReceiverSocketId(targetId);
            if (receiverSocketIds && receiverSocketIds.length > 0) {
                receiverSocketIds.forEach(socketId => {
                    io.to(socketId).emit("newMessage", newMessage);
                });
            }
        } else if (targetType === 'group' && io) {
            // Emit to group members (implement group socket logic)
            io.to(`group_${targetId}`).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in forwardMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Kiểm tra quyền xóa (chỉ owner mới được xóa)
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only delete your own messages" });
        }

        await Message.findByIdAndDelete(messageId);

        // Emit real-time notification
        const io = getIO();
        if (io) {
            const receiverSocketIds = getReceiverSocketId(message.receiverId.toString());
            const senderSocketIds = getReceiverSocketId(message.senderId.toString());

            const allSocketIds = [...(receiverSocketIds || []), ...(senderSocketIds || [])];
            allSocketIds.forEach(socketId => {
                io.to(socketId).emit("messageDeleted", { messageId });
            });
        }

        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if user is the receiver
        if (message.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to mark this message as read" });
        }

        // Add user to readBy array if not already there
        if (!message.readBy.includes(userId)) {
            message.readBy.push(userId);
            await message.save();
        }

        res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get read receipts for a message
export const getReadReceipts = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId).populate('readBy', 'fullName profilePic');
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if user is the sender
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to view read receipts" });
        }

        res.status(200).json({ readBy: message.readBy });
    } catch (error) {
        console.error("Error getting read receipts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Mark all messages from a user as read
export const markAllMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const userId = req.user._id;

        // Update all unread messages from this sender
        const result = await Message.updateMany(
            {
                senderId: senderId,
                receiverId: userId,
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId }
            }
        );

        res.status(200).json({
            message: "All messages marked as read",
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error marking all messages as read:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
