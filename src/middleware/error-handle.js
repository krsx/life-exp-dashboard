const logger = require("../config/logger");

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Check if request expects HTML (HTMX or browser) or JSON
  const isHtmxRequest = req.headers["hx-request"] === "true";
  const wantsJson =
    req.headers.accept && req.headers.accept.includes("application/json");

  if (wantsJson && !isHtmxRequest) {
    // JSON response for API clients
    return res.status(statusCode).json({
      success: false,
      error: {
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    });
  }

  // HTML response for HTMX requests
  if (isHtmxRequest) {
    return res.status(statusCode).render("partials/alert", {
      layout: false,
      type: "danger",
      message:
        err.message || "An error occurred while processing your request.",
    });
  }

  // Full page error for browser requests
  res.status(statusCode).render("error", {
    title: "Error",
    statusCode,
    message: err.message || "An unexpected error occurred.",
    showStack: process.env.NODE_ENV === "development",
    stack: err.stack,
  });
};

module.exports = errorHandler;
