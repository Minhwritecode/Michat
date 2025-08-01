import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    votes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        votedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    options: [pollOptionSchema],
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    settings: {
        allowMultipleVotes: {
            type: Boolean,
            default: false
        },
        allowAnonymousVotes: {
            type: Boolean,
            default: false
        },
        showResultsBeforeVoting: {
            type: Boolean,
            default: false
        },
        allowVoteChange: {
            type: Boolean,
            default: true
        }
    },
    status: {
        type: String,
        enum: ["active", "closed", "expired"],
        default: "active"
    },
    expiresAt: {
        type: Date
    },
    totalVotes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
pollSchema.index({ groupId: 1, createdAt: -1 });
pollSchema.index({ createdBy: 1 });
pollSchema.index({ status: 1, expiresAt: 1 });

// Virtual for checking if poll is expired
pollSchema.virtual("isExpired").get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Virtual for total votes
pollSchema.virtual("totalVoteCount").get(function() {
    return this.options.reduce((total, option) => total + option.votes.length, 0);
});

// Methods
pollSchema.methods.hasUserVoted = function(userId) {
    return this.options.some(option => 
        option.votes.some(vote => vote.user.toString() === userId.toString())
    );
};

pollSchema.methods.getUserVotes = function(userId) {
    const userVotes = [];
    this.options.forEach((option, optionIndex) => {
        if (option.votes.some(vote => vote.user.toString() === userId.toString())) {
            userVotes.push(optionIndex);
        }
    });
    return userVotes;
};

pollSchema.methods.canUserVote = function(userId) {
    if (this.status !== "active") return false;
    if (this.isExpired) return false;
    
    if (!this.settings.allowMultipleVotes && this.hasUserVoted(userId)) {
        return false;
    }
    
    return true;
};

pollSchema.methods.vote = function(userId, optionIndexes) {
    if (!this.canUserVote(userId)) {
        throw new Error("User cannot vote on this poll");
    }

    // Remove existing votes if not allowing multiple votes
    if (!this.settings.allowMultipleVotes) {
        this.options.forEach(option => {
            option.votes = option.votes.filter(vote => 
                vote.user.toString() !== userId.toString()
            );
        });
    }

    // Add new votes
    optionIndexes.forEach(index => {
        if (index >= 0 && index < this.options.length) {
            const existingVote = this.options[index].votes.find(vote => 
                vote.user.toString() === userId.toString()
            );
            
            if (!existingVote) {
                this.options[index].votes.push({
                    user: userId,
                    votedAt: new Date()
                });
            }
        }
    });

    this.totalVotes = this.totalVoteCount;
    return this.save();
};

pollSchema.methods.getResults = function(includeVoterNames = false) {
    const totalVotes = this.totalVoteCount;
    
    return this.options.map(option => ({
        text: option.text,
        votes: option.votes.length,
        percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0,
        voters: includeVoterNames ? option.votes.map(vote => vote.user) : undefined
    }));
};

// Pre-save middleware
pollSchema.pre("save", function(next) {
    // Auto-expire polls
    if (this.expiresAt && new Date() > this.expiresAt && this.status === "active") {
        this.status = "expired";
    }
    next();
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll; 