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
    EyeOff
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import useGroupStore from "../../stores/useGroupStore";
import Message from "../messages/Message";
import MessageInput from "../messages/MessageInput";
import EmojiPicker from "../emoji/EmojiPicker";
const GroupChat = ({ group }) => {
    const { authUser } = useAuthStore();
    const { 
        isGroupAdmin, 
        isGroupOwner, 
        removeMember, 
        updateMemberRole,
        leaveGroup,
        deleteGroup,
        generateInviteCode 
    } = useGroupStore();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [inviteCode, setInviteCode] = useState(group.inviteCode || "");
    const [selectedMember, setSelectedMember] = useState(null);
    const [privateMessageTo, setPrivateMessageTo] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const isAdmin = isGroupAdmin(group._id, authUser._id);
    const isOwner = isGroupOwner(group._id, authUser._id);

    // Mock messages for demo
    useEffect(() => {
        const mockMessages = [
            {
                _id: "1",
                senderId: group.owner,
                text: "Chào mừng mọi người đến với nhóm! 👋",
                createdAt: new Date(Date.now() - 3600000),
                messageType: "group"
            },
            {
                _id: "2",
                senderId: group.members[0]?.user,
                text: "Cảm ơn bạn đã tạo nhóm này!",
                createdAt: new Date(Date.now() - 1800000),
                messageType: "group"
            },
            {
                _id: "3",
                senderId: authUser._id,
                text: "Mọi người có thể chia sẻ ý tưởng ở đây nhé",
                createdAt: new Date(Date.now() - 900000),
                messageType: "group"
            }
        ];
        setMessages(mockMessages);
    }, [group, authUser._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        // Check if user can chat
        const canUserChat = group.members.find(m => 
            m.user._id === authUser._id && m.isActive
        )?.canChat;

        if (!canUserChat) {
            alert("Bạn không có quyền gửi tin nhắn trong nhóm này");
            return;
        }

        const messageData = {
            text: newMessage,
            groupId: group._id,
            messageType: privateMessageTo ? "group_private" : "group",
            privateTo: privateMessageTo?._id
        };

        // Add message to UI immediately
        const tempMessage = {
            _id: Date.now().toString(),
            senderId: authUser._id,
            text: newMessage,
            createdAt: new Date(),
            messageType: messageData.messageType,
            privateTo: privateMessageTo?._id
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage("");
        setPrivateMessageTo(null);

        // TODO: Send to backend
        // await sendMessage(messageData);
    };

    const handleFileUpload = (file) => {
        // TODO: Handle file upload
        console.log("File upload:", file);
    };

    const handleImageUpload = (file) => {
        // TODO: Handle image upload
        console.log("Image upload:", file);
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
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
            <div className="bg-base-200 border-b border-base-300 p-4">
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <Message
                                key={message._id}
                                message={message}
                                isOwnMessage={message.senderId === authUser._id}
                                showPrivateIndicator={message.privateTo}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-base-300">
                        <MessageInput
                            value={newMessage}
                            onChange={setNewMessage}
                            onSend={handleSendMessage}
                            onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            onFileClick={() => fileInputRef.current?.click()}
                            onImageClick={() => imageInputRef.current?.click()}
                            placeholder={
                                privateMessageTo 
                                    ? `Nhắn tin riêng cho ${privateMessageTo.fullName}...`
                                    : "Nhắn tin trong nhóm..."
                            }
                            disabled={
                                group.privacy === "readonly" || 
                                !group.members.find(m => m.user._id === authUser._id && m.isActive)?.canChat
                            }
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
                    <div className="w-80 bg-base-200 border-l border-base-300 overflow-y-auto">
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
                                                    src={member.user.avatar || "/avatar.png"}
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
