# RAG System: Data Parsing & Structuring Strategy

## 1. Architecture Goal: From Full-Text Retrieval to Attribute Comparison

In engineering compliance review, traditional chunking by character count breaks logical context. The core strategy is to convert unstructured procedure documents and structured list documents into **strongly-typed attribute knowledge units**, establishing a logical alignment between:

- **Standards (PRC)** — the rules a product must comply with
- **Facts (LST)** — the design baselines and reference data to compare against

This system covers all 8 engineering disciplines (0 Administration through 9 Electrical). Each discipline has its own document numbering prefix and its own compliance domain.

---

## 2. File Format Handling

Before parsing, files must be routed by format since each requires a different extraction approach:

| Format | Files | Extraction method |
|---|---|---|
| `.doc` / `.docx` | Most PRC and LST text documents | Extract via python-docx; no coordinate-based annotation extraction available — track Track Changes as revision markers instead |
| `.pdf` | Some PRC documents (e.g., PRC-0003 comments version) | Coordinate-based extraction; separate content stream from annotation layer |
| `.xls` / `.xlsx` | Most LST list documents | Extract via openpyxl; handle multi-sheet workbooks — each sheet may have a different schema |

**Duplicate document rule:** Where the same document exists as both `.doc` and `.pdf` (e.g., `1-PRC-0003`), treat the `.pdf` as the published/authoritative version and the `.doc` as the working draft. Parse both but tag `doc_status` accordingly.

**Revision supersession rule:** Where multiple revisions of the same document exist (e.g., R2 and R3), only parse the highest revision. Lower revisions should be archived, not indexed.

---

## 3. Template vs. Real Data Flag

**Critical:** Several LST and PRC files are templates with placeholder values (e.g., `XXXX`, blank cells). Parsing these without flagging them will cause the RAG to return empty or placeholder values as if they were real compliance data.

Detection rules:
- Filename contains `[Template]`, `(Template)`, or `Template`
- Cell values match patterns: `XXXX`, `XX-XX`, `TBD`, blank across >50% of data rows

Flag these with `is_template: true` in metadata. Chunks from template documents should be retrievable for schema/structure questions but excluded from numerical compliance comparisons.

**Known templates in current dataset:**
- `1-LST-0001` Battery Limits Conditions — template, no real values
- `1-PRC-0001` Process Design Criteria — template structure only
- `4-LST-0001` Equipment List — template

**Known real data files:**
- `1-LST-0002` Fluid Codes Master List
- `1-LST-0003` Process Control Logic Narrative
- `5-LST-0001` Line List
- `5-LST-0002` Tie Point List
- `5-LST-0003-x` Piping Service Lists
- `8-LST-0103` Alarm Interlocks & Setpoints
- `8-LST-0110` to `8-LST-0121` Instrument Process Data Lists

---

## 4. Tiered Parsing Strategy

### 4.1 Procedure Documents (PRC Series) — Semantic Anchor Parsing

PRC documents define the engineering "law" and approval workflows.

**Contextual chunking by section heading:**
- Split strictly on document headings (e.g., Section 3.1, 3.2), not by character count
- Reason: engineering rules have strong stage dependency. A Stage 1 P&ID requirement is entirely different from an As-Built requirement. Splitting by heading ensures the AI always has the applicable stage context

**Annotation layer isolation (PDF only):**
- Separate the content stream (body text) from human annotations/comments using coordinate parsing
- Tag body text as `Authority: Standard`
- Tag annotations as `Authority: Human_Comment` and attach as metadata, not as retrievable content
- Reason: prevents the AI from treating reviewer notes, informal questions, or temporary markups (e.g., "Cannot find on Q drive") as mandatory engineering standards

**For .doc files — Track Changes handling:**
- Identify and extract accepted text only
- Flag paragraphs with unresolved changes as `doc_status: Under_Review`

**Obsolete content filtering:**
- Remove paragraphs marked with strikethrough formatting or explicit `Deleted` labels
- Reason: PRC documents retain revision history inline; outdated rules must not be retrieved as active standards

---

### 4.2 List Documents (LST Series) — Attribute Object Parsing

LST documents provide the reference facts for comparison. Each discipline has different column schemas — use discipline-aware templates.

**General principle — Row-to-Attribute Conversion:**
Convert each data row into a structured descriptive sentence that repeats the header context. This dramatically improves LLM numerical sensitivity during comparison, since vector embeddings handle raw numbers poorly.

**Discipline-specific conversion templates:**

**Discipline 1 — Fluid Codes (1-LST-0002):**
```
Fluid code [{Fluid_Code}] represents [{Fluid_Name}], service type [{Service}], hazard classification [{Hazard}].
```

