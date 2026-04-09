## Process Calculation Summary: MEG Transfer Pump Skid

**Project:** MEG Transfer Pump Skid — B Star Chemetics
**Location:** Sarnia, Ontario, Canada
**Date:** [Current Date]
**Prepared By:** [Your Name/Process Engineer]

---

### 1. Scope

This document summarizes the process calculations for the Monoethylene Glycol (MEG) Transfer Pump Skid at B Star Chemetics' Sarnia facility. It covers fluid properties, design criteria, hydraulic calculations, risk considerations, and key parameters for mechanical engineering handover, ensuring the pump is appropriately sized and specified for its intended service.

### 2. Fluid Identification

*   **Fluid:** Monoethylene Glycol (MEG), 95% by weight
*   **Code:** MEG
*   **Source:** RAG / 1-LST-0002 (estimated)

**Fluid Properties:**
*   **Density:** 1095 kg/m³ (Specific Gravity: 1.095)
*   **Viscosity:** 2.5 mPa·s
*   **Vapour Pressure at 65°C:** 0.2 kPa
*   **Corrosive:** False

**Engineering Significance:**
The fluid's density is critical for converting head to pressure and for power calculations. The low viscosity (2.5 mPa·s) indicates that standard centrifugal pumps are suitable without significant derating due to viscous effects. The low vapour pressure (0.2 kPa at 65°C) is favorable for Net Positive Suction Head Available (NPSHa) calculations, minimizing the risk of cavitation. The non-corrosive nature simplifies material selection, allowing for standard industrial materials.

### 3. Design Criteria Summary

*   **Normal Flow:** 45 m³/h
*   **Rated Flow:** 54.0 m³/h (A 20% margin has been applied to the normal flow to determine the rated flow.)
    *   *Source for margin:* 4-PDS-XXXX-R1 (Template Brine Ion Exchange Pkg).xls
*   **Design Pressure:** 10 bar (PN10)
*   **Corrosion Allowance:** 1.5 mm
    *   *Source for corrosion allowance:* 5-LST-0003
*   **Material Requirements:** No specific corrosive material requirement is indicated, as the 'corrosive_fluid' flag is not active. Standard materials suitable for MEG are acceptable.
*   **Pressure Test Requirements:** No mandatory hydrostatic test requirement is indicated, as the 'high_pressure' flag is not active.
    *   *Source for design criteria:* RAG / 1-PRC-0001

### 4. Hydraulic Calculation

**Total Dynamic Head (TDH) Breakdown:**
*   Pressure Differential Head: 15.8 m
*   Static Head: 5 m
*   Friction Losses: 3.3 m
*   **Total Dynamic Head (TDH): 24.1 m**

**Net Positive Suction Head Available (NPSHa):**
*   **NPSHa:** 25.6 m

**Notes:** No specific notes or unusual conditions were identified during the hydraulic calculation.

### 5. Risk Considerations

No active risk flags were identified for this project based on the provided data. This implies that no specific engineering mitigations (e.g., special material requirements for corrosion, specific high-pressure testing protocols, or unique safety interlocks) are triggered by inherent fluid properties or operating conditions beyond standard industrial practices.

### 6. Handover to Mechanical Engineer

The following parameters are to be used by the Mechanical Engineer for the selection and design of the MEG Transfer Pump:

*   **Fluid:** Monoethylene Glycol (MEG)
*   **Density:** 1095 kg/m³
*   **Viscosity:** 2.5 mPa·s
*   **Vapour Pressure:** 0.2 kPa (at 65°C)
*   **Operating Temperature (for Vapour Pressure):** 65°C (Refer to P&ID for full operating temperature range.)
*   **Rated Flow:** 54.0 m³/h
*   **Total Dynamic Head (TDH):** 24.1 m
*   **Net Positive Suction Head Available (NPSHa):** 25.6 m
*   **Design Pressure:** 10 bar (PN10)
*   **Corrosion Allowance:** 1.5 mm
*   **Material Selection:** Standard industrial materials suitable for non-corrosive MEG service.
*   **Pressure Testing:** Standard industrial pressure testing procedures.