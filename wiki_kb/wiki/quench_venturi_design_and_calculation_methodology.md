---
slug: quench_venturi_design_and_calculation_methodology
title: Quench Venturi Design and Calculation Methodology
source_doc: 1-Cal-6510-R0 (Template Quench Venturi and Retention Vessel)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Quench Venturi Design and Calculation Methodology

This page outlines the design guidelines and calculation principles applied to the Quench Venturi, as documented in [[1-CAL-6510-R0_quench_venturi_and_retention_vessel_calculation_document_details]]. Adherence to these methodologies ensures the venturi's optimal performance and operational safety.

**Mandatory Requirements and Guidelines:**
*   Gas flows **must** be obtained from the mass balance program.
*   Mass balance output **must** be checked for consistency with the venturi design.
*   Acid properties **must** be inserted into the calculations.

**Velocity Guidelines:**
*   Exit throat velocity **should** be between 150 and 250 ft/s.
*   Default Exit throat velocity = 60 ft/s.
*   Initial velocity at the throat is usually zero.
*   Gas outlet velocity **should** be between 60-90 ft/s.
*   Default Gas outlet velocity is 60 ft/s.
*   Transition Duct Velocity is determined based on the outlet gas flow and a pre-set ratio, which is itself based on bricking requirements.

**Calculation Principles:**
*   **Throat Length:** This parameter is used to calculate the droplet to gas velocity ratio for pressure drop calculations.
*   **Semrau Efficiency:** This efficiency is predicated on the principle that collection efficiency is a function of power dissipation across the venturi. This relationship is described by an exponential equation that incorporates empirically determined aerosol coefficients.
*   **Phosphoric Acid Coefficients:** These coefficients can be used to approximate sulphur dioxide in relevant calculations.

For detailed performance data, refer to [[quench_venturi_performance_data]]. Specific pressure drop calculations are elaborated in [[quench_venturi_pressure_drop_calculations]].