**Discipline 1 — Control Logic (1-LST-0003):**
```
Equipment [{Tag}] requires the following permissives to start: [{Permissives}]. Interlock condition: [{Interlock}].
```

**Discipline 5 — Line List (5-LST-0001):**
```
Line [{Line_No}] carries fluid code [{Fluid}], design pressure [{Press}] kPag, design temperature [{Temp}] degC, material class [{Material}], insulation [{Insulation}].
```

**Discipline 5 — Piping Service List (5-LST-0003-x):**
```
Piping service [{Service_Code}] applies to [{Description}], pressure rating [{Press_Rating}], material spec [{Material_Spec}], applicable to [{Plant_Type}].
```

**Discipline 8 — Instrument Process Data Lists (8-LST-0110 to 0121):**
```
Instrument [{Tag}] type [{Instrument_Type}] measures [{Process_Variable}] on line/equipment [{Line_or_Equip}], range [{Range}] [{Unit}], design pressure [{Press}] kPag, design temperature [{Temp}] degC, fluid code [{Fluid}].
```

**Discipline 8 — Alarm Interlocks & Setpoints (8-LST-0103):**
```
Tag [{Tag}] has alarm type [{Alarm_Type}] at setpoint [{Setpoint}] [{Unit}], interlock action [{Action}] at [{Interlock_Value}] [{Unit}].
```

**Discipline 9 — Electrical Checkout Lists (9-LST-0701 to 0731):**
```
System [{System_Name}], check item [{Item_No}]: [{Requirement}]. Acceptance criteria: [{Criteria}].
```

**Multi-sheet Excel handling:**
- Identify each sheet separately; do not merge schemas across sheets
- Tag each chunk with the sheet name as a sub-source identifier

---

## 5. Metadata Schema

Every parsed chunk must carry the following metadata to support filtered multi-path retrieval:

| Key | Source | Purpose |
|---|---|---|
| `discipline` | Document prefix (1–9) | Filter retrieval by engineering domain (piping, instrumentation, electrical, etc.) |
| `doc_id` | Document number (e.g., 5-LST-0001) | Unique document identifier for cross-referencing |
| `doc_type` | PRC / LST | Distinguishes rules from facts |
| `doc_status` | Standard / Commentary / Human_Comment / Under_Review / Template | Defines authority weight; compliance decisions use Standard only |
| `is_template` | Boolean (detected from filename or content) | Exclude from numerical compliance comparisons |
| `tag_ref` | 4-digit tag number (e.g., 1016, 7803) | Cross-document anchor linking equipment (4-PRC), piping (5-PRC), and calculations (CAL) |
| `fluid_code` | SAS, BR, CL2, etc. | Links chemical media to relevant safety design criteria |
| `stage_gate` | Stage 1–5 / As Built | Marks lifecycle stage of the rule; prevents cross-stage false matches |
| `is_constraint` | Detected via must / shall / > / < | Flags paragraphs containing hard compliance rules for automatic rule extraction |
| `revision` | R0, R1, R2, etc. | Tracks document revision; only highest revision indexed |
| `unit_system` | Metric / Imperial | Flags the unit system in use for normalization |

---

## 6. Unit Normalization

Unit inconsistencies between documents (e.g., PSI vs kPag, degF vs degC) must be resolved at parse time, not at query time.

Rules:
- **Pressure:** normalize to kPag as base unit; store original value and unit as metadata
- **Temperature:** normalize to degC as base unit
- **Flow:** normalize to m³/h or kg/h depending on phase (gas vs liquid)
- Flag any value where the unit cannot be determined with `unit_system: Unknown` for manual review

---

## 7. Why This Strategy Supports Automated Compliance Review

**Eliminates semantic pollution:** Isolating PDF annotations ensures the RAG only makes decisions based on controlled document content, not informal reviewer commentary.

**Template safety:** Flagging template documents prevents the system from returning placeholder values as compliance thresholds.

**Discipline-aware retrieval:** The `discipline` metadata field allows the system to route queries correctly — an instrument pressure question should retrieve from 8-LST, not 5-LST.

**Supports logical comparison:** Converting LST rows into attribute sentences enables the LLM to perform comparisons like: *"Does the design pressure of this new product exceed the maximum recorded for SAS fluid lines?"*

**Constraint extraction:** The `is_constraint` flag enables automatic harvesting of hard rules (must/shall/>/<) from PRC documents, which can be compiled into a standalone compliance ruleset.

**Stage-aware compliance:** The `stage_gate` field prevents a Stage 1 draft requirement from being applied to an As-Built product review.
