/******************************************************************************
 * Description:
 * 1.  Creates the Schema (3NF).
 * 2.  Creates Temporary Staging Tables.
  * 3.  Loads Raw CSV data into Staging.
 ******************************************************************************/

-- 1. DATABASE INITIALIZATION
DROP DATABASE IF EXISTS life_expectancy_db;
CREATE DATABASE life_expectancy_db;
USE life_expectancy_db;

-- Set connection character set
SET NAMES utf8mb4;

-- 2. DDL - CREATE NORMALIZED TABLES (3NF)

-- Table: Region (Top level continent)
CREATE TABLE Region (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Table: SubRegion (Subdivision of continent)
CREATE TABLE SubRegion (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_id INT NOT NULL,
    FOREIGN KEY (region_id) REFERENCES Region(id) ON DELETE CASCADE
);

-- Table: IntermediateRegion (Optional granular subdivision)
CREATE TABLE IntermediateRegion (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sub_region_id INT NOT NULL,
    FOREIGN KEY (sub_region_id) REFERENCES SubRegion(id) ON DELETE CASCADE
);

-- Table: Country (The Political Entity)
CREATE TABLE Country (
    code CHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    alpha_2 CHAR(2),
    numeric_code INT,
    sub_region_id INT NOT NULL,
    intermediate_region_id INT,
    FOREIGN KEY (sub_region_id) REFERENCES SubRegion(id),
    FOREIGN KEY (intermediate_region_id) REFERENCES IntermediateRegion(id)
);

-- Table: LifeExpectancy (The Fact Table)
CREATE TABLE LifeExpectancy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_code CHAR(3) NOT NULL,
    year INT NOT NULL,
    value DECIMAL(10, 4) NOT NULL,
    FOREIGN KEY (country_code) REFERENCES Country(code) ON DELETE CASCADE,
    UNIQUE KEY unique_country_year (country_code, year)
);

-- 3. EXTRACT - PREPARE STAGING AREA

-- Raw table for data2.csv (Locations)
CREATE TEMPORARY TABLE raw_locations (
    name TEXT,
    alpha_2 VARCHAR(100),
    alpha_3 VARCHAR(100),
    country_code VARCHAR(100),
    iso_3166_2 VARCHAR(200),
    region TEXT,
    sub_region TEXT,
    intermediate_region TEXT,
    region_code VARCHAR(100),
    sub_region_code VARCHAR(100),
    intermediate_region_code VARCHAR(200)
);

-- Raw table for data1.csv (Facts)
-- Using TEXT for flexible length handling
CREATE TEMPORARY TABLE raw_facts (
    entity TEXT,
    code VARCHAR(100),
    year INT,
    life_expectancy DECIMAL(10, 4)
);