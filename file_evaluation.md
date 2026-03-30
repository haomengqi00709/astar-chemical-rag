# File Evaluation: RAG Compliance System
## Scope: All disciplines (0–9), List and Procedure folders only

---

## Summary

The RAG system is designed to answer: **"Will a new product comply with our engineering standards?"**

Across all 8 disciplines, the List and Procedure folders provide a solid foundation for compliance checking — strongest in Instrumentation (8) and Piping (5), weakest in Insulation (6) and Coatings (7).

**Key limitation:** Several List files are templates with placeholders rather than filled-in project data. These can define the schema for compliance but cannot provide actual numerical thresholds to compare against.

---

## Discipline-by-Discipline Evaluation

### 0 — Administration
**Files:**
- `0-LST-0001` Document Register (template)
- `0-PRC-0001` Approval & Use of Standards
- `0-PRC-0002` Document Numbering
- `0-PRC-0003` File Structure
- `0-PRC-0004` Style of Textual Documents
- `0-PRC-0005` Publishing of Project Documents
- `0-PRC-0006` AKC Control of Project Documentation
- `0-PRC-0007` Review of Vendor Documentation

**Data completeness:** Procedures are real and complete. List is a template.

**Can answer:**
- Is this document numbered correctly per our standard?
- Has this document been approved through the right process?
- What are the vendor documentation requirements?

**Cannot answer:** Any technical/engineering compliance question.

---

### 1 — Process Technology
**Files:**
- `1-LST-0001` Battery Limits Conditions (template — placeholders only)
- `1-LST-0002` Fluid Codes Master List ✅ real data
- `1-LST-0003` Process Control Logic Narrative ✅ real data
- `1-PRC-0001` Process Design Criteria (template — structure only, no values)
- `1-PRC-0002` Process Flowsheet Development and Approval
- `1-PRC-0003` PID Development and Approval
- `1-PRC-0004` Hazard & Operability Studies

**Data completeness:** Mixed. Two lists have real data; the most critical ones (battery limits, design criteria) are templates.

**Can answer:**
- What fluid code applies to this product/fluid?
- What control permissives are required to start this equipment or open this valve?
- What approval stages does a new product need to pass through?
- What documentation is required before a HAZOP?

**Cannot answer:**
- Is this product's pressure/temperature within design limits? (no actual values in LST-0001 or PRC-0001)

---

### 4 — Equipment
**Files:**
- `4-LST-0001` Equipment List (template)
- `4-LST-0004` Mechanical Equipment Checkout List ✅ real checklist
- `4-LST-0101` Standard Equipment Numbering ✅ real data
- `4-PRC-0001` Plant Equipment Identification
- `4-PRC-0002` Equipment Design Criteria
- `4-PRC-0003` Equipment Design and Specification
- `4-PRC-0004` Mechanical Checkout Equipment
- `4-PRC-0005` Equipment Part Numbering
- `4-PRC-0007` Pump Calculation Procedure
- `4-PRC-0008` Gas-Gas Exchanger Thermal Calculations
- `4-PRC-0009` Gas-Gas Exchanger Mechanical Calculations

**Data completeness:** Procedures are real and substantive. Equipment list is a template.

**Can answer:**
- Is this equipment identified and numbered correctly?
- What design criteria apply to this equipment type?
- What are the specification requirements for pumps / heat exchangers?
- What does the mechanical checkout require?

**Cannot answer:**
- Specific equipment design values (depends on filled-in project data sheets, not in scope here).

---

### 5 — Piping & Layout
**Files:**
- `5-LST-0001` Line List ✅ real data
- `5-LST-0002` Tie Point List ✅ real data
- `5-LST-0003` Piping Service List — Chemical Plant ✅ real data
- `5-LST-0003-2` Piping Service List — Acid Plant ✅ real data
- `5-LST-0004` Piping Service List — Utilities ✅ real data
- `5-LST-0005` Plant Layout Checklist ✅ real checklist
- `5-LST-0011` Standard ANSI Piping Connections for Instrumentation ✅ real data
- `5-PRC-0001` Plant Pipe Numbering
- `5-PRC-0002` Piping Design Criteria
- `5-PRC-0003` Piping Design and Specification
- `5-PRC-0004` Line List Development and Approval
- `5-PRC-0005` Plant Layout Review
- `5-PRC-0006` Piping Specialty Item Numbering
- `5-PRC-0007` Mechanical Checkout Piping

**Data completeness:** Strongest of all disciplines. Most lists contain real project data.

**Can answer:**
- What piping service class applies to this fluid/product?
- What are the line design conditions (pressure, temperature, material)?
- What are the tie-in connection specs at battery limits?
- What ANSI connection standards apply for instrumentation?
- Does the plant layout meet our checklist requirements?
- Is this pipe numbered correctly?

---

### 6 — Insulation
**Files:**
- `6-PRC-0002` Insulation Design and Specification

**Data completeness:** Minimal — one procedure, no lists.

**Can answer:**
- What are the insulation design and material specification requirements?

**Cannot answer:** Any numerical or product-specific insulation compliance without additional data.

---

