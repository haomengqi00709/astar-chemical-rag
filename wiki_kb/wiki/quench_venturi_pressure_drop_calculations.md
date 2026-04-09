---
slug: quench_venturi_pressure_drop_calculations
title: Quench Venturi Pressure Drop Calculations
source_doc: 1-Cal-6510-R0 (Template Quench Venturi and Retention Vessel)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Quench Venturi Pressure Drop Calculations

This page details the methodologies and results for pressure drop calculations within the Quench Venturi system, as documented in [[1-CAL-6510-R0_quench_venturi_and_retention_vessel_calculation_document_details]]. Understanding these calculations is vital for optimizing venturi performance and ensuring operational efficiency.

**General Considerations:**
*   Extreme angles are expected to cause a higher pressure drop than predicted by standard models.
*   The total loss (dP sheet) does NOT include venturi entrance loss, which is assumed to be part of the venturi throat pressure loss.

**Pressure Drop Models and Results:**

**Calvert (1968) Model:**
*   **Throat Pressure Drop 1:** 7.861718056801079 in W.C. (199.6876386427474 mm W.C.)
*   **Basis:** Assumes water drops are accelerated to the bulk gas velocity in the throat.
*   **Application:** Provides a good estimation of the maximum pressure drop.

**Yamauchi (1964) Model:**
*   **Pressure Drop:** 3.4371803104597753 in W.C. (87.30437988567829 mm W.C.)
*   **Basis:** Based on experimental data for a hot gas.
*   **Application:** Used as a cross-check against values calculated using the Yung model.

**Modified Calvert (Yung et al. 1977) Model:**
*   **Droplet Size 3:** 124.16661747291204 microns
*   **Reynold's Number:** 299.869627850395
*   **Drag Coeff (CDo):** 0.6677651592930184
*   **Venturi Vessel Exit Loss:** 1.1219672640914415
*   **b (Drop velocity ratio):** 0.6239452759367716
*   **Throat Pressure Drop 4:** 4.905281842287849 in W.C. (124.59415879411135 mm W.C.)
*   **Assumptions:**
    *   Liquid has no initial velocity at the throat.
    *   Droplets can be characterized by the Nukiyama-Tanasawa equation.
    *   Pressure drop is calculated for the throat only.
*   **Validity:** SPS report SAR 47 states that the equation for Droplet Size is only valid for gas velocities in the range of 60-230 m/s and L/G ratio of 0.08-1.01.

**Other Pressure Losses:**
*   **90 bend pressure loss:** 0.20080236653364214 in W.C. (5.10038010995451 mm W.C.)
*   **Venturi Vessel Exit Loss (dP sheet):** 0.10040118326682107 in W.C. (2.550190054977255 mm W.C.)
*   **Total loss in venturi:** 5.206485392088312 in W.C. (132.24472895904313 mm W.C.)
*   **Separator Entrance Loss:** 0.20080236653364214 in W.C. (5.10038010995451 mm W.C.)
*   **Separator Pressure Loss:** 0.0 in W.C. (0.0 mm W.C.)
*   **Separator Exit Loss:** 0.26083081169973876 in W.C. (6.625102617173364 mm W.C.)
*   **Total 5 Pressure Loss:** 5.668118570321693 in W.C. (276.21494064521414 mm W.C.)

These calculations contribute to the overall [[quench_venturi_performance_data]] and are guided by the [[quench_venturi_design_and_calculation_methodology]].