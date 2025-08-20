import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/bmc-caf-library",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "default-secret-key-for-development",
  jwtExpire: process.env.JWT_EXPIRE || "1h",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "default-refresh-secret-for-development",
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || "7d",

  // Google Drive (optional)
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,

  // Email (optional)
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT || 587,
  emailSecure: process.env.EMAIL_SECURE === "true",
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM || "noreply@bmccaflibrary.com",
  emailFromName: process.env.EMAIL_FROM_NAME || "BMC CAF Library",

  // Client
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],
};

// Log config status on startup
console.log("=== Configuration Status ===");
console.log(`Environment: ${config.nodeEnv}`);
console.log(`Port: ${config.port}`);
console.log(`MongoDB: ${config.mongoUri ? "✓ Configured" : "✗ Missing"}`);
console.log(
  `JWT Secret: ${
    config.jwtSecret !== "default-secret-key-for-development"
      ? "✓ Configured"
      : "⚠️  Using default (not for production!)"
  }`
);
console.log(
  `Email: ${config.emailHost ? "✓ Configured" : "✗ Not configured (optional)"}`
);
console.log(
  `Google Drive: ${
    config.googleClientEmail ? "✓ Configured" : "✗ Not configured (optional)"
  }`
);
console.log("===========================");

// Validate required configs
if (config.nodeEnv === "production") {
  if (config.jwtSecret === "default-secret-key-for-development") {
    console.error("ERROR: Cannot use default JWT secret in production!");
    process.exit(1);
  }
  if (!config.mongoUri) {
    console.error("ERROR: MongoDB URI is required!");
    process.exit(1);
  }
}

export default config;
