import mongoose from "mongoose";

const StoryForwardSchema = new mongoose.Schema({
    storyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Story', 
        required: true 
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    targetType: { 
        type: String, 
        enum: ['user', 'group'], 
        required: true 
    },
    targetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    forwardedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

export default mongoose.model('StoryForward', StoryForwardSchema);