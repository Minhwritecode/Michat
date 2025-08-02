import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
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

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/trello", trelloRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/polls", pollRoutes);

const PORT = process.env.PORT || 5001;

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Error connecting to database:", err);
    });
