import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import {
    Heart,
    MessageCircle,
    Copy,
    Pin,
    Edit,
    MoreVertical,
    Reply,
    Download,
    Play,
    FileText,
    Forward,
    Globe,
    X,
    Users,
    User,
    Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import LinkPreview from "../LinkPreview";
import axios from "../../libs/axios";

const EMOTION_STYLES = {
  happy: "bg-yellow-100 text-yellow-800 border-yellow-200 shadow-yellow-200/50",
  love: "bg-pink-100 text-pink-800 border-pink-200 shadow-pink-200/50",
  sad: "bg-blue-100 text-blue-800 border-blue-200 shadow-blue-200/50",
  angry: "bg-red-100 text-red-800 border-red-200 shadow-red-200/50",
  neutral: "",
  excited: "bg-orange-100 text-orange-800 border-orange-200 shadow-orange-200/50",
  special: "bg-purple-100 text-purple-800 border-purple-200 shadow-purple-200/50"
};

const EMOTION_ICONS = {
  happy: "😊",
  love: "❤️",
  sad: "😢",
  angry: "😠",
  neutral: "",
  excited: "⚡",
  special: "⭐"
};

const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "👍", label: "Like" },
  { emoji: "👎", label: "Dislike" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" }
];

const Message = ({ message, onReply, onEdit, onForward }) => {
    const { authUser } = useAuthStore();
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const contextMenuRef = useRef(null);
    const messageRef = useRef(null);
    const isOwnMessage = message.senderId._id === authUser._id;
    const [translated, setTranslated] = useState(null);
    const [translating, setTranslating] = useState(false);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setShowContextMenu(false);
                setShowReactions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReaction = async (emoji) => {
        try {
            const response = await fetch(`/messages/reaction/${message._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emoji }),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to add reaction');

            setShowReactions(false);
            toast.success('Đã thêm cảm xúc!');
        } catch {
            toast.error('Thêm cảm xúc thất bại!');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        toast.success('Đã copy tin nhắn!');
        setShowContextMenu(false);
    };

    const handlePin = async () => {
        try {
            const response = await fetch(`/messages/pin/${message._id}`, {
                method: 'PUT',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to pin message');

            toast.success(message.isPinned ? 'Đã bỏ ghim tin nhắn' : 'Đã ghim tin nhắn');
            setShowContextMenu(false);
        } catch {
            toast.error('Ghim tin nhắn thất bại!');
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) return;
        
        try {
            const response = await fetch(`/messages/${message._id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to delete message');

            toast.success('Đã xóa tin nhắn!');
            setShowContextMenu(false);
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error('Xóa tin nhắn thất bại!');
        }
    };

    const handleDownload = (attachment) => {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Đang tải file...');
    };

    const handleTranslate = async () => {
        if (translating || translated) return;
        setTranslating(true);
        try {
            const res = await axios.post("/translate", {
                text: message.text,
                targetLang: "en"
            });
            setTranslated(res.data.translated);
        } catch {
            setTranslated("Không thể dịch tin nhắn này.");
        }
        setTranslating(false);
    };

    // Handle reply with scroll to original message
    const handleReply = () => {
        onReply(message);
        // Scroll to original message if it exists
        if (message.replyTo) {
            const originalMessageElement = document.querySelector(`[data-message-id="${message.replyTo._id}"]`);
            if (originalMessageElement) {
                originalMessageElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                originalMessageElement.classList.add('highlight');
                setTimeout(() => originalMessageElement.classList.remove('highlight'), 2000);
            }
        }
        setShowContextMenu(false);
    };

    // Handle edit
    const handleEdit = () => {
        onEdit(message);
        setShowContextMenu(false);
    };

    // Handle forward
    const handleForward = () => {
        setShowForwardModal(true);
        setShowContextMenu(false);
    };

    const renderAttachment = (attachment) => {
        switch (attachment.type) {
            case 'image':
                return (
                    <div className="relative group">
                        <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            onClick={() => window.open(attachment.url, '_blank')}
                        />
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-300/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            case 'gif':
                return (
                    <div className="relative group">
                        <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            onClick={() => window.open(attachment.url, '_blank')}
                        />
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-300/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            case 'video':
                return (
                    <div className="relative group">
                        <video
                            controls
                            className="max-w-xs rounded-lg"
                            preload="metadata"
                        >
                            <source src={attachment.url} type="video/mp4" />
                        </video>
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-300/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            case 'audio':
                return (
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors duration-200">
                        <Play size={16} />
                        <audio controls className="flex-1">
                            <source src={attachment.url} />
                        </audio>
                        {attachment.duration > 0 && (
                            <span className="text-xs opacity-50">
                                {Math.floor(attachment.duration / 60)}:{(attachment.duration % 60).toString().padStart(2, '0')}
                            </span>
                        )}
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="btn btn-circle btn-xs hover:scale-110 transition-transform duration-200"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            case 'document':
                return (
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors duration-200">
                        <FileText size={20} />
                        <span className="flex-1 text-sm">{attachment.filename}</span>
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="btn btn-circle btn-xs hover:scale-110 transition-transform duration-200"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const getEmotionStyle = () => {
        if (!message.emotion || message.emotion === "neutral") return "";
        return EMOTION_STYLES[message.emotion] || "";
    };

    const getEmotionIcon = () => {
        if (!message.emotion || message.emotion === "neutral") return null;
        return EMOTION_ICONS[message.emotion] || null;
    };

    return (
        <>
            <div 
                ref={messageRef}
                data-message-id={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`relative max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {/* Message Content */}
                    <div
                        className={`p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                            isOwnMessage
                                ? `bg-primary text-primary-content hover:bg-primary/90 ${getEmotionStyle()}`
                                : `bg-base-200 hover:bg-base-300 ${getEmotionStyle()}`
                        }`}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setShowContextMenu(true);
                        }}
                    >
                        {/* Emotion Icon */}
                        {getEmotionIcon() && (
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-base-100 rounded-full flex items-center justify-center shadow-md animate-bounce-in">
                                <span className="text-sm">{getEmotionIcon()}</span>
                            </div>
                        )}

                        {/* Reply Preview */}
                        {message.replyTo && (
                            <div className="mb-2 p-2 bg-base-300/50 rounded text-xs opacity-70 border-l-2 border-primary cursor-pointer hover:bg-base-300/70 transition-colors">
                                <div className="font-semibold">Replying to:</div>
                                <div className="truncate">{message.replyTo.text}</div>
                            </div>
                        )}

                        {/* Message Text */}
                        {message.text && (
                            <div>
                                <div className="mb-2 break-words">{message.text}</div>
                                {/* Tìm link trong text và render LinkPreview */}
                                {message.text.match(/https?:\/\/[^ \s]+/g)?.map((url, idx) => (
                                    <LinkPreview key={idx} url={url} />
                                ))}
                            </div>
                        )}

                        {/* Attachments */}
                        {message.attachments && message.attachments.map((attachment, index) => (
                            <div key={index} className="mb-2">
                                {renderAttachment(attachment)}
                            </div>
                        ))}

                        {/* Timestamp */}
                        <div className="text-xs opacity-50 mt-1 flex items-center gap-2">
                            <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                            {isOwnMessage && message.readBy?.length > 0 && (
                                <span className="text-green-500 flex items-center gap-1">
                                    <span>✓</span>
                                    <span>Đã xem</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Context Menu - Improved UI */}
                    {showContextMenu && (
                        <div
                            ref={contextMenuRef}
                            className="absolute top-0 right-0 bg-base-100 rounded-xl shadow-2xl border border-base-300 p-2 z-50 min-w-48 animate-modal-slide-in"
                        >
                            <div className="flex items-center justify-between p-2 border-b border-base-300 mb-2">
                                <span className="text-sm font-medium">Tùy chọn</span>
                                <button
                                    onClick={() => setShowContextMenu(false)}
                                    className="btn btn-circle btn-xs btn-ghost"
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <button
                                    onClick={handleReply}
                                    className="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg flex items-center gap-3 transition-colors duration-150"
                                >
                                    <Reply size={16} />
                                    <span>Reply</span>
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg flex items-center gap-3 transition-colors duration-150"
                                >
                                    <Copy size={16} />
                                    <span>Copy</span>
                                </button>

                                <button
                                    onClick={() => setShowReactions(true)}
                                    className="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg flex items-center gap-3 transition-colors duration-150"
                                >
                                    <Heart size={16} />
                                    <span>React</span>
                                </button>

                                <button
                                    onClick={handlePin}
                                    className="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg flex items-center gap-3 transition-colors duration-150"
                                >
                                    <Pin size={16} />
                                    <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
                                </button>

                                {isOwnMessage && (
                                    <button
                                        onClick={handleEdit}
                                        className="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg flex items-center gap-3 transition-colors duration-150"
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleForward}
                                    className="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg flex items-center gap-3 transition-colors duration-150"
                                >
                                    <Forward size={16} />
                                    <span>Forward</span>
                                </button>

                                {isOwnMessage && (
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-3 py-2 hover:bg-error/10 text-error rounded-lg flex items-center gap-3 transition-colors duration-150"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                )}

                                {message.text && (
                                    <button
                                        onClick={handleTranslate}
                                        className="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg flex items-center gap-3 transition-colors duration-150"
                                        disabled={translating}
                                    >
                                        <Globe size={16} />
                                        <span>{translating ? 'Translating...' : 'Translate'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reactions Picker - Improved UI */}
                    {showReactions && (
                        <div className="absolute bottom-full left-0 mb-2 bg-base-100 rounded-xl shadow-2xl border border-base-300 p-3 z-50 animate-modal-slide-in">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium">Thả cảm xúc</span>
                                <button
                                    onClick={() => setShowReactions(false)}
                                    className="btn btn-circle btn-xs btn-ghost"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {REACTIONS.map((reaction, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleReaction(reaction.emoji)}
                                        className="p-3 hover:bg-base-200 rounded-lg text-lg hover:scale-110 transition-all duration-150 flex flex-col items-center gap-1"
                                        title={reaction.label}
                                    >
                                        <span>{reaction.emoji}</span>
                                        <span className="text-xs opacity-70">{reaction.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions (visible on hover) */}
                    <div className={`absolute -top-2 -right-2 transition-all duration-200 ${
                        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}>
                        <button
                            onClick={() => setShowContextMenu(true)}
                            className="btn btn-circle btn-xs bg-base-100 hover:bg-base-200 shadow-lg border border-base-300"
                        >
                            <MoreVertical size={12} />
                        </button>
                    </div>

                    {/* Translation Result */}
                    {translated && (
                        <div className="mt-2 text-xs bg-blue-50 text-blue-700 rounded-lg px-3 py-2 flex items-center gap-2 animate-fade-in">
                            <Globe size={13} className="text-blue-400" />
                            <span className="italic">{translated}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Reactions Display - Under message like Messenger */}
            {message.reactions && message.reactions.length > 0 && (
                <div className={`flex justify-center mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-center gap-1 bg-base-200 rounded-full px-2 py-1 shadow-sm">
                        {message.reactions.map((reaction, index) => (
                            <span
                                key={index}
                                className="text-sm animate-bounce-in"
                                title={`${reaction.emoji} by ${reaction.userId?.fullName || 'Unknown'}`}
                            >
                                {reaction.emoji}
                            </span>
                        ))}
                        <span className="text-xs opacity-70 ml-1">
                            {message.reactions.length}
                        </span>
                    </div>
                </div>
            )}

            {/* Forward Modal */}
            {showForwardModal && (
                <ForwardModal
                    message={message}
                    onClose={() => setShowForwardModal(false)}
                    onForward={onForward}
                />
            )}
        </>
    );
};

// Forward Modal Component
const ForwardModal = ({ message, onClose, onForward }) => {
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        // Fetch users and groups
        const fetchData = async () => {
            try {
                const [usersRes, groupsRes] = await Promise.all([
                    fetch("/users", { credentials: "include" }),
                    fetch("/groups/my-groups", { credentials: "include" })
                ]);
                
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData);
                }
                
                if (groupsRes.ok) {
                    const groupsData = await groupsRes.json();
                    setGroups(groupsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        fetchData();
    }, []);

    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTargetToggle = (type, id) => {
        const target = `${type}:${id}`;
        setSelectedTargets(prev => 
            prev.includes(target) 
                ? prev.filter(t => t !== target)
                : [...prev, target]
        );
    };

    const handleForward = async () => {
        if (selectedTargets.length === 0) {
            toast.error("Vui lòng chọn ít nhất một người nhận");
            return;
        }

        try {
            for (const target of selectedTargets) {
                const [type, id] = target.split(':');
                await onForward(message, type, id);
            }
            toast.success(`Đã chuyển tiếp tin nhắn đến ${selectedTargets.length} nơi`);
            onClose();
        } catch (error) {
            toast.error("Chuyển tiếp tin nhắn thất bại!");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <Forward size={20} />
                        <h3 className="text-lg font-semibold">Chuyển tiếp tin nhắn</h3>
                    </div>
                    <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-base-300">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered w-full"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-base-300">
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${activeTab === "users" ? "border-b-2 border-primary text-primary" : "text-base-content/70"}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <User size={16} className="inline mr-2" />
                        Bạn bè
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${activeTab === "groups" ? "border-b-2 border-primary text-primary" : "text-base-content/70"}`}
                        onClick={() => setActiveTab("groups")}
                    >
                        <Users size={16} className="inline mr-2" />
                        Nhóm
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-96">
                    {activeTab === "users" ? (
                        <div className="p-4 space-y-2">
                            {filteredUsers.map(user => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                                        selectedTargets.includes(`user:${user._id}`) ? 'bg-primary/10' : ''
                                    }`}
                                    onClick={() => handleTargetToggle("user", user._id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTargets.includes(`user:${user._id}`)}
                                        onChange={() => {}}
                                        className="checkbox checkbox-sm"
                                    />
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.fullName}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="flex-1">{user.fullName}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {filteredGroups.map(group => (
                                <div
                                    key={group._id}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                                        selectedTargets.includes(`group:${group._id}`) ? 'bg-primary/10' : ''
                                    }`}
                                    onClick={() => handleTargetToggle("group", group._id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTargets.includes(`group:${group._id}`)}
                                        onChange={() => {}}
                                        className="checkbox checkbox-sm"
                                    />
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                        <Users size={16} className="text-primary-content" />
                                    </div>
                                    <span className="flex-1">{group.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-300">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/70">
                            {selectedTargets.length} nơi được chọn
                        </span>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn btn-sm">
                                Hủy
                            </button>
                            <button 
                                onClick={handleForward} 
                                className="btn btn-sm btn-primary"
                                disabled={selectedTargets.length === 0}
                            >
                                Chuyển tiếp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message; 