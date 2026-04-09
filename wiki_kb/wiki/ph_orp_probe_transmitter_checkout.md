---
slug: ph_orp_probe_transmitter_checkout
title: pH/ORP Probe and Transmitter Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# pH/ORP Probe and Transmitter Checkout

This procedure details the specific checkout requirements for pH/ORP Probes and Transmitters. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to pH/ORP Probes & Transmitters include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Nameplate data and record for pH/ORP Probes & Transmitters **must** match the Instrument Specification Sheet information. The Nameplate tag for pH/ORP Probes & Transmitters **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubed:** N/A
*   **Probe Location:** pH/ORP probes in the process lines and tank **must** be located in such a manner that they will remain immersed in fluid at all times.
*   **Access for Buffering:** The surrounding area where pH/ORP probes are inserted **must** have access room for buffering pH/ORP probes.

**Electrical and Wiring Checks**
*   **Control Signal Wiring:** Control signal wiring connections for pH/ORP Probes & Transmitters **must** be in accordance with the [[instrument_loop_diagrams]] and manufacturers' instructions.
*   **Transmitter Control Signal Wiring at DCS:** Transmitter control signal wiring connections at the DCS termination cabinet for pH/ORP Probes & Transmitters **must** be in accordance with the [[instrument_loop_diagrams]].

**Calibration and Functional Checks**
*   **Fail Action Operation:** The fail action of the pH/ORP transmitter **must** meet the instrument specifications, confirmed through model numbers and/or manufacturers' software settings.
*   **Range:** The range of the pH/ORP transmitter **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Calibration Verification:** If the manufacturer has not provided Calibration Certification for a pH/ORP Transmitter, calibration verification **must** be performed. Documentation verifying the calibration tests **must** be properly filed and turned over to the site supervisor after acceptance of the installation.
*   **Analog Signal Simulation:** The analog control signal (4-20 mA) from the transmitter **must** be simulated either through the Manufacturer's software or a milliamp test instrument. The analog signal **must** be received correctly at the control system.
*   **DCS Check:** The DCS check **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **Initials KC:** Indicates checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Indicates acceptance of Instrumentation Checkout completion.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]