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
  getMyDocumentsCount,
} from "../controllers/dashboardController.js";

const router = express.Router();

// All admin/teacher dashboard routes require authentication and role
router.use(
  [
    "/overview",
    "/revenue",
    "/users",
    "/files",
    "/activities",
    "/top-downloads",
    "/top-users",
  ],
  auth,
  checkRole(["admin", "teacher"])
);

// Overview statistics
router.get("/overview", getDashboardOverview);
router.get("/revenue", getRevenueStatistics);
router.get("/users", getUserStatistics);
router.get("/files", getFileStatistics);

// Detailed statistics
router.get("/activities", getRecentActivities);
router.get("/top-downloads", getTopDownloads);
router.get("/top-users", getTopUsers);

// Current user's own stats
router.get("/me/documents/count", auth, getMyDocumentsCount);

export default router;
