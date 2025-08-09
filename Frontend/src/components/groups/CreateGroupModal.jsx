import React, { useState } from "react";
import { X, Upload, Users, Lock, Globe, EyeOff, Loader2 } from "lucide-react";
import useGroupStore from "../../stores/useGroupStore";

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { createGroup, loading } = useGroupStore();
    // Removed unused variable 'authUser'

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        privacy: "private",
        avatar: null
    });
    const [avatarPreview, setAvatarPreview] = useState("");
    const [errors, setErrors] = useState({});

    const privacyOptions = [
        {
            value: "private",
            label: "Riêng tư",
            description: "Chỉ thành viên mới có thể thấy và tham gia",
            icon: <Lock size={16} />
        },
        {
            value: "public",
            label: "Công khai",
            description: "Ai cũng có thể tìm thấy và tham gia",
            icon: <Globe size={16} />
        },
        {
            value: "readonly",
            label: "Chỉ đọc",
            description: "Thành viên chỉ có thể xem tin nhắn",
            icon: <EyeOff size={16} />
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setErrors(prev => ({
                    ...prev,
                    avatar: "Vui lòng chọn file hình ảnh"
                }));
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    avatar: "Kích thước file không được vượt quá 5MB"
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                avatar: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            setErrors(prev => ({
                ...prev,
                avatar: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Tên nhóm không được để trống";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Tên nhóm phải có ít nhất 3 ký tự";
        } else if (formData.name.trim().length > 100) {
            newErrors.name = "Tên nhóm không được vượt quá 100 ký tự";
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Mô tả không được vượt quá 500 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const groupData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                privacy: formData.privacy
            };

            if (formData.avatar) {
                groupData.avatar = avatarPreview;
            }

            await createGroup(groupData);
            handleClose();
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    const handleClose = () => {
        setFormData({
            name: "",
            description: "",
            privacy: "private",
            avatar: null
        });
        setAvatarPreview("");
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <div>
                        <h2 className="text-2xl font-bold">Tạo nhóm mới</h2>
                        <p className="text-base-content/70">
                            Tạo nhóm trò chuyện với bạn bè và đồng nghiệp
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-circle btn-sm btn-ghost"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar Upload */}
                    <div className="text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Users size={32} className="text-base-content/50" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-primary text-primary-content p-2 rounded-full cursor-pointer hover:bg-primary-focus transition-colors">
                                <Upload size={16} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {errors.avatar && (
                            <p className="text-error text-sm mt-2">{errors.avatar}</p>
                        )}
                    </div>

                    {/* Group Name */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Tên nhóm *</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nhập tên nhóm..."
                            className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                            maxLength={100}
                        />
                        {errors.name && (
                            <p className="text-error text-sm mt-1">{errors.name}</p>
                        )}
                        <p className="text-xs text-base-content/60 mt-1">
                            {formData.name.length}/100 ký tự
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Mô tả</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả về nhóm (tùy chọn)..."
                            className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
                            maxLength={500}
                        />
                        {errors.description && (
                            <p className="text-error text-sm mt-1">{errors.description}</p>
                        )}
                        <p className="text-xs text-base-content/60 mt-1">
                            {formData.description.length}/500 ký tự
                        </p>
                    </div>

                    {/* Privacy Settings */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Quyền riêng tư</span>
                        </label>
                        <div className="space-y-3">
                            {privacyOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                        formData.privacy === option.value
                                            ? "border-primary bg-primary/5"
                                            : "border-base-300 hover:border-base-400"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="privacy"
                                        value={option.value}
                                        checked={formData.privacy === option.value}
                                        onChange={handleInputChange}
                                        className="radio radio-primary mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {option.icon}
                                            <span className="font-medium">{option.label}</span>
                                        </div>
                                        <p className="text-sm text-base-content/70">
                                            {option.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-outline flex-1"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                "Tạo nhóm"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
