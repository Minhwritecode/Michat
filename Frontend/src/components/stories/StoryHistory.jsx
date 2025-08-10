import { useState, useEffect, useCallback, useRef } from "react";
import { Trash2, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import toast from "react-hot-toast";
import CreateStoryModal from "./CreateStoryModal";

const StoryHistory = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewer, setViewer] = useState(null);
    useAuthStore();

    // Refs must be declared unconditionally before any early return
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const cardWidthWithGap = 256 + 16; // w-64 + gap-4

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current; if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }, []);

    const scrollByCols = (dir) => {
        const el = scrollRef.current; if (!el) return;
        el.scrollBy({ left: dir * cardWidthWithGap, behavior: 'smooth' });
        setTimeout(updateScrollState, 250);
    };

    useEffect(() => {
        updateScrollState();
        const el = scrollRef.current; if (!el) return;
        el.addEventListener('scroll', updateScrollState);
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState]);

    // Recompute when stories list changes (after render)
    useEffect(() => {
        const t = setTimeout(updateScrollState, 50);
        return () => clearTimeout(t);
    }, [stories.length, updateScrollState]);

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
        } catch {
            console.error("Error fetching stories");
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
        } catch {
            toast.error("Xóa story thất bại!");
        }
    };

    // Xem lại story (có thể mở modal xem chi tiết)
    const handleViewStory = (story) => {
        setViewer(story);
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
                    {/* Overlay arrows */}
                    {(stories.length > 4) && (
                        <>
                            <button
                                className="flex absolute left-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm bg-base-100/90 border border-base-300 shadow"
                                onClick={() => scrollByCols(-1)}
                                aria-label="Scroll left"
                                disabled={!canScrollLeft}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="flex absolute right-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm bg-base-100/90 border border-base-300 shadow"
                                onClick={() => scrollByCols(1)}
                                aria-label="Scroll right"
                                disabled={!canScrollRight}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </>
                    )}

                    {/* Scroll Container: 4 per row visually using fixed card width (w-64) */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                    >
                        {stories.map((story) => (
                            <div
                                key={story._id}
                                className="flex-shrink-0 w-64 bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 snap-start"
                            >
                                {/* Story Media */}
                                <div className="relative h-40 bg-base-200">
                                    {story.media ? (
                                        /\.(mp4|webm|ogg)(\?|$)/i.test(story.media) ? (
                                            <video
                                                src={story.media}
                                                className="w-full h-full object-cover"
                                                preload="metadata"
                                                muted
                                                playsInline
                                                onMouseEnter={e => e.currentTarget.play()}
                                                onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                            />
                                        ) : (
                                            <img
                                                src={story.media}
                                                alt="Story"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.src = '/avatar.png'; }}
                                            />
                                        )
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
                                            className="btn btn-circle btn-xs bg-base-100/90 border border-base-300 hover:bg-base-100"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStory(story._id)}
                                            className="btn btn-circle btn-xs bg-error/90 hover:bg-error text-error-content"
                                            title="Xóa story"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Story Content */}
                                <div className="p-4">
                                    {story.text && (
                                        <p className="text-sm mb-2 line-clamp-2 leading-5">
                                            {story.text}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-base-content/60 pt-1">
                                        <span className="truncate">{formatDate(story.createdAt)}</span>
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

                    {/* Scroll Controls indicators */}
                    <div className="flex justify-center mt-3 gap-2">
                        <button className="btn btn-circle btn-xs btn-ghost" onClick={() => scrollByCols(-1)} disabled={!canScrollLeft}>
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.max(1, Math.ceil(stories.length / 4)) }, (_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-base-300"></div>
                            ))}
                        </div>
                        <button className="btn btn-circle btn-xs btn-ghost" onClick={() => scrollByCols(1)} disabled={!canScrollRight}>
                            <ChevronRight size={14} />
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

            {/* Viewer Modal */}
            {viewer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setViewer(null)}>
                    <div className="bg-base-100 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 border-b border-base-300 flex items-center justify-between">
                            <div className="font-semibold">Story chi tiết</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setViewer(null)}>Đóng</button>
                        </div>
                        <div className="p-0">
                            {viewer.media ? (/\.(mp4|webm|ogg)(\?|$)/i.test(viewer.media) ? (
                                <video src={viewer.media} controls className="w-full max-h-[70vh] object-contain bg-black" />
                            ) : (
                                <img src={viewer.media} alt="story" className="w-full max-h-[70vh] object-contain bg-base-200" />
                            )) : (
                                <div className="w-full h-64 flex items-center justify-center text-base-content/50">Không có media</div>
                            )}
                            {viewer.text && (
                                <div className="px-6 py-4 border-t border-base-200 text-sm leading-6">{viewer.text}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryHistory; 