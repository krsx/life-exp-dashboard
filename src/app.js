const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const logger = require("./config/logger");

// Import routes here

// Import middleware
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");

const app = express();

// Configure Handlebars view engine
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      // Helper to check equality
      eq: (a, b) => a === b,
      // Helper to format decimal numbers
      formatDecimal: (value, decimals = 2) => {
        if (value === null || value === undefined) return "N/A";
        return Number(value).toFixed(decimals);
      },
      // Helper for JSON stringify
      json: (context) => JSON.stringify(context),
      // Helper to get current year
      currentYear: () => new Date().getFullYear(),
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Static files middleware
app.use(express.static(path.join(__dirname, "../public")));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method === "POST" ? req.body : undefined,
  });
  next();
});

// Mount routes here

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
