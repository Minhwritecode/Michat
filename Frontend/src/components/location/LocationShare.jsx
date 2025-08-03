import React, { useState, useEffect } from "react";
import { 
    MapPin, 
    Navigation, 
    Clock, 
    Users, 
    Share2, 
    X, 
    Loader2,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import axios from "../../libs/axios";
import toast from "react-hot-toast";

const LocationShare = ({ isOpen, onClose, receiverId = null, groupId = null }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [duration, setDuration] = useState(1); // hours
    const [address, setAddress] = useState("");

    useEffect(() => {
        if (isOpen) {
            getCurrentLocation();
        }
    }, [isOpen]);

    const getCurrentLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Trình duyệt không hỗ trợ định vị");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                
                setLocation({
                    latitude,
                    longitude,
                    accuracy
                });

                // Get address from coordinates
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();
                    
                    if (data.display_name) {
                        setAddress(data.display_name);
                    }
                } catch (error) {
                    console.error("Error getting address:", error);
                }

                setLoading(false);
            },
            (error) => {
                let errorMessage = "Không thể lấy vị trí hiện tại";
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Bạn cần cho phép truy cập vị trí";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Thông tin vị trí không khả dụng";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Hết thời gian lấy vị trí";
                        break;
                }
                
                setError(errorMessage);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    const handleShareLocation = async () => {
        if (!location) return;

        setLoading(true);
        try {
            const locationData = {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                isLive,
                address: address ? {
                    formatted: address
                } : undefined
            };

            if (receiverId) {
                locationData.receiverId = receiverId;
            } else if (groupId) {
                locationData.groupId = groupId;
            }

            if (isLive && duration) {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + duration);
                locationData.expiresAt = expiresAt.toISOString();
            }

            await axios.post("/location/share", locationData);

            toast.success(
                isLive 
                    ? `Đã chia sẻ vị trí trực tiếp trong ${duration} giờ`
                    : "Đã chia sẻ vị trí"
            );
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi chia sẻ vị trí");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setLocation(null);
        setError(null);
        setIsLive(false);
        setDuration(1);
        setAddress("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-content p-2 rounded-full">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Chia sẻ vị trí</h2>
                            <p className="text-base-content/70 text-sm">
                                Chia sẻ vị trí hiện tại của bạn
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-circle btn-sm btn-ghost"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Location Status */}
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-base-content/70">Đang lấy vị trí...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-error" />
                            <p className="text-error font-medium mb-2">Lỗi định vị</p>
                            <p className="text-base-content/70 text-sm mb-4">{error}</p>
                            <button
                                onClick={getCurrentLocation}
                                className="btn btn-outline btn-sm"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : location ? (
                        <div className="space-y-4">
                            {/* Location Info */}
                            <div className="bg-base-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={16} className="text-success" />
                                    <span className="font-medium">Vị trí hiện tại</span>
                                </div>
                                
                                {address && (
                                    <p className="text-sm text-base-content/70 mb-2">
                                        {address}
                                    </p>
                                )}
                                
                                <div className="text-xs text-base-content/60 space-y-1">
                                    <div>Tọa độ: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</div>
                                    <div>Độ chính xác: ±{Math.round(location.accuracy)}m</div>
                                </div>
                            </div>

                            {/* Live Location Toggle */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isLive}
                                        onChange={(e) => setIsLive(e.target.checked)}
                                        className="checkbox checkbox-primary"
                                    />
                                    <div>
                                        <span className="font-medium">Chia sẻ vị trí trực tiếp</span>
                                        <p className="text-sm text-base-content/70">
                                            Cập nhật vị trí theo thời gian thực
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Duration for Live Location */}
                            {isLive && (
                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">Thời gian chia sẻ</span>
                                    </label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="select select-bordered w-full"
                                    >
                                        <option value={1}>1 giờ</option>
                                        <option value={2}>2 giờ</option>
                                        <option value={4}>4 giờ</option>
                                        <option value={8}>8 giờ</option>
                                        <option value={24}>24 giờ</option>
                                    </select>
                                </div>
                            )}

                            {/* Recipient Info */}
                            <div className="bg-base-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Users size={14} />
                                    <span>
                                        Chia sẻ cho: {receiverId ? "Người dùng" : "Nhóm"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleClose}
                            className="btn btn-outline flex-1"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleShareLocation}
                            disabled={!location || loading}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang chia sẻ...
                                </>
                            ) : (
                                <>
                                    <Share2 size={16} />
                                    Chia sẻ vị trí
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationShare; 