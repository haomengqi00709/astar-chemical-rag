# Wiki Knowledge Base — Progression

Last updated: 2026-04-18

---

## Overview

The wiki KB is a second-tier knowledge system on top of ChromaDB. It converts source documents into interlinked Markdown wiki pages, builds a graph of `[[wiki links]]`, and provides an agentic query interface that navigates the wiki like a human expert.

There are two pipelines:
- **Standard** (`wiki_kb/`) — AK Chemetics engineering documents, built once
- **User projects** (`user_projects/:id/wiki/`) — per-project wiki, built on demand

---

## Pipeline

```
Source docs (raw/)
    → build_index.py       — parse docs, generate wiki pages with [[links]] and frontmatter
    → wiki/*.md            — one page per document/section
    → Index.md             — hierarchical index of all pages
    → db/engineering.db    — SQLite tables extracted from LST docs
    → ask.py / ask_generic.py — agentic query over wiki + SQL
```

---

## Wiki Page Format

Each `.md` file has YAML frontmatter:
```yaml
---
slug: 5-LST-0003_piping_service_list
title: Piping Service List
source_doc: 5-LST-0003
doc_type: LST
discipline: 5
discipline_name: Piping & Layout
source_folder: List
track: A
---
```

Body contains `[[wiki links]]` to related pages. Links are parsed by the graph API to build the knowledge graph.

---

## Query Agents

### `ask.py` — Standard knowledge base
- Used by `/api/wiki/query` for the Library Standard section
- Model: `gemini-2.5-flash`
- Tools: `get_wiki_index`, `search_wiki_in_category`, `search_wiki`, `get_wiki_page`, `follow_link`, `query_table`, `list_sql_tables`
- Agent reads `Index.md` first, then navigates pages following links as needed
- Returns answer with cited sources

### `ask_generic.py` — User project knowledge bases
- Used by `/api/user-projects/:id/query`
- Identical to `ask.py` except system prompt has no engineering/discipline assumptions
- `WIKI_KB_ROOT` env var set to the project directory at runtime

### Rate Limit Handling
- Both scripts use `_generate_with_retry()` with:
  - `max_retries = 3`
  - Delay = API-suggested `retryDelay` value + 2s buffer (up to 120s max)
  - Previously capped at 15s — too short for Gemini's suggested 35s+ delays, causing consistent failures

---

## Graph API

Two endpoints build knowledge graphs from `[[wiki links]]` in markdown files:

| Endpoint | Source | Used by |
|---|---|---|
| `GET /api/wiki/graph` | `wiki_kb/wiki/*.md` | Library Standard Knowledge Graph |
| `GET /api/user-projects/:id/graph` | `user_projects/:id/wiki/*.md` | Per-project Knowledge Graph |

Nodes carry: `id`, `title`, `discipline`, `doc_type`, `source_folder`, `source_doc`, `degree`

Graph is cached in memory (rebuilt hourly for standard, on-demand for user projects).

---

## Changes Log

### 2026-04-18
- `ask.py`: retry delay changed from `min(suggested, 15)` → `min(suggested + 2, 120)` — fixes consistent "Wiki query failed" errors on large wikis
- `ask.py`: `max_retries` increased 1 → 3
- `server.js`: quota errors (429/RESOURCE_EXHAUSTED in stderr) now return friendly message instead of generic "Wiki query failed"
- `ask_generic.py`: added as domain-agnostic version of `ask.py` for user project queries

### Pre-2026-04-09
- `build_index.py`: generates wiki pages from source documents with frontmatter + [[wiki links]]
- `Index.md` generation: hierarchical index organized by discipline
- SQLite DB built from LST tables for structured queries
- Per-project wiki pipeline wired into user project creation flow
- LibreOffice added as dependency for `.doc` → `.docx` conversion before parsing

---

## Known Issues / Next Steps

- Standard wiki has 3,251 pages — large `Index.md` (29KB) is read on every query, consuming significant tokens
- No incremental rebuild — adding one document requires full pipeline re-run
- `ask.py` uses synchronous retries — a 35s rate-limit pause blocks the HTTP request thread
- User project wiki quality depends on source document format (PDFs with complex layouts may parse poorly)
