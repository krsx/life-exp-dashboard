// Load environment variables first
require("dotenv").config();

const app = require("./app");
const logger = require("./config/logger");
const { testConnection } = require("./config/database");

const PORT = process.env.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Start server
const startServer = async () => {
  // Test database connection
  const dbConnected = await testConnection();

  if (!dbConnected) {
    logger.error("Unable to connect to database. Retrying in 5 seconds...");
    setTimeout(startServer, 5000);
    return;
  }

  const server = (global.server = app.listen(PORT, () => {
    logger.info(
      `Life Expectancy Dashboard running on http://localhost:${PORT}`
    );
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  }));

  // Handle shutdown signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
startServer();
