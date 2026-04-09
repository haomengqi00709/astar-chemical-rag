---
slug: 4-CAL-0015_calculation_details
title: 4-CAL-0015 Converter Load Distribution Calculation Details
source_doc: 4-CAL-0015
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# 4-CAL-0015 Converter Load Distribution Calculation Details

This page provides the detailed inputs, formulas, and results for the 4-CAL-0015 Converter Load Distribution calculation.

### Calculation Inputs
*   Shell ID = 1e-05 mm
*   Core OD = 1e-05 mm
*   Poisson's Ratio (n) = 0.305
*   Unit Load (q) = 1.0 N/mm^2

### Calculation Steps and Results

**Radii Calculations:**
*   Plate Outside Radius (a) = 0.5 * OD = 5e-06 mm
*   Plate Inside Radius (b) = 0.5 * ID = 5e-06 mm

**Geometry Constants:**
*   Geometry Constant C1 = 0.5*(1 + n)*(b/a)*ln(a/b) + 0.25*(1 - n)*(a/b - b/a) = 0.0
*   Geometry Constant C3 = 0.25*(b/a)*(((b/a)^2 + 1)*ln(a/b) + (b/a)^2 - 1) = 0.0
*   Geometry Constant C7 = 0.5*(1 - n^2)*(a/b - b/a) = 0.0
*   Geometry Constant C9 = (b/a)*(0.5*(1 + n)*ln(a/b) + 0.25*(1 - n)*(1 - (b/a)^2)) = 0.0
*   Geometry Constant L11 = (1/64)*(1 + 4*(b/a)^2 - 5*(b/a)^4 - 4*((b/a)^2)*(2 + (b/a)^2)*ln(a/b)) = 0.0
*   Geometry Constant L17 = 0.25*(1 - 0.25*(1 - n)*(1 - (b/a)^4) - ((b/a)^2)*(1 + (1 + n)*ln(a/b))) = 0.0

**Shear Forces:**
*   Unit Shear Force @ Core (Qb) = q*a*(C1*L17 - C7*L11)/(C1*C9 - C3*C7) = 7 N/mm
*   Unit Shear Force @ Shell (Qa) = abs(Qb*b/a - q/(2*a)*(a^2 - b^2)) = 7 N/mm

**Reactions:**
*   Reaction @ Core (Fb) = Qb*2*p*b = 7 kN
*   Reaction @ Shell (Fa) = Qa*2*p*a = 7 kN

**Load Fractions:**
*   Fraction Carried by Core (db) = Fb/(Fa + Fb) = 7
*   Fraction Carried by Shell (da) = 1 - db = 7