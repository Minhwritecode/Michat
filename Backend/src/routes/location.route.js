import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    shareLocation,
    getLocationHistory,
    getNearbyLocations,
    stopLiveLocation,
    deleteLocation
} from "../controllers/location.controller.js";

const router = express.Router();

// Location routes
router.post("/share", protectRoute, shareLocation);
router.get("/history", protectRoute, getLocationHistory);
router.get("/nearby", protectRoute, getNearbyLocations);
router.put("/:locationId/stop-live", protectRoute, stopLiveLocation);
router.delete("/:locationId", protectRoute, deleteLocation);

export default router; 