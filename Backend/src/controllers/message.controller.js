import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../libs/cloudinary.js";
import { getReceiverSocketId, io } from "../libs/socket.js";

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
        const { text, attachments, replyTo } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const messageData = {
            senderId,
            receiverId,
            text,
            replyTo
        };

        // Handle file uploads
        if (attachments && attachments.length > 0) {
            const uploadedAttachments = [];

            for (const attachment of attachments) {
                const { file, type, filename, size } = attachment;

                // Upload to Cloudinary
                const uploadResponse = await cloudinary.uploader.upload(file, {
                    folder: `michat/${type}`,
                    resource_type: type === 'video' ? 'video' : 'image',
                    allowed_formats: type === 'document' ? ['pdf', 'doc', 'docx', 'txt'] : undefined
                });

                uploadedAttachments.push({
                    type,
                    url: uploadResponse.secure_url,
                    filename,
                    size
                });
            }

            messageData.attachments = uploadedAttachments;
        }

        const newMessage = new Message(messageData);
        await newMessage.save();

        // Populate sender info for real-time
        await newMessage.populate('senderId', 'fullName profilePic');

        const receiverSocketIds = getReceiverSocketId(receiverId);
        if (receiverSocketIds && receiverSocketIds.length > 0) {
            receiverSocketIds.forEach(socketId => {
                io.to(socketId).emit("newMessage", newMessage);
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

        // Remove existing reaction from this user
        message.reactions = message.reactions.filter(reaction =>
            reaction.userId.toString() !== userId.toString()
        );

        // Add new reaction
        message.reactions.push({ userId, emoji });
        await message.save();

        // Emit to all connected users
        const receiverSocketIds = getReceiverSocketId(message.receiverId.toString());
        const senderSocketIds = getReceiverSocketId(message.senderId.toString());

        const allSocketIds = [...(receiverSocketIds || []), ...(senderSocketIds || [])];
        allSocketIds.forEach(socketId => {
            io.to(socketId).emit("messageReaction", { messageId, reactions: message.reactions });
        });

        res.status(200).json(message);
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

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        message.text = text;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        // Emit to all connected users
        const receiverSocketIds = getReceiverSocketId(message.receiverId.toString());
        const senderSocketIds = getReceiverSocketId(message.senderId.toString());

        const allSocketIds = [...(receiverSocketIds || []), ...(senderSocketIds || [])];
        allSocketIds.forEach(socketId => {
            io.to(socketId).emit("messageEdited", { messageId, text, editedAt: message.editedAt });
        });

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in editMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
