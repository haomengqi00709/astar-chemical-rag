# Project Progress

## Status: Deployed — Pending End-to-End Verification
Last updated: 2026-03-30

---

## Web UI + Deployment (Phase 2)

### Deployment
- [x] GitHub repo: https://github.com/haomengqi00709/astar-chemical-rag
- [x] Docker image: ghcr.io/haomengqi00709/astar-chemical-rag:latest (built via GitHub Actions)
- [x] GitHub Actions: auto-builds on push to main — embeds chroma_db at build time using GOOGLE_API_KEY secret
- [x] Railway: live at astar-chemical-rag-production-1802.up.railway.app (port 8080)
- [ ] **TODO:** Verify end-to-end — create new project → run PM → Process → Mechanical agents

### Dashboard — Project Detail View
- [x] Project Files section (full-width, bottom) — docs grouped by role (PM / Process / Mechanical)
- [x] PumpCalcPanel inside Mechanical CAL DocRow extraContent
- [x] ProcessStepsPanel inside Process CAL DocRow extraContent
- [x] Removed: Handoff Brief, Process Results, Mechanical Results panels

### Calc Sheets
- [x] Pump calc sheet: INPUT / CALC / OUTPUT structure (matches Excel template)
- [x] Expandable formula rows — chevron reveals how each variable was calculated
- [x] Editable notes + AI chat for the document owner
- [x] Read-only view for cross-role access
- [x] Gate 1 fix — mechanical engineer can view/edit their own calc before publish

### Library Page
- [x] Standard section: discipline list (collapsible)
- [x] Reference Projects section: completed projects as indented children (collapsible hierarchy)
- [x] ProjectRefView: project files grouped by role with inline doc viewer

### Branding & Demo
- [x] Company name → A Star Chemical (Sidebar + SignIn)
- [x] Demo SOW → B Star Chemetics MEG Transfer Pump Skid (Sarnia, Ontario)
- [x] "Use Demo" button wired to B Star Chemetics SOW
- [x] Removed all visible AI model references (Gemini, etc.)

---

---

## Completed

### XLS Parser (`parse_xls.py`)
- Parses all `.xls` / `.xlsx` files from **List and Procedure** folders across all disciplines (0–9)
- Outputs `parsed_chunks.json` and `llm_review_queue.json` to project root
- Each chunk carries: `doc_id`, `doc_type`, `discipline`, `discipline_name`, `source_folder`, `revision`, `is_template`, `needs_llm_review`

**What works:**
- Cover page / signature sheet detection and skipping
- Multi-row header merging (avg cell length threshold)
- Partial key matching in `_get()` handles column name variations
- Fluid Codes (1-LST-0002): clean output
- Piping Service Lists (5-LST-0003-x): clean output

**Known limitations:**
- `row_to_text()` partially hardcoded per doc ID — deferred refactor to config-driven
- Line List (5-LST-0001): template only, no real data
- Alarm Interlocks (8-LST-0103): template only, 0 chunks
- ~79% flagging rate — mostly legitimate (template files with empty cells)

**Output:** ~8,700 chunks

---

### DOC Parser (`parse_doc.py`)
- Parses all `.doc` / `.docx` files from **List and Procedure** folders across all disciplines (0–9)
- Converts legacy `.doc` → `.docx` via LibreOffice before parsing
- PRC/SPC files: section-heading chunking (Heading 1/2 styles)
- LST `.doc` files: table extraction, falls back to paragraph extraction
- HOLD files skipped, duplicate revisions filtered (highest R-number kept)
- Merges output into `parsed_chunks.json` alongside XLS chunks

**What works:**
- 2,805 chunks, 0 errors
- `is_constraint` flag (must/shall/>/<) on every PRC section chunk
- Revision history tables correctly skipped
- Control Logic (1-LST-0003): table rows extracted
- Electrical checklists (9-LST-07xx): checklist items extracted

---

