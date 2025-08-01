import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    createGroup,
    getUserGroups,
    getGroupDetails,
    updateGroup,
    addMember,
    removeMember,
    joinGroupByCode,
    generateInviteCode,
    leaveGroup,
    deleteGroup,
    getGroupMembers,
    updateMemberRole,
    toggleMemberChat
} from "../controllers/group.controller.js";

const router = express.Router();

// Group management routes
router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.put("/:groupId", protectRoute, updateGroup);
router.delete("/:groupId", protectRoute, deleteGroup);

// Member management
router.get("/:groupId/members", protectRoute, getGroupMembers);
router.post("/:groupId/members", protectRoute, addMember);
router.delete("/:groupId/members/:memberId", protectRoute, removeMember);
router.put("/:groupId/members/:memberId/role", protectRoute, updateMemberRole);
router.put("/:groupId/members/:memberId/chat", protectRoute, toggleMemberChat);

// Join/Leave group
router.post("/join", protectRoute, joinGroupByCode);
router.post("/:groupId/leave", protectRoute, leaveGroup);

// Invite code
router.post("/:groupId/invite-code", protectRoute, generateInviteCode);

export default router; 