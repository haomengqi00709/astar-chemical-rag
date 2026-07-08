## Process Calculation Summary: MEG Transfer Pump Skid

**Project:** MEG Transfer Pump Skid — B Star Chemetics
**Location:** Sarnia, Canada
**Date:** [Current Date]
**Document Ref:** PCS-MEG-001-R0

---

### 1. Scope

This document summarizes the process engineering calculations for the Monoethylene Glycol (MEG) Transfer Pump, part of the B Star Chemetics facility in Sarnia, Canada. The purpose of this pump is to transfer 95% by weight Monoethylene Glycol.

### 2. Fluid Identification

*   **Fluid Name:** Monoethylene Glycol (MEG), 95% by weight
*   **Fluid Code:** MEG (Source: RAG / 1-LST-0002)
*   **Key Properties:**
    *   Density: 1095 kg/m³
    *   Specific Gravity (SG): 1.095
    *   Viscosity: 4.0 mPa·s
    *   Vapour Pressure at 65°C: 0.15 kPa
    *   Corrosive: True (Source: RAG / 1-LST-0002)

*   **Engineering Significance:**
    *   The high density (1095 kg/m³) is critical for converting pump head to discharge pressure and for power calculations.
    *   The low viscosity (4.0 mPa·s) indicates that standard centrifugal pump selection criteria apply, with minimal impact on pump efficiency or friction losses due to viscosity.
    *   The low vapour pressure (0.15 kPa at 65°C) is favorable for NPSH availability, reducing the risk of cavitation.
    *   The fluid is identified as "Corrosive: True." This is a critical factor for material selection, despite other design criteria suggesting non-corrosive service (see Section 5).

### 3. Design Criteria Summary

The following design criteria were applied for the MEG Transfer Pump:

*   **Normal Flow:** 45 m³/h
*   **Rated Flow:** 54.0 m³/h (This includes a 20% margin over normal flow, as per 4-PDS-XXXX-R1 (Template Brine Ion Exchange Pkg).xls)
*   **Design Pressure:** 10 bar (PN10 rating)
*   **Corrosion Allowance:** 0 mm (Source: 5-LST-0003-2)
*   **Material Selection Basis:** Standard practice for non-corrosive service (Source: 5-LST-0003-2). *Note: This contradicts the fluid property stating "Corrosive: True." This discrepancy is highlighted in Section 5.*
*   **Pressure Test:** Standard pressure testing procedures apply.

### 4. Hydraulic Calculation

The hydraulic calculations for the MEG Transfer Pump resulted in the following:

*   **Pressure Differential Head:** 15.8 m
*   **Static Head:** 5.0 m
*   **Friction Losses:** 3.3 m
*   **Total Dynamic Head (TDH):** 24.1 m (Sum of pressure differential, static, and friction heads)
*   **Net Positive Suction Head Available (NPSHa):** 25.6 m

*   **Notes:** No specific notes were provided with the hydraulic results.

### 5. Risk Considerations

*   **Active Risk Flags:** None were provided as active for this project.

*   **Identified Discrepancy / Engineering Implication:**
    A significant discrepancy has been identified between the fluid properties and the design criteria regarding corrosion.
    *   Fluid properties state: "Corrosive: True."
    *   Design criteria state: "Corrosion allowance: 0 mm" and "Material selection based on standard practice for non-corrosive service."

    This contradiction presents a critical risk. If MEG is indeed corrosive, selecting materials based on non-corrosive service and applying zero corrosion allowance could lead to premature equipment failure, leaks, safety hazards, and significant operational downtime. This requires immediate clarification and resolution with the client and relevant stakeholders (e.g., Materials Engineer, Project Manager).

### 6. Handover to Mechanical Engineer

The following parameters are to be used by the Mechanical Engineer for the selection and sizing of the MEG Transfer Pump:

*   **Fluid:** Monoethylene Glycol (MEG), 95% by weight
*   **Rated Flow:** 54.0 m³/h
*   **Total Dynamic Head (TDH):** 24.1 m
*   **NPSH Available (NPSHa):** 25.6 m
*   **Fluid Density:** 1095 kg/m³
*   **Fluid Viscosity:** 4.0 mPa·s
*   **Vapour Pressure (at 65°C):** 0.15 kPa (Consider 65°C as a key operating/design temperature for NPSH calculations)
*   **Design Pressure:** 10 bar (PN10)
*   **Corrosion Allowance:** 0 mm. **CRITICAL NOTE:** This value is provided in the design criteria but contradicts the fluid property stating "Corrosive: True." **Material selection must be confirmed to be suitable for corrosive MEG service, or the "Corrosive: True" property must be formally revised.**
*   **Material Selection Guidance:** Based on "standard practice for non-corrosive service." **CRITICAL NOTE:** As above, this contradicts the fluid property "Corrosive: True." **Mechanical Engineer must seek clarification and ensure materials are appropriate for the actual corrosivity of 95% MEG.**

---