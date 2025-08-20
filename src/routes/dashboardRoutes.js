import express from "express";
import {
  verifyToken as auth,
  authorize as checkRole,
} from "../middleware/auth.js";
import {
  getDashboardOverview,
  getRevenueStatistics,
  getUserStatistics,
  getFileStatistics,
  getRecentActivities,
  getTopDownloads,
  getTopUsers,
} from "../controllers/dashboardController.js";

const router = express.Router();

// All routes require authentication and admin/teacher role
router.use(auth, checkRole(["admin", "teacher"]));

// Overview statistics
router.get("/overview", getDashboardOverview);
router.get("/revenue", getRevenueStatistics);
router.get("/users", getUserStatistics);
router.get("/files", getFileStatistics);

// Detailed statistics
router.get("/activities", getRecentActivities);
router.get("/top-downloads", getTopDownloads);
router.get("/top-users", getTopUsers);

export default router;
