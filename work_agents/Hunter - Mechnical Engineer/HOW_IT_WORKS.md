# Mechanical Engineer Agent (Hunter) — How It Works

## Input
`process_output.json` from the Process Agent. Contains: rated flow, TDH, NPSHa, fluid properties, design criteria, risk flags.

## What It Does

**Step 1 — Pump hydraulic calculations (Python)**
Follows `Pump_Calculation_Template.csv` exactly. Pure maths — no AI involved:

```
Total Suction Head (m)  = (Ps_v + Patm) × 100,000/(ρg) + zs − hf_s − Pv × 100,000/(ρg)
Total Discharge Head (m) = (Pd_v + Patm) × 100,000/(ρg) + zd + hf_d
TDH (m)                 = Total Discharge Head − Total Suction Head
Hydraulic Power (kW)    = Q × ρ × g × TDH / 3,600,000
Shaft Power/BHP (kW)    = Hydraulic Power / η  (η = 0.72 assumed, vendor confirms)
Motor Power (kW)        = BHP × API 610 margin
  API 610 margins: <22 kW → ×1.25 | 22–55 kW → ×1.15 | >55 kW → ×1.10
Specific Speed          = N × Q^0.5 / TDH^0.75  → impeller type
NPSHa vs NPSHr check    = NPSHa (from Process) vs 4.0 m estimate (vendor confirms)
```

If static heads or friction losses are missing (TBD from Process Agent), the agent falls back to the pressure differential head from Process and flags it.

**Step 2 — Material selection from RAG**
Queries RAG for:
- Material requirements for the specific fluid service (5-LST-0003)
- General equipment requirements (4-SPC-0001)
- Centrifugal pump specification (4-SPC-0002)

Gemini reads the RAG results and returns: casing material, impeller material, shaft material, mechanical seal type, API seal plan, and a list of items the vendor must confirm.

**Step 3 — Show thinking chain**
Displays to the user before writing anything:
1. Process handoff — fluid, flow, NPSHa, design pressure
2. Pump calculations — all results following the CSV template
3. Material selection — materials with RAG source cited, vendor confirmation list

**Step 4 — Human confirmation**
User types `yes` or `no`. Nothing is written until confirmed.

**Step 5 — Generate pump datasheet**
Gemini writes a filled Pump Data Sheet (4-PDS-XXXX equivalent) with 7 sections:
1. Equipment Identification
2. Operating Conditions
3. Hydraulic Calculation Summary
4. Materials of Construction
5. Mechanical Seal Specification
6. Vendor Requirements
7. Open Items (TBD)

## Outputs
| File | Purpose |
|------|---------|
| `mechanical_output.json` | Full results — closes the PM → Process → Mechanical chain |
| `pump_datasheet.md` | Filled pump datasheet — equivalent to 4-PDS-XXXX |

## Files Used
| Source | How used |
|--------|---------|
| `process_output.json` (from Aria) | All process inputs — flow, heads, fluid properties |
| `Pump_Calculation_Template.csv` | Defines the calculation structure and formulas |
| RAG (ChromaDB) | Material selection (5-LST-0003, 4-SPC-0001, 4-SPC-0002, 4-PRC-0007) |

## Files NOT Read (output targets only)
| File | Why not read |
|------|-------------|
| `4-PDS-XXXX-R2 (Template Pump).xlsm` | Blank datasheet template — `pump_datasheet.md` is the filled equivalent |
| `0-REQ-5XXX-R1 (Template) Requisition.xlsm` | Blank requisition template — next stage after datasheet |
| `Achieve/0-TAB-5XXX-2-R0 Centrifugal Pump Tech Bid Tab.xls` | Blank bid tabulation — for vendor comparison stage |
| `Achieve/4-LST-0001-R1 (Template Equipment List).xls` | Blank equipment list template |
| `4-SPC-0001` / `4-SPC-0002` / `4-PRC-0007` | Already indexed in RAG — queried there instead |

## Usage
```bash
# Default — reads process_output.json from Process Agent folder
python "work_agents/Hunter - Mechnical Engineer/mechanical_agent.py"

# With a specific process output file
python "work_agents/Hunter - Mechnical Engineer/mechanical_agent.py" --context path/to/process_output.json

# JSON output only (no confirmation prompt)
python "work_agents/Hunter - Mechnical Engineer/mechanical_agent.py" --json
```
