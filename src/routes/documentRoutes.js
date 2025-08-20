import { Router } from "express";
import upload from "../middleware/multer.js";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  downloadFile,
  updateDocument,
  deleteDocument,
  approveDocument,
  rejectDocument,
} from "../controllers/documentController.js";
import {
  createComment,
  getComments,
  getReplies,
  updateComment,
  deleteComment,
  toggleLikeComment,
  reportComment,
} from "../controllers/commentController.js";
import {
  createOrUpdateRating,
  getRatings,
  getUserRating,
  deleteRating,
  toggleRatingVisibility,
} from "../controllers/ratingController.js";
import { downloadWithPayment } from "../controllers/transactionController.js";
import { verifyToken, authorize, optionalAuth } from "../middleware/auth.js";
import { validateDocument } from "../middleware/validation.js";

const router = Router();

// Public document routes
router.get("/", optionalAuth, getDocuments);
router.get("/:id", optionalAuth, getDocumentById);

// Document management routes (require authentication)
router.post(
  "/",
  verifyToken,
  upload.array("files", 10),
  validateDocument,
  createDocument
);
router.put("/:id", verifyToken, updateDocument);
router.delete("/:id", verifyToken, deleteDocument);

// File download routes
router.get("/:documentId/files/:fileId/download", optionalAuth, downloadFile);
router.post(
  "/:documentId/files/:fileId/purchase",
  verifyToken,
  downloadWithPayment
);

// Admin document routes
router.put("/:id/approve", verifyToken, authorize("admin"), approveDocument);
router.put("/:id/reject", verifyToken, authorize("admin"), rejectDocument);

// Comment routes
router.get("/:documentId/comments", getComments);
router.get("/:documentId/comments/:commentId/replies", getReplies);
router.post("/:documentId/comments", verifyToken, createComment);
router.put("/:documentId/comments/:commentId", verifyToken, updateComment);
router.delete("/:documentId/comments/:commentId", verifyToken, deleteComment);
router.post(
  "/:documentId/comments/:commentId/like",
  verifyToken,
  toggleLikeComment
);
router.post(
  "/:documentId/comments/:commentId/report",
  verifyToken,
  reportComment
);

// Rating routes
router.get("/:documentId/ratings", getRatings);
router.get("/:documentId/ratings/user", verifyToken, getUserRating);
router.post("/:documentId/ratings", verifyToken, createOrUpdateRating);
router.delete("/:documentId/ratings/:ratingId", verifyToken, deleteRating);
router.put(
  "/:documentId/ratings/:ratingId/visibility",
  verifyToken,
  authorize("admin"),
  toggleRatingVisibility
);

export default router;
