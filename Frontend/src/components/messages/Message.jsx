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
    Globe
} from "lucide-react";
import toast from "react-hot-toast";
import LinkPreview from "../LinkPreview";
import axios from "../../libs/axios";

const Message = ({ message, onReply, onEdit, onForward }) => {
    const { authUser } = useAuthStore();
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
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
            const res = await axios.post("/api/translate", {
                text: message.text,
                targetLang: "en"
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

    const commonReactions = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];

    return (
        <div 
            ref={messageRef}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {/* Message Content */}
                <div
                    className={`p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                        isOwnMessage
                            ? 'bg-primary text-primary-content hover:bg-primary/90'
                            : 'bg-base-200 hover:bg-base-300'
                    }`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setShowContextMenu(true);
                    }}
                >
                    {/* Reply Preview */}
                    {message.replyTo && (
                        <div className="mb-2 p-2 bg-base-300/50 rounded text-xs opacity-70 border-l-2 border-primary">
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

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-base-300/50 rounded-full text-xs animate-bounce-in"
                                >
                                    {reaction.emoji}
                                </span>
                            ))}
                        </div>
                    )}

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

                {/* Context Menu */}
                {showContextMenu && (
                    <div
                        ref={contextMenuRef}
                        className="absolute top-0 right-0 bg-base-300 rounded-lg shadow-lg p-2 z-50 min-w-32 animate-fade-in"
                    >
                        <button
                            onClick={() => onReply(message)}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2 transition-colors duration-150"
                        >
                            <Reply size={14} />
                            Reply
                        </button>

                        <button
                            onClick={handleCopy}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2 transition-colors duration-150"
                        >
                            <Copy size={14} />
                            Copy
                        </button>

                        <button
                            onClick={() => setShowReactions(true)}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2 transition-colors duration-150"
                        >
                            <Heart size={14} />
                            React
                        </button>

                        <button
                            onClick={handlePin}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2 transition-colors duration-150"
                        >
                            <Pin size={14} />
                            {message.isPinned ? 'Unpin' : 'Pin'}
                        </button>

                        {isOwnMessage && (
                            <button
                                onClick={() => onEdit(message)}
                                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2 transition-colors duration-150"
                            >
                                <Edit size={14} />
                                Edit
                            </button>
                        )}

                        <button
                            onClick={() => onForward(message)}
                            className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2 transition-colors duration-150"
                        >
                            <Forward size={14} />
                            Forward
                        </button>

                        {message.text && (
                            <button
                                onClick={handleTranslate}
                                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded flex items-center gap-2 transition-colors duration-150"
                                disabled={translating}
                            >
                                <Globe size={14} />
                                {translating ? 'Translating...' : 'Translate'}
                            </button>
                        )}
                    </div>
                )}

                {/* Reactions Picker */}
                {showReactions && (
                    <div className="absolute bottom-full left-0 bg-base-300 rounded-lg shadow-lg p-2 z-50 animate-fade-in">
                        <div className="flex gap-1">
                            {commonReactions.map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleReaction(emoji)}
                                    className="p-2 hover:bg-base-200 rounded text-lg hover:scale-110 transition-transform duration-150"
                                >
                                    {emoji}
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
                        className="btn btn-circle btn-xs bg-base-300 hover:bg-base-200 shadow-lg"
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
    );
};

export default Message; 