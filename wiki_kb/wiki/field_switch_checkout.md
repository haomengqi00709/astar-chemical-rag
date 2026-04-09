---
slug: field_switch_checkout
title: Field Switch Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Field Switch Checkout

This procedure details the specific checkout requirements for Field Switches. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Field Switches include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Nameplate data and record for Field Switches **must** match the Instrument Specification Sheet information. The Nameplate tag for Field Switches **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubed:** N/A
*   **Installation:** Switches **must** be installed in accordance with [[instrument_installation_details_8_dtl_xxxx]] and/or manufacturer instructions.

**Electrical and Wiring Checks**
*   **Control Signal Wiring:** Control signal wiring connections for Field Switches **must** be in accordance with the [[instrument_loop_diagrams]] and manufacturers' instructions.
*   **Switch Control Signal Wiring at DCS:** Switch control signal wiring connections at the DCS termination cabinet **must** be in accordance with the [[instrument_loop_diagrams]].

**Calibration and Functional Checks**
*   **Fail Action Operation:** The fail action operation of the switch **must** meet the instrument specifications by simulation of the failed switch.
*   **Range:** The range of the switch **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Calibration Verification:** If the manufacturer has not provided Calibration Certification for a Switch, calibration verification **must** be performed and documentation verifying the calibration tests **must** be properly filed and turned over to the site supervisor after acceptance of the installation.
*   **Process Condition Simulation:** Process conditions **must** be simulated to cycle the switch. If this is not possible, the discrete control signal from the field switch **must** be simulated (by applying jumpers or lifting of wire leads as may be required).
*   **Discrete Signal Reception:** The discrete control signal from the field switch **must** be received correctly at the control system.
*   **DCS Check:** The DCS check for Field Switches **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **Initials KC:** Indicates checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Indicates acceptance of Instrumentation Checkout completion.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]