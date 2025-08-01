import mongoose from "mongoose";

const e2eeKeySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    publicKey: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    fingerprint: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
e2eeKeySchema.index({ userId: 1, isActive: 1 });
e2eeKeySchema.index({ fingerprint: 1 });

const sessionKeySchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    sessionKey: {
        type: String,
        required: true
    },
    encryptedSessionKey: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
sessionKeySchema.index({ conversationId: 1, isActive: 1 });
sessionKeySchema.index({ participants: 1 });
sessionKeySchema.index({ expiresAt: 1 });

const E2EEKey = mongoose.model("E2EEKey", e2eeKeySchema);
const SessionKey = mongoose.model("SessionKey", sessionKeySchema);

export { E2EEKey, SessionKey }; 