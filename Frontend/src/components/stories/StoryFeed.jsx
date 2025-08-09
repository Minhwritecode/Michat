import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
    Heart,
    MessageCircle,
    Share2,
    Eye,
    Clock,
    ChevronLeft,
    ChevronRight,
    Send,
    X,
    User,
    Users
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useChatStore } from "../../stores/useChatStore";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const StoryFeed = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardLoading, setForwardLoading] = useState(false);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("users");
    const [usersList, setUsersList] = useState([]);
    const [groupsList, setGroupsList] = useState([]);
    const modalRef = useRef(null);

    const { authUser } = useAuthStore();
    const { sendMessage } = useChatStore();

    // Fetch stories with improved error handling
    const fetchStories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/story", {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            // Validate response data
            if (!Array.isArray(data)) {
                throw new Error("Invalid stories data format");
            }

            console.log("Fetched stories:", data); // Debug log
            setStories(data);
        } catch (error) {
            console.error("Error fetching stories:", error);
            toast.error("Lỗi khi tải stories. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch users and groups for forwarding
    const fetchForwardData = useCallback(async () => {
        try {
            // Fetch users (giữ nguyên)
            const usersRes = await fetch("/api/auth/users-with-unread", {
                credentials: "include"
            });
            let usersData = [];

            if (usersRes.ok) {
                const usersResponse = await usersRes.json();
                usersData = Array.isArray(usersResponse?.data) ? usersResponse.data :
                    Array.isArray(usersResponse) ? usersResponse : [];
            }

            // Fetch groups với xử lý response mới
            let groupsData = [];
            try {
                const groupsRes = await fetch("/api/groups/my-groups", {
                    credentials: "include"
                });

                if (groupsRes.ok) {
                    const response = await groupsRes.json();

                    // Xử lý response theo cấu trúc mới
                    if (response?.success && response.data?.groups) {
                        groupsData = response.data.groups;
                    }
                    // Fallback cho các cấu trúc khác
                    else if (Array.isArray(response)) {
                        groupsData = response;
                    }
                    else if (response?.data && Array.isArray(response.data)) {
                        groupsData = response.data;
                    }
                    else {
                        console.error("Unexpected groups data format:", response);
                        toast.error("Định dạng dữ liệu nhóm không hợp lệ");
                    }
                }
            } catch (groupsError) {
                console.error("Error fetching groups:", groupsError);
                toast.error("Lỗi khi tải danh sách nhóm");
            }

            console.log("Processed groups data:", groupsData); // Debug log
            setUsersList(usersData);
            setGroupsList(groupsData);
        } catch (error) {
            console.error("Error fetching forward data:", error);
            toast.error("Lỗi khi tải danh sách chuyển tiếp");
        }
    }, []);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    // Group stories by user with validation
    const storiesByUser = stories.reduce((acc, story) => {
        try {
            // Validate story structure
            if (!story || !story.userId || !story.userId._id) {
                console.error("Invalid story format:", story);
                return acc;
            }

            const userId = story.userId._id;
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.userId,
                    stories: []
                };
            }
            acc[userId].stories.push(story);
            return acc;
        } catch (error) {
            console.error("Error grouping stories:", error);
            return acc;
        }
    }, {});

    // Handle story reactions
    const handleReact = async (storyId, emoji) => {
        try {
            const res = await fetch(`/api/story/${storyId}/react`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ emoji })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            await fetchStories();
            toast.success("Đã thả cảm xúc!");
        } catch (error) {
            console.error("React error:", error);
            toast.error("Thả cảm xúc thất bại!");
        }
    };

    // Helpers
    const isVideoSrc = (src = "") => /\.(mp4|webm|ogg)(\?|$)/i.test(src) || src.startsWith("data:video") || src.includes("/video");

    // Handle story replies
    const handleReply = async () => {
        if (!replyText.trim() || !selectedStory) return;

        try {
            // Send reply to API
            const replyRes = await fetch(`/api/story/${selectedStory._id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    text: replyText
                })
            });

            if (!replyRes.ok) {
                throw new Error("Failed to send reply");
            }

            // Send notification (separate try-catch to not affect main reply)
            try {
                await sendMessage({
                    text: `${authUser.fullName} đã reply story của bạn: "${replyText}"`,
                    attachments: [],
                    replyTo: null,
                    metadata: {
                        storyId: selectedStory._id,
                        type: "story_reply"
                    }
                }, { isGroup: false, targetId: selectedStory.userId._id });
            } catch (notificationError) {
                console.error("Notification error:", notificationError);
            }

            toast.success("Đã gửi reply!");
            setReplyText("");
            await fetchStories();
        } catch (error) {
            console.error("Reply error:", error);
            toast.error(error.message || "Gửi reply thất bại!");
        }
    };

    // Handle story forwarding
    const handleForwardStory = async (story, targetType, targetId) => {
        try {
            // Send forward request to backend
            const forwardRes = await fetch(`/api/story/${story._id}/forward`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    targetType,
                    targetId
                })
            });

            if (!forwardRes.ok) {
                throw new Error(`HTTP error! status: ${forwardRes.status}`);
            }

            // Send message to target
            await sendMessage({
                text: `${authUser.fullName} đã chuyển tiếp một story`,
                attachments: story.media ? [{
                    file: story.media,
                    type: isVideoSrc(story.media) ? 'video' : 'image',
                    filename: `story_${story._id}.${isVideoSrc(story.media) ? 'mp4' : 'jpg'}`,
                    preview: story.media
                }] : [],
                replyTo: null,
                metadata: {
                    storyId: story._id,
                    type: "story_forward"
                }
            }, { isGroup: targetType === 'group', targetId });

            return true;
        } catch (error) {
            console.error("Forward error:", error);
            throw error;
        }
    };

    // Handle forwarding to multiple targets
    const handleForwardToTargets = async () => {
        if (selectedTargets.length === 0) {
            toast.error("Vui lòng chọn ít nhất một người/nhóm");
            return;
        }

        setForwardLoading(true);

        try {
            await Promise.all(selectedTargets.map(async target => {
                const [type, id] = target.split(':');
                await handleForwardStory(selectedStory, type, id);
            }));

            toast.success(`Đã chuyển tiếp đến ${selectedTargets.length} nơi`);
            setShowForwardModal(false);
            setSelectedTargets([]);
        } catch (error) {
            console.error(error);
            toast.error("Chuyển tiếp thất bại!");
        } finally {
            setForwardLoading(false);
        }
    };

    // Open story modal with validation
    const openStoryModal = (story, userStories) => {
        try {
            if (!story || !userStories || !userStories.stories) {
                throw new Error("Invalid story or userStories data");
            }

            const storyIndex = userStories.stories.findIndex(s => s._id === story._id);
            if (storyIndex === -1) {
                throw new Error("Story not found in user's stories");
            }

            console.log("Opening story modal with:", {
                story,
                index: storyIndex,
                total: userStories.stories.length
            });

            setSelectedStory(story);
            setCurrentStoryIndex(storyIndex);
            setShowStoryModal(true);
            fetchForwardData();
        } catch (error) {
            console.error("Error opening story modal:", error);
            toast.error("Không thể mở story. Vui lòng thử lại.");
        }
    };

    // Navigate between stories with validation
    const navigateStory = (direction) => {
        try {
            if (!selectedStory || !selectedStory.userId || !storiesByUser[selectedStory.userId._id]) {
                throw new Error("Invalid story navigation data");
            }

            const userStories = storiesByUser[selectedStory.userId._id].stories;
            let newIndex = currentStoryIndex + direction;

            if (newIndex < 0) newIndex = userStories.length - 1;
            if (newIndex >= userStories.length) newIndex = 0;

            console.log("Navigating story:", {
                from: currentStoryIndex,
                to: newIndex,
                direction
            });

            setCurrentStoryIndex(newIndex);
            setSelectedStory(userStories[newIndex]);

            // Auto-play video if exists
            const videoElement = document.querySelector(`video[src="${userStories[newIndex].media}"]`);
            if (videoElement && userStories[newIndex].media.includes('video')) {
                videoElement.currentTime = 0;
                videoElement.play().catch(e => console.error("Video play error:", e));
            }
        } catch (error) {
            console.error("Error navigating stories:", error);
        }
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowStoryModal(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter users and groups for forwarding
    const filteredUsers = usersList.filter(user =>
        user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        user._id !== authUser._id &&
        user._id !== selectedStory?.userId?._id
    );

    const filteredGroups = groupsList.filter(group =>
        group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Toggle selection for forwarding
    const handleTargetToggle = (type, id) => {
        const target = `${type}:${id}`;
        setSelectedTargets(prev =>
            prev.includes(target)
                ? prev.filter(t => t !== target)
                : [...prev, target]
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="loading loading-spinner"></div>
            </div>
        );
    }

    if (stories.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-base-content/50 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h4 className="text-lg font-medium mb-2">Chưa có story nào</h4>
                <p className="text-base-content/70">
                    Hãy tạo story đầu tiên để chia sẻ khoảnh khắc của bạn!
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Stories</h3>
                    <p className="text-sm text-base-content/70">
                        {Object.keys(storiesByUser).length} người dùng • {stories.length} stories
                    </p>
                </div>
            </div>

            {/* Story Carousel */}
            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {Object.values(storiesByUser).map((userStories, idx) => {
                        const user = userStories.user;
                        const latestStory = userStories.stories[0];
                        const isOwnStory = user._id === authUser._id;
                        const hasReacted = latestStory.reactions?.some(r => r.userId === authUser._id);
                        const isExpired = new Date(latestStory.expiredAt) < new Date();

                        return (
                            <div key={`${user._id}-${idx}`} className="flex-shrink-0 w-20 text-center">
                                {/* Story Circle */}
                                <div className="relative mb-2">
                                    <button
                                        onClick={() => !isExpired && openStoryModal(latestStory, userStories)}
                                        className={`w-16 h-16 rounded-full p-0.5 transition-all duration-200 hover:scale-105 ${isExpired
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : hasReacted
                                                ? "bg-gradient-to-r from-pink-500 to-purple-500"
                                                : "bg-gradient-to-r from-primary to-secondary"
                                            }`}
                                        disabled={isExpired}
                                    >
                                        <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={user.profilePic || "/avatar.png"}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </button>

                                    {/* Story count badge */}
                                    {userStories.stories.length > 1 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-content rounded-full text-xs flex items-center justify-center">
                                            {userStories.stories.length}
                                        </div>
                                    )}

                                    {/* Time remaining or expired */}
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                        <div className={`rounded-full px-2 py-1 text-xs shadow-sm flex items-center gap-1 ${isExpired ? "bg-gray-200 text-gray-700" : "bg-base-100"
                                            }`}>
                                            <Clock size={10} />
                                            {isExpired ? "Hết hạn" : formatDistanceToNow(new Date(latestStory.expiredAt), {
                                                addSuffix: true,
                                                locale: vi
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* User name */}
                                <div className="text-xs font-medium truncate">
                                    {isOwnStory ? "Bạn" : user.fullName}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Story Modal */}
            {showStoryModal && selectedStory && selectedStory.userId && createPortal(
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div
                        ref={modalRef}
                        className="bg-base-100/95 text-base-content rounded-xl w-full max-w-3xl mx-4 h-[90vh] overflow-hidden relative flex flex-col shadow-2xl"
                    >
                        {/* Navigation Arrows */}
                        {storiesByUser[selectedStory.userId._id]?.stories?.length > 1 && (
                            <>
                                <button
                                    onClick={() => navigateStory(-1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost z-10"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => navigateStory(1)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost z-10"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Story Header */}
                        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100/95 backdrop-blur z-10 relative">
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedStory.userId.profilePic || "/avatar.png"}
                                    alt={selectedStory.userId.fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <div className="font-semibold">
                                        {selectedStory.userId._id === authUser._id
                                            ? "Bạn"
                                            : selectedStory.userId.fullName
                                        }
                                    </div>
                                    <div className="text-xs text-base-content/70">
                                        {currentStoryIndex + 1}/{storiesByUser[selectedStory.userId._id]?.stories?.length || 1} • {formatDistanceToNow(new Date(selectedStory.expiredAt), {
                                            addSuffix: true,
                                            locale: vi
                                        })}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowStoryModal(false)}
                                className="btn btn-circle btn-sm btn-ghost"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Story Content */}
                        <div className="overflow-y-auto flex-1">
                            <div className="w-full h-full">
                                {selectedStory.media ? (
                                    <div className="relative w-full bg-black flex items-center justify-center">
                                        {isVideoSrc(selectedStory.media) ? (
                                            <video
                                                src={selectedStory.media}
                                                className="w-full max-h-[65vh] object-contain"
                                                controls
                                                autoPlay
                                                key={selectedStory._id} // Force re-render on change
                                            />
                                        ) : (
                                            <img
                                                src={selectedStory.media}
                                                alt="Story"
                                                className="w-full max-h-[65vh] object-contain"
                                                key={selectedStory._id}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-base-content/70">Story này không có media</div>
                                )}

                                <p className="p-4 text-base min-h-6 break-words">
                                    {selectedStory.text || ""}
                                </p>

                                {/* Reactions and Comments */}
                                <div className="p-4">
                                    {/* Reactions */}
                                    {selectedStory.reactions?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selectedStory.reactions.map((reaction, i) => (
                                                <div key={i} className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-full text-sm">
                                                    <span>{reaction.emoji}</span>
                                                    <span>
                                                        {reaction.userId._id === authUser._id
                                                            ? "Bạn"
                                                            : reaction.userId.fullName}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comments */}
                                    {selectedStory.replies?.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-medium">Bình luận:</h4>
                                            {selectedStory.replies.map((reply, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <img
                                                        src={reply.userId.profilePic || "/avatar.png"}
                                                        alt={reply.userId.fullName}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {reply.userId._id === authUser._id
                                                                ? "Bạn"
                                                                : reply.userId.fullName}
                                                        </div>
                                                        <div className="bg-base-200 rounded-lg p-2 text-sm">
                                                            {reply.text}
                                                        </div>
                                                        <div className="text-xs text-base-content/70 mt-1">
                                                            {formatDistanceToNow(new Date(reply.createdAt), {
                                                                addSuffix: true,
                                                                locale: vi
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 border-t border-base-300">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Nhập reply..."
                                    className="input input-bordered flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                />
                                <button
                                    onClick={handleReply}
                                    className="btn btn-primary"
                                    disabled={!replyText.trim()}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between p-4 bg-base-100/80 backdrop-blur-sm border-t border-base-300">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleReact(selectedStory._id, "❤️")}
                                    className="btn btn-circle btn-sm hover:scale-110 transition-transform"
                                    title="Thả tim"
                                >
                                    <Heart
                                        size={16}
                                        className={selectedStory.reactions?.some(r => r.userId === authUser._id) ? "fill-red-500 text-red-500" : ""}
                                    />
                                </button>
                                <button
                                    onClick={() => setShowForwardModal(true)}
                                    className="btn btn-circle btn-sm hover:scale-110 transition-transform"
                                    title="Chuyển tiếp"
                                >
                                    <Share2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                <Eye size={14} />
                                <span>{selectedStory.views || 0} lượt xem</span>
                            </div>
                        </div>
                    </div>
                </div>, document.body)
            }

            {/* Forward Modal */}
            {showForwardModal && selectedStory && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-base-100 rounded-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-base-300">
                            <div className="flex items-center gap-3">
                                <Share2 size={20} />
                                <h3 className="text-lg font-semibold">Chuyển tiếp story</h3>
                            </div>
                            <button
                                onClick={() => setShowForwardModal(false)}
                                className="btn btn-circle btn-sm btn-ghost"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Story Preview */}
                        <div className="p-4 border-b border-base-300">
                            {selectedStory.media && (
                                <div className="relative mb-3">
                                    {selectedStory.media.includes('video') ? (
                                        <video
                                            src={selectedStory.media}
                                            className="w-full h-32 object-cover rounded-lg"
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={selectedStory.media}
                                            alt="Story preview"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                        Story
                                    </div>
                                </div>
                            )}
                            {selectedStory.text && (
                                <p className="text-sm line-clamp-2">"{selectedStory.text}"</p>
                            )}
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
                                className={`flex-1 py-2 text-sm font-medium flex items-center justify-center ${activeTab === "users"
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-base-content/70 hover:bg-base-200"
                                    }`}
                                onClick={() => setActiveTab("users")}
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
                            >
                                <Users size={16} className="inline mr-2" />
                                Nhóm
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === "users" ? (
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
                                        onClick={() => {
                                            setShowForwardModal(false);
                                            setSelectedTargets([]);
                                        }}
                                        className="btn btn-sm"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleForwardToTargets}
                                        className="btn btn-sm btn-primary"
                                        disabled={selectedTargets.length === 0 || forwardLoading}
                                    >
                                        {forwardLoading ? 'Đang xử lý...' : 'Chuyển tiếp'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>, document.body)
            }
        </div>
    );
};

export default StoryFeed;