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

const app = express();

// ======================
// Security Middlewares
// ======================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                process.env.NODE_ENV === 'development' ? "'unsafe-inline'" : "",
                process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""
            ].filter(Boolean),
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
                process.env.FRONTEND_URL || "http://localhost:5173",
                `ws://${process.env.FRONTEND_URL?.replace(/https?:\/\//, "") || "localhost:5173"}`,
                `wss://${process.env.FRONTEND_URL?.replace(/https?:\/\//, "") || "localhost:5173"}`
            ],
            workerSrc: ["'self'", "blob:"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
            frameSrc: ["'self'"],
            mediaSrc: ["'self'", "data:", "blob:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"]
        },
        reportOnly: process.env.NODE_ENV === 'development'
    },
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    crossOriginResourcePolicy: { policy: "same-site" }
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// ======================
// Standard Middlewares
// ======================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ======================
// Third-party Services
// ======================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
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
// Health Check
// ======================
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
    });
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
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
    });
});

// ======================
// Favicon Route
// ======================
app.get("/favicon.ico", (req, res) => {
    res.status(204).end(); // No content for favicon
});

// ======================
// Error Handling
// ======================
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ======================
// 404 Handler
// ======================
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
        method: req.method
    });
});

// ======================
// Server Setup
// ======================
server.on("request", app);

const PORT = process.env.PORT || 5001;

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`[${new Date().toISOString()}] 🚀 Server running on port ${PORT}`);
            console.log(`[${new Date().toISOString()}] 🌍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`[${new Date().toISOString()}] 🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
            console.log(`[${new Date().toISOString()}] 📊 Health check: http://localhost:${PORT}/health`);
            console.log(`[${new Date().toISOString()}] ✅ MongoDB: Connected successfully`);
            console.log(`[${new Date().toISOString()}] 🔧 Environment Variables:`);
            console.log(`[${new Date().toISOString()}]    - NODE_ENV: ${process.env.NODE_ENV}`);
            console.log(`[${new Date().toISOString()}]    - PORT: ${process.env.PORT}`);
            console.log(`[${new Date().toISOString()}]    - FRONTEND_URL: ${process.env.FRONTEND_URL}`);
        });
    })
    .catch((err) => {
        console.error(`[${new Date().toISOString()}] ❌ Database connection failed:`, err);
        process.exit(1);
    });