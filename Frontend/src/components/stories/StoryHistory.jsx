import { useState, useEffect, useCallback } from "react";
import { Trash2, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import toast from "react-hot-toast";
import CreateStoryModal from "./CreateStoryModal";

const StoryHistory = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { authUser } = useAuthStore();

    // Fetch stories của user hiện tại - sử dụng useCallback để tránh re-create
    const fetchUserStories = useCallback(async () => {
        try {
            const res = await fetch("/api/story/my-stories", { 
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
    }, []);

    useEffect(() => {
        let isMounted = true;
        
        const loadStories = async () => {
            if (isMounted) {
                await fetchUserStories();
            }
        };
        
        loadStories();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [fetchUserStories]);

    // Xóa story
    const handleDeleteStory = async (storyId) => {
        if (!confirm("Bạn có chắc chắn muốn xóa story này?")) return;
        
        try {
            const res = await fetch(`/api/story/${storyId}`, {
                method: "DELETE",
                credentials: "include"
            });
            
            if (res.ok) {
                toast.success("Đã xóa story!");
                fetchUserStories();
            } else {
                toast.error("Xóa story thất bại!");
            }
        } catch (error) {
            toast.error("Xóa story thất bại!");
        }
    };

    // Xem lại story (có thể mở modal xem chi tiết)
    const handleViewStory = (story) => {
        // TODO: Implement modal xem story chi tiết
        console.log("View story:", story);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Hôm nay";
        if (diffDays === 2) return "Hôm qua";
        if (diffDays <= 7) return `${diffDays - 1} ngày trước`;
        return date.toLocaleDateString("vi-VN");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Story của tôi</h3>
                    <p className="text-sm text-base-content/70">
                        {stories.length} story • Chỉ hiển thị story của bạn
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-sm btn-primary gap-2 hover:scale-105 transition-transform"
                >
                    <Plus size={16} />
                    Tạo story mới
                </button>
            </div>

            {/* Story Carousel */}
            {stories.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-xl">
                    <div className="text-base-content/50 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-medium mb-2">Chưa có story nào</h4>
                    <p className="text-base-content/70 mb-4">
                        Tạo story đầu tiên để chia sẻ khoảnh khắc của bạn!
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary gap-2"
                    >
                        <Plus size={16} />
                        Tạo story đầu tiên
                    </button>
                </div>
            ) : (
                <div className="relative">
                    {/* Scroll Container */}
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {stories.map((story) => (
                            <div
                                key={story._id}
                                className="flex-shrink-0 w-64 bg-base-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Story Media */}
                                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20">
                                    {story.media ? (
                                        <img
                                            src={story.media}
                                            alt="Story"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-base-content/50">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button
                                            onClick={() => handleViewStory(story)}
                                            className="btn btn-circle btn-xs bg-base-100/80 hover:bg-base-100"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStory(story._id)}
                                            className="btn btn-circle btn-xs bg-error/80 hover:bg-error text-error-content"
                                            title="Xóa story"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Story Content */}
                                <div className="p-4">
                                    {story.text && (
                                        <p className="text-sm mb-2 line-clamp-2">
                                            {story.text}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-base-content/60">
                                        <span>{formatDate(story.createdAt)}</span>
                                        {story.reactions?.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span>❤️</span>
                                                <span>{story.reactions.length}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Scroll Indicators (simple dots and arrows) */}
                    <div className="flex justify-center mt-4 gap-2">
                        <button className="btn btn-circle btn-sm btn-ghost">
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.ceil(stories.length / 3) }, (_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-base-300"></div>
                            ))}
                        </div>
                        <button className="btn btn-circle btn-sm btn-ghost">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Create Story Modal */}
            <CreateStoryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={() => {
                    setShowCreateModal(false);
                    fetchUserStories();
                }}
            />
        </div>
    );
};

export default StoryHistory; 