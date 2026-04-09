---
slug: dcs_analog_output_testing
title: DCS Analog Output Testing Procedure
source_doc: 8-PRC-0006
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Analog Output Testing Procedure

Analog Output (AO) testing is an essential part of the [[dcs_io_testing_general|DCS I/O Testing General Requirements]] to verify that the Distributed Control System (DCS) can accurately send control signals to field devices. This procedure details the steps for testing analog outputs.

**Procedure Steps:**
1.  **Confirm Measurement Range and Engineering Units:** The console specialist **must** confirm the measurement range and engineering units for the specific analog output on the operator station. This ensures the DCS is configured to send signals within the expected parameters.
2.  **Select Tag to Manual Mode:** The console specialist **must** select the analog output tag to Manual Mode on the operator station. This allows for direct manipulation of the output signal for testing purposes.
3.  **Step Output Signal:** The console specialist **must** step the output from 0% to 100% in increments of 25%, as described in [blank]. This generates a series of known output signals.
4.  **Witness Output Changes:** The field specialist **witnesses** the analog output changes at the field end device. This is observed as 4 mA, 8 mA, 12 mA, 16 mA, and 20 mA steps measured with a multimeter, or by observing the appropriate physical movement of the final control element (e.g., valve position).
5.  **Record Results:** The results of the analog output testing **must** be listed in the appropriate columns on the [[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheet 1 (8-LST-0102)]]. This documentation provides a record of the successful verification or identifies any discrepancies.

This procedure ensures that the DCS can reliably control analog field devices, which is crucial for maintaining process stability and operational efficiency.

[[dcs_io_testing_general|DCS I/O Testing General Requirements]]
[[8-LST-0102_dcs_configuration_checkout_sheet|DCS Configuration Checkout Sheets (8-LST-0102)]]