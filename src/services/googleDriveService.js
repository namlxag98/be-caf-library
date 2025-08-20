import { google } from "googleapis";
import { logger } from "../utils/logger.js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  async initialize() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });

      this.drive = google.drive({ version: "v3", auth });
      logger.info("Google Drive service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Google Drive service:", error);
      throw error;
    }
  }

  async uploadFile(filePath, fileName, mimeType) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [this.folderId],
      };

      const media = {
        mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media,
        fields: "id, webViewLink",
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      logger.error("Failed to upload file to Google Drive:", error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId,
      });
      logger.info(`File ${fileId} deleted from Google Drive`);
    } catch (error) {
      logger.error("Failed to delete file from Google Drive:", error);
      throw error;
    }
  }

  async getFileUrl(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: "webViewLink, webContentLink",
      });
      return {
        viewLink: response.data.webViewLink,
        downloadLink: response.data.webContentLink,
      };
    } catch (error) {
      logger.error("Failed to get file URL from Google Drive:", error);
      throw error;
    }
  }

  async updateFile(fileId, filePath, fileName, mimeType) {
    try {
      const media = {
        mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.update({
        fileId,
        media,
        fields: "id, webViewLink",
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      logger.error("Failed to update file in Google Drive:", error);
      throw error;
    }
  }

  async downloadFile(fileId) {
    try {
      if (!this.drive) {
        await this.initialize();
      }
      const response = await this.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );
      return response.data; // stream
    } catch (error) {
      logger.error("Failed to download file from Google Drive:", error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
