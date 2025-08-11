import Poll from "../models/poll.model.js";
import Group from "../models/group.model.js";
import { ApiError } from "../libs/utils.js";
import Message from "../models/message.model.js";
import { getIO } from "../libs/socket.js";

// Create a new poll
export const createPoll = async (req, res, next) => {
    try {
        const { groupId, question, description, options, settings, expiresAt } = req.body;
        const userId = req.user._id;

        // Validate group membership
        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isMember(userId)) {
            throw new ApiError(403, "Bạn không phải thành viên của nhóm này");
        }

        // Validate input
        if (!question || question.trim().length === 0) {
            throw new ApiError(400, "Câu hỏi không được để trống");
        }

        if (!options || options.length < 2) {
            throw new ApiError(400, "Phải có ít nhất 2 lựa chọn");
        }

        if (options.length > 10) {
            throw new ApiError(400, "Tối đa 10 lựa chọn");
        }

        // Validate options
        const validOptions = options.filter(option => 
            option && option.trim && option.trim().length > 0
        );

        if (validOptions.length < 2) {
            throw new ApiError(400, "Phải có ít nhất 2 lựa chọn hợp lệ");
        }

        // Create poll
        const poll = new Poll({
            question: question.trim(),
            description: description?.trim() || "",
            options: validOptions.map(option => ({ text: option.trim() })),
            groupId,
            createdBy: userId,
            settings: {
                allowMultipleVotes: settings?.allowMultipleVotes || false,
                allowAnonymousVotes: settings?.allowAnonymousVotes || false,
                showResultsBeforeVoting: settings?.showResultsBeforeVoting || false,
                allowVoteChange: settings?.allowVoteChange !== false
            },
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });

        await poll.save();

        // Populate creator info
        await poll.populate("createdBy", "username fullName avatar");

        // Also create a group message referencing this poll so it appears in chat
        try {
            const message = await Message.create({
                senderId: userId,
                groupId,
                text: "", // poll-only message
                messageType: "group",
                poll: poll._id,
            });
            await message.populate("senderId", "fullName profilePic");

            // Broadcast lightweight event to clients if socket available
            const io = getIO && getIO();
            if (io) {
                io.emit("group:message:new", { groupId, messageId: message._id });
            }
        } catch {}

        res.status(201).json({
            success: true,
            message: "Tạo thăm dò ý kiến thành công",
            data: poll
        });
    } catch (error) {
        next(error);
    }
};

// Get polls for a group
export const getGroupPolls = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 10, status = "all" } = req.query;
        const userId = req.user._id;

        // Validate group membership
        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isMember(userId)) {
            throw new ApiError(403, "Bạn không phải thành viên của nhóm này");
        }

        // Build query
        const query = { groupId };
        if (status !== "all") {
            query.status = status;
        }

        const polls = await Poll.find(query)
            .populate("createdBy", "username fullName avatar")
            .populate("options.votes.user", "username fullName avatar")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Poll.countDocuments(query);

        // Add user vote info to each poll
        const pollsWithUserVotes = polls.map(poll => ({
            ...poll,
            userVotes: poll.getUserVotes ? poll.getUserVotes(userId) : [],
            hasVoted: poll.hasUserVoted ? poll.hasUserVoted(userId) : false,
            canVote: poll.canUserVote ? poll.canUserVote(userId) : false
        }));

        res.status(200).json({
            success: true,
            data: {
                polls: pollsWithUserVotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPolls: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get poll details
export const getPollDetails = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const userId = req.user._id;

        const poll = await Poll.findById(pollId)
            .populate("createdBy", "username fullName avatar")
            .populate("options.votes.user", "username fullName avatar")
            .populate("groupId", "name");

        if (!poll) {
            throw new ApiError(404, "Thăm dò ý kiến không tồn tại");
        }

        // Check group membership
        const group = await Group.findById(poll.groupId);
        if (!group || !group.isMember(userId)) {
            throw new ApiError(403, "Bạn không có quyền xem thăm dò ý kiến này");
        }

        // Add user vote info
        const pollWithUserInfo = {
            ...poll.toObject(),
            userVotes: poll.getUserVotes(userId),
            hasVoted: poll.hasUserVoted(userId),
            canVote: poll.canUserVote(userId),
            results: poll.getResults(poll.settings.allowAnonymousVotes === false)
        };

        res.status(200).json({
            success: true,
            data: pollWithUserInfo
        });
    } catch (error) {
        next(error);
    }
};

// Vote on a poll
export const voteOnPoll = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const { optionIndexes } = req.body;
        const userId = req.user._id;

        const poll = await Poll.findById(pollId)
            .populate("createdBy", "username fullName avatar")
            .populate("options.votes.user", "username fullName avatar");

        if (!poll) {
            throw new ApiError(404, "Thăm dò ý kiến không tồn tại");
        }

        // Check group membership
        const group = await Group.findById(poll.groupId);
        if (!group || !group.isMember(userId)) {
            throw new ApiError(403, "Bạn không có quyền bình chọn");
        }

        // Validate option indexes
        if (!Array.isArray(optionIndexes) || optionIndexes.length === 0) {
            throw new ApiError(400, "Phải chọn ít nhất một lựa chọn");
        }

        if (!poll.settings.allowMultipleVotes && optionIndexes.length > 1) {
            throw new ApiError(400, "Chỉ được chọn một lựa chọn");
        }

        // Validate option indexes are within range
        const validIndexes = optionIndexes.filter(index => 
            index >= 0 && index < poll.options.length
        );

        if (validIndexes.length === 0) {
            throw new ApiError(400, "Lựa chọn không hợp lệ");
        }

        // Vote
        await poll.vote(userId, validIndexes);

        // Get updated poll
        const updatedPoll = await Poll.findById(pollId)
            .populate("createdBy", "username fullName avatar")
            .populate("options.votes.user", "username fullName avatar");

        const pollWithUserInfo = {
            ...updatedPoll.toObject(),
            userVotes: updatedPoll.getUserVotes(userId),
            hasVoted: updatedPoll.hasUserVoted(userId),
            canVote: updatedPoll.canUserVote(userId),
            results: updatedPoll.getResults(updatedPoll.settings.allowAnonymousVotes === false)
        };

        res.status(200).json({
            success: true,
            message: "Bình chọn thành công",
            data: pollWithUserInfo
        });
    } catch (error) {
        next(error);
    }
};

// Close a poll
export const closePoll = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const userId = req.user._id;

        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new ApiError(404, "Thăm dò ý kiến không tồn tại");
        }

        // Check permissions (only creator or group admin can close)
        const group = await Group.findById(poll.groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (poll.createdBy.toString() !== userId.toString() && !group.isAdmin(userId)) {
            throw new ApiError(403, "Bạn không có quyền đóng thăm dò ý kiến này");
        }

        poll.status = "closed";
        await poll.save();

        res.status(200).json({
            success: true,
            message: "Đã đóng thăm dò ý kiến",
            data: poll
        });
    } catch (error) {
        next(error);
    }
};

// Delete a poll
export const deletePoll = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const userId = req.user._id;

        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new ApiError(404, "Thăm dò ý kiến không tồn tại");
        }

        // Check permissions (only creator or group admin can delete)
        const group = await Group.findById(poll.groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (poll.createdBy.toString() !== userId.toString() && !group.isAdmin(userId)) {
            throw new ApiError(403, "Bạn không có quyền xóa thăm dò ý kiến này");
        }

        await Poll.findByIdAndDelete(pollId);

        res.status(200).json({
            success: true,
            message: "Đã xóa thăm dò ý kiến"
        });
    } catch (error) {
        next(error);
    }
}; 