---
slug: pump_minimum_flow_requirements
title: Pump Minimum Flow Requirements
source_doc: 4-PRC-0007
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Pump Minimum Flow Requirements

Minimum flow requirements are crucial for ensuring the safe and reliable operation of pumps. This page details the concepts of pump kickback, Minimum Continuous Flow (MCF), and Minimum Thermal Flow (MTF), along with their application in pump sizing.

### Pump Kickback

Pump kickback refers to a portion of the pump's discharge flow that is recirculated back to the suction side or another vessel to maintain a minimum flow through the pump.
*   At the [[pump_sizing_stages|RFQ stage]], the Hydraulic Engineer **will** assume a value for the pump kickback. 25% of the process design flow **will** be used as an estimate for TDH and NPSHa calculations.
*   The design flow rate defined on the [[4-DST-XXXX-R2_template_pump_datasheet_administration|DST]] **will** equal the PDS design flow plus any pump kickback.
*   The vendor **will** confirm the pump kickback value at a later date.

### Vendor Minimum Continuous Flow (MCF)

The Vendor Minimum Continuous Flow (MCF) is the lowest flow rate at which a pump can operate continuously without experiencing adverse effects.
*   At the [[pump_sizing_stages|RFP stage]], the actual Vendor recommended minimum continuous flow **will** be used for pump kickbacks, replacing the estimate used during the RFQ stage.
*   The MCF **will** be added to the [[4-PDS-XXXX-R2_template_pump_datasheet_administration|PDS]] design flow in cases where the pump **will** operate continuously with a closed control or automatic on/off valve on the pump discharge.
*   The vendor recommends the MCF to guarantee:
    *   Acceptable radial forces on the shaft.
    *   Acceptable vibration.
    *   Acceptable noise.
    *   Acceptable bearing life (this is a concern only when specified by the Owner).
*   Refer to [[minimum_flow_requirements_commentary]] for further discussion on Minimum Flow Requirements.

### Minimum Thermal Flow (MTF)

Alternatively to MCF, the Minimum Thermal Flow (MTF) can be used, particularly when thermal considerations are paramount.
*   The formula for MTF is: `MTF = 3.6 * kWo / (Sg * cp * DT)`.
    *   `kWo` = power input to the fluid (kW)
    *   `Sg` = specific gravity
    *   `cp` = specific heat (kJ/kg°C)
    *   `DT` = allowable temperature rise (°C)
*   As a standard, the allowable temperature rise **will** be 5°C.
*   The Process Engineer **will** confirm that the temperature rise produces no process problems.
*   The Requisition Originator **will** verify that the pump and piping can handle the temperature rise.

### Pump Kickback
The PDS design flow **will not** include any pump kickback. The design flow rate defined on the DST **will** equal the PDS design flow plus any pump kickback.
The Hydraulic Engineer **will** assume a value for the pump kickback, which the vendor **will** confirm at a later date.

### Minimum Continuous Flow (MCF)
The MCF **will** be added to the PDS design flow in cases where the pump **will** operate continuously with a closed control or automatic on/off valve on the pump discharge.
Bearing life is a concern only when specified by the Owner.

### Minimum Thermal Flow (MTF)
The Process Engineer **will** confirm that the temperature rise produces no process problems.
The Requisition Originator **will** verify that the pump and piping can handle the temperature rise.
---