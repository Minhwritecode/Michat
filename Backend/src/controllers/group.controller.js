import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../libs/cloudinary.js";
import { ApiError } from "../libs/utils.js";

// Create a new group
export const createGroup = async (req, res, next) => {
    try {
        const { name, description, privacy, avatar } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!name || name.trim().length === 0) {
            throw new ApiError(400, "Tên nhóm không được để trống");
        }

        // Handle avatar upload
        let avatarUrl = "";
        if (avatar) {
            const result = await uploadToCloudinary(avatar, "group-avatars");
            avatarUrl = result.secure_url;
        }

        // Create group
        const group = new Group({
            name: name.trim(),
            description: description?.trim() || "",
            privacy: privacy || "private",
            avatar: avatarUrl,
            owner: userId,
            members: [{ user: userId, role: "admin" }]
        });

        // Generate invite code
        group.generateInviteCode();

        await group.save();

        // Populate owner and members
        await group.populate([
            { path: "owner", select: "username fullName avatar" },
            { path: "members.user", select: "username fullName avatar" }
        ]);

        res.status(201).json({
            success: true,
            message: "Tạo nhóm thành công",
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Get user's groups
export const getUserGroups = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, search = "" } = req.query;

        const query = {
            "members.user": userId,
            "members.isActive": true
        };

        if (search) {
            query.$text = { $search: search };
        }

        const groups = await Group.find(query)
            .populate("owner", "username fullName avatar")
            .populate("members.user", "username fullName avatar")
            .sort({ lastActivity: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Group.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                groups,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalGroups: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get group details
export const getGroupDetails = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId)
            .populate("owner", "username fullName avatar")
            .populate("admins", "username fullName avatar")
            .populate("members.user", "username fullName avatar");

        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isMember(userId)) {
            throw new ApiError(403, "Bạn không phải thành viên của nhóm này");
        }

        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Update group
export const updateGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { name, description, privacy, avatar, settings } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isAdmin(userId)) {
            throw new ApiError(403, "Bạn không có quyền chỉnh sửa nhóm này");
        }

        // Handle avatar upload
        if (avatar && avatar !== group.avatar) {
            const result = await uploadToCloudinary(avatar, "group-avatars");
            group.avatar = result.secure_url;
        }

        // Update fields
        if (name) group.name = name.trim();
        if (description !== undefined) group.description = description.trim();
        if (privacy) group.privacy = privacy;
        if (settings) group.settings = { ...group.settings, ...settings };

        await group.save();

        await group.populate([
            { path: "owner", select: "username fullName avatar" },
            { path: "members.user", select: "username fullName avatar" }
        ]);

        res.status(200).json({
            success: true,
            message: "Cập nhật nhóm thành công",
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Add member to group
export const addMember = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { userIds } = req.body;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.canInviteMembers(currentUserId)) {
            throw new ApiError(403, "Bạn không có quyền thêm thành viên");
        }

        // Check if group is full
        const currentMemberCount = group.members.filter(m => m.isActive).length;
        if (currentMemberCount + userIds.length > group.settings.maxMembers) {
            throw new ApiError(400, "Nhóm đã đạt giới hạn thành viên");
        }

        // Validate users exist
        const users = await User.find({ _id: { $in: userIds } });
        if (users.length !== userIds.length) {
            throw new ApiError(400, "Một số người dùng không tồn tại");
        }

        // Add members
        const newMembers = userIds.map(userId => ({
            user: userId,
            role: "member",
            joinedAt: new Date(),
            isActive: true
        }));

        // Filter out existing members
        const existingMemberIds = group.members.map(m => m.user.toString());
        const uniqueNewMembers = newMembers.filter(m => 
            !existingMemberIds.includes(m.user.toString())
        );

        if (uniqueNewMembers.length === 0) {
            throw new ApiError(400, "Tất cả người dùng đã là thành viên của nhóm");
        }

        group.members.push(...uniqueNewMembers);
        await group.save();

        await group.populate([
            { path: "owner", select: "username fullName avatar" },
            { path: "members.user", select: "username fullName avatar" }
        ]);

        res.status(200).json({
            success: true,
            message: `Đã thêm ${uniqueNewMembers.length} thành viên mới`,
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Remove member from group
export const removeMember = async (req, res, next) => {
    try {
        const { groupId, memberId } = req.params;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isAdmin(currentUserId)) {
            throw new ApiError(403, "Bạn không có quyền xóa thành viên");
        }

        // Prevent removing owner
        if (group.owner.toString() === memberId) {
            throw new ApiError(400, "Không thể xóa chủ nhóm");
        }

        // Prevent removing yourself if you're not owner
        if (currentUserId.toString() === memberId && !group.isOwner(currentUserId)) {
            throw new ApiError(400, "Bạn không thể tự xóa mình khỏi nhóm");
        }

        const memberIndex = group.members.findIndex(m => 
            m.user.toString() === memberId && m.isActive
        );

        if (memberIndex === -1) {
            throw new ApiError(404, "Thành viên không tồn tại trong nhóm");
        }

        group.members[memberIndex].isActive = false;
        await group.save();

        await group.populate([
            { path: "owner", select: "username fullName avatar" },
            { path: "members.user", select: "username fullName avatar" }
        ]);

        res.status(200).json({
            success: true,
            message: "Đã xóa thành viên khỏi nhóm",
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Join group by invite code
export const joinGroupByCode = async (req, res, next) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user._id;

        if (!inviteCode) {
            throw new ApiError(400, "Mã mời không được để trống");
        }

        const group = await Group.findOne({ inviteCode });
        if (!group) {
            throw new ApiError(404, "Mã mời không hợp lệ");
        }

        if (group.isMember(userId)) {
            throw new ApiError(400, "Bạn đã là thành viên của nhóm này");
        }

        // Check if group is full
        const currentMemberCount = group.members.filter(m => m.isActive).length;
        if (currentMemberCount >= group.settings.maxMembers) {
            throw new ApiError(400, "Nhóm đã đạt giới hạn thành viên");
        }

        // Add member
        group.members.push({
            user: userId,
            role: "member",
            joinedAt: new Date(),
            isActive: true
        });

        await group.save();

        await group.populate([
            { path: "owner", select: "username fullName avatar" },
            { path: "members.user", select: "username fullName avatar" }
        ]);

        res.status(200).json({
            success: true,
            message: "Tham gia nhóm thành công",
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Generate new invite code
export const generateInviteCode = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.canInviteMembers(userId)) {
            throw new ApiError(403, "Bạn không có quyền tạo mã mời");
        }

        const newCode = group.generateInviteCode();
        await group.save();

        res.status(200).json({
            success: true,
            message: "Tạo mã mời thành công",
            data: { inviteCode: newCode }
        });
    } catch (error) {
        next(error);
    }
};

// Leave group
export const leaveGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isMember(userId)) {
            throw new ApiError(400, "Bạn không phải thành viên của nhóm này");
        }

        // Prevent owner from leaving
        if (group.isOwner(userId)) {
            throw new ApiError(400, "Chủ nhóm không thể rời nhóm. Hãy chuyển quyền sở hữu trước");
        }

        const memberIndex = group.members.findIndex(m => 
            m.user.toString() === userId.toString() && m.isActive
        );

        if (memberIndex !== -1) {
            group.members[memberIndex].isActive = false;
            await group.save();
        }

        res.status(200).json({
            success: true,
            message: "Đã rời khỏi nhóm"
        });
    } catch (error) {
        next(error);
    }
};

// Delete group
export const deleteGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isOwner(userId)) {
            throw new ApiError(403, "Chỉ chủ nhóm mới có thể xóa nhóm");
        }

        await Group.findByIdAndDelete(groupId);

        res.status(200).json({
            success: true,
            message: "Đã xóa nhóm thành công"
        });
    } catch (error) {
        next(error);
    }
};

