/**
 * Validation utilities
 */

/**
 * Validate country code (ISO Alpha-3)
 */
const isValidCountryCode = (code) => {
  return typeof code === "string" && /^[A-Z]{3}$/.test(code.toUpperCase());
};

/**
 * Validate year
 */
const isValidYear = (year) => {
  const numYear = parseInt(year, 10);
  return !isNaN(numYear) && numYear >= 1900 && numYear <= 2100;
};

/**
 * Validate life expectancy value
 */
const isValidLifeExpectancy = (value) => {
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue >= 0 && numValue <= 150;
};

/**
 * Validate numeric ID
 */
const isValidId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0;
};

/**
 * Sanitize search keyword
 */
const sanitizeKeyword = (keyword) => {
  if (!keyword || typeof keyword !== "string") return "";
  // Remove dangerous characters, keep alphanumeric, spaces, and basic punctuation
  return keyword
    .replace(/[^\w\s-]/gi, "")
    .trim()
    .substring(0, 100);
};

/**
 * Validate year range
 */
const isValidYearRange = (startYear, endYear) => {
  const start = parseInt(startYear, 10);
  const end = parseInt(endYear, 10);
  return isValidYear(start) && isValidYear(end) && start <= end;
};

module.exports = {
  isValidCountryCode,
  isValidYear,
  isValidLifeExpectancy,
  isValidId,
  sanitizeKeyword,
  isValidYearRange,
};
