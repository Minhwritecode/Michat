import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        friendRequests: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        sentRequests: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        familyIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        // Nhãn quan hệ dùng cho filter (family, bestie, coworker, friend, stranger)
        label: {
            type: String,
            enum: ["family", "bestie", "coworker", "friend", "stranger", null],
            default: null
        },
        // Nhãn quan hệ theo TỪNG người (per-friend label), chỉ lưu trên user đăng nhập
        relationLabels: {
            type: Map,
            of: {
                type: String,
                enum: ["family", "bestie", "coworker", "friend", "stranger"],
                default: undefined
            },
            default: {}
        },
        // Thêm trường nickname cho user
        nickname: {
            type: String,
            default: ""
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;