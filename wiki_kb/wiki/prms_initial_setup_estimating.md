---
slug: prms_initial_setup_estimating
title: PRMS Initial Setup for Estimating
source_doc: 0-PRC-3003
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# PRMS Initial Setup for Estimating

The initial setup of the Project Resource Management System (PRMS) is crucial for generating an accurate office hours estimate. This process involves manual data input and system manipulation to define project scope and refine the final estimate.

**General Requirements:**
*   To obtain an office hours estimate, the PRMS **must** be updated with project-specific data. This data is input manually into all cells highlighted in blue.
*   Following this initial input, the PRMS **must** be manipulated to accurately define the project scope and to tune the final estimate.

**Step-by-Step Setup for Estimating:**

1.  **"Totals" Worksheet (Initial Input - Estimating):**
    *   Enter the project name and number.

2.  **"Est-budget" Worksheet (Initial Input - Estimating):**
    *   Unprotect the sheet.
    *   Define all quantities of work objects for cost codes ranging from ENG-0-5000 to ENG-9-9200.
    *   Fill in the estimate of administration hours for cost codes from ENG-0-0100 to ENG-0-4400.
    *   Protect the worksheet without a password once data entry is complete.

3.  **Cost Code Worksheets (Initial Input - Estimating):**
    *   If the project is a full EPC job, this step may be omitted.
    *   For projects with a limited scope, change "y" to "n" in row 87 for any activities that are not included in the project.

4.  **"Admin" Worksheet (Initial Input - Estimating):**
    *   Open the "admin" worksheet.
    *   Distribute the administration budgeted hours between the various disciplines.
    *   The total of budgeted hours on the "admin" worksheet **must** agree with the estimates provided on the "Est-budget" worksheet.

5.  **Budget Review and Tune-up:**
    *   On the "Totals" sheet, check if the budget for each discipline appears reasonable for the specific project.
    *   If the budget is not reasonable, the PRMS requires a "tune-up."
    *   Open and unprotect the "Tune-up" worksheet.
    *   Adjust the assumed productivity factor on the "Tune-up" worksheet. This adjustment **shall** be made such that the budget displayed on the "Totals" page matches the project's expectations.
    *   Once the tune-up is complete, protect the "tune-up" sheet without a password.
    *   **Note:** The assumed productivity factor only multiplies calculated hours (from sheets ENG-0-5000 to ENG-9-9200). It does not affect administration hours, as these are input manually.

This detailed setup ensures that the PRMS accurately reflects the project's estimated resource requirements and scope before project execution begins.

[[project_resource_management_system_overview|PRMS Overview]]
[[prms_structure_and_data_management|PRMS Structure and Data Management]]
[[prms_calculations_and_metrics|PRMS Calculations and Performance Metrics]]