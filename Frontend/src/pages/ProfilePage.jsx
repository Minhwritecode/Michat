import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { Camera, Mail, User, Heart, HeartOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    const [selectedImg, setSelectedImg] = useState(null);
    const [viewedUser, setViewedUser] = useState(null);
    const [relationStatus, setRelationStatus] = useState("me");
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [userLabel, setUserLabel] = useState("");
    const [isFamily, setIsFamily] = useState(false);
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
        setLoading(false);
    };

    useEffect(() => { fetchProfile(); }, [userId]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            await updateProfile({ profilePic: base64Image });
            fetchProfile();
        };
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
        <div className="h-screen pt-20 bg-base-200">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8 shadow-xl">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold ">{viewedUser.fullName}</h1>
                        <p className="mt-2 text-zinc-400">{viewedUser.email}</p>
                        <div className="flex justify-center mt-4 gap-2">
                            <ProfileActionButton viewedUser={viewedUser} relationStatus={relationStatus} refresh={fetchProfile} />
                            {relationStatus !== "me" && (
                                <button
                                    className={`btn btn-sm ${isFamily ? "btn-error" : "btn-success"}`}
                                    onClick={handleToggleFamily}
                                >
                                    {isFamily ? <HeartOff size={16} /> : <Heart size={16} />}
                                    {isFamily ? "Xoá khỏi gia đình" : "Thêm vào gia đình"}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={selectedImg || viewedUser.profilePic || "/avatar.png"}
                                alt="Profile"
                                className="size-32 rounded-full object-cover border-4 shadow-lg"
                            />
                            {relationStatus === "me" && (
                                <label
                                    htmlFor="avatar-upload"
                                    className={`
                    absolute bottom-0 right-0 
                    bg-base-content hover:scale-105
                    p-2 rounded-full cursor-pointer 
                    transition-all duration-200
                    `}
                                >
                                    <Camera className="w-5 h-5 text-base-200" />
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-sm text-zinc-400">
                            {relationStatus === "me" ? "Click camera để đổi ảnh đại diện" : null}
                        </p>
                        {relationStatus !== "me" && (
                            <div className="flex gap-2 mt-2">
                                {LABELS.map(l => (
                                    <button
                                        key={l.key}
                                        className={`btn btn-xs ${userLabel === l.key ? "btn-primary" : "btn-outline"}`}
                                        onClick={() => handleLabelChange(l.key)}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                            </div>
                            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{viewedUser?.fullName}</p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </div>
                            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{viewedUser?.email}</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Bạn bè</h2>
                            {friends.length === 0 ? (
                                <div className="text-zinc-400">Chưa có bạn bè nào</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {friends.map(friend => (
                                        <div key={friend._id} className="flex flex-col items-center bg-base-100 rounded-lg p-2 shadow cursor-pointer hover:bg-base-200 transition"
                                            onClick={() => navigate(`/chat/${friend._id}`)}
                                            title={`Chat với ${friend.fullName}`}
                                        >
                                            <img src={friend.profilePic || "/avatar.png"} alt={friend.fullName} className="w-12 h-12 rounded-full object-cover mb-1" />
                                            <div className="text-xs font-medium text-center truncate w-20">{friend.fullName}</div>
                                            <div className="text-[10px] text-zinc-400 truncate w-20">{friend.email}</div>
                                            <button className="btn btn-xs btn-primary mt-1">Chat nhanh</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
