---
slug: 4-CAL-0025_gas_gas_hx_duct_combined_base_loads
title: Gas/Gas Hx Duct Combined Base Loads (4-CAL-0025)
source_doc: 4-CAL-0025
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Gas/Gas Hx Duct Combined Base Loads (4-CAL-0025)

This page outlines the calculation of combined loads at the base of the Gas/Gas Heat Exchanger (Hx), derived from the individual duct connection loads specified in document 4-CAL-0025. These calculations aggregate the forces and moments from all duct connections (A, B, C, D) to determine the total loads acting on the base structure.

The formulas below are used to calculate the combined loads. The current results reflect the placeholder values (0.0 N or 0.0 N*m) from the [[4-CAL-0025_gas_gas_hx_duct_connection_loads]]. These results **shall** be updated once actual duct loads are known.

**Combined Loads @ Base:**
*   **Horizontal Force Fx:**
    *   Formula: Fxa + Fxb + Fxc + Fxd
    *   Result: 0.0 kN
*   **Horizontal Force Fz:**
    *   Formula: Fza + Fzb + Fzc + Fzd
    *   Result: 0.0 kN
*   **Resultant Shear V:**
    *   Formula: sqr(Fx^2 + Fz^2)
    *   Result: 0.0 kN
*   **Horizontal Moment Mx:**
    *   Formula: Mxa + Mxb + Mxc + Mxd + Fza*Ya + Fzb*Yb + Fzc*Yc + Fzd*Yd
    *   Result: 0.0 kN*m
*   **Horizontal Moment Mz:**
    *   Formula: Mza + Mzb + Mzc + Mzd - Fxa*Ya - Fxb*Yb - Fxc*Yc - Fxd*Yd
    *   Result: 0.0 kN*m
*   **Resultant Moment M:**
    *   Formula: sqr(Mx^2 + Mz^2)
    *   Result: 0.0 kN*m
*   **Vertical Force Fz:**
    *   Formula: Fya + Fyb + Fyc + Fyd
    *   Result: 0.0 kN

The methodology and conventions governing these calculations are further detailed in [[4-CAL-0025_gas_gas_hx_duct_loads_calculation_methodology_and_conventions]].