### PDF Parser (`parse_pdf.py`)
- Parses `.pdf` files in List and Procedure folders across all disciplines
- Deduplicates against already-parsed `.doc` files (skips PDFs with same doc_id unless filename contains "comment")
- Skips PDFs with no standard doc_id (stamps, diagrams, flow diagrams)
- Body text → section chunks (`authority: Standard`), font-size-based heading detection (85th percentile threshold)
- Annotations → separate chunks (`authority: Human_Comment`) — preserved for context but excluded from compliance decisions

**Results (0 errors):**
- 2 skipped (no doc_id): Vendor Stamp, Flow Diagram
- 4 parsed: 1-PRC-0002, 1-PRC-0003 (comments), 8-PRC-0002, 8-PRC-0004
- 48 PDF chunks total: 36 body sections + 12 annotations
- `1-PRC-0003 comments.pdf` unique value: 8 human annotations from Daniel

**Output:** 8,785 total chunks in `parsed_chunks.json` (XLS + DOC + PDF merged)

---

### LST Enrichment (`enrich_lst.py`)
- LLM rewrites each LST table row into natural language — one chunk per row preserved
- Uses Gemini in batches of 20 rows per call
- Saves `original_text` in metadata as backup before overwriting
- Re-running is safe — already-enriched chunks are skipped (detected via `original_text` field)
- 3,500 chunks enriched total (181 fluid codes + 3,319 remaining LST rows)

**Before enrichment:**
```
Fluid code [AA] represents fluid [Air, Atmospheric], scope [A], technology [], comments [Also dilution air].
```
**After enrichment:**
```
Fluid code AA identifies Air, Atmospheric service. It is within project scope (classification A) and is selected as WA service. Also used as dilution air.
```

---

### Vector Store (`load_vectorstore.py`)
- Embeds all chunks using `gemini-embedding-001` via Google Gemini API
- Stores in local ChromaDB collection (`compliance_docs`) at `./chroma_db/`
- Cosine similarity distance, full metadata preserved per chunk
- Empty-text chunks filtered before embedding (954 skipped)
- Rate-limit handling: auto-retries with delay parsed from 429 response
- Defaults missing `authority` field to `Standard` (fixes XLS/DOC chunks being excluded)

**Critical bug fixed:** XLS and DOC chunks had no `authority` field — the `where={'authority': 'Standard'}` filter was silently excluding all 8,700+ XLS chunks from every search. Fixed by defaulting to `Standard` in `clean_metadata()`.

**Results:**
- 7,843 chunks indexed
- Batch size: 50 (stays within 3,000/min quota)

---

### RAG Query Pipeline (`query.py`)
- Embeds question with `gemini-embedding-001` (`RETRIEVAL_QUERY` task type)
- Retrieves top-8 `authority: Standard` chunks + top-3 `authority: Human_Comment` chunks
- Builds structured prompt with document references
- Generates answer with `gemini-2.5-flash` at temperature 0.2
- CLI filters: `--discipline`, `--source procedure/list`, `--no-comments`, `--top-k`

---

### Unified Agentic Pipeline (`agent.py`) — primary interface
- **Query decomposition**: Gemini breaks question into up to 5 focused sub-questions
- **Multi-retrieval**: runs vector search independently for each sub-question
- **Doc-ID following**: detects doc_id references in retrieved chunks, fetches those docs directly from ChromaDB
- **Source map**: shows each document used — which sub-questions retrieved it, chunk count, constraint count, whether fetched via reference
- **Skills integrated**: Gemini automatically calls calculation skills when numerical inputs are provided
- **Slash commands**: `/skill_name` forces a specific skill; AI extracts parameters from natural language input
- Same CLI filters as `query.py` plus `--verbose`

**Three usage modes:**
1. Natural text question → text answer (no numbers provided)
2. Natural text with numbers → AI auto-calls the appropriate skill
3. `/skill_name <input>` → forces that specific skill

