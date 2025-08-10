import React, { useState } from "react";
import { 
    BarChart3, 
    Users, 
    Clock, 
    CheckCircle, 
    XCircle, 
    MoreVertical,
    Trash2,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import axios from "../../libs/axios";
import toast from "react-hot-toast";

const PollCard = ({ poll, onVote, onDelete }) => {
    const { authUser } = useAuthStore();
    const [selectedOptions, setSelectedOptions] = useState(poll.userVotes || []);
    const [showResults, setShowResults] = useState(
        poll.hasVoted || poll.settings.showResultsBeforeVoting
    );
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const isCreator = poll.createdBy._id === authUser._id;
    const isExpired = poll.status === "expired" || poll.status === "closed";
    const canVote = poll.canVote && !isExpired;

    const handleOptionClick = (optionIndex) => {
        if (!canVote) return;

        if (poll.settings.allowMultipleVotes) {
            setSelectedOptions(prev => 
                prev.includes(optionIndex)
                    ? prev.filter(i => i !== optionIndex)
                    : [...prev, optionIndex]
            );
        } else {
            setSelectedOptions([optionIndex]);
        }
    };

    const handleVote = async () => {
        if (selectedOptions.length === 0) {
            toast.error("Vui lòng chọn ít nhất một lựa chọn");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`/api/polls/${poll._id}/vote`, {
                optionIndexes: selectedOptions
            });

            toast.success("Bình chọn thành công!");
            onVote(response.data.data);
            setShowResults(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi bình chọn");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isCreator) return;

        if (confirm("Bạn có chắc chắn muốn xóa thăm dò ý kiến này?")) {
            try {
                await axios.delete(`/api/polls/${poll._id}`);
                toast.success("Đã xóa thăm dò ý kiến");
                onDelete(poll._id);
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi khi xóa");
            }
        }
    };

    const getStatusBadge = () => {
        if (poll.status === "closed") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle size={12} />
                    Đã đóng
                </span>
            );
        }
        if (poll.status === "expired") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Clock size={12} />
                    Hết hạn
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle size={12} />
                Đang hoạt động
            </span>
        );
    };

    const formatTimeLeft = () => {
        if (!poll.expiresAt) return null;
        
        const now = new Date();
        const expiresAt = new Date(poll.expiresAt);
        const diff = expiresAt - now;

        if (diff <= 0) return "Đã hết hạn";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days} ngày ${hours} giờ`;
        if (hours > 0) return `${hours} giờ ${minutes} phút`;
        return `${minutes} phút`;
    };

    return (
        <div className="bg-base-100 rounded-xl p-6 shadow-lg border border-base-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={20} className="text-primary" />
                        <h3 className="font-bold text-lg">{poll.question}</h3>
                        {getStatusBadge()}
                    </div>
                    
                    {poll.description && (
                        <p className="text-base-content/70 text-sm mb-2">
                            {poll.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-base-content/60">
                        <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>{poll.totalVotes || 0} bình chọn</span>
                        </div>
                        {poll.expiresAt && (
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{formatTimeLeft()}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {poll.settings.allowAnonymousVotes ? (
                                <>
                                    <EyeOff size={12} />
                                    <span>Ẩn danh</span>
                                </>
                            ) : (
                                <>
                                    <Eye size={12} />
                                    <span>Công khai</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isCreator && (
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="btn btn-circle btn-sm btn-ghost"
                        >
                            <MoreVertical size={16} />
                        </button>
                        
                        {showOptions && (
                            <div className="absolute right-0 top-10 bg-base-200 rounded-lg shadow-lg border border-base-300 p-2 z-10">
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-base-300 rounded w-full"
                                >
                                    <Trash2 size={14} />
                                    Xóa thăm dò
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-4">
                {poll.options.map((option, index) => {
                    const isSelected = selectedOptions.includes(index);
                    const voteCount = option.votes?.length || 0;
                    const percentage = poll.totalVotes > 0 
                        ? Math.round((voteCount / poll.totalVotes) * 100) 
                        : 0;

                    return (
                        <div
                            key={index}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-base-300 hover:border-base-400'
                            } ${!canVote ? 'cursor-default' : ''}`}
                            onClick={() => handleOptionClick(index)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{option.text}</span>
                                
                                {showResults && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-base-content/60">
                                            {voteCount} bình chọn
                                        </span>
                                        <span className="text-sm font-medium text-primary">
                                            {percentage}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Progress bar for results */}
                            {showResults && (
                                <div className="mt-2">
                                    <div className="w-full bg-base-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Voter names (if not anonymous) */}
                            {showResults && !poll.settings.allowAnonymousVotes && voteCount > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {option.votes?.slice(0, 3).map((vote, voteIndex) => (
                                        <span
                                            key={voteIndex}
                                            className="text-xs bg-base-200 px-2 py-1 rounded"
                                        >
                                            {vote.user.fullName}
                                        </span>
                                    ))}
                                    {voteCount > 3 && (
                                        <span className="text-xs text-base-content/60">
                                            +{voteCount - 3} khác
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-base-content/60">
                    Tạo bởi {poll.createdBy.fullName} • {new Date(poll.createdAt).toLocaleDateString("vi-VN")}
                </div>

                {canVote && selectedOptions.length > 0 && (
                    <button
                        onClick={handleVote}
                        disabled={loading}
                        className="btn btn-primary btn-sm"
                    >
                        {loading ? "Đang bình chọn..." : "Bình chọn"}
                    </button>
                )}

                {!showResults && poll.canVote && !isExpired && (
                    <button
                        onClick={() => setShowResults(true)}
                        className="btn btn-outline btn-sm"
                    >
                        Xem kết quả
                    </button>
                )}
            </div>
        </div>
    );
};

export default PollCard; 