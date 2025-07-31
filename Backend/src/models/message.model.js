import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        // File attachments
        attachments: [{
            type: {
                type: String,
                enum: ['image', 'video', 'audio', 'document', 'gif'],
                required: true
            },
            url: {
                type: String,
                required: true
            },
            filename: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true
            },
            duration: {
                type: Number,
                default: 0
            }
        }],
        // Emoji reactions
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
        // Reply to another message
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        // Message status
        isPinned: {
            type: Boolean,
            default: false
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date
        },
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
