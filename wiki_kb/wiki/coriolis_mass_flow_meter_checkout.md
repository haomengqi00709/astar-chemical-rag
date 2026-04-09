---
slug: coriolis_mass_flow_meter_checkout
title: Coriolis Mass Flow Meter Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Coriolis Mass Flow Meter Checkout

This procedure details the specific checkout requirements for Coriolis Mass Flow Meters. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Coriolis Mass Flow Meters include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[8-lst-0004_instrument_cable_schedule]] (Instrument Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Nameplate data and record **must** match the Instrument Specification Sheet information. The Nameplate tag **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubed:** N/A
*   **Process Line Location:** The Coriolis flow tube **must** be located in the process line such that the flowtube is flooded at all times during operation.
*   **Preferred Installation:** Preferred installation for a liquid service Coriolis flow tube is vertical and below the pipeline. Preferred installation for a gas service Coriolis flow tube is vertical and above the pipeline.
*   **Flow Direction:** Coriolis tube flow direction **must** correspond to the arrow indicated on the flow tube.
*   **Servicing:** The Coriolis flow tube **must** be isolatable for servicing.

**Electrical and Wiring Checks**
*   **Wiring Connections:** Coriolis flow tube and transmitter wiring connections **must** be in accordance with the [[instrument_loop_diagrams]] and the manufacturers' instructions. If the Coriolis transmitter is remotely mounted, flow tube wiring connections and transmitter wiring connections **must** be in accordance with the [[instrument_loop_diagrams]] and the manufacturers' instructions.
*   **Control Signal Wiring:** Coriolis transmitter control signal wiring connections **must** be in accordance with the [[instrument_loop_diagrams]].
*   **Power and Control Wiring:** Coriolis Power and Control wiring **must** be in accordance with the [[instrument_loop_diagrams]]. Coriolis power supply voltage **must** be correct. Coriolis hot and neutral **must** be connected to the correct terminals. Coriolis power supply **must** be fed from the correct circuit breaker/fused terminal in accordance with the [[instrument_loop_diagrams]].
*   **Output Signal Wiring at DCS:** Coriolis Output Signal control signal wiring connections at the DCS termination cabinet **must** be in accordance with the [[instrument_loop_diagrams]].

**Functional Checks**
*   **Fail Position:** The fail position of the Coriolis transmitter **must** be as specified on the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Field Fail Action Checked:** N/A
*   **Output Signals:** All Coriolis output signals **must** be configured as specified on the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Calibration Verification:** If the manufacturer has not provided Calibration Certification, calibration verification **must** be performed. Documentation verifying calibration tests **must** be properly filed and turned over to the site supervisor after acceptance of the installation.
*   **Analog Signal Simulation:** The analog control signal (4-20 mA) from the Coriolis transmitter **must** be simulated. The analog signal **must** be received correctly at the control system.
*   **DCS Check:** The DCS check **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **Initials KC:** Indicates checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Indicates acceptance of Instrumentation Checkout completion.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]

**Required Documents**
Documents specific to Coriolis Mass Flow Meters also include:
*   Loop Diagram
*   Installation Detail
*   Cable Schedule

**General Checks**
*   Impulse Tubed: N/A
*   Inst Air Tubed: N/A
*   Field Fail Action Checked: N/A
*   All Coriolis output signals must be configured as specified on the instrument specification sheet.
---