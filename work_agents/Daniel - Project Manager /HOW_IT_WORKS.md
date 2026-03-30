# PM Agent — How It Works

## Input
A SOW file (`.docx`, `.txt`, or raw text string) + a project end date.

## What It Does

**Step 1 — Load catalog**
Reads `catalog.json` (in `work_agents/`), which is the routing map built from Daniel's real documents via `build_catalog.py`. The catalog defines what project types exist and what documents each type requires.

**Step 2 — Parse the SOW**
Sends the full SOW text to Gemini. Extracts structured parameters:
- Client, project title, location
- Equipment type, fluid name
- Flow rate, pressures, temperature, static heads
- Special requirements

**Step 3 — Match project type**
Compares the extracted equipment keywords against catalog triggers.
Example: "horizontal centrifugal pump" → matches `centrifugal_pump` project type.

**Step 4 — Evaluate risk flags**
Checks extracted SOW data against each flag's keywords and numeric thresholds:
- "brine" / "corrosive" → fires `corrosive_fluid` flag
- design pressure > 10 bar → fires `high_pressure` flag

For each fired flag, queries RAG for relevant company standards.
Fired flags add extra documents to the register (e.g. `4-SPC-0001` for corrosive service).

**Step 5 — Build document register**
Takes required docs from the catalog for the matched project type, adds any extras from fired flags, calculates planned due dates by counting backwards from the project end date using each doc's `weeks_before_end`.

**Step 6 — Show thinking chain**
Displays all steps above to the user before writing anything:
1. SOW analysis — extracted parameters
2. Catalog match — which project type and why
3. Risk analysis — fired flags + RAG findings
4. Proposed document register — full table with owners, dates, dependencies

**Step 7 — Human confirmation**
User types `yes` or `no`. Nothing is written until confirmed.

**Step 8 — Generate handoff brief**
On confirmation, Gemini writes a professional plain-English brief covering:
- Project overview
- What Process Engineer needs to do
- What Mechanical Engineer needs to do (and what they wait for)
- Risk flag engineering implications
- Key milestone dates

## Outputs
| File | Purpose |
|------|---------|
| `project_context.json` | Machine-readable handoff — read by Process Agent |
| `handoff_brief.md` | Human-readable brief — who does what and why |

## Files Used
| Source | How used |
|--------|---------|
| `catalog.json` | Routing — which docs to produce for which project type |
| RAG (ChromaDB) | Content queries for fired risk flags |
| `project_context.json` | Written as output |

> `catalog.json` is itself built from Daniel's documents (filled Document Register, agent templates) via `build_catalog.py`. Re-run that script when new project types or documents are added.

## Usage
```bash
# With a real SOW file
python "work_agents/Daniel - Project Manager /pm_agent.py" --sow path/to/sow.docx --end-date 2026-08-01

# With the built-in demo SOW
python "work_agents/Daniel - Project Manager /pm_agent.py" --demo --end-date 2026-08-01

# JSON output only (no confirmation prompt)
python "work_agents/Daniel - Project Manager /pm_agent.py" --demo --end-date 2026-08-01 --json
```
