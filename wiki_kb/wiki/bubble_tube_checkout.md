---
slug: bubble_tube_checkout
title: Bubble Tube Checkout
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Bubble Tube Checkout

This procedure details the specific checkout requirements for Bubble Tubes. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to Bubble Tubes include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** Model No. nameplate data and record **must** match the Instrument Specification Sheet information. The Nameplate tag **must** match the Instrument Tag Number.
*   **Tubing:** Tubing **must** meet specification in accordance with the [[instrument_installation_details_8_dtl_xxxx]]. Tubing installation **must** be neat and properly secured.
*   **Isolation and Bleeding:** Isolation valves **must** be closed. Residue **must** be bled from between the isolation valve and transmitter.
*   **Inst Air Tubed:** N/A
*   **Mounting:** The bubble tube **must** be securely mounted to the least agitated area of the tank or sump, confirmed with the [[instrument_installation_details_8_dtl_xxxx]].
*   **Accessibility:** Accessibility of the level transmitter (d/p cell), isolation valve for the air or nitrogen purge, and water purge (if applicable) **must** be confirmed. Easy access to the purge rotameter and pressure regulators **must** be confirmed.

**Pre-Operational Checks**
*   **Loop Check Prerequisite:** [[dcs_loop_configuration_checkout]], DCS operation, and [[alarms_interlocks_and_setpoints]] operation **must** be completed before reopening isolation valves.
*   **Regulator Setting:** The regulator **must** be set 1-2 psig higher than the tank head pressure.
*   **Purge Flow:** Purge flow (rotameter) **must** be regulated to allow 1 bubble every 4-5 seconds when the tank or sump is filled to its maximum level.
*   **Leak Check:** After start-up, there **must** be no leaks from any of the fittings.

**Functional Checks (Refer to Level Transmitter)**
*   **Field Term Chk:** N/A (see [[pressure_and_level_transmitter_checkout]])
*   **DCS Term Chk:** N/A (see [[pressure_and_level_transmitter_checkout]])
*   **Fail Action:** N/A (see [[pressure_and_level_transmitter_checkout]])
*   **Field Fail Action Checked:** N/A (see [[pressure_and_level_transmitter_checkout]])
*   **Scale/Calibration:** N/A (see [[pressure_and_level_transmitter_checkout]])
*   **Field/DCS Calibration Check:** Refers to the Check - 0% procedure as outlined in [[instrument_checkout_general_guidelines]] (see [[pressure_and_level_transmitter_checkout]]).
*   **DCS Check:** N/A (see [[pressure_and_level_transmitter_checkout]])

**Sign-off**
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]