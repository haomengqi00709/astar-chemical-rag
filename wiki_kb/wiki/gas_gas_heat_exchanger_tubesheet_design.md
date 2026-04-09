---
slug: gas_gas_heat_exchanger_tubesheet_design
title: Gas/Gas Heat Exchanger Tubesheet Design
source_doc: 4-PRC-0009
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Gas/Gas Heat Exchanger Tubesheet Design

The design of tubesheets for gas/gas heat exchangers is a critical aspect of mechanical integrity, performed using [[4-CAL-0003_gas_gas_hx_tubesheets]]: Gas/Gas Hx Tubesheets.

**Tubesheet Modeling:**
The tubesheet is modeled as an annular plate subjected to a uniform load, with both edges considered simply supported.

**Tubesheet Loading Considerations:**
The design **must** account for various types of loading:
*   Pressure
*   Bundle weight
*   Shell weight (including insulation and vertical duct loads)
*   Differential expansion

**Operating Conditions for Tubesheet Checks:**
The following operating conditions **must** be considered during tubesheet design:
*   Normal operation
*   Maximum pressure
*   Hot shutdown (full operating temperature, no pressure)

Additionally, where shellside and tubeside streams are pressurized by different sources (e.g., SO3 cooler and preheater), tubesheets **should** also be checked for full pressure on one side and no pressure on the other side.

**Resultant Stresses:**
Resultant stresses for tubesheets are categorized into two groups:
*   **Primary Stresses:** These include stresses due to pressure and weight.
*   **Primary Plus Secondary Stresses:** These include thermal stresses.

**Differential Expansion:**
Differential expansion **must** be calculated for all cases as described in Section 4.2 of the main procedure. This is crucial for ensuring the tubesheet can accommodate thermal growth without excessive stress.

For an overview of the entire mechanical calculation procedure, refer to [[4-prc-0009_gas_gas_exchanger_mechanical_calculations]]. Methods for accommodating thermal growth are detailed in [[gas_gas_heat_exchanger_thermal_expansion_accommodation]].