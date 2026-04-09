---
slug: dcs_analog_input_testing
title: DCS Analog Input Testing Procedure
source_doc: 8-PRC-0006
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Analog Input Testing Procedure

Analog Input (AI) testing is a critical part of the [[dcs_io_testing_general|DCS I/O Testing General Requirements]] to ensure that process measurements are accurately received and displayed by the Distributed Control System (DCS). This procedure outlines the steps for verifying analog inputs.

**Procedure Steps:**
1.  **Confirm Measurement Range and Engineering Units:** The console specialist **must** confirm the measurement range and engineering units for the specific analog input on the operator station. This ensures that the DCS is configured to interpret the signal correctly.
2.  **Simulate Analog Input Signal:** The field specialist **must** simulate the analog input signal as described in [blank]. This involves generating a known signal at the field instrument to represent various process conditions.
3.  **Witness Signal at Operator Station:** The analog input signals **are witnessed** at the operator station at specific increments: 0%, 25%, 50%, 75%, and 100% of the configured range, displayed in the correct engineering units. The console specialist verifies these readings.
4.  **Check Analog Input Alarms:** Analog input alarms **must** be checked against [blank]. This involves verifying that the DCS correctly triggers alarms when the simulated signal crosses predefined alarm setpoints.
5.  **Record Results:** The results of the analog input testing **must** be listed in the appropriate columns on the [[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheet (8-LST-0102)]]. This documentation provides a record of the successful verification or identifies any discrepancies.

This systematic approach ensures that all analog input channels are functioning correctly, providing reliable process data to the DCS for monitoring and control.

[[dcs_io_testing_general|DCS I/O Testing General Requirements]]
[[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheets (8-LST-0102)]]