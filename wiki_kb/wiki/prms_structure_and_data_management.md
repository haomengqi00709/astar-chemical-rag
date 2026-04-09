---
slug: prms_structure_and_data_management
title: PRMS Structure and Data Management
source_doc: 0-PRC-3003
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# PRMS Structure and Data Management

The Project Resource Management System (PRMS) is structured around a series of worksheets designed to manage project data effectively.

**Cost Code Worksheets (ENG-0-5000 to ENG-9-9200):**
The PRMS contains one dedicated worksheet for each cost code within the range of ENG-0-5000 to ENG-9-9200.
*   **Activity Breakdown:** The work associated with each cost code is broken down into discrete activities. These activities correspond to specific document deliverables or identifiable milestones.
*   **Earned Hours Assignment:** Each activity is assigned a value of unit earned hours for every department involved in its completion.
*   **Base Configuration:** The PRMS's base configuration is tailored for a full Engineering, Procurement, and Construction (EPC) project. For projects with a more limited design scope, the PRMS **must** be re-configured by "toggling off" any activities not included in the project's design scope.
*   **Quantification Units:** Each cost code is assigned standard quantification units. For example, for cost code ENG-4-1000 (Type A Equipment), the unit of quantification is the count of unique equipment items.
    *   The tag number and description of each unique equipment item are entered into the rows of the ENG-4-1000 worksheet, with each item assigned a quantity of 1.
    *   If the count of completed activities is derived from another system, only a single item is entered into the cost code worksheet.
    *   For grouped quantification, the total count of items is entered as the quantity for a single item.
*   **Quantity Management:** Updating of quantities is achieved by ensuring all items are entered into the cost code worksheet and that the quantity entered is correct. The estimated (budget) quantity of items for each cost code is initially entered into the PRMS. This budget quantity may not be changed except as authorized by a [[scope_change_control_0_prc_4003|Change Notice (0-PRC-4003)]].

**Overhead Cost Code Worksheet (ENG-0-0100 to ENG-0-4400):**
The PRMS includes a single worksheet dedicated to cost codes ranging from ENG-0-0100 to ENG-0-4400, which represent Project Overhead Resources.
*   The budget for the total of these overhead cost codes is entered into this overhead worksheet.
*   This overhead budget is then distributed across each participating department.

**Data Provision:**
Status and quantity data, crucial for PRMS accuracy, are provided to Project Controls by the Project Engineer and the Discipline Leads.

[[project_resource_management_system_overview|PRMS Overview]]
[[prms_calculations_and_metrics|PRMS Calculations and Performance Metrics]]
[[prms_initial_setup_estimating|PRMS Initial Setup for Estimating]]
[[prms_project_execution_setup|PRMS Project Execution Setup]]