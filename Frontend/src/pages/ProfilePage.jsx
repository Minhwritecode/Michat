import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { Heart, HeartOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProfileOverview from "../components/profile/ProfileOverview";
import FriendRequests from "../components/profile/FriendRequests";
import FriendsList from "../components/profile/FriendsList";
import StoriesHistory from "../components/profile/StoriesHistory";

const LABELS = [
    { key: "family", label: "Gia đình" },
    { key: "friend", label: "Bạn bè" },
    { key: "stranger", label: "Người lạ" },
];

const ProfileActionButton = ({ viewedUser, relationStatus, refresh }) => {
    const handleAction = async (action) => {
        let url = "";
        switch (action) {
            case "add":
                url = `/api/auth/add-friend/${viewedUser._id}`; break;
            case "accept":
                url = `/api/auth/accept-friend/${viewedUser._id}`; break;
            case "reject":
                url = `/api/auth/reject-friend/${viewedUser._id}`; break;
            case "cancel":
                url = `/api/auth/cancel-friend/${viewedUser._id}`; break;
            case "unfriend":
                url = `/api/auth/unfriend/${viewedUser._id}`; break;
        }
        if (!url) return;
        const res = await fetch(url, { method: "POST", credentials: "include" });
        const data = await res.json();
        toast.success(data.message);
        refresh();
    };

    if (relationStatus === "me") return null;
    if (relationStatus === "friend")
        return <button className="btn btn-error" onClick={() => handleAction("unfriend")}>Huỷ kết bạn</button>;
    if (relationStatus === "sent")
        return <button className="btn btn-warning" onClick={() => handleAction("cancel")}>Huỷ lời mời</button>;
    if (relationStatus === "received")
        return (
            <div className="flex gap-2">
                <button className="btn btn-success" onClick={() => handleAction("accept")}>Chấp nhận</button>
                <button className="btn btn-error" onClick={() => handleAction("reject")}>Từ chối</button>
            </div>
        );
    return <button className="btn btn-primary" onClick={() => handleAction("add")}>Kết bạn</button>;
};

const ProfilePage = () => {
    const { authUser, updateProfile } = useAuthStore();
    const [viewedUser, setViewedUser] = useState(null);
    const [relationStatus, setRelationStatus] = useState("me");
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [userLabel, setUserLabel] = useState("");
    const [isFamily, setIsFamily] = useState(false);
    const [myStories, setMyStories] = useState([]);
    const navigate = useNavigate();

    // Giả sử bạn lấy userId từ URL hoặc props, ở đây demo lấy chính mình
    const userId = authUser._id;

    const fetchProfile = async () => {
        setLoading(true);
        // Lấy thông tin user đang xem
        const res = await fetch(`/api/auth/profile/${userId}`, { credentials: "include" });
        const user = await res.json();
        setViewedUser(user);
        setUserLabel(user.label || "");
        setIsFamily(user.label === "family");
        // Lấy quan hệ
        const relRes = await fetch(`/api/auth/friends-requests`, { credentials: "include" });
        const rel = await relRes.json();
        if (user._id === authUser._id) setRelationStatus("me");
        else if (rel.friends.some(u => u._id === user._id)) setRelationStatus("friend");
        else if (rel.sentRequests.some(u => u._id === user._id)) setRelationStatus("sent");
        else if (rel.friendRequests.some(u => u._id === user._id)) setRelationStatus("received");
        else setRelationStatus("none");
        // Lấy danh sách bạn bè của user đang xem
        const friendsRes = await fetch(`/api/auth/friends-requests`, { credentials: "include" });
        const friendsData = await friendsRes.json();
        if (user._id === authUser._id) setFriends(friendsData.friends);
        else {
            // Nếu xem profile người khác, cần API riêng để lấy bạn bè của họ (giả sử user trả về friends)
            setFriends(user.friends || []);
        }
        // Lấy lịch sử story của tôi (nếu xem profile của chính mình)
        try {
            if (user._id === authUser._id) {
                const myStoriesRes = await fetch(`/api/story/my-stories`, { credentials: "include" });
                if (myStoriesRes.ok) {
                    const data = await myStoriesRes.json();
                    setMyStories(Array.isArray(data) ? data : []);
                }
            } else {
                setMyStories([]);
            }
        } catch (_) { setMyStories([]); }

        setLoading(false);
    };

    useEffect(() => { fetchProfile(); }, [userId]);

    const handleImageUpload = async (img) => {
        await updateProfile({ profilePic: img });
        fetchProfile();
    };

    const handleLabelChange = async (label) => {
        setUserLabel(label);
        await fetch(`/api/auth/label/${viewedUser._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ label })
        });
        fetchProfile();
    };

    const handleToggleFamily = async () => {
        try {
            const res = await fetch(`/api/auth/family/${viewedUser._id}`, {
                method: "POST",
                credentials: "include"
            });
            const data = await res.json();
            toast.success(data.message);
            fetchProfile();
        } catch {
            toast.error("Lỗi cập nhật gia đình");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    if (!viewedUser) return <div className="flex justify-center items-center h-screen">Không tìm thấy user</div>;

    return (
        <div className="min-h-screen pt-20 bg-base-200">
            <div className="max-w-5xl mx-auto p-4 py-8 space-y-6">
                <ProfileOverview user={viewedUser} onUpdateAvatar={handleImageUpload} />
                <div className="flex justify-end gap-2">
                    <ProfileActionButton viewedUser={viewedUser} relationStatus={relationStatus} refresh={fetchProfile} />
                    {relationStatus !== "me" && (
                        <button className={`btn btn-sm ${isFamily ? "btn-error" : "btn-success"}`} onClick={handleToggleFamily}>
                            {isFamily ? <HeartOff size={16} /> : <Heart size={16} />}
                            {isFamily ? "Xoá khỏi gia đình" : "Thêm vào gia đình"}
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-base-100 rounded-xl border border-base-300 shadow">
                            <div className="p-4 border-b font-semibold">Lời mời kết bạn</div>
                            <FriendRequests />
                        </div>
                        <div className="bg-base-100 rounded-xl border border-base-300 shadow">
                            <div className="p-4 border-b font-semibold flex items-center gap-2"><Clock className="w-4 h-4" /> Lịch sử Story</div>
                            <StoriesHistory />
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-base-100 rounded-xl border border-base-300 shadow">
                        <div className="p-4 border-b font-semibold">Danh sách bạn bè & Bộ lọc</div>
                        <FriendsList />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
