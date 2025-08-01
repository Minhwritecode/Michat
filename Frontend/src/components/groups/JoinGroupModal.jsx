import React, { useState } from "react";
import { X, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import useGroupStore from "../../stores/useGroupStore";

const JoinGroupModal = ({ isOpen, onClose }) => {
    const { joinGroup, loading } = useGroupStore();
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inviteCode.trim()) {
            setError("Vui lòng nhập mã mời");
            return;
        }

        try {
            setError("");
            setSuccess("");
            await joinGroup(inviteCode.trim().toUpperCase());
            setSuccess("Tham gia nhóm thành công!");
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Lỗi khi tham gia nhóm");
        }
    };

    const handleClose = () => {
        setInviteCode("");
        setError("");
        setSuccess("");
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
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Tham gia nhóm</h2>
                            <p className="text-base-content/70 text-sm">
                                Nhập mã mời để tham gia nhóm
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Invite Code Input */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Mã mời</span>
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => {
                                setInviteCode(e.target.value.toUpperCase());
                                setError("");
                            }}
                            placeholder="Nhập mã mời (VD: ABC123)"
                            className="input input-bordered w-full text-center text-lg font-mono tracking-wider"
                            maxLength={8}
                            autoFocus
                        />
                        <p className="text-xs text-base-content/60 mt-1">
                            Mã mời thường có 6 ký tự
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle size={16} />
                            <span>{success}</span>
                        </div>
                    )}

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
                            disabled={loading || !inviteCode.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tham gia...
                                </>
                            ) : (
                                "Tham gia nhóm"
                            )}
                        </button>
                    </div>
                </form>

                {/* Help Text */}
                <div className="p-6 pt-0">
                    <div className="bg-base-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Làm thế nào để lấy mã mời?</h4>
                        <ul className="text-sm text-base-content/70 space-y-1">
                            <li>• Yêu cầu chủ nhóm hoặc quản trị viên chia sẻ mã mời</li>
                            <li>• Mã mời thường được hiển thị trong cài đặt nhóm</li>
                            <li>• Mã mời có thể được tạo lại nếu cần thiết</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinGroupModal; 