---
slug: 4-CAL-0012_converter_bed_weight_calculation
title: Converter Bed Weight Calculation (4-CAL-0012)
source_doc: 4-CAL-0012
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Converter Bed Weight Calculation (4-CAL-0012)

This calculation, documented as 4-CAL-0012, determines the total weight of a converter bed (Equipment Tag No. 7540). The results are specifically formatted for ease of input into a PV Elite model. This document represents Revision 1, which was converted from a Mathcad format.

### Input Parameters

The following parameters are required for the calculation:
*   Bed Number
*   Bed OD / Shell ID (OD): mm
*   Bed ID / Core OD (ID): mm
*   Amount of Bloop (D): mm
*   Catalyst Depth (h1): mm
*   Quartz Depth (h2): mm
*   Number of Riser Pipes (n)
*   Riser Pipe OD (d): mm
*   Catalyst Density (r1): kg/m3
*   Quartz Density (r2): kg/m3
*   Ceramic Saddle Density (r3): kg/m3
*   Wire Mesh Diameter (f): mm
*   Wire Mesh Open Area Fraction (Aopen)

### Calculation Methodology

The following formulas are used to determine the converter bed weight and related properties:

*   **Bed Area (A):** `p/4*(OD^2 - ID^2 - n*d^2)` (Unit: m2)
*   **Bloop Radius (R):** `(D^2 + ((OD - ID)/4)^2)/(2*D)`
    *   Example value: 7 mm
*   **Bloop Included Angle (q):** `2*asin((OD - ID)/(4*R))`
    *   Example value: 7 deg
*   **Bloop Cross-Sectional Area (Ab):** `0.5*(R^2)*(q - sin(q))`
    *   Example value: 7 m2
*   **Catalyst Volume (V1):** `A*h1` (Unit: m3)
*   **Quartz Volume (V2):** `A*h2` (Unit: m3)
*   **Saddle Volume (V3):** `p*0.5*(OD + ID)*Ab - n*p/4*(d^2)*D`
    *   Example value: 7 m3
*   **Wire Mesh Volume (V4):** `(1 - Aopen)*A*p/4*f` (Unit: m3)
*   **Catalyst Weight (W1):** `V1*r1` (Unit: kg)
*   **Quartz Weight (W2):** `V2*r2` (Unit: kg)
*   **Saddles Weight (W3):** `V3*r3`
    *   Example value: 7 kg
*   **Wire Mesh Weight (W4):** `V4*(7999 kg/m3)`
    *   The material density for wire mesh is 7999 kg/m3. (Unit: kg)
*   **Total for Bed Weight (W):** `W1 + W2 + W3 + W4`
    *   Example value: 7 kg
*   **Height of Packed Section (H):** `h1 + h2 + f` (Unit: mm)
*   **Density of Packed Section (r):** `W/(p/4*OD^2*H)`
    *   Example value: 7 kg/m3

### Outputs

The primary outputs of this calculation are:
*   Total for Bed Weight (W)
*   Height of Packed Section (H)
*   Density of Packed Section (r)

### Related Documents

*   The calculated Total for Bed Weight (W) is an input to document [[4-CAL-0013_converter_bed_support_structure_calculation]].
*   For general information on converters, refer to [[0-QDS-7401_converter_shop_overview]].
*   Further administrative details for this calculation can be found on the [[4-CAL-0012_converter_bed_weight_calculation_document_details]] page.