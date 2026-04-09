---
slug: pressure_and_level_transmitter_checkout
title: Pressure and Level Transmitter Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Pressure and Level Transmitter Checkout

This procedure details the specific checkout requirements for Pressure and Level Transmitters. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Transmitters (Pressure, Level) include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** The Transmitter Model No. nameplate data **must** match the Instrument Specification Sheet information. The Nameplate tag **must** match the Instrument Tag Number.
*   **Impulse Tubing:** Impulse tubing **must** meet specification in accordance with the [[instrument_installation_details_8_dtl_xxxx]]. Installation **must** be neat and properly secured.
*   **Isolation and Bleeding:** All isolation valves **must** be closed. Any residue from between the isolation valve and the transmitter **must** be bled. After start-up, confirm there are no leaks from any of the fittings.
*   **Inst Air Tubed:** N/A
*   **Pressure Transmitter Location:** Pressure transmitters **must** be properly located above gas lines or below liquid and steam lines, as confirmed with the [[instrument_installation_details_8_dtl_xxxx]].
*   **Level Transmitter Suppression:** All level transmitters with remote seals or compensation legs **must** be properly suppressed according to the distance between the two connections, as confirmed with the [[instrument_installation_details_8_dtl_xxxx]].
*   **Loop Check Prerequisite:** [[dcs_loop_configuration_checkout]], DCS operation, and [[alarms_interlocks_and_setpoints]] operation **must** be completed before reopening isolation valves.

**Calibration and Functional Checks**
*   **Calibration Basis:** Calibration is based on the specific gravity of the process fluid in most cases. Calibration on water will likely introduce a calibration error.
*   **Analog Signal Simulation:** The analog control signal (4-20 mA) from the transmitter **must** be simulated either through the Manufacturers software or a milliamp test instrument.
*   **Field/DCS Calibration Check:** Refers to the Check - 0% procedure as outlined in [[instrument_checkout_general_guidelines]].

**Sign-off**
*   **Initials KC:** Indicates checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Indicates acceptance of Instrumentation Checkout completion.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]

**Installation Verification**
*   Loop Check, DCS operation, and Interlock operation must be completed before reopening isolation valves.
*   Inst Air Tubed: N/A

**Calibration Checks**
*   Field/DCS Calibration Check – 25% refers to the Check - 0% procedure.
*   Field/DCS Calibration Check – 50% refers to the Check - 0% procedure.
*   Field/DCS Calibration Check – 75% refers to the Check - 0% procedure.
*   Field/DCS Calibration Check – 100% refers to the Check - 0% procedure.
---