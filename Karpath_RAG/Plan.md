# Agentic Wiki System — Architecture & Execution Plan

## What This Is

A document intelligence system that converts raw documents (PDFs, reports, policies) into a structured, navigable wiki knowledge base, then answers questions by letting an LLM navigate the wiki like a human expert would navigate Wikipedia.

This is fundamentally different from RAG (Retrieval-Augmented Generation):

| | RAG | Agentic Wiki |
|---|---|---|
| Knowledge storage | Vector embeddings | Structured wiki pages |
| Retrieval | Semantic similarity search | LLM navigation + wikilinks |
| Setup cost | Parse → chunk → embed → index | Parse → compile |
| User injection | Re-embed everything | Drop file → compile |
| Reasoning | Single-shot over retrieved chunks | Multi-step navigation |
| Explainability | "Top-k chunks" | "Read these pages, followed these links" |

Inspired by Andrej Karpathy's wiki compilation method.

---

## Core Design Principles

### 1. LLM as Compiler, Not Retriever
The LLM reads raw documents and compiles them into structured knowledge — not just indexes them. This means the LLM does the hard work of understanding, synthesizing, and organizing information upfront, so that query-time reasoning is fast and grounded.

### 2. Agentic Throughout
Every stage uses agentic LLM loops (ReAct: Thought → Tool call → Observation → repeat), not fixed pipelines. Agents decide:
- How many chunks to read
- Which topics warrant separate pages
- Which existing pages to merge vs create new
- Which wiki links to follow when answering

This makes the system generalize to any document type without code changes.

### 3. AI Decides Structure
No hardcoded categories, no predefined schemas. The LLM discovers:
- What topics exist in the corpus
- How to organize them hierarchically
- What slug naming conventions make sense

This means the same codebase works for EI policy reports, medical guidelines, legal documents, or financial filings.

