---
slug: dcs_digital_output_testing
title: DCS Digital Output Testing Procedure
source_doc: 8-PRC-0006
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Digital Output Testing Procedure

Digital Output (DO) testing is a crucial part of the [[dcs_io_testing_general|DCS I/O Testing General Requirements]] to confirm that discrete control commands from the Distributed Control System (DCS) are correctly transmitted to and activate field devices. This procedure outlines the steps for verifying digital outputs.

**Procedure Steps:**
1.  **Select I/O Database Tag:** The console specialist **must** select the I/O database tag for the specific digital output on the operator station. This prepares the system for manipulating the output status.
2.  **Select Tag to Manual Mode:** The console specialist **must** select the digital output tag to Manual Mode on the operator station. This allows for direct control of the output signal for testing purposes.
3.  **Change Output Value:** The console specialist **must** change the value from "0" to "1" (by forcing the output) and then back three (3) times. This simulates the DCS commanding the field device to turn on and off.
4.  **Witness Output Changes:** The field specialist **witnesses** the digital output changes at the field end device. This is done using a multimeter to check for energisation/de-energisation of the output signal or by observing the physical activation/deactivation of the final control element (e.g., motor starter, solenoid valve), as described in [blank] and/or [blank].
5.  **Record Results:** The results of the digital output testing **must** be listed in the appropriate columns on the [[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheet 1 (8-LST-0102)]]. This documentation provides a record of the successful verification or identifies any discrepancies.

This systematic procedure ensures that all digital output channels are functioning correctly, enabling the DCS to reliably control discrete field devices essential for process operation and safety.

[[dcs_io_testing_general|DCS I/O Testing General Requirements]]
[[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheets (8-LST-0102)]]