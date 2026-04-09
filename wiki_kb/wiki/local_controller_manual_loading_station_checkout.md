---
slug: local_controller_manual_loading_station_checkout
title: Local Controller/Manual Loading Station Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Local Controller/Manual Loading Station Checkout

This procedure details the specific checkout requirements for Local Controllers and Manual Loading Stations. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Local Controller/Manual Loading Station include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Nameplate data and record **must** match the Instrument Specification Sheet information. The Nameplate tag **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubed:** N/A
*   **Installation:** The controller and/or manual loading station **must** be installed in accordance with [[instrument_installation_details_8_dtl_xxxx]] and/or manufacturer instructions.

**Electrical and Wiring Checks**
*   **Control Signal Wiring:** Control signal wiring connections **must** be in accordance with the [[instrument_loop_diagrams]] and manufacturers' instructions.
*   **Power Supply:** Power supply voltage **must** be correct. Hot and neutral connections for the power supply **must** be to the correct terminals. The power supply **must** be fed from the correct circuit breaker/fused terminal in accordance with the [[instrument_loop_diagrams]].
*   **Control Signal Wiring at DCS:** Control signal wiring connections at the DCS termination cabinet **must** be in accordance with the [[instrument_loop_diagrams]].

**Functional Checks**
*   **Fail Action:** The fail action of the switch **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]]. The configured fail action operation of the controller/manual loading station **must** meet the instrument specifications.
*   **Range:** The range of the controller/manual loading station **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Analog Input Signal Simulation:** Simulate the analog input signal to the controller at the primary measurement transmitter either through manufacturers' software or a milliamp test instrument. Confirm the analog signal is received correctly at the control system.
*   **Output Drive Verification:** Drive the output of the controller or manual loading station in increments of 0%, 25%, 50%, 75%, and 100%. Verify the correct output is received at the final control element or DCS as required.
*   **Field/DCS Calibration Check:** The procedure for 25%, 50%, 75%, and 100% checks is the same as the 0% procedure.
*   **DCS Check:** The DCS check **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]