### 4. Navigation Over Search
The query system is designed like human expert navigation:
```
Question → Understand domain → Find relevant category in index
         → Navigate to specific pages → Follow wikilinks to related pages
         → Synthesize answer
```
Not: "embed query → find nearest neighbors → hope the right chunk is in top-k"

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INPUT                                │
│  PDF / Word / Markdown / any document format                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                    ingest.py (parse)
                          │
              ┌───────────▼───────────┐
              │   raw/narrative/*.md  │  One .md per section
              │   raw/data/*.csv      │  Extracted tables
              └───────────┬───────────┘
                          │
               ┌──────────▼──────────┐
               │    Agent 1          │
               │  (corpus analysis)  │
               └──────────┬──────────┘
                          │ corpus_map.json
               ┌──────────▼──────────┐
               │    Agent 2          │
               │  (compilation)      │  ← Core of the system
               └──────────┬──────────┘
                          │
              ┌───────────▼───────────┐
              │     wiki/*.md         │  2000-3000 focused pages
              │     Index.md          │  Hierarchical navigation map
              └───────────┬───────────┘
                          │
               ┌──────────▼──────────┐
               │   build_index.py    │  AI-generated hierarchy
               └──────────┬──────────┘
                          │
               ┌──────────▼──────────┐
               │    Agent 3          │
               │  (review/correct)   │
               └──────────┬──────────┘
                          │
               ┌──────────▼──────────┐
               │     ask.py          │  Agentic query
               └─────────────────────┘
```

---

## Agent 2: The Compilation Engine (Most Important)

### Why Two-Phase Architecture

Naive approach: "Read document → write wiki page" fails on long documents because:
- A 30,000+ character document fills the context window just being read
- Once context is full, writing quality degrades severely
- MALFORMED_FUNCTION_CALL errors crash the pipeline

Solution: Split into two isolated LLM sessions.

### Four-Phase Compilation (Recommended)

```
Phase 1a — Extract (isolated session)
  Agent reads raw file in 10,000-char chunks
  Outputs: compact bullet-point fact list (~3,000 chars)

Phase 1b — Verify extraction (new isolated session)
  Agent re-reads raw file + Phase 1a output
  Finds facts that were missed
  Outputs: enriched fact list (only adds, never removes)

Phase 2a — Write wiki pages (new isolated session)
  Agent receives only the compact fact list
  Groups facts by topic → one wiki page per topic
  Outputs: multiple focused wiki pages

Phase 2b — Verify coverage (new isolated session)
  Agent reads Phase 1b fact list + all pages written in 2a
  Identifies facts not captured in any page
  Fills gaps (only adds, never removes)
```

**Why four phases instead of two?**
- Phase 1a alone has "lost in the middle" problem: LLM reads 4 chunks sequentially but deprioritizes middle content
- Phase 1b catches what 1a missed with a fresh context and explicit "find what's missing" instruction
- Phase 2b catches cases where facts were extracted but not written into any page

**Why isolated sessions?**
Each phase starts with a clean context window. No accumulated tool call history from previous reads. This prevents context overflow and keeps each LLM call focused.

**Cost:** ~4× more LLM calls per file vs single-phase. With Gemini 2.0 Flash, total cost for 1,252 files remains under $40.

### Topic-Based Page Splitting

One source file should produce multiple wiki pages, not one large page.

A file about the Canadian labour market (21,000+ chars) should produce:
```
employment_levels_fy2021.md       (employment counts, sector breakdowns)
unemployment_rates_fy2021.md      (unemployment timeline)
wages_fy2021.md                   (hourly/weekly wage data)
labour_force_participation_fy2021.md  (participation rates)
employment_by_demographics_fy2021.md  (age/gender breakdowns)
```

Benefits:
- Each page stays under 1,200 chars (fast to read, easy to cross-reference)
- LLM can retrieve exactly the topic it needs
- Cross-references via `[[WikiLink]]` connect related pages

### Slug Convention
```
Temporal data:  {topic}_fy{year_short}   e.g. unemployment_rates_fy2021
Stable concepts: {topic}                  e.g. ei_eligibility_overview
```

---

## Hierarchical Index

### Why Not a Flat Index

A flat alphabetical list of 2,335 pages is unusable for navigation:
- Too large to fit in LLM context (~350,000 chars)
- No structure for the LLM to reason about
- Forces brute-force keyword search instead of navigation

### AI-Generated Hierarchy

The index structure is discovered by LLM from the actual content, not predefined by humans:

```
Step 1: Sample 300 slugs → LLM proposes 10-15 categories
Step 2: All 2,335 slugs assigned to categories in batches of 200
Step 3: Write compact hierarchical Index.md (one section per category)
```

Result: a small index (~50 lines) that fits easily in context:
```
## Labour Market Information
_Data and analysis on labour market trends, employment rates, unemployment rates._
210 pages · years: 1516–2122

## EI Benefits
_Claims, amounts paid, eligibility, and benefit types across all EI programs._
445 pages · years: 1920–2024
```

### Why AI Decides the Structure
The same codebase should work for any document type. Medical records, legal filings, financial reports — all have different natural category structures. Hardcoding EI categories would break generalization.

---

## WikiLinks: The Navigation Mechanism

Every wiki page should contain `[[links]]` to related pages:

```markdown
## Unemployment Rates FY2021
- May 2020: unemployment rate peaked at 13.4%
- See also: [[labour_force_participation_fy2021]], [[employment_levels_fy2021]]
- COVID-19 context: [[covid_19_economic_measures_fy2021]]
```

When the query agent reads a page, it can choose to follow links to get more context — exactly like a human researcher following Wikipedia links.

**Current status:** Links are written but not actively followed. Next step: give query agent a `follow_link(slug)` tool.

---

## Query System

### Agent Navigation Flow

```
Question arrives
    ↓
1. Agent reads hierarchical Index.md
   (small enough to fit in context)
    ↓
2. Agent identifies relevant category/categories
    ↓
3. Agent calls search_wiki_in_category(category, keywords)
   (searches only within that category's pages)
    ↓
4. Agent reads relevant pages via get_wiki_page(slug)
    ↓
5. Agent follows [[WikiLinks]] if more context needed
    ↓
6. Agent calls done(answer) with specific facts cited
```

### Tools Available to Query Agent
- `get_wiki_index()` — reads hierarchical Index.md
- `search_wiki_in_category(category, query)` — searches within a category
- `search_wiki(query)` — searches across all pages (fallback)
- `get_wiki_page(slug)` — reads a specific page
- `done(answer)` — returns final answer

---

## Track A vs Track B

### Track A: Narrative → Wiki (Implemented)
Text sections compiled into structured wiki pages. Good for policy, analysis, definitions, trends.

### Track B: Tables → Pandas (Planned)
Raw CSV tables from extracted documents. Good for exact statistics by province, year, demographic.

Query routing:
```
Question → route()
  → "policy/trend question" → Track A (wiki navigation)
  → "specific stat question" → Track B (pandas code generation)
  → "both" → hybrid (wiki for context + pandas for numbers)
```

Track B is needed when the exact number only exists in a data table, not in the narrative.

---

## File Structure

```
project_root/
├── raw/
│   ├── narrative/{fiscal_year}/*.md    — ingested text sections
│   └── data/{fiscal_year}/*.csv        — extracted tables
│
├── wiki/
│   ├── Index.md                        — hierarchical navigation index
│   └── *.md                            — compiled wiki pages
│
├── wiki_categories.json                — slug → category mapping
├── corpus_map.json                     — Agent 1 output
├── compile_status.json                 — tracks compiled/pending files
│
├── src/
│   ├── ingest.py                       — PDF → raw files
│   ├── tools.py                        — all tool functions for agents
│   ├── agent_corpus.py                 — Agent 1
│   ├── agent_compile.py                — Agent 2 (four-phase)
│   ├── agent_review.py                 — Agent 3
│   ├── build_index.py                  — hierarchical index builder
│   ├── ask.py                          — agentic query
│   ├── evaluate.py                     — eval against ground truth
│   └── orchestrator.py                 — pipeline driver
│
└── logs/
    ├── compile_comparison.md           — source vs generated comparison
    └── review_report.md                — Agent 3 flagged issues
```

---

## Key Engineering Decisions

### Why Gemini Instead of Claude
Claude API quota is limited and expensive for bulk compilation (1,252 files × 4 phases). Gemini 2.0 Flash is cheaper for this volume and supports function calling with Python-native type hints — no manual JSON schema required.

### Why Not Just RAG
Tested both. RAG (vector search + BM25 + reranking) scored 83% on 100-question eval. Agentic wiki scored 75% on 80 text questions in first version, with clear paths to improvement (four-phase compilation, hierarchical navigation). Wiki has advantages RAG doesn't:
- No re-embedding when documents change
- LLM can reason across multiple wiki pages in sequence
- Navigation is explainable (agent shows which pages it read)
- Better for policy/trend questions that span multiple sections

### Why Isolated Sessions per Phase
Single long chat sessions accumulate tool call history in context. After reading 30,000 chars of raw content, the context is too full for quality writing. New sessions = clean context = better output per phase.

### Why Agent Decides Page Structure
Fixed schemas ("always create these 5 page types") break on unusual files. Agentic topic detection handles edge cases: a file with only 3 facts doesn't need 5 pages; a file with 40 facts about 8 distinct topics needs 8 pages.

---

## Current Performance (EI Reports, Apr 2026)

| Metric | Value |
|---|---|
| Source files | 1,252 narrative sections |
| Wiki pages generated | 2,335 |
| Avg pages per source file | 1.9 |
| Eval score (80 text questions) | 75% semantic |
| RAG baseline (100 questions) | 83% semantic |
| Estimated improvement with 4-phase | +5-10% |

### Known Failure Modes
1. **Data in wiki, search missed it** (~25% of failures) — search_wiki token matching doesn't handle synonym/paraphrase
2. **Data missing from wiki** (~25% of failures) — Phase 1a extraction misses facts in middle chunks
3. **Wrong year returned** (~25% of failures) — multiple pages with similar content across years
4. **Data only in tables** (~25% of failures) — requires Track B

### Roadmap to Close the Gap
1. Four-phase compilation → fixes "missing data" failures
2. Hierarchical index + category-aware search → fixes "wrong year" and "search miss" failures
3. Track B (CSV + pandas) → fixes "data only in tables" failures
4. WikiLink following → enables multi-hop reasoning across pages

---

## Reusing This for Other Projects

To apply this system to a new document corpus:

1. **Ingest**: Write a parser for your document format → output `raw/narrative/*.md` + `raw/data/*.csv`
2. **Compile**: Run `python src/orchestrator.py` — no configuration needed, Agent 1 discovers the corpus structure
3. **Build Index**: Run `python src/build_index.py` — AI discovers category structure from your content
4. **Query**: Run `python src/ask.py "your question"` — agent navigates wiki

No hardcoded categories, no predefined schemas, no domain-specific prompts beyond the base system instructions.

The only domain-specific artifact is `corpus_map.json` (produced by Agent 1), which captures the temporal vs stable concept distinction for your specific corpus.