**Slash command routing:** Prompt instruction forces the named tool (e.g. `"INSTRUCTION: You must call check_corrosion_allowance..."`). `tool_config` mode='ANY' was avoided — it conflicts with `automatic_function_calling` and causes None responses.

---

### Calculation Skills (`skills/`)
- One file per skill; `skills/__init__.py` aggregates `TOOLS` list for Gemini function calling
- `calc_agent.py` is a simpler standalone version (kept for reference; `agent.py` is the primary interface)

**Skills implemented:**

| Slash command | File | What it checks |
|---|---|---|
| `/corrosion_allowance` | `corrosion_allowance.py` | rate × life vs required allowance from 5-LST-0003 |
| `/fluid_scope` | `fluid_scope.py` | fluid code scope classification from 1-LST-0002 |
| `/pressure_test` | `pressure_test.py` | test pressure vs 1.5× (hydro) or 1.1× (pneumatic) design pressure |

**Adding a new skill:** create a file in `skills/`, define one function with type hints + docstring, add import to `skills/__init__.py`. It will appear automatically in `/help`.

---

### Evaluation (`evaluate.py`)
- 10 test questions across Easy / Medium / Hard / Gap test categories
- Runs simple pipeline by default; `--use-agent` for agentic pipeline
- Saves full results with answers, source maps, retrieval checks to `evaluation_results.md`

**Scores — Simple pipeline, 2026-03-27:**

| Q | Difficulty | Question (short) | Result | Notes |
|---|---|---|---|---|
| Q01 | Easy | P&ID approval stages | HIT | 1-PRC-0003 |
| Q02 | Easy | Process flowsheet procedure | HIT | 1-PRC-0002 |
| Q03 | Easy | Control system design requirements | HIT | 8-PRC-0004 |
| Q04 | Medium | Fluid codes and meanings | HIT | 1-LST-0002 |
| Q05 | Medium | Piping service classifications | HIT | 5-LST-0003 |
| Q06 | Medium | Instrument & control design criteria | HIT | 8-PRC-0002 |
| Q07 | Hard | New heat exchanger — docs & approvals | PARTIAL | Got 1-PRC-0003, missed 1-PRC-0002 |
| Q08 | Hard | Client change to valve spec — process | MISS | Expected 1-PRC-0003, not retrieved |
| Q09 | Hard | Butterfly valve in toxic service | PARTIAL | Got 5-LST-0003 + 1-LST-0002, missed 1-PRC-0003 |
| Q10 | Gap | Civil & structural foundation requirements | GAP TEST | Correct — disciplines 2 & 3 missing from dataset |

**Score: 8/10** (6 full HITs, 2 PARTIALs, 1 MISS, 1 correct GAP). Full answers saved in `evaluation_results.md`.

**Note on Q08:** Earlier runs retrieved 0-PRC-4003 (change management appendix) and scored HIT. Current run misses 1-PRC-0003 MOC section — ranking varies by query phrasing.

---

### Skill Questions (`agent.py`)

**3 natural language — AI auto-picks skill, 2026-03-27:**

| Question | Skill called | Result |
|---|---|---|
| Brine feed pipe, rate 0.125mm/yr, life 20yr. Comply? | `check_corrosion_allowance` | COMPLIANT — 2.5mm = 2.5mm req (zero margin) |
| Is fluid code AA within our approved project scope? | `check_fluid_scope` | IN SCOPE — classification A from 1-LST-0002 |
| AVC vent pipe 200 kPa design, 280 kPa hydro test. OK? | `check_pressure_test` | NON-COMPLIANT — need 300 kPa min (1.5×), margin −20 kPa |

**3 slash commands — forced skill, 2026-03-27:**

| Command | Result |
|---|---|
| `/corrosion_allowance` brine pipe, 0.15mm/yr, 25yr | NON-COMPLIANT — 3.75mm calc > 2.5mm req, margin −1.25mm |
| `/fluid_scope` fluid code WC | Not found — WC not in 1-LST-0002 (correct behaviour) |
| `/pressure_test` AVC vent, 200 kPa design, 280 kPa hydro | NON-COMPLIANT — need 300 kPa min, margin −20 kPa |

