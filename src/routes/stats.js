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

module.exports = router;
