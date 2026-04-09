---
slug: skirt_opening_reinforcement_calculation_methodology
title: Skirt Opening Reinforcement Calculation Methodology
source_doc: 4-CAL-0024
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Skirt Opening Reinforcement Calculation Methodology

The methodology for calculating skirt opening reinforcement, as outlined in document [[4-cal-0024_skirt_opening_reinforcement_calculation_administration]], focuses on ensuring that the structural integrity of a vessel skirt is maintained after an opening is introduced. This is achieved by comparing the moment of inertia of the removed skirt section with that of the proposed reinforcing ring. The calculation involves several steps, including determining geometric properties and moments of inertia for both the opening and the reinforcement.

**Calculation of Skirt Section Properties:**
The properties of the skirt section removed by the opening are derived based on principles found in Roark's Formulas for Stress and Strain, specifically referencing Table 1, case 19 (hollow circular sector). The following formulas are used:

*   **Skirt Outside Radius (R):** Calculated as half of the Skirt Outside Diameter (OD).
    *   `R = 0.5 * OD`
*   **Opening Half Included Angle (a):** Determined using the skirt radius, opening width, and reinforcing ring thickness.
    *   `a = asin((w/2 + tr)/R)` (in degrees)
*   **Area of Opening (A):** Represents the cross-sectional area of the material removed from the skirt.
    *   `A = 2 * a * (R - t/2) * t` (in mm²)
*   **Centroidal Distance (N.A. to outside of skirt) (y):** The distance from the neutral axis (N.A.) of the removed section to the outside surface of the skirt.
    *   `y = R * (1 - 2 * sina / (3 * a) * (1 - t/R + 1 / (2 - t/R)))` (in mm)
*   **Moment of Inertia of Opening (about N.A.) (I):** The moment of inertia of the removed skirt section about its own neutral axis.
    *   `I = R^3 * t * [(1 - 1.5 * t/R) * (a + sina * cosa - 2/a * (sina)^2) + (t^2 * sina) / (3 * R^2 * (2 - t/R)) * (1 - t/R)]` (in mm⁴)
*   **Moment of Inertia about Vessel Centerline (I1):** The moment of inertia of the removed skirt section about the vessel's centerline.
    *   `I1 = I + A * (R - y)^2` (in mm⁴)

**Calculation of Reinforcing Ring Properties:**
The properties of the reinforcing ring are calculated to ensure it provides adequate compensation for the removed skirt material.

*   **Ring Area (Ar):** The total cross-sectional area of the reinforcing ring.
    *   `Ar = 2 * (tr * wr)` (in mm²)
*   **Centroidal Distance (N.A. to vessel centerline) (yr):** The distance from the neutral axis of the reinforcing ring to the vessel's centerline.
    *   `yr = (R - t/2) * cos(a)` (in mm)
*   **Moment of Inertia (about N.A.) (Ir):** The moment of inertia of the reinforcing ring about its own neutral axis.
    *   `Ir = 2 * (1/12 * tr * wr^3)` (in mm⁴)
*   **Moment of Inertia about Vessel Centerline (Ir1):** The moment of inertia of the reinforcing ring about the vessel's centerline.
    *   `Ir1 = Ir + Ar * yr^2` (in mm⁴)

**Mandatory Design Requirement:**
*   The moment of inertia of the reinforcing ring **MUST** be equal to or greater than the moment of inertia of the skirt section removed. This is a critical design criterion to ensure sufficient reinforcement.

**Simplifications Applied:**
To streamline calculations while maintaining accuracy, certain simplifications are applied:
*   Simplifications for skirt section properties are applied for thin cylinders, specifically when the ratio of skirt thickness to radius (t/R) is much less than 1 (t/R << 1).
*   Simplifications for skirt section properties are also applied for small opening angles, where the angular extent of the opening is limited.

This calculation methodology is a key component of [[process_calculations]] for pressure vessel design and contributes to the overall [[equipment_design_and_specification_4_prc_0003]]. The inputs for these calculations are detailed in [[skirt_opening_reinforcement_calculation_inputs]].

### Core Requirement
The fundamental requirement of this calculation is that **the moment of inertia of the reinforcing ring must be equal to or greater than the moment of inertia of the skirt section removed.**

### Basis and Assumptions
*   **Reference:** Skirt section properties are derived per **Roark Table 1, case 19 (hollow circular sector)**.
*   **Simplifications:**
    *   Simplifications for skirt section properties are applied for **thin cylinders (t/R << 1)**.
    *   Simplifications for skirt section properties are applied for **small opening angles**.
---