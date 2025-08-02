import User from "../models/user.model.js";
import { generateToken } from "../libs/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from "../libs/cloudinary.js";
import Message from "../models/message.model.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            // generate jwt token here
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {

            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        // Check if it's a valid base64 image
        if (!profilePic.startsWith('data:image/')) {
            return res.status(400).json({ message: "Invalid image format" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: 'michat-profiles',
            resource_type: 'image'
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in update profile:", error);
        res.status(500).json({ message: "Failed to upload image. Please try again." });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Gửi lời mời kết bạn
export const addFriend = async (req, res) => {
    try {
        const userId = req.user._id;
        const targetId = req.params.userId;
        if (userId == targetId) return res.status(400).json({ message: "Không thể kết bạn với chính mình" });

        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if (!user || !target) return res.status(404).json({ message: "User not found" });
        if (user.friends.includes(targetId)) return res.status(400).json({ message: "Đã là bạn bè" });
        if (user.sentRequests.includes(targetId)) return res.status(400).json({ message: "Đã gửi lời mời" });

        user.sentRequests.push(targetId);
        target.friendRequests.push(userId);

        await user.save();
        await target.save();

        res.json({ message: "Đã gửi lời mời kết bạn" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi gửi lời mời kết bạn" });
    }
};

// Chấp nhận lời mời
export const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const targetId = req.params.userId;

        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if (!user || !target) return res.status(404).json({ message: "User not found" });
        if (!user.friendRequests.includes(targetId)) return res.status(400).json({ message: "Không có lời mời này" });

        user.friends.push(targetId);
        target.friends.push(userId);

        user.friendRequests = user.friendRequests.filter(id => id.toString() !== targetId);
        target.sentRequests = target.sentRequests.filter(id => id.toString() !== userId);

        await user.save();
        await target.save();

        res.json({ message: "Đã chấp nhận kết bạn" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi chấp nhận kết bạn" });
    }
};

// Từ chối lời mời
export const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const targetId = req.params.userId;

        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if (!user || !target) return res.status(404).json({ message: "User not found" });

        user.friendRequests = user.friendRequests.filter(id => id.toString() !== targetId);
        target.sentRequests = target.sentRequests.filter(id => id.toString() !== userId);

        await user.save();
        await target.save();

        res.json({ message: "Đã từ chối lời mời kết bạn" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi từ chối kết bạn" });
    }
};

// Huỷ lời mời đã gửi
export const cancelFriendRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const targetId = req.params.userId;

        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if (!user || !target) return res.status(404).json({ message: "User not found" });

        user.sentRequests = user.sentRequests.filter(id => id.toString() !== targetId);
        target.friendRequests = target.friendRequests.filter(id => id.toString() !== userId);

        await user.save();
        await target.save();

        res.json({ message: "Đã huỷ lời mời kết bạn" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi huỷ lời mời kết bạn" });
    }
};

// Lấy danh sách bạn bè và lời mời
export const getFriendsAndRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'fullName email profilePic')
            .populate('friendRequests', 'fullName email profilePic')
            .populate('sentRequests', 'fullName email profilePic');
        res.json({
            friends: user.friends,
            friendRequests: user.friendRequests,
            sentRequests: user.sentRequests
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách bạn bè/lời mời" });
    }
};

// Huỷ kết bạn
export const unfriend = async (req, res) => {
    try {
        const userId = req.user._id;
        const targetId = req.params.userId;
        const user = await User.findById(userId);
        const target = await User.findById(targetId);
        if (!user || !target) return res.status(404).json({ message: "User not found" });
        user.friends = user.friends.filter(id => id.toString() !== targetId);
        target.friends = target.friends.filter(id => id.toString() !== userId);
        await user.save();
        await target.save();
        res.json({ message: "Đã huỷ kết bạn" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi huỷ kết bạn" });
    }
};

export const updateUserLabel = async (req, res) => {
    try {
        const { userId } = req.params;
        const { label } = req.body;
        // Chỉ cho phép gán label cho người khác
        if (userId === req.user._id.toString()) return res.status(400).json({ message: "Không thể gán label cho chính mình" });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.label = label;
        await user.save();
        res.json({ message: "Đã cập nhật label" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật label" });
    }
};

// Helper: xác định label
function getUserLabel(loggedInUser, targetUser) {
    if (loggedInUser.friends?.includes(targetUser._id)) return "friend";
    if (loggedInUser.familyIds?.includes(targetUser._id)) return "family";
    if (loggedInUser.friendRequests?.includes(targetUser._id) || loggedInUser.sentRequests?.includes(targetUser._id)) return "stranger";
    return "stranger";
}

// Sửa getUsersForSidebar để trả về label
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const loggedInUser = await User.findById(loggedInUserId);
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        const usersWithLabel = filteredUsers.map(u => ({
            ...u.toObject(),
            label: getUserLabel(loggedInUser, u)
        }));
        res.status(200).json(usersWithLabel);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Sửa get profile trả về label
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        const loggedInUser = await User.findById(req.user._id);
        const label = getUserLabel(loggedInUser, user);
        res.json({ ...user.toObject(), label });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy profile" });
    }
};

// Thêm/xoá family member
export const toggleFamilyMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUser = await User.findById(req.user._id);
        if (!loggedInUser) return res.status(404).json({ message: "User not found" });

        const isFamily = loggedInUser.familyIds?.includes(userId);
        if (isFamily) {
            loggedInUser.familyIds = loggedInUser.familyIds.filter(id => id.toString() !== userId);
        } else {
            if (!loggedInUser.familyIds) loggedInUser.familyIds = [];
            loggedInUser.familyIds.push(userId);
        }
        await loggedInUser.save();
        res.json({ message: isFamily ? "Đã xoá khỏi gia đình" : "Đã thêm vào gia đình" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật gia đình" });
    }
};

// Lấy danh sách user với unreadCount
export const getUsersWithUnreadCount = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const loggedInUser = await User.findById(loggedInUserId);
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        // Tính unreadCount cho mỗi user
        const usersWithData = await Promise.all(filteredUsers.map(async (user) => {
            const unreadCount = await Message.countDocuments({
                senderId: user._id,
                receiverId: loggedInUserId,
                readBy: { $ne: loggedInUserId }
            });

            return {
                ...user.toObject(),
                label: getUserLabel(loggedInUser, user),
                unreadCount
            };
        }));

        res.status(200).json(usersWithData);
    } catch (error) {
        console.error("Error in getUsersWithUnreadCount: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Cập nhật biệt danh cá nhân
export const updateNickname = async (req, res) => {
    try {
        const { nickname } = req.body;
        const userId = req.user._id;
        if (typeof nickname !== "string" || nickname.length > 30) {
            return res.status(400).json({ message: "Biệt danh không hợp lệ" });
        }
        const user = await User.findByIdAndUpdate(
            userId,
            { nickname },
            { new: true }
        );
        res.status(200).json({ nickname: user.nickname });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật biệt danh" });
    }
};