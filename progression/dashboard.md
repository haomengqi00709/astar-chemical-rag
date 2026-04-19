# Dashboard — Progression

Last updated: 2026-04-18

---

## Overview

The Dashboard is the primary workspace for engineering project execution. Users select a role (PM / Process Engineer / Mechanical Engineer), run AI agents, review outputs, and approve deliverables.

---

## Project Lifecycle

```
SOW input → PM Agent → Process Agent → Mechanical Agent → Deliverable Review → Add to Library
```

Each stage is gated — Process agent unlocks after PM docs are approved, Mechanical after Process.

---

## Key Components

### Project Card (`ProjectCard`)
- Completion percentage bar (approved docs / total docs)
- Pipeline status indicators: PM / Process / Mechanical (pending / in_progress / done)
- Role-based session management — each role gets its own document session

### Project Detail View (`ProjectDetailView`)
- Document register grouped by role (PM / Process / Mechanical)
- Each doc row shows status badge (pending / in_progress / under_review / approved)
- Expandable extra content per doc type:
  - `CAL` docs → calc sheet panels (Process CAL: `ProcessStepsPanel`, Mechanical CAL: `PumpCalcPanel`)
  - Other docs → inline markdown viewer

### Deliverable Summaries
- "Summarize Deliverables" button calls `/api/projects/:id/summarize-deliverables`
- Generates a versioned AI summary of all approved deliverables
- Each version stored in `project.deliverable_summaries[]`
- Can be downloaded as `.md` or exported as `.docx`
- Version history shown in expandable list

### Add to Reference Library
- "Build Reference Wiki" button on completed projects
- Calls wiki pipeline to generate wiki pages from project deliverables
- Once built, project appears in Library → Reference Projects as a full `UserProjectView`

---

## Role-Based Access

| Role | Can see | Can edit |
|---|---|---|
| PM | All docs | PM deliverables only |
| Process Engineer | PM + Process docs | Process CAL |
| Mechanical Engineer | Process + Mechanical docs | Mechanical CAL |

- Each role has a separate "session" — documents released by one role become readable by others
- Calc sheets are read-only for non-owner roles

---

## Changes Log

### 2026-04-18 (recent sessions)
- Deliverable Summaries feature: versioned AI summaries with .md/.docx download
- "Add to Reference Library" flow: completed projects can be built into wiki and shown in Library
- Pipeline error details surfaced in UI (stderr from agent subprocess shown to user)
- Per-role session generation — each role gets isolated document access

### Pre-2026-04-09
- Pump calc sheet: INPUT / CALC / OUTPUT structure, expandable formula rows
- Process calc sheet: same structure
- Doc status workflow: pending → in_progress → under_review → approved
- Project completion % based on approved docs
- Removed: Handoff Brief, Process Results, Mechanical Results standalone panels (merged into calc sheets)

---

## Known Issues / Next Steps

- `buildRefStatus` polling is manual (user clicks refresh) — could be made automatic
- Deliverable summary export to `.docx` requires server-side Python (LibreOffice path)
- No diff view between deliverable versions yet
