const mysql = require("mysql2/promise");
const logger = require("./logger");

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "life_expectancy_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info("Database connection established successfully");
    connection.release();
    return true;
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    return false;
  }
};

// Execute query with logging
const query = async (sql, params = []) => {
  try {
    logger.debug(`Executing query: ${sql}`);
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    logger.error(`Query error: ${error.message}`, { sql, params });
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
