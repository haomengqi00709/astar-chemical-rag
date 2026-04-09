---
slug: scrubber_venturi_pressure_drop_calculations
title: Scrubber Venturi Pressure Drop Calculations
source_doc: 1-Cal-6520-R0 (Template Variable Throat Venturi and Gas Cooling Tower)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Scrubber Venturi Pressure Drop Calculations

The pressure drop across the Scrubber Venturi and associated components is a critical design parameter, calculated using various models as detailed in **1-Cal-6520-R0**.

**Max Flow Case Pressure Drop Calculations:**
*   **Calvert (1968) Throat Pressure Drop:** 33.994042643314984 in W.C. (863.4512873092831 mm W.C.)
    *   *Note:* Calvert pressure drop is based on the assumption that water drops are accelerated to bulk gas velocity in the throat.
*   **Modified Calvert (Yung et al. 1977) Parameters:**
    *   **Droplet Size:** 83.2121223883828 microns
    *   **Reynold's Number:** 363.5673697462251
    *   **Drag Coeff (CDo):** 0.6264744427937694
    *   **X (Dimensionless Throat Length):** 1.1693635254045882
    *   **b (Drop Velocity Ratio):** 0.6827842361940373
    *   **Throat Pressure Drop:** 23.21059644136335 in W.C. (589.550927696227 mm W.C.)
    *   *Note:* Assumption in the Yung delP model: Liquid has no initial velocity at the throat.
*   **Component Pressure Losses:**
    *   **90 bend pressure loss:** 0.035658188289646904 in W.C. (0.9057207142107053 mm W.C.)
    *   **Venturi Vessel Exit Loss:** 0.2612570323062621 in W.C. (6.63594863460014 mm W.C.)
    *   **Total loss in venturi:** 23.50751166195926 in W.C. (597.0925970450378 mm W.C.)
    *   **Separator Entrance Loss:** 0.5225140646125243 in W.C. (13.271857241158115 mm W.C.)
    *   **Separator Pressure Loss:** 0.0 in W.C. (0.0 mm W.C.)
    *   **Separator Exit Loss:** 0.2612570323062621 in W.C. (6.635928620579057 mm W.C.)
    *   **Total pressure loss:** 24.291282758878044 in W.C. (617.000382906775 mm W.C.)

**Min Flow Case Pressure Drop Calculations:**
*   **Calvert (1968) Throat Pressure Drop:** 35.57746495715223 in W.C. (903.6676099116665 mm W.C.)
*   **Modified Calvert (Yung et al. 1977) Parameters:**
    *   **Droplet Size:** 114.42457513681694 microns
    *   **Reynold's Number:** 285.086949800135
    *   **Drag Coeff (CDo):** 0.6794269495480375
    *   **X (Dimensionless Throat Length):** 1.1436966858965174
    *   **b (Drop Velocity Ratio):** 0.6534543596442755
    *   **Throat Pressure Drop:** 23.248249581342552 in W.C. (590.5055393661008 mm W.C.)
*   **Component Pressure Losses:**
    *   **90 bend pressure loss:** 0.0037470176243927684 in W.C. (0.09517424765957631 mm W.C.)
    *   **Venturi Vessel Exit Loss:** 0.0018735088121963842 in W.C. (0.04758712382978816 mm W.C.)
    *   **Total loss in venturi:** 23.25387010777914 in W.C. (590.6483007375901 mm W.C.)
    *   **Retention Entrance Loss:** 0.0037470176243927684 in W.C. (0.09517424765957631 mm W.C.)
    *   **Separator Pressure Loss:** 0.0 in W.C. (0.0 mm W.C.)
    *   **Retention Exit Loss:** 0.02745329338092989 in W.C. (0.6973136518756191 mm W.C.)
    *   **Total pressure loss:** 23.28507041878446 in W.C. (1182.0890893747155 mm W.C.)

**Nukiyama-Tanasawa Equation Validity:**
*   The Nukiyama-Tanasawa equation is only valid when gas velocity is between 60-230 m/s.
*   The Nukiyama-Tanasawa equation is only valid when L/G ratio is between 0.08-1.01.

These detailed calculations are essential for predicting the hydraulic performance of the venturi system. For overall performance data, refer to [[scrubber_venturi_max_flow_case_performance]] and [[scrubber_venturi_min_flow_case_performance]]. Further context on the underlying assumptions can be found in [[scrubber_venturi_design_principles]].