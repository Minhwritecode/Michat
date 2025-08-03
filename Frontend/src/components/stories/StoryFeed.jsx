import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Eye, Clock } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import toast from "react-hot-toast";

const StoryFeed = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const { authUser } = useAuthStore();

    // Fetch tất cả stories còn hiệu lực
    const fetchStories = async () => {
        try {
            const res = await fetch("/story", { 
                credentials: "include" 
            });
            if (res.ok) {
                const data = await res.json();
                setStories(data);
            }
        } catch (error) {
            console.error("Error fetching stories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    // Group stories by user
    const storiesByUser = stories.reduce((acc, story) => {
        const userId = story.userId._id;
        if (!acc[userId]) {
            acc[userId] = {
                user: story.userId,
                stories: []
            };
        }
        acc[userId].stories.push(story);
        return acc;
    }, {});

    // Handle story reactions
    const handleReact = async (storyId, emoji) => {
        try {
            await fetch(`/story/${storyId}/react`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ emoji })
            });
            toast.success("Đã thả cảm xúc!");
            fetchStories();
        } catch (error) {
            toast.error("Thả cảm xúc thất bại!");
        }
    };

    // Handle story replies
    const handleReply = async (storyId, text) => {
        try {
            await fetch(`/story/${storyId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text })
            });
            toast.success("Đã gửi reply!");
            fetchStories();
        } catch (error) {
            toast.error("Gửi reply thất bại!");
        }
    };

    // Handle story forward
    const handleForward = (story) => {
        toast("Chức năng chuyển tiếp story sẽ được bổ sung!");
    };

    // Open story modal
    const openStoryModal = (story) => {
        setSelectedStory(story);
        setShowStoryModal(true);
    };

    // Calculate time remaining
    const getTimeRemaining = (expiredAt) => {
        const now = new Date();
        const expired = new Date(expiredAt);
        const diff = expired - now;
        
        if (diff <= 0) return "Đã hết hạn";
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md"></div>
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
                    {Object.values(storiesByUser).map((userStories) => {
                        const user = userStories.user;
                        const latestStory = userStories.stories[0]; // Lấy story mới nhất
                        const isOwnStory = user._id === authUser._id;
                        const hasReacted = latestStory.reactions?.some(r => r.userId === authUser._id);

                        return (
                            <div
                                key={user._id}
                                className="flex-shrink-0 w-20 text-center"
                            >
                                {/* Story Circle */}
                                <div className="relative mb-2">
                                    <button
                                        onClick={() => openStoryModal(latestStory)}
                                        className={`w-16 h-16 rounded-full p-0.5 transition-all duration-200 hover:scale-105 ${
                                            hasReacted 
                                                ? "bg-gradient-to-r from-pink-500 to-purple-500" 
                                                : "bg-gradient-to-r from-primary to-secondary"
                                        }`}
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
                                    
                                    {/* Time remaining */}
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-base-100 rounded-full px-2 py-1 text-xs shadow-sm flex items-center gap-1">
                                            <Clock size={10} />
                                            {getTimeRemaining(latestStory.expiredAt)}
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
            {showStoryModal && selectedStory && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-base-100 rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
                        {/* Story Header */}
                        <div className="flex items-center justify-between p-4 border-b border-base-300">
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
                                        {getTimeRemaining(selectedStory.expiredAt)} còn lại
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowStoryModal(false)}
                                className="btn btn-circle btn-sm btn-ghost"
                            >
                                ×
                            </button>
                        </div>

                        {/* Story Content */}
                        <div className="p-4">
                            {selectedStory.media && (
                                <img
                                    src={selectedStory.media}
                                    alt="Story"
                                    className="w-full rounded-lg mb-4 max-h-64 object-cover"
                                />
                            )}
                            
                            {selectedStory.text && (
                                <p className="text-base mb-4">{selectedStory.text}</p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReact(selectedStory._id, "❤️")}
                                        className="btn btn-circle btn-sm hover:scale-110 transition-transform"
                                        title="Thả tim"
                                    >
                                        <Heart size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleReply(selectedStory._id, "👍")}
                                        className="btn btn-circle btn-sm hover:scale-110 transition-transform"
                                        title="Reply"
                                    >
                                        <MessageCircle size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleForward(selectedStory)}
                                        className="btn btn-circle btn-sm hover:scale-110 transition-transform"
                                        title="Chuyển tiếp"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-base-content/70">
                                    <Eye size={14} />
                                    <span>{selectedStory.reactions?.length || 0} reactions</span>
                                </div>
                            </div>

                            {/* Reactions */}
                            {selectedStory.reactions?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {selectedStory.reactions.map((reaction, idx) => (
                                        <span key={idx} className="text-lg animate-bounce-in">
                                            {reaction.emoji}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryFeed; 