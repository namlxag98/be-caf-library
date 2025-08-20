import express from "express";
import multer from "multer";
import path from "path";
import {
  verifyToken as auth,
  authorize as checkRole,
} from "../middleware/auth.js";
import {
  uploadFile,
  downloadFile,
  approveFile,
  getFiles,
} from "../controllers/fileController.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Public routes
router.get("/", getFiles);

// Protected routes
router.post("/upload", auth, upload.single("file"), uploadFile);
router.get("/download/:id", auth, downloadFile);

// Admin only routes
router.post("/approve/:id", auth, checkRole(["admin"]), approveFile);

export default router;
