## Process Calculation Summary: MEG Transfer Pump Skid

**Project:** MEG Transfer Pump Skid — B Star Chemetics
**Location:** Sarnia, Ontario, Canada
**Date:** [Current Date]
**Prepared By:** Process Engineer

---

### 1. Scope

This document summarizes the key process and hydraulic calculations for the Monoethylene Glycol (MEG) Transfer Pump Skid. It outlines the fluid properties, design criteria, hydraulic performance requirements, and relevant engineering considerations to guide the subsequent mechanical design and procurement phases of the project.

### 2. Fluid Identification

*   **Fluid:** Monoethylene Glycol (MEG), 95% by weight (code: MEG)
*   **Source:** RAG / 1-LST-0002 (estimated)
*   **Properties:**
    *   Density: 1095 kg/m³
    *   Specific Gravity (SG): 1.095
    *   Viscosity: 4.0 mPa·s
    *   Vapour Pressure at 65°C: 0.5 kPa
    *   Corrosive: True

*   **Engineering Significance:** The fluid's corrosivity (MEG, 95% wt) is a critical factor for material selection, necessitating the use of corrosion-resistant materials for all wetted parts of the pump and associated piping. The low vapour pressure at 65°C indicates a reduced risk of cavitation from this property alone, but NPSHa must still be confirmed.

### 3. Design Criteria Summary

The following design criteria have been established for the MEG Transfer Pump:

*   **Flow Rates:**
    *   Normal Flow: 45 m³/h
    *   Rated Flow: 54.0 m³/h (20% margin applied to normal flow)
    *   *Source:* 4-PDS-XXXX-R1 (Template Brine Ion Exchange Pkg).xls
*   **Design Pressure:** 10 bar (PN10)
    *   *Source:* RAG / 1-PRC-0001
*   **Corrosion Allowance:** 1.5 mm
    *   *Source:* 5-LST-0003
*   **Material Selection:** Material selection shall be based on the corrosive nature of the fluid. While no specific corrosive material requirement from 4-SPC-0001 is triggered (as no corrosive fluid flag is active in that system), the fluid property "Corrosive: True" from 1-LST-0002 dictates the need for corrosion-resistant materials. Reference examples from 5-LST-0003 (e.g., Cr-Mo steel, 316L Stainless Steel, FRP) should be considered.
*   **Pressure Testing:** A mandatory hydrostatic test is not explicitly required by the 'high_pressure' flag (as it is not active). However, hydrostatic testing is a common and recommended practice for process equipment, as exemplified in 5-LST-0003, and should be performed.
    *   *Source:* RAG / 1-PRC-0001, 5-LST-0003

### 4. Hydraulic Calculation

The following hydraulic parameters have been calculated for the pump at rated flow:

*   **Total Dynamic Head (TDH) Breakdown:**
    *   Pressure Differential Head: 15.8 m
    *   Static Head: 5.0 m
    *   Friction Losses: 3.3 m
    *   **Calculated TDH:** 24.1 m
*   **Net Positive Suction Head Available (NPSHa):** 25.6 m
*   **Notes:** None

### 5. Risk Considerations

*   **Active Risk Flags:** None.
*   **Engineering Implications:** The absence of active risk flags indicates that no specific, pre-defined project risks (e.g., 'high_pressure', 'corrosive_fluid_flag' from 4-SPC-0001) have been triggered by the system. This simplifies the design process by not requiring additional, flag-driven mitigation strategies or design reviews. However, the inherent corrosivity of MEG (as identified in fluid properties) remains a primary engineering consideration for material selection, independent of system flags.

### 6. Handover to Mechanical Engineer

The following parameters are to be used by the Mechanical Engineer for pump selection, sizing, and skid design:

*   **Fluid:** Monoethylene Glycol (MEG), 95% by weight
*   **Fluid Density:** 1095 kg/m³
*   **Fluid Viscosity:** 4.0 mPa·s
*   **Fluid Vapour Pressure (at 65°C):** 0.5 kPa
*   **Rated Flow:** 54.0 m³/h
*   **Total Dynamic Head (TDH):** 24.1 m
*   **Net Positive Suction Head Available (NPSHa):** 25.6 m
*   **Design Pressure:** 10 bar (PN10)
*   **Corrosion Allowance:** 1.5 mm
*   **Material Selection Guidance:** Pump and wetted components must be suitable for corrosive MEG service. Refer to 5-LST-0003 for examples of suitable materials (e.g., Cr-Mo steel, 316L Stainless Steel, FRP).
*   **Pressure Testing:** Hydrostatic testing of the pump and skid piping is recommended.