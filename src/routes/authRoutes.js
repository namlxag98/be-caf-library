import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { validateAuth } from "../middleware/validation.js";

const router = Router();

// Public routes
router.post("/register", validateAuth.register, register);
router.post("/login", validateAuth.login, login);
router.post("/refresh-token", refreshToken);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/logout", verifyToken, logout);
router.post(
  "/change-password",
  verifyToken,
  validateAuth.changePassword,
  changePassword
);

export default router;
