const { query } = require("../config/database");
const logger = require("../config/logger");

/**
 * Get all countries ordered by name
 */
const getAllCountries = async () => {
  const sql = "SELECT code, name FROM Country ORDER BY name ASC";
  return await query(sql);
};

/**
 * Get all regions ordered by name
 */
const getAllRegions = async () => {
  const sql = "SELECT id, name FROM Region ORDER BY name ASC";
  return await query(sql);
};

/**
 * Get all sub-regions ordered by name
 */
const getAllSubRegions = async () => {
  const sql = `
    SELECT sr.id, sr.name, r.name as region_name 
    FROM SubRegion sr
    JOIN Region r ON sr.region_id = r.id
    ORDER BY sr.name ASC
  `;
  return await query(sql);
};

/**
 * Get distinct years with data
 */
const getAvailableYears = async () => {
  const sql = "SELECT DISTINCT year FROM LifeExpectancy ORDER BY year DESC";
  const results = await query(sql);
  return results.map((row) => row.year);
};

/**
 * Get years for a specific country
 */
const getYearsForCountry = async (countryCode) => {
  const sql = `
    SELECT DISTINCT year 
    FROM LifeExpectancy 
    WHERE country_code = ? 
    ORDER BY year DESC
  `;
  const results = await query(sql, [countryCode]);
  return results.map((row) => row.year);
};

/**
 * Get the maximum year for a country
 */
const getMaxYearForCountry = async (countryCode) => {
  const sql =
    "SELECT MAX(year) as maxYear FROM LifeExpectancy WHERE country_code = ?";
  const results = await query(sql, [countryCode]);
  return results[0]?.maxYear || null;
};

/**
 * Check if a record exists
 */
const recordExists = async (countryCode, year) => {
  const sql =
    "SELECT COUNT(*) as count FROM LifeExpectancy WHERE country_code = ? AND year = ?";
  const results = await query(sql, [countryCode, year]);
  return results[0].count > 0;
};

module.exports = {
  getAllCountries,
  getAllRegions,
  getAllSubRegions,
  getAvailableYears,
  getYearsForCountry,
  getMaxYearForCountry,
  recordExists,
};
