import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStatistics,
  getCategoryCustomFields,
} from "../controllers/categoryController.js";
import { verifyToken, authorize } from "../middleware/auth.js";
import { validateCategory } from "../middleware/validation.js";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/tree", getCategoryTree);
router.get("/statistics", getCategoryStatistics);
router.get("/:id", getCategoryById);
router.get("/:id/custom-fields", getCategoryCustomFields);

// Protected routes (Admin only)
router.post(
  "/",
  verifyToken,
  authorize("admin"),
  validateCategory,
  createCategory
);
router.put(
  "/:id",
  verifyToken,
  authorize("admin"),
  validateCategory,
  updateCategory
);
router.delete("/:id", verifyToken, authorize("admin"), deleteCategory);

export default router;
