# Library Page — Progression

Last updated: 2026-04-18

---

## Overview

The Library page is the main interface for non-dashboard users. It has three sections in the left sidebar:

1. **Standard** — AK Chemetics engineering knowledge base (Query / Knowledge Graph / All Documents)
2. **Reference Projects** — completed or user-uploaded projects
3. **User Projects** — custom RAG projects uploaded by users (Start New flow)

---

## Components

### Standard Section
- **Query tab** — chat interface against the AK Chemetics wiki via `/api/wiki/query` → `ask.py`
- **Knowledge Graph tab** — renders `KnowledgeGraph` component pointed at `/api/wiki/graph`
- **All Documents tab** — discipline-grouped document browser with inline viewer

### Reference Projects Section
- Lists all completed agent projects (from Dashboard) and user-uploaded projects
- "Add Reference Project" button opens `CreateProjectView` (same as Start New flow)
- Clicking a completed project opens `CompletedProjectView` or `UserProjectView` (if wiki already built)

### User Project View (`UserProjectView`)
- Three-tab layout: **Chat** / **Files** / **Knowledge Graph**
- Chat: queries project wiki via `/api/user-projects/:id/query` → `ask_generic.py`
- Files: shows wiki pages (falls back to source files if no wiki built yet)
- Knowledge Graph: renders `KnowledgeGraph` pointed at `/api/user-projects/:id/graph`

---

## Knowledge Graph Color Modes

The `KnowledgeGraph` component auto-detects color mode from the data:

| Mode | Trigger | Legend shows |
|---|---|---|
| `discipline` | Any node has `discipline >= 0` | Hardcoded AK Chemetics discipline names |
| `source` | All nodes have `discipline = -1` | Source document filenames from `source_doc` field |

- **Standard library graph** → discipline mode (AK Chemetics wiki files have discipline metadata)
- **User project graph** → source mode (user-uploaded files default to `discipline: -1`)
- `forceColorMode` prop available on `KnowledgeGraph` to override auto-detection

---

## Changes Log

### 2026-04-18
- **Knowledge Graph expand button** — changed from `position: fixed` (full viewport) to `position: absolute` relative to `<main>` container, so sidebar stays visible. `<main>` given `position: relative` in Library.tsx.
- **Expand/minimize icon** — `Maximize2` toggles to `Minimize2` when expanded.
- **Discipline coloring restored** — removed `forceColorMode="source"` from standard library graph (was accidentally overriding discipline mode).
- **"Add Reference Project" visible to all users** — removed `isAdmin` guard so demo users can upload projects.

### 2026-04-09 → 2026-04-15
- Added 3-tab layout (Chat / Files / Knowledge Graph) to user project view
- Files tab falls back to source files when wiki not yet built
- "Add to Reference Library" button wires completed Dashboard projects into Library
- Per-project wiki graph API (`/api/user-projects/:id/graph`)
- Knowledge graph added to every project view
- `KnowledgeGraph` component refactored: source vs discipline color mode, pan/zoom, node sidebar

---

## Known Issues / Next Steps

- Standard wiki query (`ask.py`) can hit Gemini rate limits on large wikis — retry logic in place (max 3 retries, respects API-suggested delay up to 120s)
- `forceColorMode` prop exists but currently unused — may be needed if future data sources mix discipline and non-discipline nodes
