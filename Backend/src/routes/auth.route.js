import express from "express";
import { checkAuth, login, logout, signup, updateProfile, addFriend, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, getFriendsAndRequests, unfriend, updateUserLabel, getUserProfile, toggleFamilyMember, getUsersWithUnreadCount } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/label/:userId", protectRoute, updateUserLabel);

router.post("/add-friend/:userId", protectRoute, addFriend);
router.post("/accept-friend/:userId", protectRoute, acceptFriendRequest);
router.post("/reject-friend/:userId", protectRoute, rejectFriendRequest);
router.post("/cancel-friend/:userId", protectRoute, cancelFriendRequest);
router.post("/unfriend/:userId", protectRoute, unfriend);
router.post("/family/:userId", protectRoute, toggleFamilyMember);
router.get("/friends-requests", protectRoute, getFriendsAndRequests);
router.get("/profile/:userId", protectRoute, getUserProfile);
router.get("/users-with-unread", protectRoute, getUsersWithUnreadCount);

router.get("/check", protectRoute, checkAuth);

export default router;