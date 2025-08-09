import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    media: { 
        type: String,
        validate: {
            validator: function(v) {
                // Validate URL format
                return /^(https?:\/\/).+\.(jpg|jpeg|png|gif|mp4|mov|avi)$/i.test(v);
            },
            message: props => `${props.value} không phải là URL media hợp lệ!`
        }
    },
    text: { 
        type: String,
        maxlength: [500, "Story text không được vượt quá 500 ký tự"]
    },
    privacy: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public"
    },
    reactions: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true 
        },
        emoji: { 
            type: String,
            required: true
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    replies: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true 
        },
        text: { 
            type: String,
            required: true,
            maxlength: [200, "Reply không được vượt quá 200 ký tự"]
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    views: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true 
        },
        viewedAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    forwards: {
        type: Number,
        default: 0
    },
    expiredAt: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(v) {
                // ExpiredAt phải sau thời điểm hiện tại
                return v > new Date();
            },
            message: "Thời gian hết hạn phải trong tương lai"
        }
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate để lấy thông tin người dùng
storySchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Index cho các trường thường xuyên truy vấn
storySchema.index({ userId: 1 });
storySchema.index({ expiredAt: 1 });
storySchema.index({ createdAt: -1 });
storySchema.index({ privacy: 1 });
storySchema.index({ "reactions.userId": 1 });
storySchema.index({ "views.userId": 1 });

// Middleware tự động xóa sau khi hết hạn
storySchema.post('save', function(doc, next) {
    const now = new Date();
    const expiresIn = doc.expiredAt - now;
    
    if (expiresIn > 0) {
        setTimeout(async () => {
            try {
                await mongoose.model('Story').deleteOne({ _id: doc._id });
                console.log(`Story ${doc._id} đã tự động xóa sau khi hết hạn`);
            } catch (err) {
                console.error(`Lỗi khi tự động xóa story ${doc._id}:`, err);
            }
        }, expiresIn);
    }
    
    next();
});

// Phương thức kiểm tra xem story còn hiệu lực không
storySchema.methods.isActive = function() {
    return new Date(this.expiredAt) > new Date();
};

// Phương thức thêm view
storySchema.methods.addView = async function(userId) {
    if (!this.views.some(view => view.userId.equals(userId))) {
        this.views.push({ userId });
        await this.save();
    }
    return this;
};

// Phương thức thêm reaction
storySchema.methods.addReaction = async function(userId, emoji) {
    // Xóa reaction cũ nếu có
    this.reactions = this.reactions.filter(r => !r.userId.equals(userId));
    
    // Thêm reaction mới
    if (emoji) {
        this.reactions.push({ userId, emoji });
    }
    
    await this.save();
    return this;
};

// Phương thức thêm reply
storySchema.methods.addReply = async function(userId, text) {
    this.replies.push({ userId, text });
    await this.save();
    return this;
};

const Story = mongoose.model("Story", storySchema);
export default Story;