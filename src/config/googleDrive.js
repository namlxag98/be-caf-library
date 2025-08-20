import { google } from "googleapis";
import { logger } from "../utils/logger.js";

class GoogleDriveConfig {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.initialized = false;
  }

  initialize() {
    try {
      // Kiểm tra biến môi trường
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!clientEmail || !privateKey) {
        logger.warn(
          "Google Drive configuration not found. Google Drive features will be disabled."
        );
        logger.warn(
          "To enable Google Drive, please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env file"
        );
        return false;
      }

      // Xử lý private key với proper formatting
      const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

      // Create JWT client với error handling
      this.auth = new google.auth.JWT({
        email: clientEmail,
        key: formattedPrivateKey,
        scopes: [
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/drive",
        ],
      });

      // Create Drive instance
      this.drive = google.drive({
        version: "v3",
        auth: this.auth,
      });

      this.initialized = true;
      logger.info("Google Drive client initialized successfully");
      return true;
    } catch (error) {
      logger.error("Failed to initialize Google Drive client:", error.message);
      logger.warn("Google Drive features will be disabled");
      this.initialized = false;
      return false;
    }
  }

  getDriveInstance() {
    if (!this.initialized) {
      throw new Error(
        "Google Drive client not initialized. Check your environment variables."
      );
    }
    return this.drive;
  }

  getAuth() {
    if (!this.initialized) {
      throw new Error(
        "Google Drive client not initialized. Check your environment variables."
      );
    }
    return this.auth;
  }

  isInitialized() {
    return this.initialized;
  }
}

// Create instance but don't initialize immediately
const googleDriveConfig = new GoogleDriveConfig();

// Export a function to initialize when needed
export const initializeGoogleDrive = () => {
  return googleDriveConfig.initialize();
};

export default googleDriveConfig;
