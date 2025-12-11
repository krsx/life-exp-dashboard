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

/**
 * Update existing record
 * PUT /data/update
 */
router.put("/update", async (req, res, next) => {
  try {
    const { country_code, year, value } = req.body;

    // Validate inputs
    if (!country_code || !year || value === undefined || value === "") {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Please provide country, year, and new value.",
      });
    }

    if (!isValidCountryCode(country_code)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid country code provided.",
      });
    }

    if (!isValidYear(year)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid year provided.",
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

    // Check if record exists
    const exists = await recordExists(upperCountryCode, year);
    if (!exists) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: `No record found for ${upperCountryCode} in year ${year}.`,
      });
    }

    // Update the record
    const sql = `
      UPDATE LifeExpectancy
      SET value = ?
      WHERE country_code = ? AND year = ?
    `;
    const result = await query(sql, [
      parseFloat(value),
      upperCountryCode,
      year,
    ]);

    logger.info(
      `Updated record: ${upperCountryCode}, ${year}, new value: ${value}`
    );

    res.render("partials/alert", {
      layout: false,
      type: "success",
      message: `Successfully updated life expectancy to ${value} for ${upperCountryCode} in ${year}.`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete records by range
 * DELETE /data/delete-range
 */
router.delete("/delete-range", async (req, res, next) => {
  try {
    const { country_code, start_year, end_year } = req.body;

    // Validate inputs
    if (!country_code || !start_year || !end_year) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Please provide country, start year, and end year.",
      });
    }

    if (!isValidCountryCode(country_code)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid country code provided.",
      });
    }

    if (!isValidYearRange(start_year, end_year)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message:
          "Invalid year range. Start year must be less than or equal to end year.",
      });
    }

    const upperCountryCode = country_code.toUpperCase();

    // Count records to be deleted
    const countSql = `
      SELECT COUNT(*) as count
      FROM LifeExpectancy
      WHERE country_code = ? AND year BETWEEN ? AND ?
    `;
    const countResult = await query(countSql, [
      upperCountryCode,
      start_year,
      end_year,
    ]);
    const recordCount = countResult[0].count;

    if (recordCount === 0) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: `No records found for ${upperCountryCode} between ${start_year} and ${end_year}.`,
      });
    }

    // Delete records
    const sql = `
      DELETE FROM LifeExpectancy
      WHERE country_code = ?
      AND year BETWEEN ? AND ?
    `;
    await query(sql, [upperCountryCode, start_year, end_year]);

    logger.info(
      `Deleted ${recordCount} records: ${upperCountryCode}, ${start_year}-${end_year}`
    );

    res.render("partials/alert", {
      layout: false,
      type: "success",
      message: `Successfully deleted ${recordCount} record(s) for ${upperCountryCode} from ${start_year} to ${end_year}.`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
