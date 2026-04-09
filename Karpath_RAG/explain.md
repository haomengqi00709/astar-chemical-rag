# AI Knowledge System – 7-Step Workflow

## Overview
This system automatically builds and maintains a structured knowledge base using an LLM.

The system consists of three layers:
- RAW (input data)
- WIKI (structured knowledge)
- SCHEMA (rules and behavior)

The LLM acts as the sole writer and maintainer of the WIKI layer.

---

## Step 1: Ingest (Input Processing)

When a new source is added to RAW:

1. Read the raw file in full
2. Identify core topics and concepts
3. Check if topics already exist in WIKI
   - If YES:
     - Update existing articles
     - Add backlinks
   - If NO:
     - Create new topic folder
     - Create new index and article
4. Generate:
   - Summary
   - Key takeaways
   - Related links
5. Update:
   - Topic index
   - Master index
   - Log entry

---

## Step 2: Structure (Wiki Construction Rules)

Every WIKI article must include:

- Title
- Source reference (path to RAW file)
- 2–4 sentence introduction
- Key Takeaways (bullet points)
- Related Articles (3–8 internal links)

Rules:
- Use lowercase hyphenated file names
- Use wiki-style internal links
- Prefer bullets over long paragraphs
- Never invent information

---

## Step 3: Query (Answering Questions)

When a user asks a question:

1. Read master index
2. Identify relevant topic
3. Read:
   - Topic index
   - 1–3 relevant articles
4. Synthesize answer using only WIKI content
5. Include references to sources

---

## Step 4: Synthesis (Knowledge Expansion)

If the answer is substantial:

1. Convert the answer into a new WIKI article
2. Add:
   - Summary
   - Key takeaways
   - Cross-links to related topics
3. Update:
   - Topic index
   - Master index

This ensures:
- Knowledge compounds over time
- No useful answer is lost

---

## Step 5: Linking (Graph Maintenance)

For every update:

- Add backlinks between related pages
- Ensure each article connects to 3–8 related topics
- Maintain a navigable knowledge graph

Goal:
- Maximize connectivity
- Avoid isolated pages

---

## Step 6: Lint (Health Check)

On lint or audit:

1. Scan all WIKI files
2. Detect:
   - Contradictions
   - Stale content
   - Missing links
   - Orphan pages
   - Unsourced claims
3. Generate report
4. Wait for approval before fixing
5. Apply fixes

---

## Step 7: Log (Traceability)

For every operation:

Append one line to log:

Format:
[date] [operation] [description] [files affected]

Rules:
- Append-only (never overwrite)
- Maintain full history of changes

---

## Core Principles

- RAW is immutable (source of truth)
- WIKI is fully maintained by the LLM
- Human should not manually edit WIKI
- All knowledge must be traceable to sources
- System must prioritize structure over volume

---

## Optional: Research Extension

If information is missing:

1. Search for high-quality sources
2. Save full content to research folder
3. Treat as RAW input
4. Run ingest process

---

## Goal

Create a self-improving knowledge system where:

- Input → structured knowledge
- Questions → new knowledge
- System → continuously evolves
