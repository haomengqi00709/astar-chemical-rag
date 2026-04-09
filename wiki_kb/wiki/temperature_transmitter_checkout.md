---
slug: temperature_transmitter_checkout
title: Temperature Transmitter Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Temperature Transmitter Checkout

This procedure details the specific checkout requirements for Temperature Transmitters. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Temperature Transmitters include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Nameplate data and record for Temperature Transmitters **must** match the Instrument Specification Sheet information. The Nameplate tag for Temperature Transmitters **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubed:** N/A
*   **Installation:** The temperature transmitter **must** be installed in accordance with the [[instrument_installation_details_8_dtl_xxxx]] and/or manufacturer instructions.

**Electrical and Wiring Checks**
*   **Sensor and Transmitter Wiring:** The temperature sensor and transmitter **must** be wired in accordance with the [[instrument_loop_diagrams]] and manufacturers' instructions.
*   **Analog Control Signal Wiring:** Analog control signal wiring for Temperature Transmitters **must** be wired in accordance with the [[instrument_loop_diagrams]].

**Calibration and Functional Checks**
*   **Analog Signal Simulation:** The analog control signal (4-20 mA) from the Temperature Transmitter **must** be simulated either through the Manufacturers software or a milliamp test instrument. The analog signal from the Temperature Transmitter **must** be received correctly at the control system.
*   **DCS Check:** The DCS check for Temperature Transmitters **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **Initials KC:** Indicates checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Indicates acceptance of Instrumentation Checkout completion.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]