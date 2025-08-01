import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
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
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        formatted: String
    },
    placeName: {
        type: String,
        trim: true
    },
    accuracy: {
        type: Number,
        min: 0,
        max: 100
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    isLive: {
        type: Boolean,
        default: false
    },
    messageType: {
        type: String,
        enum: ["direct", "group"],
        default: "direct"
    }
}, {
    timestamps: true
});

// Indexes
locationSchema.index({ senderId: 1, receiverId: 1 });
locationSchema.index({ groupId: 1, createdAt: -1 });
locationSchema.index({ expiresAt: 1 });
locationSchema.index({ coordinates: "2dsphere" });

// Virtual for checking if location is expired
locationSchema.virtual("isExpired").get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Virtual for formatted coordinates
locationSchema.virtual("formattedCoordinates").get(function() {
    return `${this.coordinates.latitude.toFixed(6)}, ${this.coordinates.longitude.toFixed(6)}`;
});

// Methods
locationSchema.methods.getDistance = function(lat, lng) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
    const dLng = (lng - this.coordinates.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

locationSchema.methods.isNearby = function(lat, lng, radiusKm = 1) {
    return this.getDistance(lat, lng) <= radiusKm;
};

// Pre-save middleware
locationSchema.pre("save", function(next) {
    // Set default expiration for live locations (24 hours)
    if (this.isLive && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    next();
});

const Location = mongoose.model("Location", locationSchema);

export default Location; 