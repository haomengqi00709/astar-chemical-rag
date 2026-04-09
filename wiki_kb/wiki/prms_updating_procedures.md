---
slug: prms_updating_procedures
title: PRMS Updating Procedures
source_doc: 0-PRC-3003
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# PRMS Updating Procedures

The Project Resource Management System (PRMS) **must** be updated at regular intervals to ensure accurate project monitoring and forecasting. The specific update intervals are detailed in [[project_instructions_0_prc_2002|0-PRC-2002: Project Instructions]].

**Required Data for Updates:**
For each update, the following information is essential:
*   Actual hours expended, imported as totals per department "to date."
*   The latest actual quantities of items on the cost code worksheets.
*   The latest status (done/not done or 1/0 status) of each activity for each item on the cost code worksheets. Knowledge of the current status of all work objects is required.
*   Actual hours spent by each discipline for each cost code.
*   Knowledge of new, previously unaccounted for quantities of work objects.

**Adjustments During Updates:**
*   Budget quantities of items on the cost code worksheets **must** be adjusted according to any [[scope_change_control_0_prc_4003|Change Notices (0-PRC-4003)]].
*   Budget hours **must** be adjusted by modifying the assumed productivity for each department, also as per any [[scope_change_control_0_prc_4003|Change Notices (0-PRC-4003)]].

**Step-by-Step Update Process:**
Updated data will be input manually into all cells highlighted in red.

1.  **Open Workbook:** First, open the last saved PRMS workbook.
2.  **Order of Update:** The update **should** be made in a specific order to maintain data integrity.
3.  **"Totals" Worksheet:** Enter the current date on the "Totals" Worksheet.
4.  **Cost Code Worksheets:** Fill out each worksheet with the actual hours spent by each department up to the date of the current update.
5.  **Work Object Status:** For each work object, change the status from 0 to 1 for activities that have been fully completed. Activities that are partially completed **shall** be treated as 0 (not completed) for status tracking.
6.  **"EMF" Worksheet:**
    *   Enter the accumulated actual hours (row 62) for the current and past dates at the bottom of the worksheet.
    *   Enter the accumulated earned hours (row 64) for the current and past dates at the bottom of the worksheet.
7.  **"S-Curve" Worksheet:** For the Actual and Earned graphs, increase the data range to include the latest data entered on the "EMF" worksheet.
8.  **Worksheet Protection:** During the update process, all worksheets **should** remain protected.

**Handling Quantity Changes:**
If new work object quantities have been added to or removed from the project, these new quantities **should** be entered on the "Est-budget" worksheet. The "Est-budget" worksheet will then calculate the required change to the budget for the delivery of these new quantities. For detailed procedures on dealing with such changes, refer to section 1.1-Estimating of this procedure.

[[project_resource_management_system_overview|PRMS Overview]]
[[prms_calculations_and_metrics|PRMS Calculations and Performance Metrics]]
[[prms_reporting_and_resource_forecasting|PRMS Reporting and Resource Forecasting]]