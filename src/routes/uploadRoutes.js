import express from "express";
import {
  verifyToken as auth,
  authorize as checkRole,
} from "../middleware/auth.js";
import {
  uploadFile,
  deleteFile,
  getFileUrl,
} from "../controllers/uploadController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "temp/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// File upload routes
router.post("/upload", auth, upload.single("file"), uploadFile);
router.delete("/files/:fileId", auth, checkRole(["admin"]), deleteFile);
router.get("/files/:fileId/url", auth, getFileUrl);

export default router;
