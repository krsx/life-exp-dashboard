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

/**
 * Get sub-region comparison
 * GET /subregion
 */
router.get("/subregion", async (req, res, next) => {
  try {
    const {
      getAllSubRegions,
      getAvailableYears,
    } = require("../utils/db-helpers");
    const subRegions = await getAllSubRegions();
    const years = await getAvailableYears();

    res.render("subregion", {
      title: "Sub-Region Comparison",
      active: "subregion",
      subRegions,
      years,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get regional weakest link
 * GET /region-min
 */
router.get("/region-min", async (req, res, next) => {
  try {
    const { getAllRegions, getAvailableYears } = require("../utils/db-helpers");
    const regions = await getAllRegions();
    const years = await getAvailableYears();

    res.render("region-min", {
      title: "Regional Analysis",
      active: "region-min",
      regions,
      years,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Search for countries
 * GET /search
 */
router.get("/search", async (req, res, next) => {
  try {
    res.render("search", {
      title: "Country Search",
      active: "search",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
