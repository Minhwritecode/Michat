import { useState, useRef } from "react";
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
    Globe
} from "lucide-react";
import toast from "react-hot-toast";
import LinkPreview from "../LinkPreview";
import axios from "../../libs/axios";

const Message = ({ message, onReply, onEdit, onForward }) => {
    const { authUser } = useAuthStore();
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const contextMenuRef = useRef(null);
    const isOwnMessage = message.senderId._id === authUser._id;
    const [translated, setTranslated] = useState(null);
    const [translating, setTranslating] = useState(false);

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
        } catch {
            toast.error('Failed to add reaction');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        toast.success('Message copied to clipboard');
        setShowContextMenu(false);
    };

    const handlePin = async () => {
        try {
            const response = await fetch(`/api/messages/pin/${message._id}`, {
                method: 'PUT',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to pin message');

            toast.success(message.isPinned ? 'Message unpinned' : 'Message pinned');
            setShowContextMenu(false);
        } catch {
            toast.error('Failed to pin message');
        }
    };

    const handleDownload = (attachment) => {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleTranslate = async () => {
        if (translating || translated) return;
        setTranslating(true);
        try {
            const res = await axios.post("/api/translate", {
                text: message.text,
                targetLang: "en" // hoặc lấy từ user settings
            });
            setTranslated(res.data.translated);
        } catch {
            setTranslated("Không thể dịch tin nhắn này.");
        }
        setTranslating(false);
    };

    const renderAttachment = (attachment) => {
        switch (attachment.type) {
            case 'image':
                return (
                    <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => window.open(attachment.url, '_blank')}
                    />
                );
            case 'gif':
                return (
                    <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => window.open(attachment.url, '_blank')}
                    />
                );
            case 'video':
                return (
                    <div className="relative">
                        <video
                            controls
                            className="max-w-xs rounded-lg"
                            preload="metadata"
                        >
                            <source src={attachment.url} type="video/mp4" />
                        </video>
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-300/80"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            case 'audio':
                return (
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
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
                            className="btn btn-circle btn-xs"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            case 'document':
                return (
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                        <FileText size={20} />
                        <span className="flex-1 text-sm">{attachment.filename}</span>
                        <button
                            onClick={() => handleDownload(attachment)}
                            className="btn btn-circle btn-xs"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const commonReactions = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`relative group max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {/* Message Content */}
                <div
                    className={`p-3 rounded-lg ${isOwnMessage
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-200'
                        }`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setShowContextMenu(true);
                    }}
                    onMouseEnter={() => setShowContextMenu(false)}
                >
                    {/* Reply Preview */}
                    {message.replyTo && (
                        <div className="mb-2 p-2 bg-base-300 rounded text-xs opacity-70">
                            <div className="font-semibold">Replying to:</div>
                            <div className="truncate">{message.replyTo.text}</div>
                        </div>
                    )}

                    {/* Message Text */}
                    {message.text && (
                        <div>
                            <div className="mb-2">{message.text}</div>
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

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-base-300 rounded-full text-xs"
                                >
                                    {reaction.emoji}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs opacity-50 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                    {isOwnMessage && message.readBy?.length > 0 && (
                        <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                            <span>Đã xem</span>
                            {/* Có thể thêm avatar người đã xem nếu muốn */}
                            {/* message.readBy.map(userId => <UserAvatar userId={userId} />) */}
                        </div>
                    )}
                </div>

                {/* Context Menu */}
                {showContextMenu && (
                    <div
                        ref={contextMenuRef}
                        className="absolute top-0 right-0 bg-base-300 rounded-lg shadow-lg p-2 z-50 min-w-32"
                    >
                        <button
                            onClick={() => onReply(message)}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2"
                        >
                            <Reply size={14} />
                            Reply
                        </button>

                        <button
                            onClick={handleCopy}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2"
                        >
                            <Copy size={14} />
                            Copy
                        </button>

                        <button
                            onClick={() => setShowReactions(true)}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2"
                        >
                            <Heart size={14} />
                            React
                        </button>

                        <button
                            onClick={handlePin}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2"
                        >
                            <Pin size={14} />
                            {message.isPinned ? 'Unpin' : 'Pin'}
                        </button>

                        {isOwnMessage && (
                            <button
                                onClick={() => onEdit(message)}
                                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2"
                            >
                                <Edit size={14} />
                                Edit
                            </button>
                        )}

                        <button
                            onClick={() => onForward(message)}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2"
                        >
                            <Forward size={14} />
                            Forward
                        </button>
                    </div>
                )}

                {/* Reactions Picker */}
                {showReactions && (
                    <div className="absolute bottom-full left-0 bg-base-300 rounded-lg shadow-lg p-2 z-50">
                        <div className="flex gap-1">
                            {commonReactions.map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleReaction(emoji)}
                                    className="p-2 hover:bg-base-200 rounded text-lg"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions (visible on hover) */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setShowContextMenu(true)}
                        className="btn btn-circle btn-xs bg-base-300"
                    >
                        <MoreVertical size={12} />
                    </button>
                </div>

                {translated && (
                    <div className="mt-1 text-xs bg-blue-50 text-blue-700 rounded-lg px-3 py-2 flex items-center gap-2 animate-fade-in">
                        <Globe size={13} className="text-blue-400" />
                        <span className="italic">{translated}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message; 