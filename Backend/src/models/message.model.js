import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    // For private messages within groups
    privateTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        trim: true
    },
    attachments: [{
        type: {
            type: String,
            enum: ["image", "gif", "video", "audio", "document"],
        },
        url: String,
        filename: String,
        size: Number,
        duration: Number,
        thumbnail: String,
        format: String,
        caption: String
    }],
    image: {
        type: String
    },
    file: {
        type: String
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    emotion: {
        type: String,
        enum: ["neutral", "happy", "love", "sad", "angry", "excited", "special"],
        default: "neutral"
    },
    forwardedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    editedAt: {
        type: Date
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        emoji: {
            type: String,
            required: true
        }
    }],
    // For group messages
    messageType: {
        type: String,
        enum: ["direct", "group", "group_private"],
        default: "direct"
    }
}, {
    timestamps: true
});

// Index for efficient querying
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, groupId: 1, privateTo: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
