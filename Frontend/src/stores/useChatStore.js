import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../libs/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    // Pinning users and groups (persist locally)
    pinnedUserIds: (() => {
        try { return JSON.parse(localStorage.getItem("michat-pinned-users") || "[]"); } catch { return []; }
    })(),
    pinnedGroupIds: (() => {
        try { return JSON.parse(localStorage.getItem("michat-pinned-groups") || "[]"); } catch { return []; }
    })(),
    // id user vừa được đẩy lên top do tin nhắn mới (để highlight UI)
    lastBubbledUserId: null,
    // Lưu danh sách user đã tắt thông báo (persist localStorage)
    mutedUserIds: (() => {
        try {
            const raw = localStorage.getItem("michat-muted-users");
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    })(),
    // Notifications cache
    notifications: [],
    unreadNotifications: 0,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/api/auth/users-with-unread");
            // Ensure label field exists (fallback relation->friend)
            const users = (res.data || [])
                .map(u => ({
                    ...u,
                    label: u.label || (u.relation === 'friend' ? 'friend' : u.label),
                    lastMessageAt: u.lastMessageAt ? new Date(u.lastMessageAt).getTime() : 0
                }))
                // sort with pinned first, then by lastMessageAt desc
                .sort((a, b) => {
                    const pins = get().pinnedUserIds;
                    const aPinned = pins.includes(a._id);
                    const bPinned = pins.includes(b._id);
                    if (aPinned && !bPinned) return -1;
                    if (!aPinned && bPinned) return 1;
                    return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
                });
            set({ users });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/api/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // Lấy tin nhắn trong nhóm
    getGroupMessages: async (groupId, page = 1, limit = 50) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/api/groups/${groupId}/messages`, {
                params: { page, limit }
            });
            const messages = res.data?.data?.messages || res.data;
            set({ messages });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tải tin nhắn nhóm');
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData, options = {}) => {
        try {
            const { isGroup = false, targetId = null } = options;

            if (!targetId) {
                throw new Error(isGroup ? "Group ID is required" : "No recipient selected");
            }

            const endpoint = isGroup
                ? `/api/groups/${targetId}/messages`
                : `/api/messages/send/${targetId}`;

            const res = await axiosInstance.post(endpoint, messageData);

            // Chuẩn hóa payload khi backend trả về dạng { success, data }
            const createdMessage = res.data?.data || res.data;

            // Cập nhật state nhanh
            set(state => ({
                messages: [...state.messages, createdMessage],
                groups: isGroup && state.groups
                    ? state.groups.map(g =>
                        g._id === targetId ? { ...g, lastMessage: createdMessage } : g
                    )
                    : state.groups,
                users: !isGroup && state.users && createdMessage
                    ? state.users
                        .map(u => u._id === (createdMessage.senderId?._id || createdMessage.senderId) || u._id === (createdMessage.receiverId?._id || createdMessage.receiverId)
                            ? { ...u, lastMessageAt: new Date(createdMessage.createdAt).getTime() }
                            : u)
                        .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
                    : state.users
            }));

            // Đồng bộ lại danh sách tin nhắn nhóm từ server để đảm bảo nhất quán
            if (isGroup) {
                await get().getGroupMessages(targetId).catch((error) => {
                    console.debug('refresh group messages error:', error);
                });
            }

            return createdMessage;
        } catch (error) {
            console.error("Send message error:", error);
            throw error;
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Đảm bảo không bị đăng ký trùng listener
        socket.off("newMessage");
        socket.off("messageReaction");
        socket.off("inboxActivity");
        socket.off("messageEdited");

        socket.on("newMessage", (newMessage) => {
            set({ messages: [...get().messages, newMessage] });
            // Reorder users in sidebar when a message arrives
            // Nếu user bị mute thì KHÔNG đẩy lên top
            set((state) => {
                const authUser = useAuthStore.getState().authUser;
                const myId = authUser?._id;
                const mutedSet = new Set(get().mutedUserIds);
                const senderId = newMessage.senderId?._id || newMessage.senderId;
                const receiverId = newMessage.receiverId?._id || newMessage.receiverId;
                const partnerId = senderId === myId ? receiverId : senderId;
                const createdAtMs = new Date(newMessage.createdAt).getTime();

                const updatedUsers = state.users
                    .map((u) => {
                        const isTarget = u._id === partnerId;
                        if (!isTarget) return u;
                        if (mutedSet.has(u._id)) return u; // giữ nguyên thứ tự nếu đang mute
                        return { ...u, lastMessageAt: createdAtMs };
                    })
                    .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

                return { users: updatedUsers, lastBubbledUserId: mutedSet.has(partnerId) ? state.lastBubbledUserId : partnerId };
            });
        });

        socket.on("messageReaction", ({ messageId, reactions }) => {
            set({
                messages: get().messages.map(msg =>
                    msg._id === messageId ? { ...msg, reactions } : msg
                )
            });
        });
        socket.on("inboxActivity", ({ userIds, lastMessageAt }) => {
            set(state => ({
                users: state.users
                    .map(u => {
                        const mutedSet = new Set(get().mutedUserIds);
                        if (!userIds.includes(u._id.toString())) return u;
                        if (mutedSet.has(u._id)) return u;
                        return { ...u, lastMessageAt: new Date(lastMessageAt).getTime() };
                    })
                    .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
            }));
            // Highlight the first matching user id (prioritize the one that's not me)
            const authUser = useAuthStore.getState().authUser;
            const myId = authUser?._id?.toString();
            const partner = userIds.find(id => id !== myId);
            const mutedSet = new Set(get().mutedUserIds);
            if (partner && !mutedSet.has(partner)) set({ lastBubbledUserId: partner });
        });

        socket.on("messageEdited", ({ messageId, text, editedAt }) => {
            set({
                messages: get().messages.map(msg =>
                    msg._id === messageId ? { ...msg, text, isEdited: true, editedAt } : msg
                )
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messageReaction");
        socket.off("messageEdited");
        socket.off("inboxActivity");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    clearLastBubbledUser: () => set({ lastBubbledUserId: null }),

    // Mute helpers
    isUserMuted: (userId) => {
        return get().mutedUserIds.includes(userId);
    },
    setMuteForUser: (userId, shouldMute) => {
        if (!userId) return;
        set((state) => {
            const setNext = new Set(state.mutedUserIds);
            if (shouldMute) setNext.add(userId); else setNext.delete(userId);
            const nextArr = Array.from(setNext);
            try { localStorage.setItem("michat-muted-users", JSON.stringify(nextArr)); } catch (error) {
                console.debug('persist muted users error:', error);
            }
            return { mutedUserIds: nextArr };
        });
    },
    toggleMuteForUser: (userId) => {
        if (!userId) return;
        const currentlyMuted = get().mutedUserIds.includes(userId);
        get().setMuteForUser(userId, !currentlyMuted);
    },

    // Notification helpers
    pushNotification: (notif) => set((state) => ({ notifications: [notif, ...state.notifications].slice(0, 100), unreadNotifications: state.unreadNotifications + 1 })),
    markNotificationRead: (id) => set((state) => {
        // If id missing (ephemeral), mark first unread item
        if (!id) {
            const idx = state.notifications.findIndex(n => !n.read);
            if (idx >= 0) {
                const copy = [...state.notifications];
                copy[idx] = { ...copy[idx], read: true };
                return { notifications: copy, unreadNotifications: Math.max(0, state.unreadNotifications - 1) };
            }
            return {};
        }
        const wasUnread = state.notifications.find(n => n._id === id && !n.read);
        return {
            notifications: state.notifications.map(n => n._id === id ? { ...n, read: true } : n),
            unreadNotifications: Math.max(0, state.unreadNotifications - (wasUnread ? 1 : 0))
        };
    }),
    setNotifications: (items) => set({ notifications: items, unreadNotifications: items.filter(i => !i.read).length }),

    // Pin helpers
    isUserPinned: (userId) => get().pinnedUserIds.includes(userId),
    togglePinUser: (userId) => {
        if (!userId) return;
        set((state) => {
            const pins = new Set(state.pinnedUserIds);
            if (pins.has(userId)) pins.delete(userId); else pins.add(userId);
            const arr = Array.from(pins);
            try { localStorage.setItem("michat-pinned-users", JSON.stringify(arr)); } catch (error) {
                console.debug('persist pinned users error:', error);
            }
            // re-apply sorting
            const resorted = [...state.users].sort((a, b) => {
                const aPinned = arr.includes(a._id);
                const bPinned = arr.includes(b._id);
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
            });
            return { pinnedUserIds: arr, users: resorted };
        });
    },

    isGroupPinned: (groupId) => get().pinnedGroupIds.includes(groupId),
    togglePinGroup: (groupId) => {
        if (!groupId) return;
        set((state) => {
            const pins = new Set(state.pinnedGroupIds);
            if (pins.has(groupId)) pins.delete(groupId); else pins.add(groupId);
            const arr = Array.from(pins);
            try { localStorage.setItem("michat-pinned-groups", JSON.stringify(arr)); } catch (error) {
                console.debug('persist pinned groups error:', error);
            }
            return { pinnedGroupIds: arr };
        });
    },

    // Mark message as read
    markMessageAsRead: async (messageId) => {
        try {
            await axiosInstance.put(`/api/messages/${messageId}/read`);
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    },

    // Mark all messages from a user as read
    markAllMessagesAsRead: async (senderId) => {
        try {
            await axiosInstance.put(`/api/messages/${senderId}/mark-all-read`);
        } catch (error) {
            console.error("Error marking all messages as read:", error);
        }
    },

    // Get read receipts for a message
    getReadReceipts: async (messageId) => {
        try {
            const response = await axiosInstance.get(`/api/messages/${messageId}/read-receipts`);
            return response.data.readBy;
        } catch (error) {
            console.error("Error getting read receipts:", error);
            return [];
        }
    },
}));