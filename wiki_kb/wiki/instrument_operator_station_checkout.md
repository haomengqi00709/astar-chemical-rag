---
slug: instrument_operator_station_checkout
title: Instrument Operator Station Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Instrument Operator Station Checkout

This procedure details the specific checkout requirements for Instrument Operator Stations. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Instrument Operator Stations include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** The nameplate tag **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubed:** N/A
*   **Installation:** Switches for Instrument Operator Stations **must** be installed in accordance with [[instrument_installation_details_8_dtl_xxxx]] and/or manufacturer instructions.

**Electrical and Wiring Checks**
*   **Control Signal Wiring:** Control signal wiring connections for Instrument Operator Stations **must** be in accordance with the [[instrument_loop_diagrams]] and manufacturers' instructions.
*   **Switch Control Signal Wiring at DCS:** Switch control signal wiring connections at the DCS termination cabinet for Instrument Operator Stations **must** be in accordance with the [[instrument_loop_diagrams]].

**Functional Checks**
*   **Fail Action:** N/A
*   **Field Fail Action Checked:** N/A
*   **Scale/Calibration:** N/A
*   **Field/DCS Calibration Check – 0% and 100%:** Manually activate the operator and confirm the discrete control signal is received correctly at the control system.
*   **DCS Check:** The DCS check **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]