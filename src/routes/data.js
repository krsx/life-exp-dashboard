const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const logger = require("../config/logger");
const { getMaxYearForCountry, recordExists } = require("../utils/db-helpers");
const {
  isValidCountryCode,
  isValidYear,
  isValidLifeExpectancy,
  isValidYearRange,
} = require("../utils/validators");

/**
 * Insert new record for the next year projection
 * POST /data/insert-next
 */
router.post("/insert-next", async (req, res, next) => {
  try {
    const { country_code, value } = req.body;

    // Validate inputs
    if (!country_code || value === undefined || value === "") {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Please provide both country and life expectancy value.",
      });
    }

    if (!isValidCountryCode(country_code)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid country code provided.",
      });
    }

    if (!isValidLifeExpectancy(value)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Life expectancy value must be between 0 and 150.",
      });
    }

    const upperCountryCode = country_code.toUpperCase();

    // Get the maximum year for this country
    const maxYear = await getMaxYearForCountry(upperCountryCode);
    const nextYear = maxYear ? maxYear + 1 : new Date().getFullYear();

    // Check if record already exists (shouldn't happen, but safety check)
    const exists = await recordExists(upperCountryCode, nextYear);
    if (exists) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: `A record for year ${nextYear} already exists for this country.`,
      });
    }

    // Insert the new record
    const sql = `
      INSERT INTO LifeExpectancy (country_code, year, value) 
      VALUES (?, ?, ?)
    `;
    await query(sql, [upperCountryCode, nextYear, parseFloat(value)]);

    logger.info(
      `Inserted new record: ${upperCountryCode}, ${nextYear}, ${value}`
    );

    res.render("partials/alert", {
      layout: false,
      type: "success",
      message: `Successfully added life expectancy ${value} for year ${nextYear}.`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
