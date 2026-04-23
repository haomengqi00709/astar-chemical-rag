"""
agent_compile.py — Agent 2: Four-Phase Wiki Compilation

Converts raw/narrative/*.md files into structured wiki pages.

Four phases per file (each in an isolated LLM session):
  Phase 1a — Extract: read raw file in chunks → compact fact list
  Phase 1b — Verify:  re-read raw + 1a output → find missed facts
  Phase 2a — Write:   fact list → wiki pages (one page per topic)
  Phase 2b — Cover:   verify all facts appear in pages → fill gaps

Usage:
    python src/agent_compile.py                    # compile all pending
    python src/agent_compile.py --doc 1-PRC-0003   # compile one file
    python src/agent_compile.py --reset            # clear status, recompile all
"""

import argparse
import csv
import json
import os
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv(override=True)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

from config import WIKI_KB, RAW_NARRATIVE, WIKI_DIR, CORPUS_MAP_PATH, STATUS_PATH

GENERATION_MODEL = 'gemini-2.5-flash'
CHUNK_SIZE = 10_000   # chars per chunk for Phase 1a reading
MAX_RETRIES = 3
WORKERS = 3           # concurrent compilation threads


# ---------------------------------------------------------------------------
# Status tracking
# ---------------------------------------------------------------------------

_status_lock = threading.Lock()

def load_status() -> dict:
    if STATUS_PATH.exists():
        return json.loads(STATUS_PATH.read_text())
    return {}

def save_status(status: dict):
    STATUS_PATH.write_text(json.dumps(status, indent=2))

def mark_status(doc_id: str, state: str, pages: list[str] | None = None):
    with _status_lock:
        status = load_status()
        status[doc_id] = {'state': state, 'pages': pages or []}
        save_status(status)


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

PHASE_1A_PROMPT = """\
You are extracting engineering knowledge from a source document.

Read this engineering document carefully. Extract ALL facts, requirements, and specifications.

Focus especially on:
- Mandatory requirements (must / shall / required)
- Specific numbers (pressures, temperatures, dimensions, allowances)
- References to other documents (doc IDs like 1-LST-0002, 5-SPC-CS6)
- Process conditions and design criteria
- Material specifications and service classifications

Output a compact bullet-point fact list. One fact per line. Be precise — preserve exact numbers and doc IDs.
Do NOT write prose. Do NOT group into sections yet. Just facts.

Document:
{content}

Fact list:"""


PHASE_1B_PROMPT = """\
You are verifying an extraction from an engineering document.

Below is the original document and a fact list that was already extracted.
Your job: find facts, requirements, or specifications that were MISSED.

Rules:
- Only ADD new facts. Never remove or rephrase existing ones.
- Focus on: numbers, doc references, conditional requirements, exceptions, special cases.
- If nothing was missed, output: [COMPLETE]

Original document:
{content}

Already extracted:
{facts_1a}

Additional facts (missed items only, or [COMPLETE]):"""


PHASE_2A_PROMPT = """\
You are a technical knowledge base compiler for a chemical engineering firm.

Convert this fact list into structured wiki pages. Group related facts into focused topic pages.

Rules:
- One page per distinct topic (e.g. one page for "pressure testing requirements", another for "material selection")
- Each page: 200-800 words. Focused. No padding.
- Preserve ALL numbers and doc IDs exactly as given.
- Mandatory requirements (must/shall) must be clearly marked.
- Add [[WikiLinks]] to reference related topics — use slug format: [[topic_name]]
- IMPORTANT: When adding WikiLinks, prefer linking to slugs from the existing pages list below.
  Only invent a new slug if the topic genuinely doesn't exist yet.
- If a fact refers to a SQL table (LST or SPC files), note it as: "Data available in SQL: {{doc_id}}"
- The source document may contain [TABLE: slug] placeholders. These are inline tables extracted
  from the original document. Replace each [TABLE: slug] with a [[slug]] WikiLink in the wiki page.
  The linked page will describe what that table contains.

Existing wiki page slugs (link to these when relevant):
{existing_slugs}

Output format — repeat this block for each page:

===PAGE===
slug: topic_slug_here
title: Human Readable Title
---
[page content in markdown]
===END===

Fact list:
{facts}

Source document: {doc_id} ({discipline_name})
"""


PHASE_2B_PROMPT = """\
You are verifying wiki page coverage for an engineering document.

Below are the extracted facts and the wiki pages already written.
Your job: find facts that are NOT captured in any page and write additional content.

Rules:
- Only ADD content. Never modify existing pages.
- If a fact is missing: either add it to an existing page (specify slug) or create a new page.
- If all facts are covered: output [COMPLETE]

Output format for additions:
ADD_TO: existing_slug
[additional content]
---
Or for new pages:
===PAGE===
slug: new_slug
title: New Page Title
---
[content]
===END===

Extracted facts:
{facts}

Existing wiki pages:
{pages_summary}

Missing content (or [COMPLETE]):"""


