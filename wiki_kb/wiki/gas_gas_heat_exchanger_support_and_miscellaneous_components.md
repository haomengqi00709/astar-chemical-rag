---
slug: gas_gas_heat_exchanger_support_and_miscellaneous_components
title: Gas/Gas Heat Exchanger Support and Miscellaneous Components
source_doc: 4-PRC-0009
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Gas/Gas Heat Exchanger Support and Miscellaneous Components

The mechanical design of gas/gas heat exchangers involves the detailed analysis and calculation of various support structures and miscellaneous internal components to ensure overall stability and operational safety.

**1. Bottom Vestibule Floor Plate Design**
*   Type 4 bottom vestibules feature a sloped floor plate.
*   This floor plate is exposed to the shellside pressure and **must** be designed to withstand this pressure.
*   Calculations for the floor plate and its stiffeners are performed per [[4-CAL-0006_gas_gas_hx_floor_plate]]: Gas/Gas Hx Floor Plate.
*   Deflection of the floor plate **should** be limited to half of the plate thickness.

**2. Anchor Chair Design**
*   Anchor chairs and anchor bolts **will** be calculated per [[4-CAL-0019_anchor_chair]]: Anchor Chair.
*   Anchor chair calculations **will** be performed for both wind and seismic conditions.
*   Duct loads **will** be included for both wind and seismic conditions in these calculations.

**3. Lift Lugs Design**
*   Lift lugs and tailing lugs, essential for handling and installation, **will** be designed per [[4-CAL-0023_gas_gas_hx_lift_lugs]]: Gas/Gas HX Lift Lugs.

**4. Miscellaneous Components Analysis**
Various other components **will** be modeled using the CodeCalc® design software. Specific components requiring analysis include:
*   Internal dished heads (for type 2, 3, or 4 shells) subject to pressure on either the concave or convex side, as applicable, **must** be analyzed.
*   The cone-to-cylinder junction for type 4 bottom vestibules **must** be analyzed.
*   Axial load on the cylinder is calculated per [[4-CAL-0011_gas_gas_hx_load_distribution_calculation_overview]]: Gas/gas Hx Load Distribution.
*   Tubes **will** be checked for external (shellside) pressure.
*   Shell nozzles on type 4 top vestibules **will** be checked for external (tubeside) pressure.

These detailed analyses ensure that all parts of the heat exchanger, from major pressure boundaries to minor support elements, are designed to meet stringent safety and performance requirements.

For an overview of the entire mechanical calculation procedure, refer to [[4-prc-0009_gas_gas_exchanger_mechanical_calculations]].