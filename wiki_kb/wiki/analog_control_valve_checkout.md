---
slug: analog_control_valve_checkout
title: Analog Control Valve Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Analog Control Valve Checkout

This procedure details the specific checkout requirements for Analog Control Valves. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Analog Control Valves include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)
*   [[8-lst-0004_instrument_cable_schedule]] (Instrument Cable Schedule)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Model No. nameplate data and record **must** match the Instrument Specification Sheet information. The Nameplate tag **must** match the Instrument Tag Number.
*   **Impulse Tubed:** N/A
*   **Inst Air Tubing:** Instrument Air Tubing **must** meet specification in accordance with the [[instrument_installation_details_8_dtl_xxxx]]. Installation **must** be neat and properly secured.
*   **Installation:** The Control Valve **must** be installed in line in accordance with the [[instrument_installation_details_8_dtl_xxxx]] and manufacturer instructions. Flow direction through the valve **must** be in accordance with manufacturer instructions.
*   **Mechanical Stops:** A valve may be specified with a mechanical stop to limit either full open or full close position. The valve **must** be provided as specified on the [[8-dst-xxxx_instrument_specification_sheets]] regarding mechanical stops.

**Electrical and Wiring Checks**
*   **Wiring Connections:** Control Valve wiring connections **must** be in accordance with the [[instrument_loop_diagrams]] and the manufacturers' instructions. Analog signal wiring **must** be in accordance with the [[instrument_loop_diagrams]].
*   **Output Signal Wiring at DCS:** Output Signal control signal wiring connections at the DCS termination cabinet **must** be in accordance with the [[instrument_loop_diagrams]].

**Instrument Air Supply Procedure**
1.  Instrument airline **must** be disconnected at the valve or regulator inlet.
2.  Instrument airline **must** be pointed downward away from personal harm.
3.  Air isolation valve **must** be opened for approximately 2-3 minutes to allow any accumulated moisture in the airline to disperse (blowdown).
4.  Air isolation valve **must** be shut after blowdown.
5.  Air tubing **must** be refitted back to its original fitting on the valve or regulator.
6.  Air supply isolation valve **must** be turned back on.
7.  For valves with regulators, the air regulator setting **must** be confirmed or adjusted to suit the setting specified in the valve specification.

**Functional Checks**
*   **Fail Action Confirmation:** The valve **must** be provided as specified on the [[8-dst-xxxx_instrument_specification_sheets]] (e.g., air to open / air to close). Power sources (Instrument Air Supply / electrical control signal) **must** be individually isolated. The fail action of the control valve **must** be confirmed as indicated on the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Local Position Indication:** The local valve position indication **must** be representative of the true valve position.
*   **Stroking Procedure:** From the control room, the control valve **must** be stroked 2-3 times. Stroking can be performed by locking the controller in "manual" (output) and ramping the valve, or by producing a 4-20 mA signal at the I/O rack with the simulator. The field checker **must** confirm smooth valve movement from fully closed to fully open.
*   **Position Confirmation:** Valve position **must** be confirmed with 0%, 25%, 50%, 75%, and 100% output signal.
*   **Fail-Safe Position:** The output signal **must** be isolated. The valve **must** fail to its fail-safe position. If the valve is provided with a solenoid pilot, the fail position of the control valve **must** be confirmed with a de-energised pilot.
*   **Position Switches/Feedback:** If position switches or feedback signals to the control room have been provided, settings **must** be confirmed or adjusted to correspond to the controller specifications.
*   **Field/DCS Calibration Check:** Refers to the Check - 0% procedure as outlined in [[instrument_checkout_general_guidelines]].
*   **DCS Check:** The DCS check **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off**
*   **Initials KC:** Indicates checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Indicates acceptance of Instrumentation Checkout completion.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]