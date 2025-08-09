import React from 'react';
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
    Trash2,
    Music
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
    { emoji: "😂", label: "Laugh" },
    { emoji: "😮", label: "Wow" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😡", label: "Angry" }
];
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Lỗi trong component:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                    Đã xảy ra lỗi khi hiển thị nội dung này
                </div>
            );
        }

        return this.props.children;
    }
}

const Message = ({ message, onReply, onEdit, onForward }) => {
    const { authUser } = useAuthStore();
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text || "");
    const [isHovered, setIsHovered] = useState(false);
    const contextMenuRef = useRef(null);
    const messageRef = useRef(null);
    const isOwnMessage = message.senderId._id === authUser._id;
    const [translated, setTranslated] = useState(null);
    const [translating, setTranslating] = useState(false);
    const [localReactions, setLocalReactions] = useState(message.reactions || []);

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
            const response = await fetch(`/api/messages/reaction/${message._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emoji }),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to add reaction');

            setShowReactions(false);
            // Sync with server response to ensure consistency
            const updated = await response.json();
            setLocalReactions(updated.reactions || []);
            toast.success('Đã thêm cảm xúc!');
        } catch {
            toast.error('Thêm cảm xúc thất bại!');
        }
    };

    const submitEdit = async () => {
        try {
            const response = await fetch(`/api/messages/edit/${message._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editText }),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to edit message');
            setIsEditing(false);
            toast.success('Đã cập nhật tin nhắn');
        } catch (e) {
            toast.error('Cập nhật thất bại');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        toast.success('Đã copy tin nhắn!');
        setShowContextMenu(false);
    };

    const handlePin = async () => {
        try {
            const response = await fetch(`/api/messages/pin/${message._id}`, {
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
            const response = await fetch(`/api/messages/${message._id}`, {
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
        console.log('Attachment data:', JSON.stringify(attachment, null, 2));

        if (!attachment) return null;

        // Xử lý URL/file source
        const fileSrc = attachment.file || attachment.url;
        if (!fileSrc) return null;

        // Thêm timestamp để tránh cache
        const cacheBusterSrc = `${fileSrc}${fileSrc.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;

        // Xử lý hiển thị theo loại file
        switch (attachment.type) {
            case 'image':
            case 'gif':
                return (
                    <div className="relative group">
                        <img
                            src={cacheBusterSrc}
                            alt={attachment.filename || "Image attachment"}
                            className="max-w-full md:max-w-xs max-h-96 rounded-lg cursor-pointer bg-base-200 object-contain"
                            onClick={() => window.open(fileSrc, '_blank')}
                            onError={(e) => {
                                console.error("Failed to load image:", fileSrc);
                                e.target.src = '/image-placeholder.png'; // Fallback image
                                e.target.classList.add('bg-error/10'); // Highlight lỗi
                            }}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(attachment);
                                }}
                                className="btn btn-circle btn-sm bg-base-100/90 shadow-md"
                                title="Tải xuống"
                            >
                                <Download size={14} />
                            </button>
                        </div>
                        {(attachment.caption || attachment.size) && (
                            <div className="text-xs mt-1 text-base-content/70 truncate">
                                {attachment.caption || formatFileSize(attachment.size)}
                            </div>
                        )}
                    </div>
                );

            case 'video':
                return (
                    <div className="relative group">
                        <video
                            controls
                            className="max-w-full md:max-w-xs rounded-lg bg-black"
                            preload="metadata"
                            poster={attachment.thumbnail || '/video-placeholder.png'}
                        >
                            <source src={cacheBusterSrc} type={`video/${attachment.format || 'mp4'}`} />
                            Trình duyệt không hỗ trợ video
                        </video>
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                onClick={() => handleDownload(attachment)}
                                className="btn btn-circle btn-xs bg-base-100/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Tải xuống"
                            >
                                <Download size={12} />
                            </button>
                        </div>
                    </div>
                );

            case 'audio':
                return (
                    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors w-full max-w-md">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Music size={18} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                                {attachment.filename || "Audio file"}
                            </div>
                            {attachment.duration > 0 && (
                                <div className="text-xs text-base-content/50">
                                    {formatDuration(attachment.duration)}
                                    {attachment.size && ` • ${formatFileSize(attachment.size)}`}
                                </div>
                            )}
                        </div>
                        <audio controls className="hidden" src={fileSrc} />
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="btn btn-circle btn-sm btn-ghost"
                            title="Tải xuống"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                );

            case 'document':
                return (
                    <div
                        className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer w-full max-w-md"
                        onClick={() => handleDownload(attachment)}
                    >
                        <div className="bg-primary/10 p-2 rounded-full">
                            <FileText size={18} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                                {attachment.filename || "Document"}
                            </div>
                            <div className="text-xs text-base-content/50">
                                {attachment.format?.toUpperCase() || "FILE"}
                                {attachment.size && ` • ${formatFileSize(attachment.size)}`}
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(attachment);
                            }}
                            className="btn btn-circle btn-sm btn-ghost"
                            title="Tải xuống"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="p-3 bg-base-200 rounded-lg flex items-center gap-3">
                        <FileText size={18} />
                        <div className="flex-1">
                            <div className="font-medium">Unknown file type</div>
                            <div className="text-sm opacity-70">
                                {attachment.filename || "File"}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="btn btn-sm"
                        >
                            Download
                        </button>
                    </div>
                );
        }
    };

    // Hàm hỗ trợ định dạng
    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                        className={`p-3 rounded-lg transition-all duration-200 hover:shadow-md relative ${isOwnMessage
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

                        {/* Message Text + Inline Edit */}
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input className="input input-sm input-bordered flex-1" value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitEdit()} />
                                <button className="btn btn-sm btn-primary" onClick={submitEdit}>Lưu</button>
                                <button className="btn btn-sm" onClick={() => { setIsEditing(false); setEditText(message.text || ''); }}>Huỷ</button>
                            </div>
                        ) : (
                            message.text && (
                                <div>
                                    <div className="mb-2 break-words">{message.text}</div>
                                    {message.text.match(/https?:\/\/[^ \s]+/g)?.map((url, idx) => (
                                        <LinkPreview key={idx} url={url} />
                                    ))}
                                </div>
                            )
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

                        {/* Reactions pill pinned inside bubble */}
                        {localReactions && localReactions.length > 0 && (
                            <div className={`absolute -bottom-2 ${isOwnMessage ? 'right-2' : 'left-2'} translate-y-full`}>
                                <div className="flex items-center gap-1 bg-base-200 rounded-full px-2 py-1 shadow-sm">
                                    {localReactions.map((reaction, index) => (
                                        <span
                                            key={index}
                                            className="text-sm animate-bounce-in"
                                            title={`${reaction.emoji} by ${reaction.userId?.fullName || 'Unknown'}`}
                                        >
                                            {reaction.emoji}
                                        </span>
                                    ))}
                                    <span className="text-xs opacity-70 ml-1">
                                        {localReactions.length}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Context Menu - Improved UI */}
                    {showContextMenu && (
                        <div
                            ref={contextMenuRef}
                            className={`absolute top-0 ${isOwnMessage ? 'right-0' : 'left-0'} bg-base-100/95 backdrop-blur-md rounded-xl shadow-2xl border border-base-300 p-2 z-50 min-w-48 animate-modal-slide-in`}
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
                                        onClick={() => setIsEditing(true)}
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
                        <div className="absolute bottom-full left-0 mb-2 bg-base-100/95 backdrop-blur-md rounded-full shadow-2xl border border-base-300 p-1 z-50 animate-modal-slide-in">
                            <div className="flex items-center gap-1 px-1 py-1">
                                {REACTIONS.map((reaction, index) => (
                                    <button
                                        key={index}
                                        onClick={() => { handleReaction(reaction.emoji); setShowReactions(false); }}
                                        className="w-8 h-8 flex items-center justify-center text-lg hover:scale-110 transition-all duration-150 rounded-full hover:bg-base-200"
                                        title={reaction.label}
                                    >
                                        <span>{reaction.emoji}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions (visible on hover) */}
                    <div className={`absolute -top-2 ${isOwnMessage ? '-left-2' : '-right-2'} transition-all duration-200 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
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

            {/* Reactions display handled inside bubble */}

            {/* Read Receipts - Show avatars of users who read the message */}
            {isOwnMessage && message.readBy && message.readBy.length > 0 && (
                <div className="flex justify-end mb-2">
                    <div className="flex items-center gap-1 bg-base-200/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
                        <span className="text-xs text-base-content/70 mr-1">Đã đọc</span>
                        <div className="flex -space-x-1">
                            {message.readBy.slice(0, 3).map((reader) => (
                                <img
                                    key={reader._id || reader}
                                    src={reader.profilePic || "/avatar.png"}
                                    alt={reader.fullName || "User"}
                                    className="w-5 h-5 rounded-full border border-base-100 shadow-sm"
                                    title={reader.fullName || "User"}
                                />
                            ))}
                            {message.readBy.length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center border border-base-100 shadow-sm">
                                    +{message.readBy.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Forward Modal */}
            {showForwardModal && (
                <ErrorBoundary>
                    <ForwardModal
                        message={message}
                        onClose={() => setShowForwardModal(false)}
                        onForward={onForward}
                    />
                </ErrorBoundary>
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [usersRes, groupsRes] = await Promise.all([
                    fetch("/api/auth/users-with-unread", { credentials: "include" }),
                    fetch("/api/groups/my-groups", { credentials: "include" })
                ]);

                if (!usersRes.ok) throw new Error("Không thể tải danh sách người dùng");
                const usersData = await usersRes.json();
                setUsers(Array.isArray(usersData) ? usersData : []);

                if (!groupsRes.ok) throw new Error("Không thể tải danh sách nhóm");
                const groupsData = await groupsRes.json();
                setGroups(Array.isArray(groupsData) ? groupsData : []);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError(err.message);
                setUsers([]);
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredUsers = users.filter(user =>
        user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = groups.filter(group =>
        group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            console.error("Lỗi khi chuyển tiếp:", error);
            toast.error("Chuyển tiếp tin nhắn thất bại!");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <Forward size={20} />
                        <h3 className="text-lg font-semibold">Chuyển tiếp tin nhắn</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-circle btn-sm btn-ghost"
                        aria-label="Đóng"
                    >
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
                        disabled={loading}
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-base-300">
                    <button
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center ${activeTab === "users"
                            ? "border-b-2 border-primary text-primary"
                            : "text-base-content/70 hover:bg-base-200"
                            }`}
                        onClick={() => setActiveTab("users")}
                        disabled={loading}
                    >
                        <User size={16} className="inline mr-2" />
                        Bạn bè
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center ${activeTab === "groups"
                            ? "border-b-2 border-primary text-primary"
                            : "text-base-content/70 hover:bg-base-200"
                            }`}
                        onClick={() => setActiveTab("groups")}
                        disabled={loading}
                    >
                        <Users size={16} className="inline mr-2" />
                        Nhóm
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p className="mt-4 text-base-content/70">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-error">
                            <p>Đã xảy ra lỗi: {error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-sm btn-ghost mt-2"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : activeTab === "users" ? (
                        <div className="p-4 space-y-2">
                            {filteredUsers.length === 0 ? (
                                <p className="text-center py-4 text-base-content/70">
                                    {searchTerm ? "Không tìm thấy người dùng phù hợp" : "Không có người dùng nào"}
                                </p>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user._id}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${selectedTargets.includes(`user:${user._id}`) ? 'bg-primary/10' : ''
                                            }`}
                                        onClick={() => handleTargetToggle("user", user._id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTargets.includes(`user:${user._id}`)}
                                            readOnly
                                            className="checkbox checkbox-sm"
                                        />
                                        <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt={user.fullName}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "/avatar.png";
                                            }}
                                        />
                                        <span className="flex-1">{user.fullName}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {filteredGroups.length === 0 ? (
                                <p className="text-center py-4 text-base-content/70">
                                    {searchTerm ? "Không tìm thấy nhóm phù hợp" : "Không có nhóm nào"}
                                </p>
                            ) : (
                                filteredGroups.map(group => (
                                    <div
                                        key={group._id}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${selectedTargets.includes(`group:${group._id}`) ? 'bg-primary/10' : ''
                                            }`}
                                        onClick={() => handleTargetToggle("group", group._id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTargets.includes(`group:${group._id}`)}
                                            readOnly
                                            className="checkbox checkbox-sm"
                                        />
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <Users size={16} className="text-primary-content" />
                                        </div>
                                        <span className="flex-1">{group.name}</span>
                                        <span className="text-xs opacity-70">
                                            {group.memberCount || 0} thành viên
                                        </span>
                                    </div>
                                ))
                            )}
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
                            <button
                                onClick={onClose}
                                className="btn btn-sm"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleForward}
                                className="btn btn-sm btn-primary"
                                disabled={selectedTargets.length === 0 || loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Chuyển tiếp'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message; 