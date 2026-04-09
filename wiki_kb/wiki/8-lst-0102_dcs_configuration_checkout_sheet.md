---
slug: 8-lst-0102_dcs_configuration_checkout_sheet
title: DCS Configuration Checkout Sheets (8-LST-0102)
source_doc: 8-PRC-0006
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Configuration Checkout Sheets (8-LST-0102)

The **DCS Configuration Checkout Sheets 1 and 2**, identified as list **8-LST-0102**, are integral documents for recording the results of the [[8-PRC-0006_dcs_control_function_checkout|DCS Control Function Field Checkout]]. These sheets provide a structured summary of configured objects and their test outcomes.

Data available in SQL: 8-LST-0102

**Purpose and Structure**
*   The purpose of these check sheets is to provide a summary of configured objects and their test results.
*   List **8-LST-0102** consists of 2 pages, designed to capture comprehensive data for various DCS components.

**Completion and Sign-off**
*   The form **must** be filled out and signed by the specialist after each object has been checked. This ensures accountability and real-time documentation of verification activities.
*   Upon completion of the entire checkout process, the owner **will** indicate acceptance by signing both lists, signifying formal approval of the DCS configuration.

**Sheet 1: I/O Checkout Descriptions**
*   Sheet 1 **is filled out** as described in the [[dcs_analog_input_testing|Analog Input]], [[dcs_analog_output_testing|Analog Output]], [[dcs_digital_input_testing|Digital Input]], and [[dcs_digital_output_testing|Digital Output]] checkout descriptions. This sheet primarily focuses on the verification of individual I/O points.

**Sheet 2: Column Descriptors and Specific Checks**
Sheet 2 provides detailed columns for various control functions, including loops and graphics:

*   **Tag number:** This column is self-explanatory (e.g., "EI-2000)").
*   **Description:** This column provides a description of the service (e.g., "Cell Voltage").
*   **Columns C, D, E, F & G:** These columns require an "X" in the appropriate field to indicate status or confirmation.

**Loop Configuration Specifics (Sheet 2):**
For [[dcs_loop_configuration_checkout|Loop Configuration]] checks, the following columns are used:
*   **Algorithm:** Requires "P", "P&I", or "PID" to specify the control algorithm.
*   **Action:** Requires "Normal" or "Reverse" (applicable for Controller only).
*   **Tracking:** Requires "Setpoint" or "PV" to indicate the tracking mode.
*   **Output limit:** Requires showing the configured output limit.
*   **Enabled:** Requires an "X" when the point is enabled.

**Graphic Displays Specifics (Sheet 2):**
For [[dcs_graphic_displays_checkout|Graphic Displays]] checks, mark-off in the appropriate column for:
*   **Correct Relative location:** Verification of object placement on the graphic.
*   **Correct display and display value:** Confirmation of accurate data presentation.
*   **Event list presence:** Indication of whether the point appears on the event list.
*   **Alarm list presence and alarm priority level:** Confirmation of alarm functionality and priority.
*   **Trending status and trend number:** Indication of whether the point is trended, and its associated trend number.

**Deficiency Documentation**
*   Any identified deficiencies **will be rectified** on the spot or entered into the "comments" column.
*   As part of [[dcs_control_function_field_checkout_deficiency_management|deficiency management]], identified and listed deficiencies **must** be corrected, rechecked, and signed off. The complete DCS cannot be signed-off "Ready for water batching and commissioning" until all deficiencies are corrected, rechecked, and signed off.

These checkout sheets are crucial for maintaining a clear, auditable record of the DCS configuration and its verification status.

[[8-PRC-0006_dcs_control_function_checkout|DCS Control Function Field Checkout Overview (8-PRC-0006)]]
[[dcs_control_function_field_checkout_roles_and_responsibilities|DCS Control Function Field Checkout Roles and Responsibilities]]