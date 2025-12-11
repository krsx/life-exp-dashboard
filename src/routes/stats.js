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

/**
 * Get regional "Weakest Link" analysis
 * GET /stats/region-min?region_id=X&year=YYYY
 */
router.get("/region-min", async (req, res, next) => {
  try {
    const { region_id, year } = req.query;

    if (!region_id || !year) {
      return res.render("partials/alert", {
        layout: false,
        type: "info",
        message: "Please select both a region and a year.",
      });
    }

    if (!isValidId(region_id) || !isValidYear(year)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid parameters provided.",
      });
    }

    const sql = `
      SELECT sr.name as SubRegion, MIN(le.value) as MinVal
      FROM Region r
      JOIN SubRegion sr ON r.id = sr.region_id
      JOIN Country c ON sr.id = c.sub_region_id
      JOIN LifeExpectancy le ON c.code = le.country_code
      WHERE r.id = ? AND le.year = ?
      GROUP BY sr.id, sr.name
      ORDER BY r.name ASC, MinVal ASC
    `;
    const results = await query(sql, [region_id, year]);

    if (results.length === 0) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: "No data found for the selected region and year.",
      });
    }

    res.render("partials/region-min-results", {
      layout: false,
      data: results,
      year,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Search for countries
 * POST /stats/search
 */
router.post("/search", async (req, res, next) => {
  try {
    const { keyword } = req.body;

    if (!keyword || keyword.trim().length === 0) {
      return res.render("partials/alert", {
        layout: false,
        type: "info",
        message: "Enter a keyword to search for countries.",
      });
    }

    const sanitized = sanitizeKeyword(keyword);
    if (sanitized.length < 1) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: "Please enter a valid search keyword.",
      });
    }

    const sql = `
      SELECT c.name, MAX(le.value) as PeakLifeExpectancy
      FROM Country c
      JOIN LifeExpectancy le ON c.code = le.country_code
      WHERE c.name LIKE ?
      GROUP BY c.code, c.name
      ORDER BY c.name ASC
    `;
    const results = await query(sql, [`%${sanitized}%`]);

    if (results.length === 0) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: `No countries found matching "${sanitized}".`,
      });
    }

    res.render("partials/search-results", {
      layout: false,
      data: results,
      keyword: sanitized,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get inequality gap analysis
 * GET /stats/inequality?region_id=X
 */
router.get("/inequality", async (req, res, next) => {
  try {
    const { region_id } = req.query;

    if (!region_id) {
      return res.render("partials/alert", {
        layout: false,
        type: "info",
        message: "Please select a region to analyze.",
      });
    }

    if (!isValidId(region_id)) {
      return res.render("partials/alert", {
        layout: false,
        type: "danger",
        message: "Invalid region ID provided.",
      });
    }

    // Get the most recent year with data for this region
    const yearSql = `
      SELECT MAX(le.year) as latestYear
      FROM Region r
      JOIN SubRegion sr ON r.id = sr.region_id
      JOIN Country c ON sr.id = c.sub_region_id
      JOIN LifeExpectancy le ON c.code = le.country_code
      WHERE r.id = ?
    `;
    const yearResult = await query(yearSql, [region_id]);
    const latestYear = yearResult[0]?.latestYear;

    if (!latestYear) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: "No data available for the selected region.",
      });
    }

    const sql = `
      SELECT
        r.name as RegionName,
        MAX(le.value) - MIN(le.value) as TheInequalityGap,
        MAX(le.value) as BestMetric,
        MIN(le.value) as WorstMetric,
        ? as Year
      FROM Region r
      JOIN SubRegion sr ON r.id = sr.region_id
      JOIN Country c ON sr.id = c.sub_region_id
      JOIN LifeExpectancy le ON c.code = le.country_code
      WHERE r.id = ? AND le.year = ?
      GROUP BY r.id, r.name
    `;
    const results = await query(sql, [latestYear, region_id, latestYear]);

    if (results.length === 0) {
      return res.render("partials/alert", {
        layout: false,
        type: "warning",
        message: "No inequality data found for the selected region.",
      });
    }

    res.render("partials/inequality-results", {
      layout: false,
      data: results[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
