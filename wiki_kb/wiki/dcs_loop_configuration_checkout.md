---
slug: dcs_loop_configuration_checkout
title: DCS Loop Configuration Checkout
source_doc: 8-PRC-0006
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Loop Configuration Checkout

The checkout of Distributed Control System (DCS) loop configurations is a critical step in the [[8-PRC-0006_dcs_control_function_checkout|DCS Control Function Field Checkout]] to ensure that automated control strategies are correctly implemented and operational. This process involves verifying the configuration of various control elements.

**Equipment Requiring Configuration Checks:**
Drives, valves, closed loop controllers, manual loading stations, graphics displays, and logics all require checking for correct configuration.

**Specific Checks for Loop Configuration:**
For each control loop, the following parameters **must** be verified:
*   **Algorithm:** Check for the correct algorithm (e.g., P, PI, or PID) if required for the specific control strategy.
*   **Action:** Verify the correct action (Forward/Reverse) if required for the controller. Note that the "Action" column on [[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheet 2]] is applicable for "Controller only".
*   **Setpoint/PV Tracking:** Confirm that Setpoint/PV (Process Variable) tracking is correctly configured if required. This ensures smooth transitions between manual and automatic control modes.
*   **Output Limit:** Check that the output limit is correctly set if required. This prevents control outputs from exceeding safe or operational boundaries.
*   **Enabled Status:** Verify that the control point is ENABLED, indicating it is active within the DCS.

These checks are essential to confirm that the DCS is prepared to execute control strategies accurately and safely, contributing to the overall operational integrity of the plant.

[[8-PRC-0006_dcs_control_function_checkout|DCS Control Function Field Checkout Overview (8-PRC-0006)]]
[[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheets (8-LST-0102)]]