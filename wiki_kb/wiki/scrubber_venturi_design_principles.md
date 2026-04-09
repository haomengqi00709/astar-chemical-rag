---
slug: scrubber_venturi_design_principles
title: Scrubber Venturi Design Principles and Calculation Notes
source_doc: 1-Cal-6520-R0 (Template Variable Throat Venturi and Gas Cooling Tower)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Scrubber Venturi Design Principles and Calculation Notes

The design and performance calculations for the Scrubber Venturi, as detailed in **1-Cal-6520-R0**, adhere to specific principles and assumptions to ensure optimal operation and efficiency.

**General Design Requirements:**
*   **Gas Flow Data:** Gas flows **must** be obtained from the mass balance program. The mass balance output **must** be reviewed to ensure consistency with the venturi design.
*   **Acid Properties:** Acid properties **must** be accurately inserted into the calculations.
*   **L/G Ratio:** Specification SPS RR40 indicates that an L/G ratio above 0.61 L/m³ shows no significant effect on performance.

**Velocity Guidelines:**
*   **Exit Throat Velocity:** Should be between 150 to 250 ft/s.
*   **Inlet Liquid Velocity:** Is usually set to zero at the throat.
*   **Gas Outlet Velocity:** Should be between 60-90 ft/s.
*   **Transition Duct Velocity:** Is based on the outlet gas flow and velocity, reduced by a pre-set ratio.

**Throat Length:**
*   **Throat Length:** Is used to calculate the droplet to gas velocity ratio for pressure drop calculation.

**Efficiency Calculation Models:**
*   **Semrau Efficiency:** This calculation is based on the proposition that collection efficiency is a function of power dissipation across the venturi, according to an exponential correlation. Coefficients of phosphoric acid are assumed for this calculation.
*   **Yung's Model:** Yung's model does not predict collection efficiency very well above the steeply falling section of the curve of particle size vs. removal efficiency. The relevant curve **must** be checked to ensure this limitation is not encountered.
*   **Particle Size Calculation:** The same calculation as Yung (1 micron) **must** be used for a smaller particle diameter (0.5 micron) to assess efficiency across a broader range.

**Pressure Drop Calculation Models:**
*   **Calvert Pressure Drop:** This model is based on the assumption that water drops are accelerated to bulk gas velocity in the throat.
*   **Nukiyama-Tanasawa Equation:** This equation is only valid when gas velocity is between 60-230 m/s and when the L/G ratio is between 0.08-1.01.
*   **Yung delP Model Assumption:** The Yung delP model assumes that the liquid has no initial velocity at the throat.

These principles guide the design and analysis of the Scrubber Venturi. For specific performance data, refer to [[scrubber_venturi_max_flow_case_performance]] and [[scrubber_venturi_min_flow_case_performance]]. Detailed pressure drop calculations are available in [[scrubber_venturi_pressure_drop_calculations]], and collection efficiency calculations are in [[scrubber_venturi_collection_efficiency_calculations]].