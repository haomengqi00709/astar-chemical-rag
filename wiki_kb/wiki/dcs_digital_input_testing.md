---
slug: dcs_digital_input_testing
title: DCS Digital Input Testing Procedure
source_doc: 8-PRC-0006
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Digital Input Testing Procedure

Digital Input (DI) testing is a vital part of the [[dcs_io_testing_general|DCS I/O Testing General Requirements]] to confirm that discrete signals from field devices are correctly received and interpreted by the Distributed Control System (DCS). This procedure outlines the steps for verifying digital inputs.

**Procedure Steps:**
1.  **Select I/O Database Tag:** The console specialist **must** select the I/O database tag for the specific digital input on the operator station. This prepares the system for monitoring the input status.
2.  **Simulate Contact Change:** The field specialist **must** bridge or open the two (2) signal wires at the field instrument or motor control device to simulate a required closed or open contact, as described in [blank] and/or [blank]. This action mimics a change in the field device's state.
3.  **Exercise Switching Device (Preferred):** Wherever possible, for digital inputs, the field specialist **should** exercise the actual switching device (e.g., limit switch, push button) instead of disconnecting or bridging wires. This provides a more realistic test of the device's functionality.
4.  **Witness Change on Object Display:** The console specialist **witnesses** the digital input changes as a clear transition from "0" to "1" or "1" to "0" on the object display at the operator station. This confirms the DCS is correctly registering the state change.
5.  **Repeat Procedure:** The digital input procedure **is repeated** three (3) times to ensure consistent and reliable operation.
6.  **Record Results:** The results of the digital input testing **must** be listed in the appropriate columns on the [[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheet 1 (8-LST-0102)]]. This documentation provides a record of the successful verification or identifies any discrepancies.

This systematic approach ensures that all digital input channels are functioning correctly, providing reliable status information to the DCS for monitoring and control.

[[dcs_io_testing_general|DCS I/O Testing General Requirements]]
[[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheets (8-LST-0102)]]