import express from "express";
import {
  verifyToken as auth,
  authorize as checkRole,
} from "../middleware/auth.js";
import {
  getUserActivities,
  getAdminDashboard,
} from "../controllers/userActivityController.js";

const router = express.Router();

// User routes
router.get("/my-activities", auth, getUserActivities);

// Admin routes
router.get(
  "/dashboard",
  auth,
  checkRole(["admin", "teacher"]),
  getAdminDashboard
);

export default router;
