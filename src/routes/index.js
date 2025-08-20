import { Router } from "express";
import documentRoutes from "./documentRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import fileRoutes from "./fileRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import userActivityRoutes from "./userActivityRoutes.js";
import commentRoutes from "./commentRoutes.js";

const router = Router();

// API routes
router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/files", fileRoutes);
router.use("/upload", uploadRoutes);
router.use("/user-activities", userActivityRoutes);
router.use("/comments", commentRoutes);

export default router;
