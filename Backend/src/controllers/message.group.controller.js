import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import cloudinary, { uploadToCloudinary } from "../libs/cloudinary.js";
import { ApiError } from "../libs/utils.js";
import { getIO, getReceiverSocketId } from "../libs/socket.js";

export const sendGroupMessage = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { text, attachments = [], replyTo, privateTo, emotion } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isMember(userId)) {
            throw new ApiError(403, "Bạn không phải thành viên nhóm này");
        }

        if (!group.canChat(userId)) {
            throw new ApiError(403, "Bạn không có quyền gửi tin nhắn trong nhóm này");
        }

        // Chuẩn bị dữ liệu tin nhắn
        const messageData = {
            senderId: userId,
            groupId: groupId,
            text,
            replyTo,
            messageType: privateTo ? "group_private" : "group",
            emotion: emotion || 'neutral'
        };

        if (privateTo) {
            // validate privateTo is a member of the group
            const isTargetMember = group.members.some(m => m.user.toString() === privateTo && m.isActive);
            if (!isTargetMember) {
                throw new ApiError(400, "Người nhận riêng không thuộc nhóm này hoặc không hoạt động");
            }
            messageData.privateTo = privateTo;
        }

        // Upload file đính kèm nếu có
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

        const message = new Message(messageData);

        await message.save();

        // Populate sender for consistency with direct messages
        await message.populate('senderId', 'fullName profilePic');

        // Cập nhật lastActivity của nhóm
        group.lastActivity = new Date();
        await group.save();

        // Broadcast to all active group members
        try {
            const io = getIO && getIO();
            if (io) {
                io.to(`group:${groupId}`).emit("group:message:new", { groupId });
            }
        } catch {}

        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

export const getGroupMessages = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isMember(userId)) {
            throw new ApiError(403, "Bạn không phải thành viên nhóm này");
        }

        const messages = await Message.find({ groupId: groupId })
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("senderId", "username fullName avatar")
            .populate("replyTo")
            .populate({ path: "poll", populate: [{ path: "createdBy", select: "username fullName avatar" }, { path: "options.votes.user", select: "username fullName avatar" }] });

        // Augment poll with user-specific computed fields so the client can render and allow voting
        const messagesWithPollComputed = messages.map((msg) => {
            const msgObj = msg.toObject();
            if (msg.poll) {
                const pollDoc = msg.poll; // Mongoose document
                try {
                    msgObj.poll = {
                        ...pollDoc.toObject(),
                        userVotes: pollDoc.getUserVotes(userId),
                        hasVoted: pollDoc.hasUserVoted(userId),
                        canVote: pollDoc.canUserVote(userId),
                        results: pollDoc.getResults(pollDoc.settings.allowAnonymousVotes === false)
                    };
                } catch {}
            }
            return msgObj;
        });

        const total = await Message.countDocuments({ groupId: groupId });

        res.status(200).json({
            success: true,
            data: {
                messages: messagesWithPollComputed,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalMessages: total
                }
            }
        });
    } catch (error) {
        next(error);
    }
};