import { useEffect, useState } from "react";
import Story from "./Story";
import toast from "react-hot-toast";

const StoryList = () => {
    const [stories, setStories] = useState([]);
    const fetchStories = async () => {
        const res = await fetch("/api/story", { credentials: "include" });
        const data = await res.json();
        setStories(data);
    };
    useEffect(() => { fetchStories(); }, []);

    const handleReact = async (storyId, emoji) => {
        await fetch(`/api/story/${storyId}/react`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ emoji })
        });
        toast.success("Đã thả cảm xúc");
        fetchStories();
    };
    const handleReply = async (storyId, text) => {
        await fetch(`/api/story/${storyId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text })
        });
        toast.success("Đã gửi reply");
        fetchStories();
    };
    const handleForward = (story) => {
        // Có thể mở modal chọn người nhận hoặc chuyển tiếp vào chat
        toast("Chức năng chuyển tiếp story sẽ được bổ sung!");
    };

    return (
        <div className="w-full flex flex-col items-center">
            {stories.length === 0 ? (
                <div className="text-zinc-400">Chưa có story nào</div>
            ) : (
                stories.map(story => (
                    <Story
                        key={story._id}
                        story={story}
                        onReact={handleReact}
                        onReply={handleReply}
                        onForward={handleForward}
                    />
                ))
            )}
        </div>
    );
};

export default StoryList;