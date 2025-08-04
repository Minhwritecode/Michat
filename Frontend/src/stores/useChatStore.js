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
            set({ users: res.data });
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
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/api/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });

        socket.on("messageReaction", ({ messageId, reactions }) => {
            set({
                messages: get().messages.map(msg =>
                    msg._id === messageId ? { ...msg, reactions } : msg
                )
            });
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
