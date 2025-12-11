const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const logger = require("../config/logger");
const {
  isValidCountryCode,
  isValidYear,
  isValidId,
  sanitizeKeyword,
} = require("../utils/validators");

/**
 * Get historical trends per country
 * GET /stats/history?country_code=XXX
 */
router.get("/history", async (req, res, next) => {
  try {
    const { country_code } = req.query;

    if (!country_code) {
      return res.render("partials/alert", {
        layout: false,
        type: "info",
        message: "Please select a country to view historical trends.",
      });
    }

    if (!isValidCountryCode(country_code)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid country code provided.",
      });
    }

    const sql = `
      SELECT year, value
      FROM LifeExpectancy
      WHERE country_code = ?
      ORDER BY year ASC
    `;
    const results = await query(sql, [country_code.toUpperCase()]);

    if (results.length === 0) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: "No data found for the selected country.",
      });
    }

    res.render("partials/history-results", {
      layout: false,
      data: results,
      countryCode: country_code,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get sub-region comparative snapshot
 * GET /stats/subregion?sub_region_id=X&year=YYYY
 */
router.get("/subregion", async (req, res, next) => {
  try {
    const { sub_region_id, year } = req.query;

    if (!sub_region_id || !year) {
      return res.render("partials/alert", {
        layout: false,
        type: "info",
        message: "Please select both a sub-region and a year.",
      });
    }

    if (!isValidId(sub_region_id) || !isValidYear(year)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid parameters provided.",
      });
    }

    const sql = `
      SELECT c.name, le.value
      FROM Country c
      JOIN LifeExpectancy le ON c.code = le.country_code
      WHERE c.sub_region_id = ? AND le.year = ?
      ORDER BY c.name ASC
    `;
    const results = await query(sql, [sub_region_id, year]);

    if (results.length === 0) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: "No data found for the selected sub-region and year.",
      });
    }

    res.render("partials/subregion-results", {
      layout: false,
      data: results,
      year,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
