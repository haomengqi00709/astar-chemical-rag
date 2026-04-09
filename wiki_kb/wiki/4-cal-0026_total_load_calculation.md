---
slug: 4-CAL-0026_total_load_calculation
title: Gas/Gas Heat Exchanger Total Load Calculation (4-CAL-0026)
source_doc: 4-CAL-0026
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Gas/Gas Heat Exchanger Total Load Calculation (4-CAL-0026)

This document, identified as **4-CAL-0026**, details the calculation of component weights and duct loads for the Gas/Gas Heat Exchanger. It was prepared by Chemetics, a Division of Aker Kvaerner Canada Inc., under the project title "Gas/Gas Hx Component Weights".

**Document Administration:**
*   **Standard:** 4-CAL-0026-R0
*   **Revision:** 0.0
*   **Date:** 39143.0
*   **Status:** Comments Requested
*   **Prepared By:** T. Wacker
*   **Checked By:** J. Wright
*   **Approved By:** D. Shaw

**Purpose and Integration:**
The primary purpose of this spreadsheet is to calculate the individual component weights and overall duct loads for the Gas/Gas Heat Exchanger. The results from this calculation serve as crucial inputs for other engineering analyses and software. Specifically:
*   The total load on the top tubesheet (w1) is an input to [[4-CAL-0003]].
*   The total shell load (ws) is an input to [[4-CAL-0004]].
*   The bundle density is an input to the PV Elite software.
*   The total load on the bottom tubesheet (w2) is an input to [[4-CAL-0003]].
*   The total load on the bottom vestibule (wv) is an input to [[4-CAL-0011_gas_gas_hx_load_distribution_calculation_details]].

**Key Calculation Output:**
A significant output of this calculation is the vertical force (per meter duct diameter), which is determined to be 0.0 kN/m (Fv).

**Specific Application Note:**
The calculation for the Shell inlet/outlet nozzle weight is specifically applicable to a "Type 4 vestibule" configuration.

For detailed dimensional parameters used in these calculations, refer to [[gas_gas_hx_component_dimensions]]. Information regarding the materials of construction and their properties can be found in [[gas_gas_hx_material_properties]].

**Document Administration:**
*   Client Name: Aker Kvaerner
*   Standard: 4-CAL-0026-R0
*   Revision: 0.0
*   Date: 39143.0
*   Status: Comments Requested
*   Prepared By: T. Wacker
*   Checked By: J. Wright
*   Approved By: D. Shaw

**Key Parameters:**
*   Vertical force (per m duct dia.) (Fv): 0.0 kN/m

**Integration and Inputs/Outputs:**
This document provides critical inputs to other calculations and software:
*   Total load on top tubesheet (w1) is an input to [[4-CAL-0003]].
*   Total shell load (ws) is an input to [[4-CAL-0004]].
*   Bundle density is an input to PV Elite.
*   Total load on bottom tubesheet (w2) is an input to [[4-CAL-0003]].
*   Total load on bottom vestibule (wv) is an input to [[4-CAL-0011]].

**Calculation Details:**
*   The calculation for Shell inlet/outlet nozzle weight applies to a "Type 4 vestibule".
---