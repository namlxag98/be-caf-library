import express from "express";
import {
  verifyToken as auth,
  authorize as checkRole,
} from "../middleware/auth.js";
import {
  validateUserUpdate,
  validateBalanceUpdate,
  validateUserCreation,
  validateAdminChangePassword,
} from "../middleware/validation.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserBalance,
  getUserProfile,
  updateUserProfile,
  createUser,
  changeUserPasswordByAdmin,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, validateUserUpdate, updateUserProfile);

// Protected routes
router.get("/", auth, checkRole(["admin"]), getUsers);
router.post("/", auth, checkRole(["admin"]), validateUserCreation, createUser);
router.get("/:id", auth, checkRole(["admin"]), getUserById);
router.put("/:id", auth, checkRole(["admin"]), validateUserUpdate, updateUser);
router.delete("/:id", auth, checkRole(["admin"]), deleteUser);
router.put(
  "/:id/balance",
  auth,
  checkRole(["admin"]),
  validateBalanceUpdate,
  updateUserBalance
);
router.put(
  "/:id/password",
  auth,
  checkRole(["admin"]),
  validateAdminChangePassword,
  changeUserPasswordByAdmin
);

export default router;