// Get group members
export const getGroupMembers = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId)
            .populate("members.user", "username fullName avatar email");

        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isMember(userId)) {
            throw new ApiError(403, "Bạn không phải thành viên của nhóm này");
        }

        const activeMembers = group.members.filter(m => m.isActive);

        res.status(200).json({
            success: true,
            data: {
                members: activeMembers,
                totalMembers: activeMembers.length,
                maxMembers: group.settings.maxMembers
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update member role
export const updateMemberRole = async (req, res, next) => {
    try {
        const { groupId, memberId } = req.params;
        const { role } = req.body;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isOwner(currentUserId)) {
            throw new ApiError(403, "Chỉ chủ nhóm mới có thể thay đổi vai trò");
        }

        if (group.owner.toString() === memberId) {
            throw new ApiError(400, "Không thể thay đổi vai trò của chủ nhóm");
        }

        const memberIndex = group.members.findIndex(m => 
            m.user.toString() === memberId && m.isActive
        );

        if (memberIndex === -1) {
            throw new ApiError(404, "Thành viên không tồn tại");
        }

        group.members[memberIndex].role = role;
        await group.save();

        await group.populate([
            { path: "owner", select: "username fullName avatar" },
            { path: "members.user", select: "username fullName avatar" }
        ]);

        res.status(200).json({
            success: true,
            message: "Cập nhật vai trò thành công",
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Toggle member chat permission
export const toggleMemberChat = async (req, res, next) => {
    try {
        const { groupId, memberId } = req.params;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Nhóm không tồn tại");
        }

        if (!group.isAdmin(currentUserId)) {
            throw new ApiError(403, "Bạn không có quyền thay đổi quyền chat");
        }

        if (group.owner.toString() === memberId) {
            throw new ApiError(400, "Không thể thay đổi quyền chat của chủ nhóm");
        }

        const memberIndex = group.members.findIndex(m => 
            m.user.toString() === memberId && m.isActive
        );

        if (memberIndex === -1) {
            throw new ApiError(404, "Thành viên không tồn tại");
        }

        // Toggle chat permission
        group.members[memberIndex].canChat = !group.members[memberIndex].canChat;
        await group.save();

        await group.populate([
            { path: "owner", select: "username fullName avatar" },
            { path: "members.user", select: "username fullName avatar" }
        ]);

        res.status(200).json({
            success: true,
            message: group.members[memberIndex].canChat 
                ? "Đã cho phép thành viên chat" 
                : "Đã tắt quyền chat của thành viên",
            data: group
        });
    } catch (error) {
        next(error);
    }
};

// Đổi biệt danh thành viên trong nhóm
export const updateMemberNickname = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const { nickname } = req.body;
        const currentUserId = req.user._id;
        if (typeof nickname !== "string" || nickname.length > 30) {
            return res.status(400).json({ message: "Biệt danh không hợp lệ" });
        }
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Nhóm không tồn tại" });
        if (!group.isAdmin(currentUserId)) return res.status(403).json({ message: "Bạn không có quyền đổi biệt danh thành viên" });
        const member = group.members.find(m => m.user.toString() === userId);
        if (!member) return res.status(404).json({ message: "Thành viên không tồn tại" });
        member.nickname = nickname;
        await group.save();
        res.status(200).json({ nickname });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật biệt danh thành viên" });
    }
};
