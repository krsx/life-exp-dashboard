const express = require("express");
const router = express.Router();
const logger = require("../config/logger");

/**
 * Home page - Dashboard landing
 * GET /
 */
router.get("/", async (req, res, next) => {
  try {
    res.render("index", {
      title: "Life Expectancy Dashboard",
      active: "home",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get historical trends
 * GET /history
 */
router.get("/history", async (req, res, next) => {
  try {
    const { getAllCountries } = require("../utils/db-helpers");
    const countries = await getAllCountries();

    res.render("history", {
      title: "Historical Trends",
      active: "history",
      countries,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