# ---------------------------------------------------------------------------
# LLM call with retry
# ---------------------------------------------------------------------------

def llm_call(client: genai.Client, prompt: str, temperature: float = 0.1) -> str:
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=temperature),
            )
            return response.text or ''
        except Exception as e:
            err = str(e)
            match = re.search(r'retry[^\d]*(\d+(?:\.\d+)?)\s*s', err, re.IGNORECASE)
            wait = float(match.group(1)) + 2 if match else 30
            print(f'    [retry {attempt+1}] waiting {wait:.0f}s... ({err[:60]})')
            time.sleep(wait)
    return '[LLM_ERROR: max retries exceeded]'


# ---------------------------------------------------------------------------
# Page parser
# ---------------------------------------------------------------------------

def parse_pages(text: str) -> list[dict]:
    """Parse ===PAGE=== ... ===END=== blocks from LLM output."""
    pages = []
    pattern = re.compile(r'===PAGE===\n(.*?)===END===', re.DOTALL)
    for match in pattern.finditer(text):
        block = match.group(1).strip()
        # Extract slug and title from first two lines
        lines = block.split('\n')
        slug = ''
        title = ''
        content_start = 0
        for i, line in enumerate(lines):
            if line.startswith('slug:'):
                slug = line.split(':', 1)[1].strip()
            elif line.startswith('title:'):
                title = line.split(':', 1)[1].strip()
            elif line == '---':
                content_start = i + 1
                break

        content = '\n'.join(lines[content_start:]).strip()
        if slug and content:
            pages.append({'slug': slug, 'title': title, 'content': content})

    return pages


def parse_additions(text: str, existing_pages: list[dict]) -> list[dict]:
    """Parse ADD_TO and new ===PAGE=== blocks from Phase 2b output."""
    if '[COMPLETE]' in text:
        return existing_pages

    result = [p.copy() for p in existing_pages]
    slug_map = {p['slug']: i for i, p in enumerate(result)}

    # Handle ADD_TO blocks
    add_pattern = re.compile(r'ADD_TO:\s*(\S+)\n(.*?)(?=ADD_TO:|===PAGE===|$)', re.DOTALL)
    for match in add_pattern.finditer(text):
        target_slug = match.group(1).strip()
        addition = match.group(2).strip()
        if target_slug in slug_map:
            idx = slug_map[target_slug]
            result[idx]['content'] += f'\n\n{addition}'

    # Handle new pages
    new_pages = parse_pages(text)
    for page in new_pages:
        if page['slug'] not in slug_map:
            result.append(page)

    return result


# ---------------------------------------------------------------------------
# Four-phase compilation
# ---------------------------------------------------------------------------

