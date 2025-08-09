import { useEffect, useState } from "react";
import axiosInstance from "../../libs/axios";

const FriendRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/api/auth/friends-requests");
            setRequests(res.data.friendRequests || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const action = async (type, userId) => {
        const urlMap = {
            accept: `/api/auth/accept-friend/${userId}`,
            reject: `/api/auth/reject-friend/${userId}`,
        };
        await axiosInstance.post(urlMap[type]);
        fetchData();
    };

    if (loading) return <div className="p-4">Đang tải...</div>;

    if (requests.length === 0) return (
        <div className="p-4 text-base-content/60">Không có lời mời nào</div>
    );

    return (
        <div className="p-4 space-y-3">
            {requests.map(u => (
                <div key={u._id} className="flex items-center gap-3 bg-base-100 p-3 rounded-lg border">
                    <img src={u.profilePic || "/avatar.png"} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{u.fullName}</div>
                        <div className="text-xs text-base-content/60 truncate">{u.email}</div>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={() => action('accept', u._id)}>Chấp nhận</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => action('reject', u._id)}>Từ chối</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendRequests;


