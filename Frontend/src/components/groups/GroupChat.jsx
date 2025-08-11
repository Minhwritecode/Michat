import React, { useState, useEffect, useRef } from "react";
import {
    Send,
    Image,
    File,
    Smile,
    MoreVertical,
    Users,
    Settings,
    Crown,
    UserPlus,
    Copy,
    Trash2,
    Edit,
    LogOut,
    Shield,
    Eye,
    EyeOff,
    X
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import useGroupStore from "../../stores/useGroupStore";
import Message from "../messages/Message";
import MessageInput from "../messages/MessageInput";
import EmojiPicker from "../emoji/EmojiPicker";
import { useChatStore } from "../../stores/useChatStore";
const GroupChat = ({ group }) => {
    const { authUser } = useAuthStore();
    const { messages, getGroupMessages } = useChatStore();
    const {
        isGroupAdmin,
        isGroupOwner,
        removeMember,
        updateMemberRole,
        leaveGroup,
        deleteGroup,
        generateInviteCode
    } = useGroupStore();

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [inviteCode, setInviteCode] = useState(group.inviteCode || "");
    const [selectedMember, setSelectedMember] = useState(null);
    const [privateMessageTo, setPrivateMessageTo] = useState(null);
    const [typingUsersHeader, setTypingUsersHeader] = useState([]);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const isAdmin = isGroupAdmin(group._id, authUser._id);
    const isOwner = isGroupOwner(group._id, authUser._id);

    // Load group messages from store
    useEffect(() => {
        if (group?._id) {
            getGroupMessages(group._id);
        }
    }, [group?._id, getGroupMessages]);

    // Subscribe to realtime new group messages
    useEffect(() => {
        const handler = (e) => {
            const { groupId } = e.detail || {};
            if (groupId === group._id) {
                getGroupMessages(group._id);
            }
        };
        const socketHandler = ({ groupId }) => {
            try { window.dispatchEvent(new CustomEvent('group-message-new', { detail: { groupId } })); } catch {}
        };
        // Attach DOM event and socket listener via auth store socket
        window.addEventListener('group-message-new', handler);
        const s = useAuthStore.getState().socket;
        if (s) s.on('group:message:new', socketHandler);
        return () => {
            window.removeEventListener('group-message-new', handler);
            const s2 = useAuthStore.getState().socket;
            if (s2) s2.off('group:message:new', socketHandler);
        };
    }, [group._id, getGroupMessages]);

    // Join room for this group on mount/unmount
    useEffect(() => {
        const s = useAuthStore.getState().socket;
        if (s && group?._id) s.emit('group:join', { groupId: group._id });
        return () => {
            const s2 = useAuthStore.getState().socket;
            if (s2 && group?._id) s2.emit('group:leave', { groupId: group._id });
        };
    }, [group?._id]);

    // Subscribe to typing events for this group to show in header (max 3 users)
    useEffect(() => {
        const handler = (e) => {
            const { groupId, from, isTyping } = e.detail || {};
            if (!groupId || groupId !== group._id || !from) return;
            setTypingUsersHeader((prev) => {
                const setNow = new Map(prev.map(u => [u._id, u]));
                if (isTyping) {
                    const member = (group.members || []).find(m => m.user._id === from)?.user;
                    if (member) setNow.set(from, { _id: from, fullName: member.fullName, profilePic: member.profilePic, ts: Date.now() });
                } else {
                    setNow.delete(from);
                }
                // prune > 2s
                const now = Date.now();
                const pruned = Array.from(setNow.values()).filter(u => now - (u.ts || now) < 2000);
                return pruned.slice(0, 3);
            });
        };
        const interval = setInterval(() => {
            setTypingUsersHeader((prev) => {
                const now = Date.now();
                const pruned = prev.filter(u => now - (u.ts || now) < 2000);
                return pruned.slice(0, 3);
            });
        }, 1000);
        window.addEventListener('typing-group', handler);
        return () => {
            clearInterval(interval);
            window.removeEventListener('typing-group', handler);
        };
    }, [group._id, group.members]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Sending is handled by MessageInput via useChatStore.sendMessage

    const handleFileUpload = (file) => {
        // TODO: Handle file upload
        console.log("File upload:", file);
    };

    const handleImageUpload = (file) => {
        // TODO: Handle image upload
        console.log("Image upload:", file);
    };

    const handleEmojiSelect = () => {
        setShowEmojiPicker(false);
    };

    const handleCopyInviteCode = async () => {
        try {
            if (!inviteCode) {
                const code = await generateInviteCode(group._id);
                setInviteCode(code);
            }
            await navigator.clipboard.writeText(inviteCode);
            // Show success toast
        } catch (error) {
            console.error("Error copying invite code:", error);
        }
    };

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

    const handleLeaveGroup = async () => {
        if (confirm("Bạn có chắc chắn muốn rời khỏi nhóm này?")) {
            try {
                await leaveGroup(group._id);
            } catch (error) {
                console.error("Error leaving group:", error);
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (confirm("Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.")) {
            try {
                await deleteGroup(group._id);
            } catch (error) {
                console.error("Error deleting group:", error);
            }
        }
    };

    const getPrivacyIcon = () => {
        switch (group.privacy) {
            case "private":
                return <Shield size={16} className="text-orange-500" />;
            case "public":
                return <Eye size={16} className="text-green-500" />;
            case "readonly":
                return <EyeOff size={16} className="text-red-500" />;
            default:
                return <Shield size={16} />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-base-100">
            {/* Chat Header */}
            <div className="bg-base-200 border-b border-base-300 p-4 sticky top-20 z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={group.avatar || "/avatar.png"}
                            alt={group.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="font-bold text-lg">{group.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                {getPrivacyIcon()}
                                <span>{group.members.filter(m => m.isActive).length} thành viên</span>
                                {group.privacy === "readonly" && (
                                    <span className="text-red-500">• Chỉ đọc</span>
                                )}
                                {typingUsersHeader.length > 0 && (
                                    <span className="flex items-center gap-1 text-primary">
                                        <div className="flex -space-x-2 mr-1">
                                            {typingUsersHeader.map(u => (
                                                <img key={u._id} src={u.profilePic || '/avatar.png'} alt={u.fullName} className="w-5 h-5 rounded-full border-2 border-base-100" />
                                            ))}
                                        </div>
                                        <span className="typing-dots"><span className="dot" /><span className="dot" /><span className="dot" /></span>
                                        <span>
                                            {typingUsersHeader.length === 1 ? `${typingUsersHeader[0].fullName} đang nhập...` : 'Có người đang nhập...'}
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowMembers(!showMembers)}
                            className="btn btn-circle btn-sm btn-ghost"
                            title="Thành viên"
                        >
                            <Users size={18} />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="btn btn-circle btn-sm btn-ghost"
                                title="Cài đặt nhóm"
                            >
                                <Settings size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Private Message Indicator */}
                {privateMessageTo && (
                    <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-primary font-medium">
                                    Tin nhắn riêng tư cho {privateMessageTo.fullName}
                                </span>
                            </div>
                            <button
                                onClick={() => setPrivateMessageTo(null)}
                                className="btn btn-xs btn-ghost"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Messages */}
                <div className="flex-1 flex flex-col">
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 pb-24 ${(showMembers || showSettings) ? 'pr-80' : ''}`}>
                        {messages.map((message) => (
                            <Message
                                key={message._id}
                                message={message}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-base-300 sticky bottom-0 bg-base-100 z-20">
                        <MessageInput
                            group={group}
                            privateMessageTo={privateMessageTo}
                        />

                        {showEmojiPicker && (
                            <div className="absolute bottom-20 right-4">
                                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                {(showMembers || showSettings) && (
                    <div className="fixed top-20 right-0 h-[calc(100vh-5rem)] w-80 bg-base-200 border-l border-base-300 overflow-y-auto z-40 shadow-xl">
                        <div className="sticky top-0 z-10 bg-base-200 border-b border-base-300 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setShowMembers(true); setShowSettings(false); }}
                                    className={`btn btn-circle btn-sm btn-ghost ${showMembers ? 'bg-base-300' : ''}`}
                                    title="Thành viên"
                                >
                                    <Users size={16} />
                                </button>
                                <button
                                    onClick={() => { setShowSettings(true); setShowMembers(false); }}
                                    className={`btn btn-circle btn-sm btn-ghost ${showSettings ? 'bg-base-300' : ''}`}
                                    title="Cài đặt nhóm"
                                >
                                    <Settings size={16} />
                                </button>
                            </div>
                            <button
                                onClick={() => { setShowMembers(false); setShowSettings(false); }}
                                className="btn btn-circle btn-sm btn-ghost"
                                title="Đóng"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        {showMembers && (
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-4">Thành viên nhóm</h3>
                                <div className="space-y-2">
                                    {group.members.filter(m => m.isActive).map((member) => (
                                        <div
                                            key={member.user._id}
                                            className="flex items-center justify-between p-3 bg-base-100 rounded-lg hover:bg-base-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={member.user.profilePic || "/avatar.png"}
                                                    alt={member.user.fullName}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {member.user.fullName}
                                                        </span>
                                                        {group.owner._id === member.user._id && (
                                                            <Crown size={12} className="text-yellow-500" />
                                                        )}
                                                        {member.role === "admin" && group.owner._id !== member.user._id && (
                                                            <Shield size={12} className="text-blue-500" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-base-content/60">
                                                        {member.role === "admin" ? "Quản trị viên" : "Thành viên"}
                                                    </span>
                                                </div>
                                            </div>

                                            {isAdmin && member.user._id !== authUser._id && (
                                                <button
                                                    onClick={() => setSelectedMember(member)}
                                                    className="btn btn-xs btn-ghost"
                                                >
                                                    <MoreVertical size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showSettings && (
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-4">Cài đặt nhóm</h3>

                                {/* Invite Code */}
                                <div className="mb-6">
                                    <label className="label">
                                        <span className="label-text font-medium">Mã mời</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inviteCode}
                                            readOnly
                                            className="input input-bordered flex-1 text-sm"
                                            placeholder="Chưa có mã mời"
                                        />
                                        <button
                                            onClick={handleCopyInviteCode}
                                            className="btn btn-sm btn-outline"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Group Actions */}
                                <div className="space-y-2">
                                    <button
                                        onClick={handleLeaveGroup}
                                        className="btn btn-outline btn-error w-full justify-start"
                                    >
                                        <LogOut size={16} />
                                        Rời khỏi nhóm
                                    </button>

                                    {isOwner && (
                                        <button
                                            onClick={handleDeleteGroup}
                                            className="btn btn-outline btn-error w-full justify-start"
                                        >
                                            <Trash2 size={16} />
                                            Xóa nhóm
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden Inputs */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0])}
            />
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0])}
            />

            {/* Member Options Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-base-100 rounded-lg p-6 w-80">
                        <h3 className="font-bold text-lg mb-4">
                            Tùy chọn cho {selectedMember.user.fullName}
                        </h3>

                        <div className="space-y-2">
                            <button
                                onClick={() => handleUpdateRole(selectedMember.user._id, "admin")}
                                className="btn btn-outline w-full justify-start"
                                disabled={selectedMember.role === "admin"}
                            >
                                <Shield size={16} />
                                Thăng làm quản trị viên
                            </button>

                            <button
                                onClick={() => handleUpdateRole(selectedMember.user._id, "member")}
                                className="btn btn-outline w-full justify-start"
                                disabled={selectedMember.role === "member"}
                            >
                                <Users size={16} />
                                Hạ xuống thành viên
                            </button>

                            <button
                                onClick={() => setPrivateMessageTo(selectedMember.user)}
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
        </div>
    );
};

export default GroupChat;
