import { useState } from "react";
import { Smile, Send, Share2 } from "lucide-react";

const emojiList = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const Story = ({ story, onReact, onReply, onForward }) => {
    const [reply, setReply] = useState("");
    const [showReply, setShowReply] = useState(false);

    return (
        <div className="max-w-xs mx-auto bg-base-100 rounded-xl shadow-lg p-4 mb-6 relative">
            <div className="flex items-center gap-2 mb-2">
                <img src={story.userId.profilePic || "/avatar.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <div className="font-semibold">{story.userId.fullName}</div>
                    <div className="text-xs text-zinc-400">{new Date(story.createdAt).toLocaleString()}</div>
                </div>
            </div>
            {story.media && (
                <img src={story.media} alt="story" className="w-full rounded-lg mb-2 max-h-60 object-cover" />
            )}
            {story.text && <div className="mb-2 text-base">{story.text}</div>}
            <div className="flex gap-2 mb-2">
                {emojiList.map(emoji => (
                    <button
                        key={emoji}
                        className="text-xl hover:scale-125 transition"
                        onClick={() => onReact(story._id, emoji)}
                        title={emoji}
                    >
                        {emoji}
                    </button>
                ))}
                <button className="ml-auto" onClick={() => onForward(story)} title="Chuyển tiếp story">
                    <Share2 size={18} />
                </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
                {story.reactions?.map((r, idx) => (
                    <span key={idx} className="text-lg">{r.emoji}</span>
                ))}
            </div>
            <button className="btn btn-xs btn-outline w-full mb-2" onClick={() => setShowReply(v => !v)}>
                <Smile size={16} className="mr-1" /> Reply Story
            </button>
            {showReply && (
                <form
                    className="flex gap-2 mt-1"
                    onSubmit={e => {
                        e.preventDefault();
                        onReply(story._id, reply);
                        setReply("");
                        setShowReply(false);
                    }}
                >
                    <input
                        className="input input-sm flex-1"
                        placeholder="Nhập tin nhắn..."
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                    />
                    <button className="btn btn-sm btn-primary" type="submit">
                        <Send size={16} />
                    </button>
                </form>
            )}
            {/* Hiển thị reply */}
            {story.replies?.length > 0 && (
                <div className="mt-2 bg-base-200 rounded p-2 max-h-32 overflow-y-auto">
                    <div className="font-semibold text-xs mb-1">Reply:</div>
                    {story.replies.map((r, idx) => (
                        <div key={idx} className="text-xs mb-1">
                            <span className="font-medium">{r.userId?.fullName || "Ẩn danh"}:</span> {r.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Story;