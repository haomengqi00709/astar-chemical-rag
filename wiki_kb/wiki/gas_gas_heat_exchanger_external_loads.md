---
slug: gas_gas_heat_exchanger_external_loads
title: Gas/Gas Heat Exchanger External Loads
source_doc: 4-PRC-0009
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Gas/Gas Heat Exchanger External Loads

The mechanical design of gas/gas heat exchangers **must** account for various external loads, including those from ducts, insulation, wind, and seismic activity. These loads are considered in combination with internal pressures to ensure structural integrity.

**Duct Loads:**
Loads due to duct reactions **shall** be entered for each duct connection.
*   **Directional Assumptions:**
    *   Horizontal forces/moments are assumed to act in the same direction for conservatism.
    *   Vertical forces are assumed to act downwards.
    *   Horizontal moments **shall** be entered as negative values, as positive horizontal forces (Fx) typically produce negative resultant moments.
    *   Vertical moments (torsion) will be neglected.
*   **Combination Method:** Loads will be combined using the "Algebraic" method.
*   **Design Loads (per meter of duct diameter):**
    *   Vertical force (Fy): 30 kN
    *   Horizontal force (Fx): 30 kN
    *   Overturning moment (Mz): 100 kN*m
*   **Availability and Conservatism:** Duct loads and orientations are typically not available at the start of equipment design. Therefore, for conservatism, duct loads are assumed to act in the same direction. Design loads are average loads based on results from previous projects.
*   **Nozzle Reinforcement:** Duct loads will not be considered when checking nozzle reinforcement.

**Insulation Loads:**
*   The appropriate thickness of insulation **must** be entered into the calculations.
*   The appropriate density of insulation, including an allowance for cladding and hardware, **must** also be entered.

**Wind and Seismic Loads:**
*   Wind and seismic loads do not act simultaneously.
*   These loads, in combination with duct loads, will be considered in two scenarios:
    1.  In combination with internal pressure present.
    2.  In combination without internal pressure present.
*   **Load Multipliers:**
    *   The wind load multiplier will be 1.0.
    *   The allowable longitudinal stress multiplier for wind and seismic loads will be 1.2.

**Jurisdictional Considerations:**
Site-specific requirements for wind and seismic conditions are detailed in [[1-DST-0001_site_design_conditions]].

For an overview of the entire mechanical calculation procedure, refer to [[4-prc-0009_gas_gas_exchanger_mechanical_calculations]].