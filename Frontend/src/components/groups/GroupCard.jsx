import React from "react";
import { Users, MessageSquare, Lock, Globe, Crown, MoreVertical } from "lucide-react";
import useGroupStore from "../../stores/useGroupStore";
import { useAuthStore } from "../../stores/useAuthStore";

const GroupCard = ({ group, onClick, onOptionsClick }) => {
    const { authUser } = useAuthStore();
    const { isGroupAdmin, isGroupOwner } = useGroupStore();

    const isAdmin = isGroupAdmin(group._id, authUser._id);
    const isOwner = isGroupOwner(group._id, authUser._id);

    const getPrivacyIcon = () => {
        switch (group.privacy) {
            case "private":
                return <Lock size={16} className="text-orange-500" />;
            case "public":
                return <Globe size={16} className="text-green-500" />;
            case "readonly":
                return <Lock size={16} className="text-red-500" />;
            default:
                return <Lock size={16} className="text-gray-500" />;
        }
    };

    const getPrivacyText = () => {
        switch (group.privacy) {
            case "private":
                return "Riêng tư";
            case "public":
                return "Công khai";
            case "readonly":
                return "Chỉ đọc";
            default:
                return "Riêng tư";
        }
    };

    const formatLastActivity = (date) => {
        const now = new Date();
        const lastActivity = new Date(date);
        const diffInHours = Math.floor((now - lastActivity) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Vừa xong";
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
        return lastActivity.toLocaleDateString("vi-VN");
    };

    return (
        <div 
            className="bg-base-100 rounded-xl p-6 shadow-lg border border-base-300 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={group.avatar || "/avatar.png"}
                            alt={group.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-base-300"
                        />
                        {isOwner && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white p-1 rounded-full">
                                <Crown size={12} />
                            </div>
                        )}
                        {isAdmin && !isOwner && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                                <Users size={12} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">
                            {group.name}
                        </h3>
                        <p className="text-sm text-base-content/70 line-clamp-2">
                            {group.description || "Không có mô tả"}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOptionsClick?.(group);
                    }}
                    className="btn btn-circle btn-sm btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreVertical size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between text-sm text-base-content/60">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{group.members.filter(m => m.isActive).length} thành viên</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {getPrivacyIcon()}
                        <span>{getPrivacyText()}</span>
                    </div>
                </div>

                <div className="text-xs">
                    {formatLastActivity(group.lastActivity)}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-base-300 flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <MessageSquare size={12} />
                    <span>Nhắn tin</span>
                </div>
                
                {group.inviteCode && (
                    <div className="flex items-center gap-1 text-xs bg-base-200 px-2 py-1 rounded">
                        <span>Mã: {group.inviteCode}</span>
                    </div>
                )}
            </div>

            {/* Role Badge */}
            {(isOwner || isAdmin) && (
                <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isOwner 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-blue-100 text-blue-800"
                    }`}>
                        {isOwner ? <Crown size={12} /> : <Users size={12} />}
                        {isOwner ? "Chủ nhóm" : "Quản trị viên"}
                    </span>
                </div>
            )}
        </div>
    );
};

export default GroupCard;
