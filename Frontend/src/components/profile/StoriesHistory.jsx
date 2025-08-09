import { useEffect, useState } from "react";

const StoriesHistory = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewer, setViewer] = useState(null);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/story/my-stories", { credentials: "include" });
            const data = await res.json();
            setStories(Array.isArray(data) ? data : []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchStories(); }, []);

    if (loading) return <div className="p-4">Đang tải...</div>;

    if (stories.length === 0) return <div className="p-4 text-base-content/60">Chưa có story nào</div>;

    return (
        <div className="space-y-3">
            {/* 5 story một dòng */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {stories.map(s => (
                    <button key={s._id} className="group relative bg-base-100 rounded-lg overflow-hidden border hover:shadow-lg" onClick={() => setViewer(s)}>
                        {s.media?.match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                            <video src={s.media} className="w-full h-32 object-cover" />
                        ) : (
                            <img src={s.media || "/avatar.png"} className="w-full h-32 object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                ))}
            </div>

            {/* Viewer modal */}
            {viewer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setViewer(null)}>
                    <div className="bg-base-100 rounded-xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        {viewer.media?.match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                            <video src={viewer.media} className="w-full max-h-[80vh] object-contain" controls autoPlay />
                        ) : (
                            <img src={viewer.media} className="w-full max-h-[80vh] object-contain" />
                        )}
                        {viewer.text && <div className="p-4">{viewer.text}</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoriesHistory;


