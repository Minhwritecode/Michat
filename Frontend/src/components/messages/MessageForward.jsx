import { useState, useEffect } from "react";
import { Forward, X, Search, User, Check } from "lucide-react";
import { useChatStore } from "../../stores/useChatStore";
import { useAuthStore } from "../../stores/useAuthStore";
import toast from "react-hot-toast";

const MessageForward = ({ message, onClose, onForward }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const { users, getUsers } = useChatStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = users.filter(user =>
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleForward = async () => {
        if (selectedUsers.length === 0) {
            toast.error("Please select at least one user");
            return;
        }

        try {
            // Forward message to all selected users
            for (const userId of selectedUsers) {
                await onForward(message, userId);
            }

            toast.success(`Message forwarded to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
            onClose();
        } catch (error) {
            toast.error("Failed to forward message");
        }
    };

    const getMessagePreview = () => {
        if (message.text) {
            return message.text.length > 50
                ? message.text.substring(0, 50) + "..."
                : message.text;
        }

        if (message.attachments?.length > 0) {
            const attachmentTypes = message.attachments.map(att => att.type);
            return `${message.attachments.length} attachment(s): ${attachmentTypes.join(", ")}`;
        }

        return "No content";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <div className="flex items-center gap-2">
                        <Forward size={20} />
                        <h2 className="text-lg font-semibold">Forward Message</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-circle btn-sm"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Message Preview */}
                <div className="p-4 border-b border-base-300">
                    <div className="text-sm text-base-content/50 mb-2">Message to forward:</div>
                    <div className="p-3 bg-base-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="avatar">
                                <div className="w-8 h-8 rounded-full">
                                    <img
                                        src={message.senderId.profilePic || "/avatar.png"}
                                        alt="Profile"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium">
                                    {message.senderId._id === authUser._id ? "You" : message.senderId.fullName}
                                </div>
                                <div className="text-sm mt-1">
                                    {getMessagePreview()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Selection */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-base-300">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={16} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input input-bordered w-full pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {filteredUsers.map(user => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${selectedUsers.includes(user._id) ? 'bg-base-200' : ''
                                        }`}
                                    onClick={() => toggleUserSelection(user._id)}
                                >
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                            <img
                                                src={user.profilePic || "/avatar.png"}
                                                alt="Profile"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="font-medium">{user.fullName}</div>
                                        <div className="text-sm opacity-50">{user.email}</div>
                                    </div>

                                    {selectedUsers.includes(user._id) && (
                                        <div className="text-primary">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="btn btn-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleForward}
                                className="btn btn-sm btn-primary"
                                disabled={selectedUsers.length === 0}
                            >
                                Forward
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageForward; 