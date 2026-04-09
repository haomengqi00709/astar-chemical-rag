---
slug: orifice_plate_flow_sensor_checkout
title: Orifice Plate Flow Sensor Checkout (Venturi, Vortex, Pitot Tube)
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Orifice Plate Flow Sensor Checkout (Venturi, Vortex, Pitot Tube)

This procedure details the specific checkout requirements for Orifice Plates, Venturi, Vortex, and Pitot Tube (Annubar) flow sensors. These checks supplement the [[instrument_checkout_general_guidelines]] and ensure proper installation and functionality before commissioning.

**Required Documents**
Documents specific to these flow sensors include:
*   [[piping_and_instrumentation_drawings]] (P&ID)
*   [[8-lst-0002_instrument_index]] (Instrument Index)
*   [[8-dst-xxxx_instrument_specification_sheets]] (Instrument Specification Sheet)
*   [[instrument_loop_diagrams]] (Loop Diagram)
*   [[instrument_installation_details_8_dtl_xxxx]] (Installation Detail)

**Installation and Mechanical Checks**
*   **Nameplate Verification:** The flow sensor Model No. nameplate data **must** match the Instrument Specification Sheet information. The Nameplate tag **must** match the Instrument Tag Number.
*   **Impulse Tubing:** Impulse tubing **must** meet specification in accordance with the [[instrument_installation_details_8_dtl_xxxx]]. Installation **must** be neat and properly secured. After start-up, there **must** be no leaks from any of the impulse tubing fittings.
*   **Instrument Air Tubing:** Instrument air tubing **must** meet specification in accordance with the [[instrument_installation_details_8_dtl_xxxx]]. Installation **must** be neat and properly secured. After start-up, there **must** be no leaks from any of the instrument air tubing fittings.
*   **d/p Cell Location:** The d/p cell **must** be properly located above the orifice plate for gas lines and below the orifice plate for liquid and steam lines.
*   **Tubing Slope:** Tubing **must** be sloped a minimum of 1” per foot.
*   **Condensate Pots:** Where condensate pots are provided for steam service, all pots **must** be full with water.
*   **Field Term Chk:** N/A
*   **DCS Term Chk:** N/A

**Start-up Procedure (Isolation and Equalizing Valves)**
Before start-up:
*   High and low side connections **must** be correct.
*   Isolation valves **must** be closed.
*   The equalising valve **must** be open.

During start-up:
*   Open the equalising valve.
*   Slowly open the low side isolation valve.
*   Slowly open the high side isolation valve.
*   Close the equalising valve.

**Calibration and Functional Checks**
*   **Range:** The range of the flow sensor **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]].
*   **Calibration Verification:** If the manufacturer has not provided Calibration Certification, liquid drop tests will be performed at the discretion of the site supervisor and/or the start-up engineer to confirm calibration.
*   **Fail Action:** N/A
*   **Field Fail Action Checked:** N/A
*   **Field/DCS Calibration Check:** Refers to the Check - 0% procedure as outlined in [[instrument_checkout_general_guidelines]].

**Sign-off**
*   **Initials KC:** Indicates checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Indicates acceptance of Instrumentation Checkout completion.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located.
*   **Comments:** General comments during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_general_guidelines]]

**General Checks**
*   Field Term Chk: N/A
*   DCS Term Chk: N/A
*   Fail Action: N/A
*   Field Fail Action Checked: N/A

**Calibration Checks**
*   Field/DCS Calibration Check – 25% refers to the Check - 0% procedure.
*   Field/DCS Calibration Check – 50% refers to the Check - 0% procedure.
*   Field/DCS Calibration Check – 75% refers to the Check - 0% procedure.
*   Field/DCS Calibration Check – 100% refers to the Check - 0% procedure.
---