---

## How Files Are Generated (Agentic Pipeline)

The system runs three agents in sequence. Each agent reads the previous agent's output, queries the RAG knowledge base (ChromaDB), and produces structured deliverables.

```
Client SOW (text)
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  PM Agent — Daniel (pm_agent.py)                    │
│  Input:  SOW text                                   │
│  RAG:    catalog.json (routing) + ChromaDB          │
│  Output: project_context.json                       │
│          deliverables/                              │
│            0-LST-0001.md  — Document Register       │
│            0-PRC-2003.md  — Project Execution Plan  │
│            0-DAT-3001_0.md — Project Schedule       │
└─────────────────────────────────────────────────────┘
      │  project_context.json
      ▼
┌─────────────────────────────────────────────────────┐
│  Process Agent — Aria (process_agent.py)            │
│  Input:  project_context.json                       │
│  RAG:    fluid codes (1-LST-0002), design criteria  │
│          pressure class, corrosion margins          │
│  Calcs:  TDH, NPSHa (Python maths)                  │
│  Output: process_output.json                        │
│          process_calc_summary.md                    │
│  UI:     populates Process CAL doc (1-CAL-xxxx)     │
│          structured as INPUT / CALC / OUTPUT        │
└─────────────────────────────────────────────────────┘
      │  process_output.json
      ▼
┌─────────────────────────────────────────────────────┐
│  Mechanical Agent — Hunter (mechanical_agent.py)    │
│  Input:  process_output.json                        │
│  RAG:    pump specs (4-SPC-0002, 4-PRC-0007),       │
│          material selection (5-LST-0003)            │
│  Calcs:  shaft power, motor sizing, specific speed, │
│          NPSH margin, API 610 motor margin          │
│  Output: mechanical_output.json                     │
│          pump_datasheet.md                          │
│  UI:     populates Pump CAL doc (4-CAL-0001)        │
│          structured as INPUT / CALC / OUTPUT        │
└─────────────────────────────────────────────────────┘
```

### What each output file contains

| File | Location | Contents |
|---|---|---|
| `project_context.json` | `work_agents/Daniel - Project Manager /` | Project metadata, doc register, scope, all PM deliverables embedded |
| `0-LST-0001.md` | `work_agents/Daniel - Project Manager /deliverables/` | Document Register — full list of deliverables per discipline |
| `0-PRC-2003.md` | `work_agents/Daniel - Project Manager /deliverables/` | Project Execution Plan |
| `0-DAT-3001_0.md` | `work_agents/Daniel - Project Manager /deliverables/` | Project Schedule |
| `process_output.json` | `work_agents/Aria - Process Engineer/` | Fluid props, TDH, NPSHa, design criteria flags, RAG citations |
| `process_calc_summary.md` | `work_agents/Aria - Process Engineer/` | Human-readable process calc narrative |
| `mechanical_output.json` | `work_agents/Hunter - Mechnical Engineer/` | Pump hydraulics, motor sizing, material specs, NPSH margin |
| `pump_datasheet.md` | `work_agents/Hunter - Mechnical Engineer/` | Filled pump datasheet (4-PDS equivalent) |

### How the UI consumes them

- **server.js** runs each agent as a Python subprocess, captures stdout/stderr
- Agent outputs are stored in `context.deliverables[docId]` keyed by document ID
- `buildCalcSheet()` maps `process_output.json` → structured calc sheet JSON (`_type: 'calc_sheet'`)
- `buildPumpCalcSheet()` maps `mechanical_output.json` → pump calc sheet JSON (`_subtype: 'pump_calc'`)
- Dashboard renders calc sheets as INPUT / CALC / OUTPUT tables with expandable formula rows
- All generated files are also shown in the **Project Files** section grouped by role

