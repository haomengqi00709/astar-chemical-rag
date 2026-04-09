---
slug: gas_gas_heat_exchanger_thermal_expansion_accommodation
title: Gas/Gas Heat Exchanger Thermal Expansion Accommodation
source_doc: 4-PRC-0009
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Gas/Gas Heat Exchanger Thermal Expansion Accommodation

Accommodating thermal growth between the shell and tubes is a critical design consideration for gas/gas heat exchangers. Two primary methods are employed: annular flat plates and triple convolution expansion joints.

**1. Annular Flat Plates (Standard Method)**
The standard method for accommodating thermal growth is the use of annular flat plates at each tubesheet.
*   **Design:** The design of these annular flat plates is performed per [[4-CAL-0004_gas_gas_hx_expansion_plates]]: Gas/Gas Hx Expansion Plates.
*   **Loading:** Loading for annular flat plates is due to:
    *   Internal pressure
    *   Shell weight (including insulation and cladding)
    *   Differential movement
*   **Modeling:**
    *   For line loads (weight and differential movement), the plates are modeled as fixed inside/free outside.
    *   For internal pressure, the plates are modeled as fixed inside/simply supported outside.
*   **Resultant Stresses:** Resultant stresses for annular flat plates are grouped as:
    *   Primary stresses (pressure, weight)
    *   Primary plus secondary (thermal) stresses
*   **Operating Conditions:** Expansion plate operating conditions to consider are:
    *   Normal operation
    *   Maximum pressure
    *   Hot shutdown

**2. Triple Convolution Expansion Joint (Alternative Method)**
Where thermal growths cannot be adequately accommodated by annular plates, a triple convolution expansion joint is utilized at the upper tubesheet.
*   **Design:** The design of the triple convolution expansion joint is performed per [[4-CAL-0007_gas_gas_hx_expansion_joint]]: Gas/Gas Hx Expansion Joint.
*   **Loading:** Only differential movement and internal pressure are considered for the design of the triple convolution expansion joint.
*   **Support:** When using a triple convolution expansion joint, the weight of the shell is supported at the bottom.
*   **Calculations:**
    *   Spring rate calculations for expansion joints are performed per [[gas_gas_heat_exchanger_mechanical_calculation_prerequisites#TEMA(4)|TEMA(4)]] Section 8.
    *   Stress calculations for expansion joints are performed per the method of [[gas_gas_heat_exchanger_mechanical_calculation_prerequisites#Kopp & Sayre(5)|Kopp & Sayre(5)]].

Both methods ensure that the heat exchanger can safely manage thermal expansion stresses during various operational phases.

For an overview of the entire mechanical calculation procedure, refer to [[4-prc-0009_gas_gas_exchanger_mechanical_calculations]].