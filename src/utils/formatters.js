/**
 * Formatting utilities
 */

/**
 * Format decimal number to specified precision
 */
const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined) return "N/A";
  return Number(value).toFixed(decimals);
};

/**
 * Format country code to uppercase
 */
const formatCountryCode = (code) => {
  if (!code) return "";
  return code.toUpperCase().trim();
};

/**
 * Format year for display
 */
const formatYear = (year) => {
  return String(year);
};

/**
 * Format percentage
 */
const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format number with commas
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) return "N/A";
  return Number(num).toLocaleString();
};

module.exports = {
  formatDecimal,
  formatCountryCode,
  formatYear,
  formatPercentage,
  formatNumber,
};
