# Features Plan & Implementation Details

This document outlines the 8 core features of the `Life Expectancy Dashboard`, detailing the Frontend (HTMX), Backend (Express), and Database (SQL) implementation logic.

---

## 1. Historical Trends Per Country

**Requirement:** Select a country using a dropdown list, and then show the Life Expectancy at Birth for that country over the years ordered by year in ascending order.

- **Endpoint:** `GET /stats/history`
- **Frontend (HTMX):**
  - A `<select>` element populated with all countries.
  - Event: `hx-change` triggers the request to the backend.
  - Target: `#result-container` to render the table rows.
- **Database Logic:**
  ```sql
  SELECT year, value
  FROM LifeExpectancy
  WHERE country_code = ?
  ORDER BY year ASC;
  ```

---

## 2. Sub-Region Comparative Snapshot

**Requirement:** Select a sub-region and a year with data using two separate dropdown lists, and then show all countries in that sub-region with their Life Expectancy at Birth in that year, ordered by country name in ascending order.

- **Endpoint:** `GET /stats/subregion`
- **Frontend (HTMX):**
  - Two `<select>` elements (`sub_region_id` and `year`).
  - Trigger: A "View Report" button or `hx-trigger="change"` on the year selector.
- **Database Logic:**
  - Requires joining `Country` and `LifeExpectancy`.
  ```sql
  SELECT c.name, le.value
  FROM Country c
  JOIN LifeExpectancy le ON c.code = le.country_code
  WHERE c.sub_region_id = ? AND le.year = ?
  ORDER BY c.name ASC;
  ```

---

## 3. Regional "Weakest Link" Analysis

**Requirement:** Select a region and a year with data using two separate dropdown lists, and then display all its sub-regions and their minimum Life Expectancy at Birth in each sub-region in that year, ordered by both region and the minimum Life Expectancy at Birth.

- **Endpoint:** `GET /stats/region-min`
- **Frontend (HTMX):**
  - Dropdowns for `region_id` and `year`.
- **Database Logic:**
  - Complex join across 4 tables (`Region` -> `SubRegion` -> `Country` -> `LifeExpectancy`).
  - Uses `GROUP BY` to aggregate sub-region data.
  ```sql
  SELECT sr.name as SubRegion, MIN(le.value) as MinVal
  FROM Region r
  JOIN SubRegion sr ON r.id = sr.region_id
  JOIN Country c ON sr.id = c.sub_region_id
  JOIN LifeExpectancy le ON c.code = le.country_code
  WHERE r.id = ? AND le.year = ?
  GROUP BY sr.id
  ORDER BY r.name ASC, MinVal ASC;
  ```

---

## 4. Keyword Search & Peak Performance

**Requirement:** Do a keyword search on country names (partial match) using an input text box, and then show the matching countries along with their maximum Life Expectancy at Birth over the years, ordered by country name.

- **Endpoint:** `POST /stats/search`
- **Frontend (HTMX):**
  - `<input type="text">` with `hx-trigger="keyup changed delay:500ms"`.
  - Allows real-time filtering without page reloads.
- **Database Logic:**
  - Uses `LIKE` operator for partial matching.
  - Uses `MAX()` aggregation.
  ```sql
  SELECT c.name, MAX(le.value) as PeakLifeExpectancy
  FROM Country c
  JOIN LifeExpectancy le ON c.code = le.country_code
  WHERE c.name LIKE ?
  GROUP BY c.code
  ORDER BY c.name ASC;
  ```

---

## 5. Smart Insert (Next Year Projection)

**Requirement:** Select a country, and add a new Life Expectancy at Birth record for that country for the next year (e.g., if the latest Life Expectancy is in 2023, the new value is then for 2024).

- **Endpoint:** `POST /data/insert-next`
- **Frontend (HTMX):**
  - A form selecting a Country and providing a `value`.
- **Backend Logic:**
  1.  Query DB for `MAX(year)` for the selected country.
  2.  Increment year by 1.
  3.  Insert new record.
- **Database Logic:**
  ```sql
  INSERT INTO LifeExpectancy (country_code, year, value) VALUES (?, ?, ?);
  ```

---

## 6. Precision Data Correction

**Requirement:** Select a country, a data year (a year with data), and then update the Life Expectancy at Birth record for that country and year.

- **Endpoint:** `PUT /data/update`
- **Frontend (HTMX):**
  - Inline editing interface triggered by an "Edit" button on a specific row.
  - Sends `country_code`, `year`, and the new `value`.
- **Database Logic:**
  ```sql
  UPDATE LifeExpectancy
  SET value = ?
  WHERE country_code = ? AND year = ?;
  ```

---

## 7. Bulk Deletion by Range

**Requirement:** Select a country, a beginning data year, and an ending data year, and then delete all Life Expectancy at Birth records for that country within the specified year range.

- **Endpoint:** `DELETE /data/delete-range`
- **Frontend (HTMX):**
  - Inputs: Country Select, Start Year (Number), End Year (Number).
  - Button: `hx-delete` with `hx-confirm` for safety.
- **Database Logic:**
  ```sql
  DELETE FROM LifeExpectancy
  WHERE country_code = ?
  AND year BETWEEN ? AND ?;
  ```

---

## 8. Custom Feature: The "Inequality Gap"

**Requirement:** A feature of your choice related to the Life Expectancy at Birth data.
**Rationale:** The exam introduction highlights that differences in life expectancy "act as a potent measure of social and health equity." This feature calculates the gap between the healthiest and least healthy countries in a region.

- **Endpoint:** `GET /stats/inequality`
- **Frontend (HTMX):**
  - Select a `Region`.
  - The app calculates the gap for the most recent available year (e.g., 2021).
- **Database Logic:**
  ```sql
  SELECT
      r.name,
      MAX(le.value) - MIN(le.value) as TheInequalityGap,
      MAX(le.value) as BestMetric,
      MIN(le.value) as WorstMetric
  FROM Region r
  JOIN SubRegion sr ON r.id = sr.region_id
  JOIN Country c ON sr.id = c.sub_region_id
  JOIN LifeExpectancy le ON c.code = le.country_code
  WHERE r.id = ? AND le.year = 2021
  GROUP BY r.id;
  ```
