---
slug: pump_hydraulic_calculations
title: Pump Hydraulic Calculations
source_doc: 4-PRC-0007
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Pump Hydraulic Calculations

Pump hydraulic calculations are fundamental to selecting and sizing pumps correctly. This page details the methodologies for calculating Total Dynamic Head (TDH), Net Positive Suction Head Available (NPSHa), and Maximum Suction Pressure.

### Preliminary TDH (Total Dynamic Head) Calculation

The preliminary TDH calculation combines static and dynamic components, along with estimated pressure drops.

**Static Component:**
*   Use origin and destination elevation differences from [[4-gad-xxxx_equipment_layout_drawing|Preliminary Equipment General Arrangements]].
*   Use origin and destination pressure and liquid level differences from the [[4-PDS-XXXX-R2_template_pump_datasheet_administration|PDS]].

**Dynamic Component:**
*   Use 130% of estimated pipe length. If routing is not known at all, X, Y, and Z coordinate differences from origin to destination for the pipe length may be used.
*   Use 10 elbows for fittings.
*   Use the valve count from the [[piping_and_instrumentation_drawings|Preliminary P & ID]].
*   Use the preliminary pipe size.
*   Use estimated equipment pressure drop. Refer to [[equipment_pressure_drop_estimates]] for typical values.
*   Summarise the TDH into elevation, pressure, equipment, control valves, and friction losses.
*   Add a 10% safety factor on pipe/fitting friction losses only for preliminary TDH.

### Preliminary NPSH Available (Net Positive Suction Head Available) Calculation

The preliminary NPSHa calculation ensures that the pump will not cavitate under operating conditions.

*   Use a flow rate that has an assumed kickback factored in.
*   Use an assumed suction piping layout for pipe length and fittings.
*   Use the valve count from the [[piping_and_instrumentation_drawings|Preliminary P & ID]].
*   Use the preliminary pipe size.
*   Use atmospheric pressure corrected for [[site_design_conditions_1_dst_0001|site elevation]].
*   Use the highest (design) vapour pressure of the fluid from the [[4-PDS-XXXX-R2_template_pump_datasheet_administration|PDS]].
*   Use the minimum operating pressure and level in the vessel.
*   Use the equipment elevation difference from the assumed suction piping layout.
*   Inform the Process Engineer where there is inadequate margin for NPSH.

### Maximum Suction Pressure Calculation

This calculation is used to verify the pump casing's pressure limits.

*   Use the maximum operating pressure in the vessel.
*   Use the maximum operating level in the vessel.

### General Checks and Requirements

*   The Requisition Originator **will** use the maximum suction pressure and TDH to check that the pump casing pressure/temperature limits are suitable.
*   Pumps with exotic materials **will** be purchased based upon preliminary TDH calculations to meet delivery schedules.
*   The Requisition Originator **will** ensure that the casings have an ability to accommodate changes in duty point before final impeller trim.
*   The Requisition Originator **will** ensure required NPSH for proposed pumps is exceeded by available NPSH by at least 1m.
*   Pump kilowatts are calculated using the formula: `Q * H * Sg / (367 * h)`, where Q is flow, H is head, Sg is specific gravity, and h is efficiency.
*   The baseplate **will** be sized for the next larger motor size. If the motor frame size is the same for the next larger motor size and the selected motor size, the baseplate can be sized for the selected motor size.

### Final TDH Determination

Once all final information is available, the final TDH **must** be determined.
*   Check the [[instrument_data|Instrument Data]] for control valve pressure drops.
*   Check [[instrument_data|Instrument Data]] for pressure drop figures for any instruments that may have significant pressure drops (e.g., Coriolis meters).
*   Pump NPSH required is sensitive to the impeller size.
*   Check the NPSH available (should not have changed since preliminary sizing).

The Hydraulic Engineer **will** use ‘Pipe-Flo’ software to calculate pump hydraulic requirements.

### Maximum Suction Pressure
The Requisition Originator **will** use the maximum suction pressure and TDH to check that the pump casing pressure/temperature limits are suitable.

### Calculation Updates
Calculations **will** be updated using pipe reducers that are based on the quoted pump suction and discharge connection sizes.

### Net Positive Suction Head Available (NPSHa)
The Requisition Originator **will** ensure required NPSH for proposed pumps is exceeded by available NPSH by at least 1m.
Pump NPSH required is sensitive to the impeller size.
The NPSH available **should not** have changed since preliminary sizing, but it **will** be checked.
The Process Engineer **will** be informed where there is inadequate margin for NPSH.
---