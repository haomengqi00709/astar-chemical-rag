---
slug: pump_sizing_stages
title: Pump Sizing Stages
source_doc: 4-PRC-0007
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Pump Sizing Stages

Pump sizing is a multi-stage process, evolving from preliminary estimates to final detailed design. This page outlines the specific activities and information requirements for each stage: Request for Quotation (RFQ), Request for Purchase (RFP), and Final Impeller Trim.

### Request for Quotation (RFQ) Stage

At the RFQ stage, the focus is on preliminary pump sizing to obtain initial vendor quotations.

**Information Sources:**
The Hydraulic Engineer will obtain information from the following sources:
*   [[4-PDS-XXXX-R2_template_pump_datasheet_administration|Process Data Sheet (PDS)]]
*   [[site_design_conditions_1_dst_0001|Site conditions]] for atmospheric pressure adjusted for plant elevation.
*   [[pipe_specifications|Pipe Specifications]] for pipe dimensions.
*   [[4-gad-xxxx_equipment_layout_drawing|Preliminary Equipment General Arrangement]] for pipe routing and equipment elevations.
*   [[piping_and_instrumentation_drawings|Preliminary P & IDs]] for valve count and line sizes.
*   [[battery_limits_conditions_1_lst_0001|Battery Limit List]] for stream pressures. Data available in SQL: 1-LST-0001.

**Calculations and Estimates:**
*   The PDS design flow **will not** include any pump kickback.
*   The design flow rate defined on the [[4-DST-XXXX-R2_template_pump_datasheet_administration|DST]] **will** equal the PDS design flow plus any pump kickback.
*   The Hydraulic Engineer **will** assume a value for the pump kickback. At this stage, 25% of the process design flow **will** be used as an estimate for TDH and NPSHa calculations. The vendor **will** confirm the pump kickback value at a later date.
*   The Hydraulic Engineer **will** calculate the preliminary TDH (Total Dynamic Head).
*   The Hydraulic Engineer **will** calculate the preliminary NPSH available (Net Positive Suction Head Available).
*   The Hydraulic Engineer **will** calculate the Maximum Suction Pressure.
*   For the RFQ stage, the design flow on the [[4-DST-XXXX-R2_template_pump_datasheet_administration|DST]] **will** be entered as the value of the PDS design flow + 'Vendor Minimum Continuous Flow'.
*   Refer to [[flowchart_for_procedure_at_the_rfq_stage]] for a visual representation of this stage.

### Request for Purchase (RFP) Stage

At the RFP stage, pump requirements are recalculated based on vendor-supplied data and updated design information.

**Information Sources:**
*   Pump vendor-supplied data.
*   The design issue of the [[4-PDS-XXXX-R2_template_pump_datasheet_administration|PDS]].
*   The latest Detailed Design Information.

**Calculations and Updates:**
*   The Hydraulic Engineer **will** recalculate pump requirements.
*   The actual Vendor recommended minimum continuous flow **will** be used for pump kickbacks at the RFP stage, replacing the estimate used during the RFQ stage.
*   If a calculated TDH for a pump is based on a tie point condition from the [[battery_limits_conditions_1_lst_0001|Battery Limit List]], that tie point pressure **must** be certified.

### Final Impeller Trim

The final impeller trim stage involves obtaining the most accurate information for precise pump sizing and ensuring all components are correctly specified.

**Information Sources:**
The Hydraulic Engineer **will** obtain additional final information from:
*   Final equipment pressure drop figures from equipment files.
*   [[isometrics|Isometrics]] from the design office.
*   [[instrument_data|Instrument Data]].

**Final Checks and Requirements:**
*   The Requisition Originator **will** check that at final impeller size, the motor and coupling are sized for runout power.
*   The Requisition Originator **will** check that the baseplate is able to accommodate one motor size larger.
*   The Requisition Originator **will** ensure required NPSH for proposed pumps is exceeded by available NPSH by at least 1m.
*   For [[magnetic_drive_pump_considerations|magnetic drive pumps]], the TDH **will** have to be finalised at least to within a motor size at the time of purchase.
*   Update calculations using pipe reducers that are based on the quoted pump suction and discharge connection sizes. Incorrectly sized reducer sizes **will** result in large differences in friction K factors for reducers with very small approaches, such as those found with PVC and CPVC piping. Refer to [[friction_k_factors_for_reducers]] for more details.
*   The Requisition Originator **must** ensure that the calculation is done while still enabling the pump vendor to meet the delivery schedule.
*   Ensure that the impeller is sized not only for the duty point, but also to raise liquid to the highest point in the piping at start-up with enough flow to form a siphon.
*   Ensure that the Vendor has factored in seal drag in calculating power requirements. Many applications employ SiC vs. SiC inboard seal faces with an external flush, which results in significant seal drag.

### Request for Quotation (RFQ)
*   At this stage, 25% of the process design flow **will** be used as an estimate for TDH and NPSHa calculations.
*   For the RFQ stage, the design flow on the DST **will** be entered as the value of the PDS design flow + ‘Vendor Minimum Continuous Flow’.
*   Pumps with exotic materials **will** be purchased based upon preliminary TDH calculations to meet delivery schedules.

### Request for Purchase (RFP)
*   The Requisition Originator **will** prepare Requisitions for Purchase Enquiry / Order.
*   The Requisition Originator **will** ensure that the casings have an ability to accommodate changes in duty point before final impeller trim.

### Final Impeller Trim
*   For Final Impeller Trim, the Hydraulic Engineer **will** obtain additional final information from final equipment pressure drop figures from equipment files.
*   The Requisition Originator **will** check that at final impeller size, the motor and coupling are sized for runout power.
*   The final TDH **will** be determined once all the information is available.
*   The Requisition Originator **must** ensure that the calculation is done while still enabling the pump vendor to meet the delivery schedule.
*   The impeller **will** be sized not only for the duty point, but also to raise liquid to the highest point in the piping at start-up with enough flow to form a siphon.
---