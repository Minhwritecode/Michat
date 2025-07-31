import { useState, useEffect } from "react";
import { Search, X, MessageCircle, Calendar, User } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";

const MessageSearch = ({ messages, onMessageClick, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const { authUser } = useAuthStore();

    useEffect(() => {
        if (searchTerm.trim()) {
            const results = messages.filter(message => {
                const text = message.text?.toLowerCase() || "";
                const search = searchTerm.toLowerCase();
                return text.includes(search);
            });
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, messages]);

    const handleResultClick = (message) => {
        setSelectedResult(message);
        onMessageClick(message);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return "Today";
        } else if (diffDays === 2) {
            return "Yesterday";
        } else if (diffDays <= 7) {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSenderName = (message) => {
        if (message.senderId._id === authUser._id) {
            return "You";
        }
        return message.senderId.fullName;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h2 className="text-lg font-semibold">Search Messages</h2>
                    <button
                        onClick={onClose}
                        className="btn btn-circle btn-sm"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-base-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={16} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full pl-10"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                    {searchTerm && (
                        <div className="p-4">
                            {searchResults.length === 0 ? (
                                <div className="text-center py-8 text-base-content/50">
                                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No messages found for "{searchTerm}"</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-sm text-base-content/50 mb-4">
                                        Found {searchResults.length} message{searchResults.length !== 1 ? 's' : ''}
                                    </div>
                                    {searchResults.map((message, index) => (
                                        <div
                                            key={`${message._id}-${index}`}
                                            className={`p-3 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${selectedResult?._id === message._id ? 'bg-base-200' : ''
                                                }`}
                                            onClick={() => handleResultClick(message)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="avatar">
                                                    <div className="w-8 h-8 rounded-full">
                                                        <img
                                                            src={message.senderId.profilePic || "/avatar.png"}
                                                            alt="Profile"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm">
                                                            {getSenderName(message)}
                                                        </span>
                                                        <span className="text-xs opacity-50">
                                                            {formatTime(message.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm">
                                                        {message.text ? (
                                                            <p className="line-clamp-2">
                                                                {message.text}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs opacity-50 italic">
                                                                {message.attachments?.length > 0
                                                                    ? `${message.attachments.length} attachment(s)`
                                                                    : 'No text content'
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2 text-xs opacity-50">
                                                        <Calendar size={12} />
                                                        <span>{formatDate(message.createdAt)}</span>
                                                        {message.isEdited && (
                                                            <span className="italic">(edited)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageSearch; 