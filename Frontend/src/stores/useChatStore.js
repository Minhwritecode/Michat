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

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/api/auth/users-with-unread");
            // Ensure label field exists (fallback relation->friend)
            const users = (res.data || []).map(u => ({
                ...u,
                label: u.label || (u.relation === 'friend' ? 'friend' : u.label)
            }));
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
                await get().getGroupMessages(targetId).catch(() => { });
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

        socket.on("newMessage", (newMessage) => {
            set({ messages: [...get().messages, newMessage] });
            // Reorder users in sidebar when a message arrives
            set(state => ({
                users: state.users
                    .map(u => (u._id === (newMessage.senderId?._id || newMessage.senderId) || u._id === (newMessage.receiverId?._id || newMessage.receiverId))
                        ? { ...u, lastMessageAt: new Date(newMessage.createdAt).getTime() }
                        : u)
                    .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
            }));
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
                    .map(u => (userIds.includes(u._id.toString())
                        ? { ...u, lastMessageAt: new Date(lastMessageAt).getTime() }
                        : u))
                    .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
            }));
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
        socket.off("newMessage");
        socket.off("messageReaction");
        socket.off("messageEdited");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

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