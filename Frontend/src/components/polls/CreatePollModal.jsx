import React, { useState } from "react";
import { X, Plus, Trash2, Clock, Settings, CheckSquare, Square, Loader2 } from "lucide-react";
import axios from "../../libs/axios";
import toast from "react-hot-toast";

const CreatePollModal = ({ isOpen, onClose, groupId, onPollCreated }) => {
    const [formData, setFormData] = useState({
        question: "",
        description: "",
        options: ["", ""],
        settings: {
            allowMultipleVotes: false,
            allowAnonymousVotes: false,
            showResultsBeforeVoting: false,
            allowVoteChange: true
        },
        expiresAt: null
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleOptionChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((option, i) => 
                i === index ? value : option
            )
        }));
    };

    const addOption = () => {
        if (formData.options.length < 10) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, ""]
            }));
        }
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            setFormData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSettingChange = (setting, value) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [setting]: value
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.question.trim()) {
            newErrors.question = "Câu hỏi không được để trống";
        }

        const validOptions = formData.options.filter(option => option.trim().length > 0);
        if (validOptions.length < 2) {
            newErrors.options = "Phải có ít nhất 2 lựa chọn";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const validOptions = formData.options.filter(option => option.trim().length > 0);
            
            const response = await axios.post("/polls/create", {
                groupId,
                question: formData.question.trim(),
                description: formData.description.trim(),
                options: validOptions,
                settings: formData.settings,
                expiresAt: formData.expiresAt
            });

            toast.success("Tạo thăm dò ý kiến thành công!");
            onPollCreated(response.data.data);
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi tạo thăm dò ý kiến");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            question: "",
            description: "",
            options: ["", ""],
            settings: {
                allowMultipleVotes: false,
                allowAnonymousVotes: false,
                showResultsBeforeVoting: false,
                allowVoteChange: true
            },
            expiresAt: null
        });
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
                        <h2 className="text-2xl font-bold">Tạo thăm dò ý kiến</h2>
                        <p className="text-base-content/70">
                            Tạo cuộc thăm dò ý kiến nhanh để thu thập phản hồi
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
                    {/* Question */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Câu hỏi *</span>
                        </label>
                        <input
                            type="text"
                            name="question"
                            value={formData.question}
                            onChange={handleInputChange}
                            placeholder="Nhập câu hỏi thăm dò..."
                            className={`input input-bordered w-full ${errors.question ? 'input-error' : ''}`}
                            maxLength={500}
                        />
                        {errors.question && (
                            <p className="text-error text-sm mt-1">{errors.question}</p>
                        )}
                        <p className="text-xs text-base-content/60 mt-1">
                            {formData.question.length}/500 ký tự
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
                            placeholder="Mô tả thêm về cuộc thăm dò (tùy chọn)..."
                            className="textarea textarea-bordered w-full h-24"
                            maxLength={1000}
                        />
                        <p className="text-xs text-base-content/60 mt-1">
                            {formData.description.length}/1000 ký tự
                        </p>
                    </div>

                    {/* Options */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Lựa chọn *</span>
                        </label>
                        <div className="space-y-3">
                            {formData.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Lựa chọn ${index + 1}`}
                                            className="input input-bordered w-full"
                                            maxLength={200}
                                        />
                                    </div>
                                    {formData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="btn btn-circle btn-sm btn-ghost text-error"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.options && (
                            <p className="text-error text-sm mt-2">{errors.options}</p>
                        )}
                        {formData.options.length < 10 && (
                            <button
                                type="button"
                                onClick={addOption}
                                className="btn btn-outline btn-sm mt-3"
                            >
                                <Plus size={16} />
                                Thêm lựa chọn
                            </button>
                        )}
                    </div>

                    {/* Settings */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Cài đặt</span>
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.allowMultipleVotes}
                                    onChange={(e) => handleSettingChange("allowMultipleVotes", e.target.checked)}
                                    className="checkbox checkbox-primary"
                                />
                                <div>
                                    <span className="font-medium">Cho phép chọn nhiều lựa chọn</span>
                                    <p className="text-sm text-base-content/70">
                                        Người dùng có thể chọn nhiều lựa chọn cùng lúc
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.allowAnonymousVotes}
                                    onChange={(e) => handleSettingChange("allowAnonymousVotes", e.target.checked)}
                                    className="checkbox checkbox-primary"
                                />
                                <div>
                                    <span className="font-medium">Bình chọn ẩn danh</span>
                                    <p className="text-sm text-base-content/70">
                                        Không hiển thị tên người bình chọn
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.showResultsBeforeVoting}
                                    onChange={(e) => handleSettingChange("showResultsBeforeVoting", e.target.checked)}
                                    className="checkbox checkbox-primary"
                                />
                                <div>
                                    <span className="font-medium">Hiển thị kết quả trước khi bình chọn</span>
                                    <p className="text-sm text-base-content/70">
                                        Người dùng có thể xem kết quả trước khi bình chọn
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.allowVoteChange}
                                    onChange={(e) => handleSettingChange("allowVoteChange", e.target.checked)}
                                    className="checkbox checkbox-primary"
                                />
                                <div>
                                    <span className="font-medium">Cho phép thay đổi bình chọn</span>
                                    <p className="text-sm text-base-content/70">
                                        Người dùng có thể thay đổi bình chọn của mình
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Expiration */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Thời gian kết thúc</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.expiresAt || ""}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                expiresAt: e.target.value
                            }))}
                            className="input input-bordered w-full"
                        />
                        <p className="text-xs text-base-content/60 mt-1">
                            Để trống nếu không muốn tự động kết thúc
                        </p>
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
                                "Tạo thăm dò ý kiến"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePollModal; 