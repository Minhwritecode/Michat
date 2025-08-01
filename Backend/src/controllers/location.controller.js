import Location from "../models/location.model.js";
import Group from "../models/group.model.js";
import { ApiError } from "../libs/utils.js";

// Share location
export const shareLocation = async (req, res, next) => {
    try {
        const { 
            receiverId, 
            groupId, 
            latitude, 
            longitude, 
            address, 
            placeName, 
            accuracy, 
            isLive = false 
        } = req.body;
        const userId = req.user._id;

        // Validate coordinates
        if (!latitude || !longitude) {
            throw new ApiError(400, "Tọa độ vị trí không hợp lệ");
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new ApiError(400, "Tọa độ vị trí không hợp lệ");
        }

        // Validate recipient
        if (!receiverId && !groupId) {
            throw new ApiError(400, "Phải chỉ định người nhận hoặc nhóm");
        }

        if (receiverId && groupId) {
            throw new ApiError(400, "Chỉ có thể chia sẻ cho một người hoặc một nhóm");
        }

        // Check group membership if sharing to group
        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) {
                throw new ApiError(404, "Nhóm không tồn tại");
            }

            if (!group.isMember(userId)) {
                throw new ApiError(403, "Bạn không phải thành viên của nhóm này");
            }
        }

        // Create location share
        const location = new Location({
            senderId: userId,
            receiverId,
            groupId,
            coordinates: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            address: address || {},
            placeName: placeName?.trim(),
            accuracy: accuracy ? parseFloat(accuracy) : undefined,
            isLive,
            messageType: groupId ? "group" : "direct"
        });

        await location.save();

        // Populate sender info
        await location.populate("senderId", "username fullName avatar");

        res.status(201).json({
            success: true,
            message: "Chia sẻ vị trí thành công",
            data: location
        });
    } catch (error) {
        next(error);
    }
};

// Get location history
export const getLocationHistory = async (req, res, next) => {
    try {
        const { receiverId, groupId } = req.query;
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        // Validate recipient
        if (!receiverId && !groupId) {
            throw new ApiError(400, "Phải chỉ định người nhận hoặc nhóm");
        }

        // Build query
        const query = {
            $or: [
                { senderId: userId, receiverId },
                { senderId: receiverId, receiverId: userId }
            ]
        };

        if (groupId) {
            query.groupId = groupId;
            delete query.$or;
            query.groupId = groupId;
        }

        const locations = await Location.find(query)
            .populate("senderId", "username fullName avatar")
            .populate("receiverId", "username fullName avatar")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Location.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                locations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalLocations: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get nearby locations
export const getNearbyLocations = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 5, groupId } = req.query;
        const userId = req.user._id;

        // Validate coordinates
        if (!latitude || !longitude) {
            throw new ApiError(400, "Tọa độ vị trí không hợp lệ");
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radiusKm = parseFloat(radius);

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new ApiError(400, "Tọa độ vị trí không hợp lệ");
        }

        // Build query
        const query = {
            coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radiusKm * 1000 // Convert to meters
                }
            },
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        };

        if (groupId) {
            query.groupId = groupId;
        }

        const locations = await Location.find(query)
            .populate("senderId", "username fullName avatar")
            .populate("receiverId", "username fullName avatar")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Add distance information
        const locationsWithDistance = locations.map(location => ({
            ...location,
            distance: location.getDistance ? location.getDistance(lat, lng) : null
        }));

        res.status(200).json({
            success: true,
            data: locationsWithDistance
        });
    } catch (error) {
        next(error);
    }
};

// Stop live location sharing
export const stopLiveLocation = async (req, res, next) => {
    try {
        const { locationId } = req.params;
        const userId = req.user._id;

        const location = await Location.findById(locationId);
        if (!location) {
            throw new ApiError(404, "Vị trí không tồn tại");
        }

        // Check ownership
        if (location.senderId.toString() !== userId.toString()) {
            throw new ApiError(403, "Bạn không có quyền dừng chia sẻ vị trí này");
        }

        if (!location.isLive) {
            throw new ApiError(400, "Vị trí này không phải là chia sẻ trực tiếp");
        }

        // Set expiration to now
        location.expiresAt = new Date();
        await location.save();

        res.status(200).json({
            success: true,
            message: "Đã dừng chia sẻ vị trí trực tiếp"
        });
    } catch (error) {
        next(error);
    }
};

// Delete location
export const deleteLocation = async (req, res, next) => {
    try {
        const { locationId } = req.params;
        const userId = req.user._id;

        const location = await Location.findById(locationId);
        if (!location) {
            throw new ApiError(404, "Vị trí không tồn tại");
        }

        // Check ownership
        if (location.senderId.toString() !== userId.toString()) {
            throw new ApiError(403, "Bạn không có quyền xóa vị trí này");
        }

        await Location.findByIdAndDelete(locationId);

        res.status(200).json({
            success: true,
            message: "Đã xóa vị trí"
        });
    } catch (error) {
        next(error);
    }
}; 