---

## Demo Commands

```bash
# Simple Q&A
python query.py "What are the PID approval stages?"

# Procedure-only vs procedure+list (client demo comparison)
python query.py "What fluid codes govern piping services?" --source procedure
python query.py "What fluid codes govern piping services?"

# Agentic — text answer with source map
python agent.py "What documentation is required when adding a new heat exchanger?" --verbose

# Agentic — AI auto-detects numbers and calls skill
python agent.py "My brine feed pipe has corrosion rate 0.125mm/yr and design life 20 years. Does it comply?"
python agent.py "Is fluid code AA within our approved project scope?"
python agent.py "My AVC vent pipe design pressure is 200 kPa, hydro test pressure 280 kPa. Does this meet requirements?"

# Slash commands — force a specific skill
python agent.py "/help"
python agent.py "/corrosion_allowance brine feed pipe, rate 0.15mm/yr, design life 25 years"
python agent.py "/fluid_scope fluid code WC"
python agent.py "/pressure_test AVC vent pipe, design pressure 200 kPa, hydro test 280 kPa"
```

---

## File Structure

```
RAG_first_system/
  parse_xls.py          — XLS parser
  parse_doc.py          — DOC/DOCX parser
  parse_pdf.py          — PDF parser
  enrich_lst.py         — LLM enrichment for LST row chunks
  load_vectorstore.py   — Embed + index into ChromaDB
  query.py              — Simple RAG query pipeline
  agent.py              — PRIMARY: unified agentic pipeline (decomposition + doc-id follow + skills + slash commands)
  calc_agent.py         — Standalone calculation agent (secondary; kept for reference)
  evaluate.py           — 10-question evaluation runner
  skills/
    __init__.py         — Aggregates all tools (TOOLS list passed to Gemini)
    corrosion_allowance.py   — /corrosion_allowance
    fluid_scope.py           — /fluid_scope
    pressure_test.py         — /pressure_test
  parsed_chunks.json    — All chunks (8,785)
  llm_review_queue.json — Chunks flagged for LLM review
  chroma_db/            — ChromaDB vector store (7,843 indexed)
  evaluation_results.md — Latest evaluation output
```

---

## Known Data Gaps

- `1-LST-0001` Battery Limits — template, no real values
- `1-PRC-0001` Process Design Criteria — template, no real values
- `4-LST-0001` Equipment List — template, no real values
- Alarm Interlocks / Instrument Process Data Lists — all templates
- No filled-in project-specific Line Lists or Equipment Lists in current dataset
- Missing disciplines 2 and 3 from the drive download
- `5-LST-0003` piping service data mostly sparse (many empty cells in source XLS)

---

## Decisions Made

| Decision | Rationale |
|---|---|
| Scope: List + Procedure folders only | Client requires Procedure only; List added for completeness. Datasheet + Specification deferred. |
| `source_folder` metadata on every chunk | Enables demo: procedure-only vs procedure+list comparison |
| LST enrichment via LLM | Row text too thin for semantic retrieval; enrichment improved medium-difficulty Q score from 1/3 to 3/3 |
| Authority defaulted to Standard for XLS/DOC | Bug fix — XLS chunks were silently excluded from all searches |
| One skill per file in `skills/` | Extensible — new skills added without touching agent code |
| ChromaDB local persistence | No server needed for demo; swap to managed DB for production |
| Gemini embedding + generation | Single API key, generous free tier, good quality for demo |
| `original_text` backup in metadata | Enrichment is reversible; original row text preserved |

---

## Next Steps (if proceeding to production)

- Web UI for client demo (Streamlit ~30 min)
- Re-run evaluation with agentic pipeline (`python evaluate.py --use-agent`)
- Add more calculation skills as needed (e.g. insulation thickness, line sizing)
- Managed vector DB (Pinecone / Qdrant) for production
- Auth layer if multi-user
