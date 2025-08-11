import { useEffect, useState } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import useDraftStore from "../stores/useDraftStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Pin } from "lucide-react";

const LABELS = [
    { key: "all", label: "All" },
    { key: "family", label: "Gia đình" },
    { key: "bestie", label: "Bạn thân" },
    { key: "coworker", label: "Đồng nghiệp" },
    { key: "friend", label: "Bạn bè" },
    { key: "stranger", label: "Người lạ" },
];
const STATUS = [
    { key: "all", label: "Tất cả" },
    { key: "unread", label: "Chưa đọc" },
    { key: "read", label: "Đã đọc" },
];

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, subscribeToMessages, unsubscribeFromMessages, lastBubbledUserId, clearLastBubbledUser, isUserPinned, togglePinUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { hasDraft, getDraftPreview } = useDraftStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    useEffect(() => {
        getUsers();
        subscribeToMessages();
        const onLabel = (e) => {
            // Cập nhật label cho user mục tiêu ngay trong bộ nhớ để tránh refetch nặng
            const { userId, label } = e.detail || {};
            if (!userId) return;
            useChatStore.setState((state) => ({
                users: state.users.map(u => u._id === userId ? { ...u, label } : u)
            }));
        };
        const onSocketConnected = () => getUsers();
        window.addEventListener('label-updated', onLabel);
        window.addEventListener('socket-connected', onSocketConnected);

        // Live typing badge in Sidebar for direct chats
        const onTypingDirect = (e) => {
            const { from, isTyping } = e.detail || {};
            if (!from) return;
            const el = document.getElementById(`typing-badge-${from}`);
            if (!el) return;
            if (isTyping) {
                el.classList.remove('hidden');
                el.classList.add('flex');
                // auto-hide after 1.6s if no further typing
                clearTimeout(el._typingTimeout);
                el._typingTimeout = setTimeout(() => {
                    el.classList.add('hidden');
                    el.classList.remove('flex');
                }, 1600);
            } else {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
        };
        window.addEventListener('typing-direct', onTypingDirect);
        return () => {
            window.removeEventListener('label-updated', onLabel);
            window.removeEventListener('socket-connected', onSocketConnected);
            window.removeEventListener('typing-direct', onTypingDirect);
            unsubscribeFromMessages();
        };
    }, [getUsers, subscribeToMessages, unsubscribeFromMessages]);

    // Filter users với unreadCount thực tế
    const filteredUsers = users.filter(user => {
        let labelMatch = selectedLabel === "all" || user.label === selectedLabel;
        let statusMatch = true;
        if (selectedStatus === "unread") statusMatch = (user.unreadCount || 0) > 0;
        if (selectedStatus === "read") statusMatch = (user.unreadCount || 0) === 0;
        let onlineMatch = !showOnlineOnly || onlineUsers.includes(user._id);
        return labelMatch && statusMatch && onlineMatch;
    });

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 overflow-hidden">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2">
                    <Users className="size-6" />
                    <span className="font-medium hidden lg:block">Contacts</span>
                </div>
                {/* Filter UI */}
                <div className="mt-3 flex flex-col gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {LABELS.map(l => (
                            <button
                                key={l.key}
                                className={`btn btn-xs ${selectedLabel === l.key ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setSelectedLabel(l.key)}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {STATUS.map(s => (
                            <button
                                key={s.key}
                                className={`btn btn-xs ${selectedStatus === s.key ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setSelectedStatus(s.key)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <div className="hidden lg:flex items-center gap-2 mt-2">
                        <label className="cursor-pointer flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showOnlineOnly}
                                onChange={e => setShowOnlineOnly(e.target.checked)}
                                className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">Show online only</span>
                        </label>
                        <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
                    </div>
                </div>
            </div>
            <div className="overflow-y-auto w-full py-3">
                {filteredUsers.map(user => {
                    const hasUserDraft = hasDraft(user._id);
                    const draftPreview = getDraftPreview(user._id);

                    return (
                        <button
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`
                                w-full p-3 flex items-center gap-3
                                hover:bg-base-300 transition-colors
                                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                                ${lastBubbledUserId === user._id ? 'animate-[pulse_1.1s_ease-in-out_2] ring-2 ring-primary/50 bg-primary/5 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]' : ''}
                            `}
                            onAnimationEnd={() => {
                                if (lastBubbledUserId === user._id) clearLastBubbledUser();
                            }}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={user.profilePic || "/avatar.png"}
                                    alt={user.fullName}
                                    className="size-12 object-cover rounded-full"
                                />
                                {onlineUsers.includes(user._id) && (
                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                                )}
                                {(user.unreadCount || 0) > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
                                        {user.unreadCount > 99 ? "99+" : user.unreadCount}
                                    </span>
                                )}
                                {hasUserDraft && (
                                    <span className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
                                        📝
                                    </span>
                                )}
                            </div>
                            <div className="hidden lg:flex text-left min-w-0 flex-1 items-center gap-2">
                                <div className="font-medium truncate">{user.fullName}</div>
                                <div className="text-sm text-zinc-400 flex items-center gap-2">
                                    <span>
                                        {user.label ? LABELS.find(l => l.key === user.label)?.label : ""}
                                        {user.label && " • "}
                                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                    </span>
                                    {/* Typing badge (shows when user is typing to me anywhere) */}
                                    <span id={`typing-badge-${user._id}`} className="hidden items-center gap-1 text-primary">
                                        <span className="typing-dots"><span className="dot" /><span className="dot" /><span className="dot" /></span>
                                    </span>
                                </div>
                                {hasUserDraft && draftPreview && (
                                    <div className="text-xs text-blue-500 truncate mt-1 italic">
                                        📝 {draftPreview}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className={`btn btn-ghost btn-xs ml-auto ${isUserPinned(user._id) ? 'text-primary' : ''}`}
                                    title={isUserPinned(user._id) ? 'Bỏ ghim' : 'Ghim lên đầu'}
                                    onClick={(e) => { e.stopPropagation(); togglePinUser(user._id); }}
                                >
                                    <Pin size={14} />
                                </button>
                            </div>
                        </button>
                    );
                })}
                {filteredUsers.length === 0 && (
                    <div className="text-center text-zinc-500 py-4">No users found</div>
                )}
            </div>
        </aside>
    );
};
export default Sidebar;
