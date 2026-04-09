---
slug: process_and_mechanical_design_document_hierarchy
title: Process and Mechanical Design Document Hierarchy
source_doc: 1-DST-0001
doc_type: DST
discipline: 1
discipline_name: Process Technology
source_folder: Datasheet
track: A
---

# Process and Mechanical Design Document Hierarchy

For the Chemetics project, a structured hierarchy of five key documents defines all process and mechanical design conditions for piping and equipment throughout the plant. This ensures consistency, accuracy, and proper coordination across all engineering disciplines.

**The Five Defining Documents:**

1.  **[[site_design_conditions_1_dst_0001]] (1-DST-0001): Site Design Conditions**
    *   This document compiles crucial site-specific information, including [[wind_design_requirements]], [[seismic_design_requirements]], electrical voltages, rainfall data, and [[utility_fluid_design_conditions]].
    *   It serves as a central reference for equipment vendors and design teams.
    *   [[site_design_conditions_1_dst_0001]] is formally issued to the Owner to confirm the agreed-upon site conditions.

2.  **[[battery_limits_conditions_1_lst_0001]] (1-LST-0001): Battery Limits Conditions**
    *   This document details the process conditions that are mutually agreed upon between Chemetics and the Owner at the plant's battery limits.
    *   It is issued to the Owner to confirm these critical interface conditions.
    *   For fluids supplied from the battery limit, process design conditions **shall** be coordinated with this document, as outlined in [[utility_fluid_design_conditions]].

3.  **[[line_list_5_lst_0001]] (5-LST-0001): Line List**
    *   The Line List is a comprehensive document that defines all mechanical design conditions necessary for the selection of pipe materials and components. This includes parameters such as temperature, pressure, relief requirements, and insulation specifications.
    *   Mechanical design conditions specified on the Line List **shall** be coordinated with the utility fluid design conditions found in [[site_design_conditions_1_dst_0001]] to ensure consistency.

4.  **[[tie_point_list_5_lst_0002]] (5-LST-0002): Tie Point List**
    *   This document specifies the mechanical requirements for each pipe connection at the battery limit. These requirements include the size, precise location, and pressure relief considerations for each tie-in point.
    *   For fluids supplied from the battery limit, mechanical design conditions **shall** be coordinated with this document, as detailed in [[utility_fluid_design_conditions]].

5.  **[[equipment_data_sheets_4_dst_xxxx]] (4-DST-XXXX) or [[package_data_sheet_4_pkg_xxxx]] (4-PKG-XXXX): Equipment/Package Data Sheets**
    *   These documents provide detailed process and utility conditions specific to individual pieces of equipment or complete packaged units.
    *   [[equipment_data_sheets_4_dst_xxxx]] may reference [[site_design_conditions_1_dst_0001]] to specify general utility design requirements.
    *   It is crucial that equipment design conditions are sufficiently conservative to remain unaffected by the specific details provided in the Line List and Tie Point List.

This integrated documentation approach ensures a robust and well-coordinated design process, minimizing discrepancies and facilitating efficient project execution.

**The Five Defining Documents:**
Commentary Note 1.0 specifies that the following five documents define process and mechanical design conditions for piping and equipment within the Plant:
*   [[site_design_conditions_1_dst_0001]]: Site Design Conditions
*   [[battery_limits_conditions_1_lst_0001]]: Battery Limits Conditions
*   [[line_list_5_lst_0001]]: Line List
*   [[tie_point_list_5_lst_0002]]: Tie Point List
*   [[equipment_data_sheets_4_dst_xxxx]] (or [[package_data_sheet_4_pkg_xxxx]]): Equipment Data Sheet (or Package Data Sheet)

**Definitions:**
Note 3.0 defines process design conditions as Operating conditions.
---