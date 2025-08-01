import React, { useState, useEffect } from "react";
import { 
    X, 
    Users, 
    Search, 
    Crown, 
    Shield, 
    UserPlus, 
    MoreVertical, 
    Trash2, 
    Send,
    Loader2,
    MessageSquare,
    MessageSquareOff
} from "lucide-react";
import useGroupStore from "../../stores/useGroupStore";
import { useAuthStore } from "../../stores/useAuthStore";

const GroupMembersModal = ({ isOpen, onClose, group }) => {
    const { authUser } = useAuthStore();
    const { 
        groupMembers, 
        fetchGroupMembers, 
        removeMember, 
        updateMemberRole,
        toggleMemberChat,
        addMembers,
        loading 
    } = useGroupStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const isAdmin = useGroupStore.getState().isGroupAdmin(group?._id, authUser._id);
    const isOwner = useGroupStore.getState().isGroupOwner(group?._id, authUser._id);

    useEffect(() => {
        if (isOpen && group) {
            fetchGroupMembers(group._id);
        }
    }, [isOpen, group]);

    const filteredMembers = groupMembers.filter(member => 
        member.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemoveMember = async (memberId) => {
        try {
            await removeMember(group._id, memberId);
            setSelectedMember(null);
        } catch (error) {
            console.error("Error removing member:", error);
        }
    };

    const handleUpdateRole = async (memberId, role) => {
        try {
            await updateMemberRole(group._id, memberId, role);
            setSelectedMember(null);
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const handleToggleChat = async (memberId) => {
        try {
            await toggleMemberChat(group._id, memberId);
            setSelectedMember(null);
        } catch (error) {
            console.error("Error toggling chat permission:", error);
        }
    };

    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) return;

        try {
            const userIds = selectedUsers.map(user => user._id);
            await addMembers(group._id, userIds);
            setSelectedUsers([]);
            setShowAddMembers(false);
        } catch (error) {
            console.error("Error adding members:", error);
        }
    };

    const getRoleBadge = (member) => {
        if (group.owner._id === member.user._id) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Crown size={12} />
                    Chủ nhóm
                </span>
            );
        }
        if (member.role === "admin") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield size={12} />
                    Quản trị viên
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Users size={12} />
                Thành viên
            </span>
        );
    };

    const formatJoinDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-content p-2 rounded-full">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Thành viên nhóm</h2>
                            <p className="text-base-content/70 text-sm">
                                {groupMembers.length} thành viên • {group?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddMembers(!showAddMembers)}
                                className="btn btn-sm btn-primary"
                            >
                                <UserPlus size={16} />
                                Thêm thành viên
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="btn btn-circle btn-sm btn-ghost"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-base-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thành viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full pl-10"
                        />
                    </div>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                            <h3 className="text-lg font-semibold mb-2">Không tìm thấy thành viên</h3>
                            <p className="text-base-content/70">
                                {searchTerm ? "Không có thành viên nào phù hợp với từ khóa tìm kiếm" : "Chưa có thành viên nào"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.user._id}
                                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={member.user.avatar || "/avatar.png"}
                                            alt={member.user.fullName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">
                                                    {member.user.fullName}
                                                </span>
                                                {member.user._id === authUser._id && (
                                                    <span className="text-xs bg-primary text-primary-content px-2 py-1 rounded">
                                                        Bạn
                                                    </span>
                                                )}
                                            </div>
                                                                            <div className="flex items-center gap-2">
                                    {getRoleBadge(member)}
                                    {!member.canChat && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <MessageSquareOff size={10} />
                                            Bị cấm chat
                                        </span>
                                    )}
                                    <span className="text-xs text-base-content/60">
                                        Tham gia {formatJoinDate(member.joinedAt)}
                                    </span>
                                </div>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && member.user._id !== authUser._id && (
                                        <button
                                            onClick={() => setSelectedMember(member)}
                                            className="btn btn-circle btn-sm btn-ghost"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Member Options Modal */}
                {selectedMember && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-base-100 rounded-lg p-6 w-80">
                            <h3 className="font-bold text-lg mb-4">
                                Tùy chọn cho {selectedMember.user.fullName}
                            </h3>
                            
                            <div className="space-y-2">
                                {selectedMember.role !== "admin" && isOwner && (
                                    <button
                                        onClick={() => handleUpdateRole(selectedMember.user._id, "admin")}
                                        className="btn btn-outline w-full justify-start"
                                    >
                                        <Shield size={16} />
                                        Thăng làm quản trị viên
                                    </button>
                                )}
                                
                                {selectedMember.role === "admin" && isOwner && (
                                    <button
                                        onClick={() => handleUpdateRole(selectedMember.user._id, "member")}
                                        className="btn btn-outline w-full justify-start"
                                    >
                                        <Users size={16} />
                                        Hạ xuống thành viên
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => handleToggleChat(selectedMember.user._id)}
                                    className={`btn btn-outline w-full justify-start ${
                                        selectedMember.canChat ? 'btn-warning' : 'btn-success'
                                    }`}
                                >
                                    {selectedMember.canChat ? (
                                        <>
                                            <MessageSquareOff size={16} />
                                            Cấm chat
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare size={16} />
                                            Cho phép chat
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => {
                                        // TODO: Implement private message
                                        setSelectedMember(null);
                                    }}
                                    className="btn btn-outline w-full justify-start"
                                >
                                    <Send size={16} />
                                    Nhắn tin riêng
                                </button>
                                
                                <button
                                    onClick={() => handleRemoveMember(selectedMember.user._id)}
                                    className="btn btn-outline btn-error w-full justify-start"
                                >
                                    <Trash2 size={16} />
                                    Xóa khỏi nhóm
                                </button>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="btn btn-ghost w-full"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Members Modal */}
                {showAddMembers && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-base-100 rounded-lg p-6 w-96">
                            <h3 className="font-bold text-lg mb-4">Thêm thành viên</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text">Chọn người dùng</span>
                                    </label>
                                    <select
                                        multiple
                                        className="select select-bordered w-full h-32"
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => ({
                                                _id: option.value,
                                                fullName: option.text
                                            }));
                                            setSelectedUsers(selected);
                                        }}
                                    >
                                        <option value="user1">Nguyễn Văn A</option>
                                        <option value="user2">Trần Thị B</option>
                                        <option value="user3">Lê Văn C</option>
                                    </select>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAddMembers(false)}
                                        className="btn btn-outline flex-1"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleAddMembers}
                                        className="btn btn-primary flex-1"
                                        disabled={selectedUsers.length === 0}
                                    >
                                        Thêm ({selectedUsers.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupMembersModal; 