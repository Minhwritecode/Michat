import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Users, Search, UserPlus, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CreateStoryModal from "./stories/CreateStoryModal";
import toast from "react-hot-toast";
import axiosInstance from "../libs/axios";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [profileModal, setProfileModal] = useState({ open: false, user: null });
    const searchRef = useRef(null);

    const searchUsers = async (q) => {
        setQuery(q);
        if (!q.trim()) { setResults([]); setShowResults(false); return; }
        try {
            const res = await axiosInstance.get("/api/auth/users-with-unread");
            const users = res.data || [];
            const lowered = q.toLowerCase();
            const filtered = users.filter(u =>
                (u.fullName || "").toLowerCase().includes(lowered) ||
                (u.email || "").toLowerCase().includes(lowered)
            ).slice(0, 8);
            setResults(filtered);
            setShowResults(true);
        } catch {
            setResults([]);
            setShowResults(false);
        }
    };
    useEffect(() => {
        const handleClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        const handleKey = (e) => { if (e.key === 'Escape') setShowResults(false); };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    const handleAddFriend = async (userId) => {
        try {
            if (authUser?._id === userId) {
                toast.error("Không thể kết bạn với chính mình");
                return;
            }
            await axiosInstance.post(`/api/auth/add-friend/${userId}`);
            toast.success("Đã gửi lời mời kết bạn");
            setProfileModal(prev => ({
                open: false,
                user: prev.user ? { ...prev.user, relation: 'sent' } : null
            }));
        } catch (err) {
            const msg = err?.response?.data?.message || "Không thể gửi lời mời";
            toast.error(msg);
        }
    };

    const handleAccept = async (userId) => {
        try {
            await axiosInstance.post(`/api/auth/accept-friend/${userId}`);
            toast.success("Đã chấp nhận lời mời");
            setProfileModal(prev => ({ open: false, user: prev.user ? { ...prev.user, relation: 'friend' } : null }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể chấp nhận");
        }
    };

    const handleReject = async (userId) => {
        try {
            await axiosInstance.post(`/api/auth/reject-friend/${userId}`);
            toast.success("Đã từ chối lời mời");
            setProfileModal(prev => ({ open: false, user: prev.user ? { ...prev.user, relation: 'stranger' } : null }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể từ chối");
        }
    };

    const handleCancel = async (userId) => {
        try {
            await axiosInstance.post(`/api/auth/cancel-friend/${userId}`);
            toast.success("Đã huỷ lời mời");
            setProfileModal(prev => ({ open: false, user: prev.user ? { ...prev.user, relation: 'stranger' } : null }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể huỷ lời mời");
        }
    };

    const handleUnfriend = async (userId) => {
        try {
            await axiosInstance.post(`/api/auth/unfriend/${userId}`);
            toast.success("Đã huỷ kết bạn");
            setProfileModal(prev => ({ open: false, user: prev.user ? { ...prev.user, relation: 'stranger' } : null }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể huỷ kết bạn");
        }
    };
    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">Michat</h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search box */}
                        <div className="relative hidden md:block" ref={searchRef}>
                            <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1.5 w-72 focus-within:ring-2 ring-primary transition">
                                <Search size={16} className="text-base-content/60" />
                                <input
                                    value={query}
                                    onChange={(e) => searchUsers(e.target.value)}
                                    onFocus={() => { if (results.length > 0) setShowResults(true); }}
                                    placeholder="Tìm bạn bè..."
                                    className="bg-transparent outline-none text-sm flex-1"
                                />
                            </div>
                            {showResults && results.length > 0 && (
                                <div className="absolute mt-2 w-full bg-base-100 rounded-xl shadow-xl border border-base-300 z-50 overflow-hidden">
                                    {results.map(u => (
                                        <button
                                            key={u._id}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-base-200 transition text-left"
                                            onClick={() => { setProfileModal({ open: true, user: u }); setShowResults(false); }}
                                        >
                                            <img src={u.profilePic || "/avatar.png"} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{u.fullName}</div>
                                                <div className="text-xs text-base-content/60 truncate">{u.email}</div>
                                            </div>
                                            {u.relation === 'friend' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Friend</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {authUser && (
                            <>
                                <button
                                    className="btn btn-sm btn-primary font-semibold"
                                    onClick={() => setShowCreateStory(true)}
                                >
                                    + Tạo Story
                                </button>
                                <Link
                                    to={"/groups"}
                                    className={`btn btn-sm gap-2 transition-colors`}>
                                    <Users className="w-4 h-4" />
                                    <span className="hidden sm:inline">Nhóm</span>
                                </Link>
                            </>
                        )}
                        <Link
                            to={"/settings"}
                            className={`btn btn-sm gap-2 transition-colors`}>
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>
                        {authUser && (
                            <>
                                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>
                                <button className="flex gap-2 items-center" onClick={logout}>
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {authUser && (
                <CreateStoryModal
                    isOpen={showCreateStory}
                    onClose={() => setShowCreateStory(false)}
                    onCreated={() => setShowCreateStory(false)}
                />
            )}

            {/* User Profile Quick Modal (Portal to body to cover full page) */}
            {profileModal.open && profileModal.user && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setProfileModal({ open: false, user: null })}>
                    <div className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-base-300 flex items-center gap-3">
                            <img src={profileModal.user.profilePic || "/avatar.png"} alt={profileModal.user.fullName} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{profileModal.user.fullName}</div>
                                <div className="text-sm text-base-content/70 truncate">{profileModal.user.email}</div>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="opacity-70">Quan hệ:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${profileModal.user.relation === 'friend' ? 'bg-green-100 text-green-700' : 'bg-base-200'}`}>
                                    {profileModal.user.relation || 'stranger'}
                                </span>
                                {profileModal.user.label && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{profileModal.user.label}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                {profileModal.user.relation === 'friend' && (
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm btn-outline w-full" onClick={() => window.location.href = '/profile'}>
                                            <Check size={16} /> Bạn bè
                                        </button>
                                        <button className="btn btn-sm btn-error w-full" onClick={() => handleUnfriend(profileModal.user._id)}>
                                            Huỷ kết bạn
                                        </button>
                                    </div>
                                )}
                                {profileModal.user.relation === 'stranger' && (
                                    <button
                                        className="btn btn-sm btn-primary w-full"
                                        onClick={() => handleAddFriend(profileModal.user._id)}
                                    >
                                        <UserPlus size={16} /> Thêm bạn
                                    </button>
                                )}
                                {profileModal.user.relation === 'received' && (
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm btn-success w-full" onClick={() => handleAccept(profileModal.user._id)}>Chấp nhận</button>
                                        <button className="btn btn-sm btn-ghost w-full" onClick={() => handleReject(profileModal.user._id)}>Từ chối</button>
                                    </div>
                                )}
                                {profileModal.user.relation === 'sent' && (
                                    <button className="btn btn-sm w-full" onClick={() => handleCancel(profileModal.user._id)}>Huỷ lời mời</button>
                                )}
                                <button className="btn btn-sm w-full" onClick={() => setProfileModal({ open: false, user: null })}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>, document.body)
            }
        </header>
    );
};
export default Navbar;
