# Process Engineer Agent (Aria) — How It Works

## Input
`project_context.json` from the PM Agent. No SOW, no user input required — everything comes from the PM's handoff.

## What It Does

**Step 1 — Fluid code and properties from RAG**
Queries RAG for the fluid code (1-LST-0002 content is indexed) and physical properties.
Gemini reads the RAG results and returns the official company fluid code plus viscosity and vapour pressure estimates.
Example: "20% NaCl Brine Solution" → RAG finds 1-LST-0002 → code `BR` (Brine, Feed)

Density is taken directly from the SOW (PM already extracted it).

**Step 2 — Design criteria from RAG**
Queries RAG for design margin rules (1-PRC-0001 content is indexed) and corrosion requirements (5-LST-0003).
Gemini reads the RAG results and returns:
- Flow margin % with the source document cited
- Corrosion allowance mm with the source document cited
- Pressure class based on design pressure
- Material and pressure test notes driven by active risk flags

The agent folder templates (`1-PRC-0001`, `1-LST-0002`) are **output targets** — they define the format of the deliverables Aria produces, not inputs to read from.

**Step 4 — Hydraulic calculations (Python)**
Pure maths — no AI involved:

```
Pressure head (m)  = (Pd_v - Ps_v) × 100,000 / (ρ × g)
Static head (m)    = discharge_static_head - suction_static_head
TDH (m)            = pressure_head + static_head + friction_losses
NPSHa (m)          = (Ps_abs × 100,000) / (ρ × g) + suction_static_head
                     - suction_friction_loss - vapour_pressure × 1000 / (ρ × g)
```

If values are missing from the SOW (e.g. static heads, friction losses), they are marked `TBD` with an explicit note — the agent does not guess or silently skip them.

**Step 5 — Show thinking chain**
Displays to the user before writing anything:
1. Project context from PM — fluid, flow, pressure, active risk flags
2. Fluid properties — code (from 1-LST-0002), density, SG, viscosity, vapour pressure
3. Design criteria — rated flow, pressure class, corrosion allowance (from 1-PRC-0001)
4. Hydraulic results — pressure head, static head, TDH, NPSHa, any TBD flags

**Step 6 — Human confirmation**
User types `yes` or `no`. Nothing is written until confirmed.

**Step 7 — Generate calculation summary**
On confirmation, Gemini writes a professional calculation summary with 6 sections:
1. Scope
2. Fluid identification — code, properties, engineering significance
3. Design criteria summary — margins applied and why
4. Hydraulic calculation — TDH breakdown, NPSHa
5. Risk considerations — engineering implications of active flags
6. Handover to Mechanical — explicit parameter list Mechanical must use

## Outputs
| File | Purpose |
|------|---------|
| `process_output.json` | Machine-readable handoff — read by Mechanical Agent |
| `process_calc_summary.md` | Human-readable calculation summary / engineering record |

## Files Used
| Source | How used |
|--------|---------|
| `project_context.json` (from PM) | Project parameters, risk flags |
| RAG (ChromaDB) | All engineering knowledge — fluid codes (1-LST-0002), design criteria (1-PRC-0001), corrosion standards (5-LST-0003) |

## Files NOT Read (output targets only)
| File | Why not read |
|------|-------------|
| `1-LST-0002-R3 Fluid Codes Master List.xlsx` | Content already indexed in RAG — queried there instead |
| `1-PRC-0001-R0 Process Design Criteria.docx` | This is a blank template — it defines the output format, not an input |
| `1-LST-0003-R0 Process Control Logic Narrative.docx` | Blank template — output for a later project stage |

## Usage
```bash
# Default — reads project_context.json from PM Agent folder
python "work_agents/Aria - Process Engineer/process_agent.py"

# With a specific context file
python "work_agents/Aria - Process Engineer/process_agent.py" --context path/to/project_context.json

# JSON output only (no confirmation prompt)
python "work_agents/Aria - Process Engineer/process_agent.py" --json
```
