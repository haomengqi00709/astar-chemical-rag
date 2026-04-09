---
slug: skirt_opening_reinforcement_calculation_formulas
title: Skirt Opening Reinforcement Calculation Formulas
source_doc: 4-CAL-0024
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Skirt Opening Reinforcement Calculation Formulas

This page details the key formulas used in the [[4-cal-0024_skirt_opening_reinforcement_calculation_administration]] document to determine the properties of the skirt opening and the reinforcing ring.

### Skirt Section Properties
*   **Skirt Outside Radius (R):** `R = 0.5 * OD`
*   **Opening Half Included Angle (a):** `a = asin((w/2 + tr)/R)` in degrees
*   **Area of Opening (A):** `A = 2 * a * (R - t/2) * t` in mm²
*   **Centroidal Distance (N.A. to outside of skirt) (y):** `y = R * (1 - 2 * sina / (3 * a) * (1 - t/R + 1 / (2 - t/R)))` in mm
*   **Moment of Inertia of Opening (about N.A.) (I):** `I = R^3 * t * [(1 - 1.5 * t/R) * (a + sina * cosa - 2/a * (sina)^2) + (t^2 * sina) / (3 * R^2 * (2 - t/R)) * (1 - t/R)]` in mm⁴
*   **Moment of Inertia about Vessel Centerline (I1):** `I1 = I + A * (R - y)^2` in mm⁴

### Reinforcing Ring Properties
*   **Ring Area (Ar):** `Ar = 2 * (tr * wr)` in mm²
*   **Centroidal Distance (N.A. to vessel centerline) (yr):** `yr = (R - t/2) * cos(a)` in mm
*   **Moment of Inertia (about N.A.) (Ir):** `Ir = 2 * (1/12 * tr * wr^3)` in mm⁴
*   **Moment of Inertia about Vessel Centerline (Ir1):** `Ir1 = Ir + Ar * yr^2` in mm⁴