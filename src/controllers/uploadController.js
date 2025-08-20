import asyncHandler from "express-async-handler";
import { googleDriveService } from "../services/googleDriveService.js";
import { logger } from "../utils/logger.js";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không có file được tải lên",
      });
    }

    const { originalname, mimetype, path: tempPath } = req.file;
    const fileName = `${uuidv4()}-${originalname}`;

    // Upload to Google Drive
    const result = await googleDriveService.uploadFile(
      tempPath,
      fileName,
      mimetype
    );

    // Clean up temporary file
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      data: {
        fileId: result.fileId,
        fileName,
        viewLink: result.webViewLink,
      },
    });
  } catch (error) {
    logger.error("File upload failed:", error);
    res.status(500).json({
      success: false,
      message: "Tải lên file thất bại",
      error: error.message,
    });
  }
});

export const deleteFile = asyncHandler(async (req, res) => {
  try {
    const { fileId } = req.params;
    await googleDriveService.deleteFile(fileId);

    res.json({
      success: true,
      message: "Xóa file thành công",
    });
  } catch (error) {
    logger.error("File deletion failed:", error);
    res.status(500).json({
      success: false,
      message: "Xóa file thất bại",
      error: error.message,
    });
  }
});

export const getFileUrl = asyncHandler(async (req, res) => {
  try {
    const { fileId } = req.params;
    const urls = await googleDriveService.getFileUrl(fileId);

    res.json({
      success: true,
      data: urls,
    });
  } catch (error) {
    logger.error("Failed to get file URL:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy URL file",
      error: error.message,
    });
  }
});
