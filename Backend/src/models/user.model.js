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