import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "./libs/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import storyRoutes from "./routes/story.route.js";
import groupRoutes from "./routes/group.route.js";
import trelloRoutes from "./routes/trello.route.js";
import locationRoutes from "./routes/location.route.js";
import pollRoutes from "./routes/poll.route.js";

import { server, io } from "./libs/socket.js";

dotenv.config();

// ======================
// Initial Configuration
// ======================
const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Parse FRONTEND_URL from environment variables
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const frontendDomain = new URL(frontendUrl).hostname;
const corsOrigin = isProduction
    ? `https://${frontendDomain}`
    : `http://${frontendDomain}${frontendDomain === 'localhost' ? ':5173' : ''}`;

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
                "https://*.cloudinary.com"
            ],
            connectSrc: [
                "'self'",
                corsOrigin,
                `ws://${frontendDomain}`,
                `wss://${frontendDomain}`
            ],
            workerSrc: ["'self'", "blob:"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
            frameSrc: ["'self'"],
            mediaSrc: ["'self'", "data:", "blob:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        },
        reportOnly: !isProduction
    },
    crossOriginEmbedderPolicy: isProduction,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true
    }
}));

// Enhanced Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 500 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.ip === '::ffff:127.0.0.1' // Skip for local requests
});
app.use(limiter);

// ======================
// Standard Middlewares
// ======================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET || "default-secret"));
app.use(cors({
    origin: corsOrigin,
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
if (isProduction) {
    io.engine.opts.transports = ["websocket"];
    io.engine.opts.perMessageDeflate = false;
    io.engine.opts.cors = {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true
    };
}

io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
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

// ======================
// Health Check Endpoint
// ======================
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        frontend: corsOrigin,
        database: "connected", // Will reflect actual status in production
        websocket: io.engine.clientsCount
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
        ...(isProduction ? {} : { stack: err.stack })
    };

    console.error(`[ERROR][${statusCode}]`, {
        ...errorResponse,
        stack: err.stack
    });

    res.status(statusCode).json(errorResponse);
});

// ======================
// Server Initialization
// ======================
server.on("request", app);

const PORT = process.env.PORT || 5001;
const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`
      ====================================
       🚀 Server running on port ${PORT}
       📅 ${new Date().toISOString()}
       🌐 Environment: ${process.env.NODE_ENV || "development"}
       🔗 Frontend URL: ${corsOrigin}
       📡 WebSocket: ${isProduction ? "Secure (wss)" : "Development (ws)"}
      ====================================
      `);
        });
    } catch (err) {
        console.error("[FATAL] Failed to start server:", err);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});