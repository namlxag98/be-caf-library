import express from "express";
import {
  verifyToken as auth,
  authorize as checkRole,
} from "../middleware/auth.js";
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactions,
  getTransactionStatistics,
} from "../controllers/transactionController.js";

const router = express.Router();

// User routes
router.get("/my-transactions", auth, getUserTransactions);

// Admin routes
router.get("/", auth, checkRole(["admin"]), getTransactions);
router.get("/statistics", auth, checkRole(["admin"]), getTransactionStatistics);
router.get("/:id", auth, checkRole(["admin"]), getTransactionById);
router.post("/", auth, checkRole(["admin"]), createTransaction);
router.put("/:id", auth, checkRole(["admin"]), updateTransaction);
router.delete("/:id", auth, checkRole(["admin"]), deleteTransaction);

// Statistics route (admin only)
router.get(
  "/statistics/overview",
  auth,
  checkRole(["admin"]),
  getTransactionStatistics
);

export default router;
