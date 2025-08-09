import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
    },
    avatar: {
        type: String,
        default: ""
    },
    privacy: {
        type: String,
        enum: ["public", "private", "readonly"],
        default: "private"
    },
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ["member", "admin"],
            default: "member"
        },
        canChat: {
            type: Boolean,
            default: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        },
        // Thêm trường nickname cho từng thành viên
        nickname: {
            type: String,
            default: ""
        }
    }],
    settings: {
        allowMemberInvite: {
            type: Boolean,
            default: true
        },
        allowMemberEdit: {
            type: Boolean,
            default: false
        },
        allowMemberDelete: {
            type: Boolean,
            default: false
        },
        allowMemberChat: {
            type: Boolean,
            default: true
        },
        maxMembers: {
            type: Number,
            default: 100
        }
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
groupSchema.index({ name: "text", description: "text" });
groupSchema.index({ inviteCode: 1 });
groupSchema.index({ "members.user": 1 });
groupSchema.index({ owner: 1 });

// Virtual for member count
groupSchema.virtual("memberCount").get(function () {
    return this.members.filter(member => member.isActive).length;
});

// Methods
groupSchema.methods.isMember = function (userId) {
    return this.members.some(member =>
        member.user.toString() === userId.toString() && member.isActive
    );
};

groupSchema.methods.isAdmin = function (userId) {
    return this.owner.toString() === userId.toString() ||
        this.admins.some(admin => admin.toString() === userId.toString()) ||
        this.members.some(member =>
            member.user.toString() === userId.toString() &&
            member.role === "admin" &&
            member.isActive
        );
};

groupSchema.methods.isOwner = function (userId) {
    return this.owner.toString() === userId.toString();
};

groupSchema.methods.canInviteMembers = function (userId) {
    return this.isAdmin(userId) ||
        (this.settings.allowMemberInvite && this.isMember(userId));
};

groupSchema.methods.canChat = function (userId) {
    const member = this.members.find(m =>
        m.user.toString() === userId.toString() && m.isActive
    );
    return member ? member.canChat && this.settings.allowMemberChat : false;
};

// Generate invite code
groupSchema.methods.generateInviteCode = function () {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.inviteCode = code;
    return code;
};

// Pre-save middleware
groupSchema.pre("save", function (next) {
    if (this.isModified("members") || this.isNew) {
        this.lastActivity = new Date();
    }
    next();
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