def read_in_chunks(content: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    return [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]


def get_existing_slugs() -> str:
    """Return a compact list of existing wiki slugs for WikiLink guidance."""
    slugs = sorted(p.stem for p in WIKI_DIR.glob('*.md') if p.name != 'Index.md')
    if not slugs:
        return '(none yet)'
    return '\n'.join(f'- {s}' for s in slugs)


def compile_file(doc_id: str, raw_path: Path, meta: dict, client: genai.Client) -> list[dict]:
    """Run four-phase compilation on one narrative file. Returns list of wiki pages."""
    content = raw_path.read_text(encoding='utf-8', errors='ignore')

    # Strip frontmatter for LLM (keep for us)
    frontmatter_match = re.match(r'^---.*?---\n', content, re.DOTALL)
    clean_content = content[frontmatter_match.end():] if frontmatter_match else content

    discipline_name = meta.get('discipline_name', '')

    print(f'  Compiling {doc_id} ({len(clean_content):,} chars)...')

    # --- Phase 1a: Extract ---
    print('    Phase 1a: extracting facts...')
    chunks = read_in_chunks(clean_content)
    facts_parts = []
    for i, chunk in enumerate(chunks):
        prompt = PHASE_1A_PROMPT.format(content=chunk)
        result = llm_call(client, prompt)
        facts_parts.append(result)

    facts_1a = '\n'.join(facts_parts)
    print(f'    → {len(facts_1a.splitlines())} fact lines extracted')

    # --- Phase 1b: Verify extraction ---
    print('    Phase 1b: verifying extraction...')
    prompt_1b = PHASE_1B_PROMPT.format(
        content=clean_content[:15_000],  # truncate if very long
        facts_1a=facts_1a,
    )
    facts_1b_extra = llm_call(client, prompt_1b)

    if '[COMPLETE]' in facts_1b_extra:
        facts_final = facts_1a
        print('    → no missed facts')
    else:
        facts_final = facts_1a + '\n\n[Additional facts found in verification]\n' + facts_1b_extra
        added = len(facts_1b_extra.splitlines())
        print(f'    → {added} additional fact lines added')

    # --- Phase 2a: Write wiki pages ---
    print('    Phase 2a: writing wiki pages...')
    existing_slugs = get_existing_slugs()
    prompt_2a = PHASE_2A_PROMPT.format(
        facts=facts_final,
        doc_id=doc_id,
        discipline_name=discipline_name,
        existing_slugs=existing_slugs,
    )
    pages_raw = llm_call(client, prompt_2a, temperature=0.15)
    pages = parse_pages(pages_raw)
    print(f'    → {len(pages)} page(s) written')

    if not pages:
        print(f'    [WARN] Phase 2a produced no parseable pages for {doc_id}')
        # Fallback: save raw output as a single page
        pages = [{
            'slug': doc_id.lower().replace('-', '_'),
            'title': doc_id,
            'content': pages_raw,
        }]

    # --- Phase 2b: Verify coverage ---
    print('    Phase 2b: verifying coverage...')
    pages_summary = '\n\n'.join(
        f'[{p["slug"]}]\n{p["content"][:300]}...' for p in pages
    )
    prompt_2b = PHASE_2B_PROMPT.format(
        facts=facts_final,
        pages_summary=pages_summary,
    )
    coverage_output = llm_call(client, prompt_2b)
    pages = parse_additions(coverage_output, pages)

    final_count = len(pages)
    print(f'    → {final_count} final page(s)')

    return pages, facts_final


# ---------------------------------------------------------------------------
# Wiki page writer
# ---------------------------------------------------------------------------

def write_wiki_pages(doc_id: str, pages: list[dict], meta: dict) -> list[str]:
    """Write compiled wiki pages to wiki/ directory. Returns list of slugs."""
    WIKI_DIR.mkdir(parents=True, exist_ok=True)
    written_slugs = []

    for page in pages:
        slug = page['slug']
        title = page.get('title', slug)
        content = page['content']

        frontmatter = f"""---
slug: {slug}
title: {title}
source_doc: {doc_id}
doc_type: {meta.get('doc_type', '')}
discipline: {meta.get('discipline', '')}
discipline_name: {meta.get('discipline_name', '')}
source_folder: {meta.get('source_folder', '')}
track: A
---

# {title}

"""
        out_path = WIKI_DIR / f'{slug}.md'
        out_path.write_text(frontmatter + content, encoding='utf-8')
        written_slugs.append(slug)

    return written_slugs


# ---------------------------------------------------------------------------
# Table wiki compilation
# ---------------------------------------------------------------------------

TABLE_WIKI_PROMPT = """\
You are a technical knowledge base compiler for a chemical engineering firm.

Below is data from an engineering table extracted from document {doc_id}.
Write a single focused wiki page that describes this table so an engineer can decide
whether to query it for specific data.

The wiki page must include:
- What this table is about (1-2 sentences)
- What each column means (brief description per column)
- What kinds of questions this table can answer
- Any important notes about the data (units, scope, limitations)

Keep it concise — under 400 words. No padding.

Table slug: {slug}
Source document: {doc_id}
Columns: {columns}
Sample rows (first 5):
{sample_rows}

Output format:
===PAGE===
slug: {slug}
title: {title}
---
[page content]
===END===
"""


def compile_table_wiki(csv_path: Path, client: genai.Client) -> dict | None:
    """
    Generate a wiki page for a single inline table CSV.
    Returns page dict or None if skipped.
    """
    slug = csv_path.stem
    if (WIKI_DIR / f'{slug}.md').exists():
        return None  # already compiled

    try:
        with open(csv_path, encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
    except Exception as e:
        print(f'  [WARN] Could not read {csv_path.name}: {e}')
        return None

    # Parse metadata comment and headers
    data_start = 0
    doc_id = slug
    if rows and rows[0] and rows[0][0].startswith('#'):
        comment = rows[0][0]
        m = re.search(r'doc_id=(\S+)', comment)
        if m:
            doc_id = m.group(1)
        data_start = 1

    if len(rows) <= data_start:
        return None

    headers = rows[data_start]
    data_rows = rows[data_start + 1:]

    if not data_rows:
        return None

    # Build sample (first 5 rows)
    sample_lines = []
    for row in data_rows[:5]:
        sample_lines.append('  ' + ' | '.join(str(c) for c in row[:8]))  # cap at 8 cols for readability
    sample_rows = '\n'.join(sample_lines)

    # Infer a human-readable title from the slug
    title_parts = slug.replace('_table_', ' — Table ').replace('_', ' ')
    title = f'Table: {title_parts}'

    prompt = TABLE_WIKI_PROMPT.format(
        slug=slug,
        doc_id=doc_id,
        title=title,
        columns=', '.join(headers[:10]),
        sample_rows=sample_rows,
    )

    result = llm_call(client, prompt, temperature=0.1)
    pages = parse_pages(result)

    if not pages:
        return None

    page = pages[0]
    # Write wiki page
    frontmatter = f"""---
slug: {slug}
title: {page.get('title', title)}
source_doc: {doc_id}
doc_type: TABLE
track: B
is_table_wiki: true
---

# {page.get('title', title)}

"""
    WIKI_DIR.mkdir(parents=True, exist_ok=True)
    (WIKI_DIR / f'{slug}.md').write_text(frontmatter + page['content'], encoding='utf-8')
    return page


def compile_all_table_wikis(client: genai.Client | None = None):
    """
    Compile wiki pages for all inline table CSVs in raw/tables/
    that were extracted from Track A documents (have inline=true in comment).
    """
    if client is None:
        api_key = os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            raise RuntimeError('Set GOOGLE_API_KEY environment variable.')
        client = genai.Client(api_key=api_key)

    tables_dir = WIKI_KB / 'raw' / 'tables'
    inline_csvs = []
    for csv_path in sorted(tables_dir.glob('*.csv')):
        try:
            first_line = csv_path.read_text(encoding='utf-8').split('\n')[0]
            if 'inline=true' in first_line:
                inline_csvs.append(csv_path)
        except Exception:
            pass

    if not inline_csvs:
        print('No inline table CSVs found.')
        return

    print(f'Compiling wiki for {len(inline_csvs)} inline table(s)...')
    done, skipped = 0, 0
    for csv_path in inline_csvs:
        slug = csv_path.stem
        if (WIKI_DIR / f'{slug}.md').exists():
            skipped += 1
            continue
        print(f'  Table: {slug}')
        page = compile_table_wiki(csv_path, client)
        if page:
            done += 1
        else:
            skipped += 1

    print(f'Done: {done} compiled, {skipped} skipped')


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

def get_pending_files(target_doc_id: str | None = None) -> list[tuple[Path, dict]]:
    """Return list of (raw_path, meta) for files pending compilation."""
    status = load_status()
    pending = []

    for md_file in sorted(RAW_NARRATIVE.rglob('*.md')):
        # Parse doc_id from frontmatter
        content = md_file.read_text(encoding='utf-8', errors='ignore')
        meta = {}
        fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if fm_match:
            for line in fm_match.group(1).splitlines():
                if ':' in line:
                    k, v = line.split(':', 1)
                    meta[k.strip()] = v.strip()

        doc_id = meta.get('doc_id', md_file.stem)

        if target_doc_id and doc_id != target_doc_id:
            continue

        if not target_doc_id and status.get(doc_id, {}).get('state') == 'done':
            continue  # already compiled

        pending.append((md_file, meta))

    return pending


def run(target_doc_id: str | None = None, reset: bool = False):
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    if reset:
        STATUS_PATH.unlink(missing_ok=True)
        print('Status reset.')

    pending = get_pending_files(target_doc_id)

    if not pending:
        print('Nothing to compile. All files are up to date.')
        return

    workers = 1 if target_doc_id else WORKERS
    print(f'Compiling {len(pending)} file(s) with {workers} worker(s)...\n')

    def _compile_one(args):
        raw_path, meta = args
        doc_id = meta.get('doc_id', raw_path.stem)
        # Each thread gets its own client
        thread_client = genai.Client(api_key=api_key)
        mark_status(doc_id, 'in_progress')
        try:
            pages, facts = compile_file(doc_id, raw_path, meta, thread_client)
            slugs = write_wiki_pages(doc_id, pages, meta)
            mark_status(doc_id, 'done', slugs)
            print(f'  ✓ {doc_id} → {len(slugs)} page(s): {", ".join(slugs)}\n')
        except Exception as e:
            mark_status(doc_id, 'error')
            print(f'  ✗ {doc_id} FAILED: {e}\n')

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(_compile_one, item) for item in pending]
        for f in as_completed(futures):
            f.result()  # re-raise any uncaught exception

    # Summary
    status = load_status()
    done = sum(1 for v in status.values() if v['state'] == 'done')
    errors = sum(1 for v in status.values() if v['state'] == 'error')
    print(f'\nCompilation complete: {done} done, {errors} errors')


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Compile raw narrative files into wiki pages')
    parser.add_argument('--doc', default=None, help='Compile only this doc_id')
    parser.add_argument('--reset', action='store_true', help='Clear status and recompile all')
    args = parser.parse_args()

    run(target_doc_id=args.doc, reset=args.reset)


if __name__ == '__main__':
    main()
