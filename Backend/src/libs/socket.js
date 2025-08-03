import { Server } from "socket.io";
import http from "http";

// used to store online users
const userSocketMap = {}; // {userId: [socketId1, socketId2, ...]}
let ioInstance = null;

export function getReceiverSocketId(userId) {
    return userSocketMap[userId] || [];
}

export function getIO() {
    return ioInstance;
}

export function initSocket(app) {
    // Create server from express app
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Store io instance globally
    ioInstance = io;

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        const userId = socket.handshake.query.userId;
        if (userId) {
            if (!userSocketMap[userId]) userSocketMap[userId] = [];
            userSocketMap[userId].push(socket.id);
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // WebRTC Signaling for calls
        socket.on("call:user", ({ to, offer, callType, from }) => {
            const targetSockets = getReceiverSocketId(to);
            targetSockets.forEach(sid => {
                io.to(sid).emit("call:incoming", { from, offer, callType });
            });
        });

        socket.on("call:answer", ({ to, answer }) => {
            const targetSockets = getReceiverSocketId(to);
            targetSockets.forEach(sid => {
                io.to(sid).emit("call:answer", { answer });
            });
        });

        socket.on("call:ice-candidate", ({ to, candidate }) => {
            const targetSockets = getReceiverSocketId(to);
            targetSockets.forEach(sid => {
                io.to(sid).emit("call:ice-candidate", { candidate });
            });
        });

        socket.on("call:end", ({ to }) => {
            const targetSockets = getReceiverSocketId(to);
            targetSockets.forEach(sid => {
                io.to(sid).emit("call:end");
            });
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.id);
            if (userId && userSocketMap[userId]) {
                userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
                if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
            }
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return { io, server };
}
