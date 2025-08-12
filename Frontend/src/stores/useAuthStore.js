import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Kiểm tra và đảm bảo URL API hợp lệ
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const devUrl = "http://localhost:5001";

    if (envUrl) return envUrl;
    return import.meta.env.MODE === "development" ? devUrl : "";
};

const API_URL = getApiUrl();

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000, // 10s timeout
});

// Xử lý lỗi toàn cục cho axios
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === "ECONNABORTED") {
            toast.error("Request timeout. Please try again.");
        } else if (!error.response) {
            toast.error("Network error. Please check your connection.");
        }
        return Promise.reject(error);
    }
);

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    socketConnected: false,

    // Kiểm tra xác thực
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get("/api/auth/check");
            if (res.data) {
                set({ authUser: res.data });
                get().connectSocket();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // Đăng ký
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/api/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
            return res.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Signup failed";
            toast.error(errorMsg);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    // Đăng nhập
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/api/auth/login", data);

            if (!res.data) {
                throw new Error("No user data received");
            }

            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();
            return res.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message ||
                error.message ||
                "Login failed";
            toast.error(errorMsg);
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    // Đăng xuất
    logout: async () => {
        try {
            await axiosInstance.post("/api/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Logout failed";
            toast.error(errorMsg);
        }
    },

    // Cập nhật profile
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/api/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
            return res.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Update failed";
            toast.error(errorMsg);
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    // Kết nối Socket.IO
    connectSocket: () => {
        const { authUser, socket } = get();

        if (!authUser || (socket?.connected)) return;

        console.log("Connecting to socket...");

        const newSocket = io(API_URL, {
            query: { userId: authUser._id },
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected");
            set({ socketConnected: true });
            try { window.dispatchEvent(new Event('socket-connected')); } catch (error) {
                console.debug('socket-connected event dispatch error:', error);
            }
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
            set({ socketConnected: false });
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        // Typing events - keep minimal state here; chat components can subscribe
        newSocket.on("typing:direct", ({ from, isTyping }) => {
            window.dispatchEvent(new CustomEvent('typing-direct', { detail: { from, isTyping } }));
        });
        newSocket.on("typing:group", ({ groupId, from, isTyping }) => {
            window.dispatchEvent(new CustomEvent('typing-group', { detail: { groupId, from, isTyping } }));
        });

        newSocket.on("notification:new", (notif) => {
            try { window.dispatchEvent(new CustomEvent('notification-new', { detail: { notif } })); } catch (error) {
                console.debug('notification-new event dispatch error:', error);
            }
        });

        set({ socket: newSocket });
    },

    // Ngắt kết nối Socket.IO
    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, socketConnected: false });
        }
    },

    // Xóa state khi unmount (optional)
    reset: () => {
        get().disconnectSocket();
        set({
            authUser: null,
            isSigningUp: false,
            isLoggingIn: false,
            isUpdatingProfile: false,
            isCheckingAuth: true,
            onlineUsers: [],
            socket: null,
            socketConnected: false,
        });
    }
}));