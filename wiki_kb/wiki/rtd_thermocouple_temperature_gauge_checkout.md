---
slug: rtd_thermocouple_temperature_gauge_checkout
title: RTD, Thermocouple, and Temperature Gauge Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# RTD, Thermocouple, and Temperature Gauge Checkout

This procedure details the specific checkout requirements for Resistance Temperature Detectors (RTDs), Thermocouples, and Temperature Gauges. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to RTD, Thermocouple, Temperature Gauge include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Model No. nameplate data and record **must** match the Instrument Specification Sheet information. The Nameplate tag **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubed:** N/A
*   **Installation:** Instruments **must** be installed correctly, confirmed with the [[instrument_installation_details_8_dtl_xxxx]].
*   **Capillaries:** Capillaries **must** be supported securely and installed with adequate mechanical protection.

**Electrical and Wiring Checks**
*   **Wiring:** RTD/Thermocouple wiring to transmitters or PLC/DCS inputs **must** be wired in accordance with [[instrument_loop_diagrams]] and manufacturer instructions.
*   **Sensor Control Signal Wiring at DCS:** Sensor control signal wiring connections at the DCS termination cabinet **must** be in accordance with the [[instrument_loop_diagrams]].

**Calibration and Functional Checks**
*   **Operation Confirmation:** RTD and Thermocouple operation will be confirmed in conjunction with loop tests of transmitters. Confirmation of temperature sensors is made by immersion of the sensor into a hot bath (with a fixed known temperature).
*   **Fail Action:** N/A
*   **Field Fail Action Checked:** N/A
*   **Range:** The range of the sensor **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Calibration Verification:** If the manufacturer has not provided Calibration Certification, calibration verification **must** be performed. Documentation verifying calibration tests **must** be properly filed and turned over to the site supervisor after acceptance of the installation.
*   **Field/DCS Calibration Check:** Refers to the Check - 0% procedure as outlined in [[instrument_checkout_general_guidelines]].
*   **DCS Check:** The DCS check **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]