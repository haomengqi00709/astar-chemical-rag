# Work Agents — Progression

Last updated: 2026-04-18

---

## Overview

Three sequential AI agents handle project execution. Each reads the previous agent's output, queries the RAG knowledge base, runs calculations, and produces structured deliverables.

```
SOW → PM Agent (Daniel) → Process Agent (Aria) → Mechanical Agent (Hunter)
```

All agents are Python subprocesses spawned by `server.js` via `spawn(PYTHON, [agent_script, '--json', ...])`.

---

## PM Agent — Daniel (`pm_agent.py`)

**Input:** SOW text (from Dashboard or demo)
**RAG:** ChromaDB — document catalog, project execution procedures
**Output:**
- `project_context.json` — full project metadata + document register
- `deliverables/0-LST-0001.md` — Document Register
- `deliverables/0-PRC-2003.md` — Project Execution Plan
- `deliverables/0-DAT-3001_0.md` — Project Schedule
- `deliverables/summary_v{n}.docx` — versioned deliverable summaries (gitignored)

**Key behaviours:**
- Parses SOW to extract client, project type, fluid, flow rate, pressures, temperatures
- Generates discipline-appropriate document register based on project type
- Project context is the handoff to Process agent

**API endpoints (server.js):**
- `POST /api/projects` — create project, run PM agent
- `POST /api/projects/:id/summarize-deliverables` — generate versioned AI summary
- `GET /api/projects/:id/export-summary-docx` — export summary as .docx

---

## Process Agent — Aria (`process_agent.py`)

**Input:** `project_context.json`
**RAG:** ChromaDB — fluid codes (1-LST-0002), design criteria, corrosion margins, pressure classes
**Calcs (Python maths):**
- Total Dynamic Head (TDH)
- Net Positive Suction Head available (NPSHa)
- Fluid property assessment
**Output:**
- `process_output.json` — fluid props, TDH, NPSHa, design criteria flags, RAG citations
- `process_calc_summary.md` — human-readable narrative
- Populates `1-CAL-xxxx` calc sheet in Dashboard (INPUT / CALC / OUTPUT structure)

**API endpoints:**
- `POST /api/projects/:id/run-process` — run Process agent

---

## Mechanical Agent — Hunter (`mechanical_agent.py`)

**Input:** `process_output.json`
**RAG:** ChromaDB — pump specs (4-SPC-0002, 4-PRC-0007), material selection (5-LST-0003)
**Calcs (Python maths):**
- Shaft power, motor sizing
- Specific speed
- NPSH margin vs API 610 requirement
- API 610 motor margin
**Output:**
- `mechanical_output.json` — pump hydraulics, motor sizing, material specs, NPSH margin
- `pump_datasheet.md` — filled pump datasheet (4-PDS equivalent)
- Populates `4-CAL-0001` calc sheet in Dashboard

**API endpoints:**
- `POST /api/projects/:id/run-mechanical` — run Mechanical agent

---

## Deliverable Generation (.docx)

All three agents can export deliverables as Word documents:
- Server calls `export_docx.py` with the markdown content
- Uses python-docx (not LibreOffice) for generation
- Output served as binary download from `/api/projects/:id/export-docx/:docId`

---

## Changes Log

### 2026-04-18 (recent sessions)
- stderr from agent subprocesses now surfaced in UI error panel (previously swallowed)
- Per-role session generation — each role generates and owns its document session
- Deliverable summaries: versioned AI summaries generated from all approved deliverables

### Pre-2026-04-09
- Word/Excel deliverable generation added for all three agents
- Demo SOW: B Star Chemetics MEG Transfer Pump Skid (Sarnia, Ontario)
- `projects_store.json` holds runtime project data — gitignored (25MB, regenerated at runtime)

---

## Known Issues / Next Steps

- Agents are stateless — re-running overwrites previous output (no versioning within a run)
- No streaming output from agents — UI shows spinner until subprocess completes
- RAG citations in `process_output.json` and `mechanical_output.json` not yet shown in Dashboard UI
