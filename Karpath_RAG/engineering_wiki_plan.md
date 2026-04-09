# Engineering Document Intelligence System — Architecture Plan

## What This Is

A self-service knowledge base platform for engineering project documents.
Each client uploads their project files → the system automatically builds a structured wiki + SQL database → users and agents can query it to check what exists, what's missing, and whether designs comply with standards.

This is **independent** from the existing agent system (Daniel/Aria/Hunter). The agent system is catalog-driven and produces deliverables. This system is a document database that anything can query.

---

## Core Distinction from Standard RAG

| | Current RAG | This System |
|---|---|---|
| Storage | Vector embeddings | Wiki pages + SQL tables |
| Retrieval | Semantic similarity | Agent navigation + WikiLinks + SQL |
| Tabular data | Chunked rows (poor) | SQL queries (exact) |
| New document added | Re-embed everything | Compile that file only |
| Explainability | "Top-k chunks" | "Read these pages, followed these links" |
| Client self-service | No | Yes — drop files, system rebuilds |

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                    INPUT                        │
│  Client uploads: .doc .docx .xls .xlsx .pdf     │
│  Folder structure preserved (0-9 disciplines)   │
└─────────────────┬───────────────────────────────┘
                  │
            ingest.py
                  │
     ┌────────────┴────────────┐
     │                         │
     ▼                         ▼
