---
slug: 4-cal-0011_gas_gas_hx_load_distribution_calculation_details
title: Gas/Gas Hx Load Distribution Calculation Details (4-CAL-0011)
source_doc: 4-CAL-0011
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Gas/Gas Hx Load Distribution Calculation Details (4-CAL-0011)

This page provides the detailed methodology, inputs, intermediate calculations, and results for the axial load distribution in the Gas/Gas Heat Exchanger, as documented in 4-CAL-0011-R1. The load distribution is calculated in accordance with Roark Table 24, case 2c, which applies to an annular plate under uniform load.

**Inputs and Material Properties:**
*   Vestibule Mean Diameter (OD): 1e-07 mm
*   Core Mean Diameter (ID): 1e-07 mm
*   Total Load on Bottom Vestibule (Wv): 1e-06 kg
    *   This value is an output from [[4-cal-0026_total_load_calculation]].
*   Bottom Tubesheet Material options include stainless steel and carbon steel.
*   Poisson's Ratio (n) for stainless steel: 0.305.
    *   Further details on material properties can be found in [[bottom_tubesheet_material_properties]].
*   Unit Load on Bottom Tubesheet (q): 1.0 N/mm^2

**Geometric Parameters:**
*   Plate Outside Radius (a) calculation: 0.5 * OD
*   Plate Outside Radius (a) value: 5e-08 mm
*   Plate Inside Radius (b) calculation: 0.5 * ID
*   Plate Inside Radius (b) value: 5e-08 mm

**Geometry Constants (Roark Table 24, Case 2c):**
The following constants are derived based on the plate geometry and Poisson's Ratio:
*   Geometry Constant C1 calculation: 0.5*(1 + n)*(b/a)*ln(a/b) + 0.25*(1 - n)*(a/b - b/a)
*   Geometry Constant C1 value: 0.0
*   Geometry Constant C3 calculation: 0.25*(b/a)*(((b/a)^2 + 1)*ln(a/b) + (b/a)^2 - 1)
*   Geometry Constant C3 value: 0.0
*   Geometry Constant C7 calculation: 0.5*(1 - n^2)*(a/b - b/a)
*   Geometry Constant C7 value: 0.0
*   Geometry Constant C9 calculation: (b/a)*(0.5*(1 + n)*ln(a/b) + 0.25*(1 - n)*(1 - (b/a)^2))
*   Geometry Constant C9 value: 0.0
*   Geometry Constant L11 calculation: (1/64)*(1 + 4*(b/a)^2 - 5*(b/a)^4 - 4*((b/a)^2)*(2 + (b/a)^2)*ln(a/b))
*   Geometry Constant L11 value: 0.0
*   Geometry Constant L17 calculation: 0.25*(1 - 0.25*(1 - n)*(1 - (b/a)^4) - ((b/a)^2)*(1 + (1 + n)*ln(a/b)))
*   Geometry Constant L17 value: 0.0

**Shear Forces and Reactions:**
*   Unit Shear Force @ Inner Edge (Qb) calculation: q*a*(C1*L17 - C7*L11)/(C1*C9 - C3*C7)
*   Unit Shear Force @ Inner Edge (Qb) value: 7 N/mm
*   Unit Shear Force @ Outer Edge (Qa) calculation: abs(Qb*b/a - q/(2*a)*(a^2 - b^2))
*   Unit Shear Force @ Outer Edge (Qa) value: 7 N/mm
*   Reaction @ Inner Edge (Fb) calculation: Qb*2*p*b
*   Reaction @ Inner Edge (Fb) value: 7 N
*   Reaction @ Outer Edge (Fa) calculation: Qa*2*p*a
*   Reaction @ Outer Edge (Fa) value: 7 N

**Load Distribution and Axial Load:**
*   Fraction Carried @ Inner Edge (db) calculation: Fb/(Fa + Fb)
*   Fraction Carried @ Inner Edge (db) value: 7
*   Fraction Carried @ Outer Edge (da) calculation: 1 - db
*   Fraction Carried @ Outer Edge (da) value: 7
*   Axial Load on Inner Edge (f2) calculation: db*Wv/(2*p*b)
*   Axial Load on Inner Edge (f2) value: 7 kg/m

This resultant axial load (f2) is then used for further mechanical integrity checks, as referenced in [[4-cal-0011_gas_gas_hx_load_distribution_calculation_overview]].