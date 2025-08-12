import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../libs/axios";

const LABEL_OPTIONS = [
    { key: "family", label: "Gia đình" },
    { key: "bestie", label: "Bạn thân" },
    { key: "coworker", label: "Đồng nghiệp" },
    { key: "friend", label: "Bạn bè" },
];

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/api/auth/friends-requests");
            setFriends(res.data.friends || []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchFriends(); }, []);
    useEffect(() => {
        const onLabel = (e) => fetchFriends();
        window.addEventListener('label-updated', onLabel);
        return () => window.removeEventListener('label-updated', onLabel);
    }, []);

    const updateLabel = async (userId, label) => {
        await axiosInstance.put(`/api/auth/label/${userId}`, { label });
        fetchFriends();
    };

    const filtered = useMemo(() => {
        // Deduplicate by _id to avoid duplicate keys in render
        const dedupedMap = new Map();
        for (const u of friends) {
            if (u && u._id && !dedupedMap.has(u._id)) dedupedMap.set(u._id, u);
        }
        const list = Array.from(dedupedMap.values());
        if (filter === "all") return list;
        return list.filter(u => (u.label || 'friend') === filter);
    }, [friends, filter]);

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">Lọc:</span>
                <select className="select select-sm select-bordered" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">Tất cả</option>
                    {LABEL_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
            </div>
            {loading ? (
                <div>Đang tải...</div>
            ) : filtered.length === 0 ? (
                <div className="text-base-content/60">Không có bạn nào</div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {filtered.map(u => (
                        <div key={u._id} className="bg-base-100 p-3 rounded-lg border flex items-center gap-3">
                            <img src={u.profilePic || "/avatar.png"} className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{u.fullName}</div>
                                <div className="text-xs text-base-content/60 truncate">{u.email}</div>
                                <div className="mt-1">
                                    <select className="select select-xs select-bordered" value={u.label || "friend"} onChange={e => updateLabel(u._id, e.target.value)}>
                                        {LABEL_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendsList;


