import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./src/config/database.js";
import { initializeGoogleDrive } from "./src/config/googleDrive.js";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { logger } from "./src/utils/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables FIRST
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug: Check if .env is loaded
console.log("Environment check:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", process.env.PORT);
console.log(
  "- MONGODB_URI:",
  process.env.MONGODB_URI ? "✓ Configured" : "✗ Missing"
);
console.log(
  "- GOOGLE_CLIENT_EMAIL:",
  process.env.GOOGLE_CLIENT_EMAIL ? "✓ Configured" : "✗ Missing (optional)"
);

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Google Drive (optional - won't fail if not configured)
    const googleDriveStatus = await initializeGoogleDrive();

    // Start Express app
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
        credentials: true,
      })
    );

    app.use(morgan("combined"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Static files
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Routes
    app.use("/api", routes);

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        services: {
          mongodb: "connected",
          googleDrive: googleDriveStatus ? "connected" : "disabled",
        },
      });
    });

    // 404 handler - use function instead of wildcard
    app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.originalUrl,
      });
    });

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
      });
    });

    return server;
  } catch (error) {
    logger.error("Failed to initialize services:", error);
    throw error;
  }
};

// Start the application
initializeServices().catch((error) => {
  logger.error("Failed to start application:", error);
  process.exit(1);
});
