const logger = require("../config/logger");

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);

  // Check if request is from HTMX
  const isHtmxRequest = req.headers["hx-request"] === "true";

  if (isHtmxRequest) {
    return res.status(404).render("partials/alert", {
      layout: false,
      type: "warning",
      message: "The requested resource was not found.",
    });
  }

  res.status(404).render("error", {
    title: "404 - Page Not Found",
    statusCode: 404,
    message: "The page you are looking for does not exist.",
  });
};

module.exports = notFound;
