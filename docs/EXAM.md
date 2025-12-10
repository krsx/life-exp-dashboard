# The exam

You need to prove that:

- You can design a database that conforms to the 1st, the 2nd, and the 3rd normal forms.
- You know how to write some SQLs and do ETL using SQL statements.
- You can prepare your development environment using Docker.
- You can implement user requirements using the taught web technologies (HTML + CSS + Express + HTMX) based on your database design.
- You can prepare a compose.yaml so that the user (me) can get your software up and running quickly by 1) git clone and 2) docker compose up.

# Introduction

The Life Expectancy at Birth is arguably the most fundamental and widely used demographic indicator for comparative analysis of a society's overall health, development, and quality of life across different regions and time periods. It represents the average number of years a newborn infant is expected to live if prevailing age-specific mortality rates remain the same throughout their life.

Life expectancy is a powerful summary statistic because it is an outcome measure influenced by a wide array of factors, making it indispensable for global and national comparisons:

- **Benchmarking Health System Performance:** Comparing life expectancies directly reflects the success or failure of a country's healthcare system, particularly its ability to prevent premature deaths from infectious diseases, manage chronic conditions, and provide quality maternal and neonatal care. Higher life expectancy almost universally correlates with effective, accessible public health infrastructure.
- **Highlighting Socioeconomic Development:** This metric is highly sensitive to improvements in nutrition, sanitation, clean water access, education, and income levels. Comparing a nation's life expectancy with its peers or with historical data provides a clear gauge of its progress in overall socioeconomic development and poverty reduction.
- **Revealing Health Inequalities:** Significant differences in life expectancy within a country (e.g., between different income groups, ethnic groups, or geographic regions) act as a potent measure of social and health equity. Such comparisons expose systemic vulnerabilities and guide targeted public health interventions.
- **Informing Policy and Planning:** Governments use comparative life expectancy data to forecast future demands on national resources. A rising life expectancy necessitates planning for an aging population, including adjustments to pension systems, elder care, and specialized healthcare services.

In summary, life expectancy is a universal and profound statistic that provides an instant, comprehensive comparison of the human condition, making it the bedrock for global health monitoring and policy setting.

# The data

Your original data for this exam are to be downloaded from the following CSV files:

- [Facts](https://yo-1.ct.ntust.edu.tw/Courses/SE/2025Final/download.php?name=data1.csv&which=73ff13de0a0facda8672ac25920a371a)
- [Nations, Regions, and Continents](https://yo-1.ct.ntust.edu.tw/Courses/SE/2025Final/download.php?name=data2.csv&which=ec7f11c91e42193d8b638ddcbec7410b)

They are from the [Our World in Data](https://ourworldindata.org/) website and [Kaggle](https://www.kaggle.com/datasets/andradaolteanu/country-mapping-iso-continent-region).

For `data1.csv`, the fields are as follows:

| Field          | Description                                 |
| -------------- | ------------------------------------------- |
| Entity         | Political Entity                            |
| Code           | ISO code formed of 3 letters for the entity |
| Year           | Year of the data                            |
| LifeExpectancy | Period life expectancy (years) at birth     |

For `data2.csv`, the fields are as follows:

| Field                                          | Description                                          |
| ---------------------------------------------- | ---------------------------------------------------- |
| name                                           | Country name in English                              |
| alpha-2                                        | ISO code formed of 2 letters                         |
| alpha-3                                        | ISO code formed of 3 letters                         |
| country code                                   | Unique country code                                  |
| region                                         | The continent of provenance                          |
| sub-region                                     | Subcontinent                                         |
| intermediate region                            | Intermediate region                                  |
| codes for region/subregion/intermediate region | Codes for region, subregion, and intermediate region |

# Software Requirements

The exam requires you to develop a web application on your own (no teamwork, and hope you believe that your integrity is more important than scores). It is entirely okay to use assistance from AI, but you must understand the code that you write.

You have the following requirements:

- Select a country using a dropdown list, and then show the Life Expectancy at Birth for that country over the years ordered by year in ascending order.
- Select a sub-region and a year with data using two separate dropdown lists, and then show all countries in that sub-region with their Life Expectancy at Birth in that year, ordered by country name in ascending order.
- Select a region and a year with data using two separate dropdown lists, and then display all its sub-regions and their minimum Life Expectancy at Birth in each sub-region in that year, ordered by both region and the minimum Life Expectancy at Birth.
- Do a keyword search on country names (partial match) using an input text box, and then show the matching countries along with their maximum Life Expectancy at Birth over the years, ordered by country name.
- Select a country, and add a new Life Expectancy at Birth record for that country for the next year (e.g., if the latest Life Expectancy is in 2023, the new value is then for 2024).
- Select a country, a data year (a year with data), and then update the Life Expectancy at Birth record for that country and year.
- Select a country, a beginning data year, and an ending data year, and then delete all Life Expectancy at Birth records for that country within the specified year range.
- A feature of your choice related to the Life Expectancy at Birth data.

# Tasks

The exam consists of the following tasks that should correspond well to goal of this course and the above purposes. It should also be noted that for implementations of applications, you must use the database/ER model that you designed, with normalizations applied.

1.  **(10 pts.) Using GitHub**
    Create a GitHub repository for your final exam project with a `README.md` file. This GitHub repository should contain everything for your final exam, including your ER model image file, your SQL statements document file, and your three-tier web application project folder (that does to `/app` in Docker). Note that You should do **at least one commit** per task completed in the following.

2.  **(15 pts.) Database design & normalization**
    The given data (two CSV files) are NOT normalized. Please design a physical database model (the E-R model that can be implemented in DBMS, i.e. no many-to-many relationships) that contains all the necessary data to complete your software requirements and 2) conforms to the **3rd normal form**.
    **Commit** your E-R model either in `README.md` using [Mermaid syntax](https://docs.mermaidchart.com/mermaid-oss/syntax/entityRelationshipDiagram.html#entity-relationship-diagrams) or by an image file (e.g., `ERDiagram.BMP`, `ERDiragram.PNG`, or `ERDiagram.GIF`).
    _p.s. If you have fewer than 4 entities, you will receive a very low score..._

3.  **(15 pts.) SQL**
    **Commit** a file named `ETL.sql`. The file should be similar to "Commands used in today's demonstration for ETL." found in the week of Oct. 13 - Oct. 19. It contains all SQL statements and comments for preparing your DBMS:

    1.  Create all tables according to your uploaded E-R model.
    2.  ETL to extract data from the given data, transform the data, and load it into the designed database. You should remove errorneous data from the given data before loading them into your database. Each statement should be accompanied by a remark/comment on what the SQL statement does.
    3.  You may ETL only the needed data according to your software requirements.

4.  **(40 pts.) Three-tier Web Application**
    Implement a three-tier web application using HTML, CSS, Express, and HTMX. The application has eight features (one of your choice). Furthermore, the application should be implemented using your database tables. If you use the original tables (without normalization), you will be discounted by 30%. You should do **at least one commit** per feature implemented.

5.  **(15 pts.) Deployment with Docker**
    **Commit** a file named `compose.yaml` so that the user (me) can run your software by two commands:

    1.  `git clone Your GitHub repository URL`
    2.  `docker compose up`

6.  **(5 pts.) Git Push**
    Please make sure that you have pushed all your commits to your GitHub repository before the deadline. In fact, there is no limit on the number of pushes. So you really should do git push as often as possible.