### 7 — Coatings
**Files:**
- `7-PRC-0002` Coatings Design and Specification

**Data completeness:** Minimal — one procedure, no lists.

**Can answer:**
- What are the coating type and application specification requirements?

**Cannot answer:** Product-specific coating compliance without additional data.

---

### 8 — Instrumentation & Control
**Files:**
- `8-LST-0101` Field Instrumentation Checkout ✅
- `8-LST-0102` DCS Configuration Checkout ✅
- `8-LST-0103` Alarm Interlocks & Setpoints ✅ real values
- `8-LST-0104` Process Control DCS Configuration Parameters ✅
- `8-LST-0110` Instrument Process Data List — Analyzer ✅
- `8-LST-0111` Instrument Process Data List — Control Valve ✅
- `8-LST-0112` Instrument Process Data List — Control Damper ✅
- `8-LST-0113` Instrument Process Data List — Flow ✅
- `8-LST-0114` Instrument Process Data List — On/Off Valve ✅
- `8-LST-0115` Instrument Process Data List — Level ✅
- `8-LST-0116` Instrument Process Data List — Pressure ✅
- `8-LST-0117` Instrument Process Data List — Temperature ✅
- `8-LST-0118` Instrument Process Data List — Differential Pressure ✅
- `8-LST-0119` Instrument Process Data List — Pressure Regulator ✅
- `8-LST-0120` Instrument Process Data List — Rotameter ✅
- `8-LST-0121` Instrument Process Data List — Pressure Relief Valve ✅
- `8-PRC-0001` Plant Instrument Numbering
- `8-PRC-0002` Instrument and Control Design Criteria
- `8-PRC-0003` Field Instrument Design and Specification
- `8-PRC-0004` Control System Design and Specification
- `8-PRC-0005` Instrumentation Systems Field Checkout
- `8-PRC-0006` DCS Control Function Field Checkout
- `8-PRC-0011` Instrument Approval Tag
- `8-PRC-0014` DCS Field Hardware Checkout

**Data completeness:** Best of all disciplines. Instrument process data lists cover every major instrument type with real process data. Alarm/interlock setpoints are available.

**Can answer:**
- Does this instrument meet the spec for its type (pressure, temp, flow, level, etc.)?
- What are the alarm and interlock setpoints for this process variable?
- Does the DCS configuration meet our standards?
- What are the control valve / relief valve specifications?
- Is this instrument approved and numbered correctly?

---

### 9 — Electrical
**Files:**
- `9-LST-0001` Electrical Document Numbering Standard ✅
- `9-LST-0701` to `9-LST-0711` Contractor Field Check Lists (grounding, lightning, lighting, cable tray, cable, HV switchgear, power transformer, LV switchgear, motor, TR system) ✅
- `9-LST-0721` to `9-LST-0731` KC Specialist Field Check Lists (same systems) ✅
- `9-PRC-0001` Electrical Equipment Identification
- `9-PRC-0003` Electrical Design and Specification
- `9-PRC-0004` Electrical Systems Field Checkout
- `9-PRC-0005` Definition of Hazardous Areas (North America) ✅
- `9-PRC-0006` Definition of Hazardous Areas (IEC) ✅
- `9-PRC-0019` Field Lockout and Tagout
- `9-PRC-0020` Electrical Systems Contractor Checkout
- `9-PRC-0021` Electrical Numbering System

**Data completeness:** Good for inspection/checkout compliance. Strong on hazardous area classification.

**Can answer:**
- What hazardous area classification applies to this product/location (NEC and IEC)?
- Does the grounding / cable / switchgear / motor system meet our field checkout standards?
- Is this electrical equipment identified and numbered correctly?
- What are the lockout/tagout requirements?

---

## Overall Compliance Question Coverage

| Question type | Answerable? | Best source |
|---|---|---|
| Fluid classification | Yes | 1-LST-0002 |
| Control permissives / interlocks | Yes | 1-LST-0003, 8-LST-0103 |
| Piping service class & line conditions | Yes | 5-LST-0001/0002/0003 |
| Instrument specs by type | Yes | 8-LST-0110 to 0121 |
| Alarm & setpoint values | Yes | 8-LST-0103 |
| Hazardous area classification | Yes | 9-PRC-0005/0006 |
| Electrical system checkout compliance | Yes | 9-LST-0701 to 0731 |
| Equipment design criteria | Partially | 4-PRC-0002/0003 |
| Document approval workflow | Yes | 0-PRC-0001, 1-PRC-0002/0003 |
| Insulation / coating requirements | Procedural only | 6-PRC-0002, 7-PRC-0002 |
| Specific numerical design limits (pressure, temp) | Limited | Only where LSTs have real values, not templates |

---

## Gaps to Flag

1. **LST-0001 (Battery Limits) and PRC-0001 (Process Design Criteria)** are templates — if filled-in project-specific versions exist elsewhere, they should be added.
2. **Disciplines 6 and 7** (Insulation, Coatings) have no list data — compliance answers will be procedural only.
3. **No site-specific data** (1-DST-0001 Site Design Conditions is in the Datasheet folder, not List/Procedure) — may need to include if site conditions affect compliance.
