import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

import { connectDB } from "./libs/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import storyRoutes from "./routes/story.route.js";
import groupRoutes from "./routes/group.route.js";
import trelloRoutes from "./routes/trello.route.js";
import notificationRoutes from "./routes/notification.route.js";
import locationRoutes from "./routes/location.route.js";
import pollRoutes from "./routes/poll.route.js";
import botRoutes from "./routes/bot.route.js";
import { initSocket } from "./libs/socket.js";

dotenv.config();

// ======================
// Constants Configuration
// ======================
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || (
    isProduction
        ? 'https://michat-o9uv.onrender.com'
        : 'http://localhost:5173'
);
const FRONTEND_DOMAIN = new URL(FRONTEND_URL).hostname;

const app = express();

// ======================
// Enhanced Security Middlewares
// ======================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                ...(isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"])
                ,
                "https://apis.google.com",
                "https://www.gstatic.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://res.cloudinary.com",
                "https://*.cloudinary.com",
                "https://*.googleusercontent.com"
            ],
            connectSrc: [
                "'self'",
                FRONTEND_URL,
                `ws://${FRONTEND_DOMAIN}`,
                `wss://${FRONTEND_DOMAIN}`,
                "https://apis.google.com",
                "https://www.googleapis.com",
                "https://accounts.google.com"
            ],
            workerSrc: ["'self'", "blob:"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
            frameSrc: [
                "'self'",
                "https://accounts.google.com",
                "https://*.google.com",
                "https://*.gstatic.com"
            ],
            mediaSrc: ["'self'", "data:", "blob:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        },
        reportOnly: !isProduction
    },
    crossOriginEmbedderPolicy: isProduction,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: isProduction ? {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true
    } : false
}));

// Enhanced Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 500 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.ip === '::ffff:127.0.0.1'
});
app.use(limiter);

// ======================
// Standard Middlewares
// ======================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET || "default-secret-please-change"));
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Socket-ID"
    ]
}));

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.path}`);
    next();
});

// ======================
// Third-party Services
// ======================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Verify Cloudinary connection
cloudinary.api.ping()
    .then(() => console.log("[Cloudinary] Connected successfully"))
    .catch(err => console.error("[Cloudinary] Connection error:", err));

// ======================
// WebSocket Configuration
// ======================
const { io, server } = initSocket(app);

if (isProduction) {
    io.engine.opts.transports = ["websocket"];
    io.engine.opts.perMessageDeflate = false;
    io.engine.opts.cors = {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    };
}

io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
        console.log(`[WebSocket] Client disconnected (${reason}): ${socket.id}`);
    });

    socket.on("error", (err) => {
        console.error(`[WebSocket] Error: ${err.message}`);
    });
});

// ======================
// Routes
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/trello", trelloRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bot", botRoutes);

// ======================
// Health Check Endpoint
// ======================
app.get("/health", async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.status(200).json({
            status: "OK",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            version: "1.0.0",
            uptime: process.uptime(),
            database: "connected",
            websocket: io.engine.clientsCount
        });
    } catch (err) {
        res.status(503).json({
            status: "SERVICE_UNAVAILABLE",
            error: err.message,
            database: "disconnected"
        });
    }
});

// ======================
// Root Route
// ======================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Michat Backend API",
        version: "1.0.0",
        status: "running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        frontendUrl: FRONTEND_URL,
        documentation: "https://github.com/your-repo/docs"
    });
});

// ======================
// Enhanced Error Handling
// ======================
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const errorResponse = {
        error: err.message || "Internal Server Error",
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        ...(!isProduction && { stack: err.stack })
    };

    console.error(`[ERROR][${statusCode}]`, {
        ...errorResponse,
        stack: err.stack
    });

    res.status(statusCode).json(errorResponse);
});

// ======================
// 404 Handler
// ======================
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            "/api/auth",
            "/api/messages",
            "/api/story",
            "/api/groups",
            "/api/trello",
            "/api/location",
            "/api/polls",
            "/health"
        ]
    });
});

// ======================
// Server Initialization
// ======================
// server.on("request", app); // KHÔNG cần nữa, đã truyền app vào initSocket

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`
      ====================================
       🚀 Server running on port ${PORT}
       📅 ${new Date().toISOString()}
       🌐 Environment: ${process.env.NODE_ENV || "development"}
       🔗 Frontend URL: ${FRONTEND_URL}
       📡 WebSocket: ${isProduction ? "Secure (wss)" : "Development (ws)"}
       🛡️ CSP: ${isProduction ? "Strict" : "Development"}
      ====================================
      `);
        });
    } catch (err) {
        console.error("[FATAL] Failed to start server:", err);
        process.exit(1);
    }
};

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("\n[SIGTERM] Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

// Start the server
startServer();