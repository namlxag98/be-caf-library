import express from "express";
import {
  verifyToken as auth,
  authorize as checkRole,
} from "../middleware/auth.js";
import {
  createComment,
  approveComment,
  getComments,
} from "../controllers/commentController.js";

const router = express.Router();

// Public routes
router.get("/", getComments);

// Protected routes
router.post("/", auth, createComment);

// Admin only routes
router.post("/approve/:id", auth, checkRole(["admin"]), approveComment);

export default router;
