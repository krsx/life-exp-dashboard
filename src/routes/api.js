const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const logger = require("../config/logger");
const {
  getAllCountries,
  getAllRegions,
  getAllSubRegions,
  getAvailableYears,
  getYearsForCountry,
} = require("../utils/db-helpers");
const { isValidCountryCode } = require("../utils/validators");

/**
 * Get all countries
 * GET /api/countries
 */
router.get("/countries", async (req, res, next) => {
  try {
    const countries = await getAllCountries();
    res.json({ success: true, data: countries });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all regions
 * GET /api/regions
 */
router.get("/regions", async (req, res, next) => {
  try {
    const regions = await getAllRegions();
    res.json({ success: true, data: regions });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all sub-regions
 * GET /api/subregions
 */
router.get("/subregions", async (req, res, next) => {
  try {
    const subRegions = await getAllSubRegions();
    res.json({ success: true, data: subRegions });
  } catch (error) {
    next(error);
  }
});

/**
 * Get available years
 * GET /api/years
 */
router.get("/years", async (req, res, next) => {
  try {
    const years = await getAvailableYears();
    res.json({ success: true, data: years });
  } catch (error) {
    next(error);
  }
});

/**
 * Get years for a specific country (for dropdown population)
 * GET /api/years/:countryCode
 */
router.get("/years/:countryCode", async (req, res, next) => {
  try {
    const { countryCode } = req.params;

    if (!isValidCountryCode(countryCode)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid country code" });
    }

    const years = await getYearsForCountry(countryCode.toUpperCase());
    res.json({ success: true, data: years });
  } catch (error) {
    next(error);
  }
});

/**
 * Get years dropdown HTML for a country (HTMX endpoint)
 * GET /api/years-options/:countryCode
 */
router.get("/years-options/:countryCode", async (req, res, next) => {
  try {
    const { countryCode } = req.params;

    if (!isValidCountryCode(countryCode)) {
      return res.send('<option value="">Invalid country code</option>');
    }

    const years = await getYearsForCountry(countryCode.toUpperCase());

    if (years.length === 0) {
      return res.send('<option value="">No data available</option>');
    }

    const options = years
      .map((year) => `<option value="${year}">${year}</option>`)
      .join("");
    res.send(`<option value="">Select Year</option>${options}`);
  } catch (error) {
    next(error);
  }
});

/**
 * Get current value for a country and year (for update form)
 * GET /api/value/:countryCode/:year
 */
router.get("/value/:countryCode/:year", async (req, res, next) => {
  try {
    const { countryCode, year } = req.params;

    if (!isValidCountryCode(countryCode)) {
      return res.send('<span class="text-muted">Invalid country code</span>');
    }

    const sql = `
      SELECT value 
      FROM LifeExpectancy 
      WHERE country_code = ? AND year = ?
    `;
    const results = await query(sql, [countryCode.toUpperCase(), year]);

    if (results.length === 0) {
      return res.send('<span class="text-muted">No record found</span>');
    }

    const value = results[0].value;
    res.send(
      `<span class="badge bg-info fs-6">Current: ${Number(value).toFixed(
        2
      )}</span>`
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