raw/narrative/*.md         raw/tables/*.csv
(Procedure, Spec text)     (List, Spec rows)
     │                         │
     ▼                         ▼
 Agent 1                   sql_loader.py
(corpus analysis)               │
     │ corpus_map.json          ▼
     ▼                     SQLite / DuckDB
 Agent 2                   (queryable tables)
(four-phase compile)
     │
     ▼
wiki/*.md + Index.md
     │
     ▼
 Agent 3
(review + lint)
     │
     ▼
┌─────────────────────────────────────────────────┐
│                  QUERY LAYER                    │
│  ask.py — agent navigates wiki + queries SQL    │
└─────────────────────────────────────────────────┘
```

---

## Two Tracks (Always Run Together)

### Track A — Narrative → Wiki
For: Procedure (PRC), Specification text sections, policy content

**What gets compiled:**
- What this document covers
- What requirements it imposes (must/shall)
- What other documents it references
- WikiLinks to related pages

**Output:** `wiki/*.md` pages, one focused topic per page

---

### Track B — Tables → SQL
For: List (LST) files, Specification row data, Datasheet fields

**What gets loaded:**
- Full table rows preserved exactly
- Column names normalized
- Doc ID, discipline, revision tracked per row

**Output:** SQL tables, queryable by agent via `query_table(doc_id, filters)`

**Why not wiki for tables:**
A row like `[AA | Air, Atmospheric | Scope A | dilution air]` belongs in SQL.
A wiki page describing "what 1-LST-0002 contains and how to use it" belongs in the wiki.
Both are needed.

---

## Ingest Layer (`ingest.py`)

Reads source files and routes them:

```
File comes in
    │
    ├─ .doc / .docx → extract text by heading → raw/narrative/{discipline}/{doc_id}.md
    ├─ .pdf         → extract text + annotations → raw/narrative/{discipline}/{doc_id}.md
    └─ .xls / .xlsx →
            ├─ if doc_type is LST or row-structured SPC → raw/tables/{doc_id}.csv
            └─ if doc_type is template DST              → raw/narrative/{discipline}/{doc_id}.md
```

**Metadata captured per file:**
```json
{
  "doc_id": "5-LST-0003",
  "doc_type": "LST",
  "discipline": 5,
  "discipline_name": "Piping & Layout",
  "source_folder": "List",
  "revision": "R2",
  "track": "B"
}
```

---

## Agent 1 — Corpus Analysis

Reads all files in `raw/` and produces `corpus_map.json`:

```json
{
  "disciplines": {
    "5": {
      "name": "Piping & Layout",
      "files": ["5-LST-0003", "5-LST-0004", "5-SPC-CS6", ...],
      "track_a_files": ["5-SPC-0004"],
      "track_b_files": ["5-LST-0003", "5-LST-0003-1", "5-LST-0003-2"],
      "notes": "Piping spec files group naturally by material: CS, SS, FRP, special alloy"
    }
  },
  "cross_references": [
    {"from": "5-LST-0003", "to": "1-LST-0002", "reason": "references fluid codes"}
  ]
}
```

Agent 1 also identifies:
- Which Spec files should be sub-grouped (e.g. 5-SPC-CS* vs 5-SPC-S*)
- Which files reference each other (becomes WikiLink candidates)
- Which files are templates vs filled data

---

## Agent 2 — Four-Phase Compilation (Track A only)

Handles the "lost in the middle" and context overflow problems.

```
Phase 1a — Extract (isolated session)
  Read raw file in 10,000-char chunks
  Output: compact bullet-point fact list

Phase 1b — Verify extraction (new isolated session)
  Re-read raw file + Phase 1a output
  Find missed facts
  Output: enriched fact list (only adds, never removes)

Phase 2a — Write wiki pages (new isolated session)
  Receive only the compact fact list
  Group facts by topic → one wiki page per topic
  Output: multiple focused wiki pages with WikiLinks

Phase 2b — Verify coverage (new isolated session)
  Read Phase 1b fact list + all pages from 2a
  Identify facts not captured in any page
  Fill gaps
```

**Why isolated sessions:** each phase starts with a clean context window — no accumulated tool call history from previous reads.

---

## Wiki Page Structure

Every wiki page follows this format:

```markdown
---
slug: piping_service_classification
doc_id: 5-LST-0003
discipline: 5
discipline_name: Piping & Layout
source_folder: List
track: A
---

# Piping Service Classification

## What This Covers
Classification of piping services by fluid type, pressure class,
and corrosion allowance requirements.

## Key Facts
- Each service class defined by: fluid code, design pressure, temperature, material
- Corrosion allowance: 1.5mm standard, 3.0mm for corrosive services
- High-pressure services (>150 kPa) require additional wall thickness review

## Requirements (must/shall)
- All piping must be assigned a service class before detailed design [5-LST-0003]
- Corrosive fluid services shall use corrosion allowance from [[corrosion_allowance_standards]]

## Related Documents
- Fluid codes: [[fluid_code_definitions]] (1-LST-0002)
- Corrosion data: [[corrosion_allowance_standards]] (5-LST-0004)
- Material selection: [[piping_material_spec_overview]] (5-SPC-0004)

## What's in the SQL Table
Table `5_LST_0003` — columns: service_class, fluid_code, design_pressure_kpa,
design_temp_c, corrosion_allowance_mm, material_class, notes
Query via: query_table("5-LST-0003", filters)
```

---

## Index Structure

One-level hierarchy by discipline. Agent reads this first.

```markdown
# Engineering Knowledge Base — Index

## 0 Administration
_Project management procedures, document control, change management._
Procedure: 0-PRC-0001, 0-PRC-0002, 0-PRC-4003
List: 0-LST-0001 (Document Register template)

## 1 Process Technology
_Process design criteria, P&ID approval procedures, fluid code definitions._
Procedure: 1-PRC-0001 (Design Criteria), 1-PRC-0002 (Flowsheet), 1-PRC-0003 (P&ID)
List: 1-LST-0002 (Fluid Codes) → SQL table available

## 4 Equipment
_Equipment specifications and datasheet templates._
Specification: 4-SPC-0001 (General Equipment), 4-SPC-0002 (Centrifugal Pump)
Datasheet templates: Pump, Heat Exchanger, Vessel, Agitator, ... (30+ templates)

## 5 Piping & Layout
_Piping service classifications and material specifications._
List: 5-LST-0003 (Piping Services) → SQL table available
Specification by material:
  Carbon Steel: 5-SPC-CS4, CS6, CS7, CS9, CS11, CS12, CS14, CS15, CS16, CS17
  Stainless Steel: 5-SPC-S42, S43, S63, S65, S12, S20, S23, S35
  FRP: 5-SPC-FR5, FR22
  Special: 5-SPC-NI1

## 8 Instrumentation & Control
_Control system design, alarm lists, instrument specifications._
Procedure: 8-PRC-0002, 8-PRC-0004
List: 8-LST-0101 → SQL table available

## 9 Electrical
_Electrical equipment and cable lists._
List: 9-LST-0001 → SQL table available

---
_Missing: Disciplines 2 (Civil) and 3 (Structural) — files not uploaded._
```

---

## Query Agent Tools

```python
get_wiki_index()
# Returns Index.md — agent reads this first to find relevant discipline/category

search_wiki_in_category(discipline: int, query: str)
# Searches wiki pages within a discipline using keyword match

get_wiki_page(slug: str)
# Reads a specific wiki page — main navigation tool

follow_link(slug: str)
# Follows a [[WikiLink]] found in a page — agent decides when to use this

query_table(doc_id: str, filters: dict)
# Runs SQL against Track B tables — returns rows as text
# e.g. query_table("1-LST-0002", {"fluid_code": "AA"})

list_missing(discipline: int | None)
# Compares uploaded files against expected document types
# Returns: what's missing, what's template-only, what has real data

done(answer: str)
# Returns final answer with sources cited
```

**Agent navigation flow:**
```
Question arrives
    ↓
get_wiki_index() — find relevant discipline
    ↓
search_wiki_in_category() — find relevant page
    ↓
get_wiki_page(slug) — read the page
    ↓
Decision:
  ├─ found a WikiLink worth following → follow_link(slug)
  ├─ page points to SQL table → query_table(doc_id, filters)
  ├─ need different angle → search_wiki_in_category() again
  └─ answer is complete → done(answer)
```

---

## Client Self-Service (Future State)

When a client uploads new project documents:

```
1. ingest.py runs on new files
2. Agent 1 updates corpus_map.json (incremental — only new files)
3. Agent 2 compiles only new files into wiki pages
4. sql_loader.py loads new table files
5. build_index.py regenerates Index.md
6. Agent 3 lints for broken links or contradictions
```

User can then ask:
- "What documents do I have in Piping?"
- "I uploaded 5-LST-0003 — what data is in it?"
- "What am I missing for a pump skid project?"
- "Does my corrosion allowance comply with the standard?"

---

## File Structure

```
project_root/
├── raw/
│   ├── narrative/{discipline}/{doc_id}.md   — parsed text sections
│   └── tables/{doc_id}.csv                 — extracted table rows
│
├── wiki/
│   ├── Index.md                            — one-level hierarchy index
│   └── *.md                               — compiled wiki pages (one topic per file)
│
├── db/
│   └── engineering.db                     — SQLite, all Track B tables
│
├── corpus_map.json                         — Agent 1 output
├── compile_status.json                     — tracks compiled/pending/skipped
├── wiki_index.json                         — slug → discipline mapping
│
└── src/
    ├── ingest.py                           — parse files → raw/
    ├── sql_loader.py                       — raw/tables/*.csv → SQLite
    ├── agent_corpus.py                     — Agent 1
    ├── agent_compile.py                    — Agent 2 (four-phase)
    ├── agent_review.py                     — Agent 3 (lint)
    ├── build_index.py                      — generate Index.md
    ├── ask.py                              — query agent
    └── orchestrator.py                     — pipeline driver
```

---

## Build Sequence

```bash
# 1. Parse source documents
python src/ingest.py --source drive-download-*/

# 2. Analyse corpus
python src/agent_corpus.py

# 3. Load tables into SQL
python src/sql_loader.py

# 4. Compile wiki (Track A)
python src/orchestrator.py --compile

# 5. Build index
python src/build_index.py

# 6. Review and lint
python src/agent_review.py

# 7. Query
python src/ask.py "What are the corrosion allowance requirements for brine service?"
```

---

## Known Gaps in Current Source Data

| Gap | Impact | Fix |
|---|---|---|
| Discipline 2 (Civil), 3 (Structural) missing | No wiki pages, no SQL | Client uploads files |
| Most List files are templates (no real data) | SQL tables mostly empty | Client uploads filled versions |
| Only 4 Procedure files parsed | Wiki thin on compliance rules | Upload remaining 62+ Procedure docs |
| 0-Administration Procedure folder (62 files) not parsed | Missing project mgmt rules | Include in ingest |

---

## What This Is Not

- Not a replacement for the agent system (Daniel/Aria/Hunter)
- Not a document management system (no versioning, no access control)
- Not a compliance decision engine on its own — it provides evidence, agents reason over it
