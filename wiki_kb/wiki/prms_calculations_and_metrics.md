---
slug: prms_calculations_and_metrics
title: PRMS Calculations and Performance Metrics
source_doc: 0-PRC-3003
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# PRMS Calculations and Performance Metrics

The Project Resource Management System (PRMS) employs specific methodologies to calculate key project metrics, including budget hours, earned hours, productivity, and progress.

**Budget Hours Calculation:**
Budget hours are derived by multiplying the estimated (budget) quantity of items for each cost code by the assigned values of unit earned hours for each participating department for that cost code.

**Work Status and Earned Hours:**
*   **Work Status:** For quantification where each item occupies a single worksheet row, the work status for each activity is either zero (not completed) or unity (fully completed). For grouped quantification, the work status for each activity represents the actual count of items for which the work is fully completed. Activities that are partially completed are treated as 0.
*   **Earned Hours:** Totals of earned hours are calculated for each department for each cost code. These totals are derived from the value of unit earned hours assigned to each department for each activity. The values of unit earned hours are calculated by dividing the base unit by the assumed productivity for each department.

**Actual Hours Input:**
Actual hours expended are manually transferred from the accounting database into the respective PRMS cost code worksheets. These hours are recorded as "totals per department to date." The time-based functionality of the PRMS relies on the input of these actual hours at regular intervals.

**Productivity Calculation:**
Productivity is defined as earned hours divided by actual hours.
*   A productivity value of less than unity indicates worse than average performance.
*   A productivity value greater than unity indicates better than average performance.
*   Productivity is calculated for each department and for each cost code.
*   Assumed productivity for each department is entered into the PRMS during the estimate (budget) preparation phase. This assumed productivity anticipates better or worse performance compared to historic averages for design work.

**Forecast Hours Calculation:**
A forecast of actual total hours for each department for each cost code is calculated by dividing the forecast earned hours by the productivity. Forecast earned hours are calculated based on the actual quantities entered into the system.

**Progress Calculation:**
Progress is defined as earned hours divided by forecast earned hours, expressed as a percentage (%). Progress is calculated for each department and for each cost code.

**Overhead Cost Code Calculations (ENG-0-0100 to ENG-0-4400):**
*   Actual hours expended for the total of the overhead cost codes are manually transferred from the accounting database into the PRMS overhead worksheet, recorded as "totals per department to date."
*   Productivity for each department's total overhead cost codes is set to be identical to the value calculated for that department's design work.
*   Forecast hours for each department's total overhead cost codes are calculated using the budgeted hours and the assigned productivity values.

**Data Aggregation:**
Data from each cost code worksheet is totaled onto a single summary worksheet within the PRMS.

[[project_resource_management_system_overview|PRMS Overview]]
[[prms_structure_and_data_management|PRMS Structure and Data Management]]
[[prms_updating_procedures|PRMS Updating Procedures]]
[[prms_reporting_and_resource_forecasting|PRMS Reporting and Resource Forecasting]]