---
slug: 4-CAL-0015_converter_load_distribution_calculation
title: Converter Load Distribution Calculation (4-CAL-0015)
source_doc: 4-CAL-0015
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Converter Load Distribution Calculation (4-CAL-0015)

This document, 4-CAL-0015, details the calculation for the distribution of axial load between the shell and core of a converter (Equipment Tag No. 7540). The primary purpose of this spreadsheet is to determine how axial loads, including weight and pressure, are proportioned between these two critical components. The results derived from this calculation are essential for the structural integrity and operational design of the converter.

The calculation method employed follows Roark Table 24, case 2c, which specifically addresses annular plates under uniform load. This methodology ensures a standardized and reliable approach to load distribution analysis.

**Document Details**
*   **Document ID:** 4-CAL-0015
*   **Document Type:** Calculation
*   **Client Name:** Aker Kvaerner
*   **Project Title:** Converter Load Distribution
*   **Equipment Tag No.:** 7540
*   **Equipment Type:** Converter
*   **Location:** Chemetics, A Division of Aker Kvaerner Canada Inc.
*   **Standard Reference:** 4-CAL-0015-R1

**Revision History**
*   **Revision 1.0:**
    *   Date: 39099.0
    *   Status: Standard
    *   Prepared By: T. Wacker
    *   Checked By: J. Wright
    *   Approved By: D. Shaw
    *   Change Summary: Converted from Mathcad.
*   **Revision 0.0:**
    *   Date: 38175.0
    *   Status: Comments Requested
    *   Prepared By: T. Wacker

**Calculation Inputs**
The following parameters are used as inputs for the load distribution calculation:
*   Shell ID: 1e-05 mm
*   Core OD: 1e-05 mm
*   Poisson's Ratio (n): 0.305
*   Unit Load (q): 1.0 N/mm^2

**Calculation Formulas and Results**
The calculation proceeds through several steps to determine geometry constants, unit shear forces, and ultimately, the fraction of load carried by the core and shell.

*   **Plate Outside Radius (a):**
    *   Formula: `0.5 * OD`
    *   Result: 5e-06 mm
*   **Plate Inside Radius (b):**
    *   Formula: `0.5 * ID`
    *   Result: 5e-06 mm
*   **Geometry Constant C1:**
    *   Formula: `0.5 * (1 + n) * (b/a) * ln(a/b) + 0.25 * (1 - n) * (a/b - b/a)`
    *   Result: 0.0
*   **Geometry Constant C3:**
    *   Formula: `0.25 * (b/a) * (((b/a)^2 + 1) * ln(a/b) + (b/a)^2 - 1)`
    *   Result: 0.0
*   **Geometry Constant C7:**
    *   Formula: `0.5 * (1 - n^2) * (a/b - b/a)`
    *   Result: 0.0
*   **Geometry Constant C9:**
    *   Formula: `(b/a) * (0.5 * (1 + n) * ln(a/b) + 0.25 * (1 - n) * (1 - (b/a)^2))`
    *   Result: 0.0
*   **Geometry Constant L11:**
    *   Formula: `(1/64) * (1 + 4 * (b/a)^2 - 5 * (b/a)^4 - 4 * ((b/a)^2) * (2 + (b/a)^2) * ln(a/b))`
    *   Result: 0.0
*   **Geometry Constant L17:**
    *   Formula: `0.25 * (1 - 0.25 * (1 - n) * (1 - (b/a)^4) - ((b/a)^2) * (1 + (1 + n) * ln(a/b)))`
    *   Result: 0.0
*   **Unit Shear Force @ Core (Qb):**
    *   Formula: `q * a * (C1 * L17 - C7 * L11) / (C1 * C9 - C3 * C7)`
    *   Result: 7 N/mm
*   **Unit Shear Force @ Shell (Qa):**
    *   Formula: `abs(Qb * b/a - q / (2 * a) * (a^2 - b^2))`
    *   Result: 7 N/mm
*   **Reaction @ Core (Fb):**
    *   Formula: `Qb * 2 * p * b`
    *   Result: 7 kN
*   **Reaction @ Shell (Fa):**
    *   Formula: `Qa * 2 * p * a`
    *   Result: 7 kN
*   **Fraction Carried by Core (db):**
    *   Formula: `Fb / (Fa + Fb)`
    *   Result: 7
*   **Fraction Carried by Shell (da):**
    *   Formula: `1 - db`
    *   Result: 7

This calculation is critical for ensuring the safe and efficient operation of the converter by accurately distributing the applied loads. For related calculations concerning converters, refer to [[4-CAL-0012_converter_bed_weight_calculation]]. Other load distribution calculations can be found under [[4-cal-0011_gas_gas_hx_load_distribution_calculation_overview]].

This document is a **Calculation** document prepared for **Aker Kvaerner**, specifically for their **Chemetics, A Division of Aker Kvaerner Canada Inc.** location.

The calculation method follows **Roark Table 24, case 2c (annular plate under uniform load)**.

### Document Revisions
*   **Revision 1.0:**
    *   Date: 39099.0
    *   Status: Standard
    *   Prepared By: T. Wacker
    *   Checked By: J. Wright
    *   Approved By: D. Shaw
    *   Change: Converted from Mathcad.
*   **Revision 0.0:**
    *   Date: 38175.0
    *   Status: Comments Requested
    *   Prepared By: T. Wacker

The standard reference for this document is **4-CAL-0015-R1**.
---