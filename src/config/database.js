import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDB = async () => {
  try {
    // Kiểm tra MONGODB_URI
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in environment variables. Please check your .env file."
      );
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);

    // Provide helpful error messages
    if (error.message.includes("MONGODB_URI")) {
      logger.error(
        "Please ensure you have created a .env file with MONGODB_URI variable"
      );
    } else if (error.message.includes("ECONNREFUSED")) {
      logger.error(
        "Cannot connect to MongoDB. Please ensure MongoDB is running on your system."
      );
    }

    process.exit(1);
  }
};

export default connectDB;
