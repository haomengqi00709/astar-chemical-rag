"""
ask_generic.py — Query agent for user-uploaded knowledge bases (domain-agnostic).

Identical to ask.py except for a generic system prompt — no engineering/discipline assumptions.

Usage:
    python src/ask_generic.py "What topics are covered in these documents?"
    python src/ask_generic.py "Summarise the key points from Lecture 20."
"""

import argparse
import json
import os
import re
import sqlite3
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.api_core import exceptions as google_exceptions

load_dotenv()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

from config import WIKI_KB, WIKI_DIR, DB_PATH

GENERATION_MODEL = 'gemini-2.5-flash'

# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

def get_wiki_index() -> str:
    """Read the hierarchical Index.md — start here for every question."""
    index_path = WIKI_DIR / 'Index.md'
    if not index_path.exists():
        return '[Index.md not found. Run build_index.py first.]'
    return index_path.read_text(encoding='utf-8')


def search_wiki_in_category(discipline: int, query: str) -> str:
    """
    Search wiki pages within a specific discipline.
    Returns page titles and first 200 chars of matching pages.
    """
    query_lower = query.lower()
    results = []

    for md_file in sorted(WIKI_DIR.glob('*.md')):
        if md_file.name == 'Index.md':
            continue
        content = md_file.read_text(encoding='utf-8', errors='ignore')

        # Check discipline match
        disc_match = re.search(r'^discipline:\s*(\d+)', content, re.MULTILINE)
        if disc_match and int(disc_match.group(1)) != discipline:
            continue

        # Check if query terms appear in content
        words = re.sub(r'[^\w\s]', ' ', query_lower).split()
        if not any(w in content.lower() for w in words if len(w) > 3):
            continue

        # Extract title
        title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else md_file.stem

        # Strip frontmatter for preview
        clean = re.sub(r'^---.*?---\n', '', content, flags=re.DOTALL).strip()
        preview = clean[:200].replace('\n', ' ')

        results.append(f'[[{md_file.stem}]] — {title}\n  {preview}...')

    if not results:
        return f'No pages found in discipline {discipline} matching "{query}".'

    return f'Found {len(results)} page(s) in discipline {discipline}:\n\n' + '\n\n'.join(results)


def search_wiki(query: str) -> str:
    """Search across all wiki pages (fallback when discipline is unknown)."""
    query_lower = query.lower()
    words = re.sub(r'[^\w\s]', ' ', query_lower).split()
    keywords = [w for w in words if len(w) > 3]

    results = []
    for md_file in sorted(WIKI_DIR.glob('*.md')):
        if md_file.name == 'Index.md':
            continue
        content = md_file.read_text(encoding='utf-8', errors='ignore')

        hits = sum(1 for kw in keywords if kw in content.lower())
        if hits == 0:
            continue

        title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else md_file.stem

        # Get discipline
        disc_match = re.search(r'^discipline:\s*(\d+)', content, re.MULTILINE)
        disc = disc_match.group(1) if disc_match else '?'

        clean = re.sub(r'^---.*?---\n', '', content, flags=re.DOTALL).strip()
        preview = clean[:150].replace('\n', ' ')

        results.append((hits, f'[[{md_file.stem}]] (disc {disc}) — {title}\n  {preview}...'))

    if not results:
        return f'No pages found matching "{query}".'

    results.sort(key=lambda x: x[0], reverse=True)
    top = results[:8]
    return f'Found {len(results)} page(s) (showing top {len(top)}):\n\n' + '\n\n'.join(r[1] for r in top)


def get_wiki_page(slug: str) -> str:
    """Read a specific wiki page by slug or by source doc_id (e.g. '0-PRC-0001')."""
    # Try exact slug match first
    path = WIKI_DIR / f'{slug}.md'
    if not path.exists():
        # Try fuzzy: replace spaces and dashes
        normalized = re.sub(r'[\s-]', '_', slug.lower())
        matches = [f for f in WIKI_DIR.glob('*.md')
                   if re.sub(r'[\s-]', '_', f.stem.lower()) == normalized]
        if matches:
            path = matches[0]
        else:
            # Fallback: search by source_doc in frontmatter
            found = []
            for md_file in WIKI_DIR.glob('*.md'):
                if md_file.name == 'Index.md':
                    continue
                head = md_file.read_text(encoding='utf-8', errors='ignore')[:500]
                if re.search(rf'^source_doc:\s*{re.escape(slug)}\s*$', head, re.MULTILINE):
                    found.append(md_file)
            if found:
                # Return a listing of all pages from that source doc
                lines = [f'Found {len(found)} wiki page(s) compiled from {slug}:\n']
                for f in sorted(found):
                    content = f.read_text(encoding='utf-8', errors='ignore')
                    title_m = re.search(r'^# (.+)$', content, re.MULTILINE)
                    title = title_m.group(1) if title_m else f.stem
                    clean = re.sub(r'^---.*?---\n', '', content, flags=re.DOTALL).strip()
                    lines.append(f'[[{f.stem}]] — {title}\n  {clean[:200]}...\n')
                return '\n'.join(lines)

            return f'Page "{slug}" not found by slug or source doc_id. Use search_wiki("{slug}") to find related pages.'

    content = path.read_text(encoding='utf-8', errors='ignore')
    content = re.sub(r'^---.*?---\n', '', content, flags=re.DOTALL)
    return content


def follow_link(slug: str) -> str:
    """Follow a [[WikiLink]] — same as get_wiki_page but semantically distinct."""
    return get_wiki_page(slug)


def query_table(doc_id: str, filters: dict | None = None, limit: int = 50) -> str:
    """
    Query a SQL table by doc_id with optional column filters.
    Use when the wiki page says "Data available in SQL: {doc_id}".

    Examples:
        query_table("1-LST-0002", {"fluid_code": "AA"})
        query_table("5-LST-0003", {"service_class": "CS6"})
        query_table("5-LST-0003")  # returns first 50 rows
    """
    if not DB_PATH.exists():
        return '[Database not found. Run sql_loader.py first.]'

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row

    try:
        # Normalize doc_id to table name pattern
        normalized = re.sub(r'[^a-zA-Z0-9]', '_', doc_id)

        # Get all tables
        all_tables = [r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_%'"
        ).fetchall()]

        # Find matching table(s)
        matched = [t for t in all_tables if t == normalized or t.startswith(normalized)]

        if not matched:
            return (
                f'No table found for doc_id "{doc_id}".\n'
                f'Available tables: {", ".join(all_tables[:20])}'
            )

        results = []
        for table in matched:
            where_parts, params = [], []
            if filters:
                for col, val in filters.items():
                    clean_col = re.sub(r'[^a-zA-Z0-9_]', '_', col).lower()
                    where_parts.append(f'LOWER(CAST("{clean_col}" AS TEXT)) LIKE LOWER(?)')
                    params.append(f'%{val}%')

            where_sql = f'WHERE {" AND ".join(where_parts)}' if where_parts else ''
            sql = f'SELECT * FROM "{table}" {where_sql} LIMIT {limit}'

            rows = conn.execute(sql, params).fetchall()
            if not rows:
                results.append(f'Table `{table}`: no rows matching {filters}')
                continue

            keys = [k for k in rows[0].keys() if not k.startswith('_')]
            header = ' | '.join(keys)
            divider = '-' * len(header)
            data_lines = [' | '.join(str(row[k]) for k in keys) for row in rows]

            results.append(
                f'Table: `{table}` ({len(rows)} rows shown)\n\n'
                + header + '\n' + divider + '\n'
                + '\n'.join(data_lines)
            )

        return '\n\n'.join(results)

    finally:
        conn.close()


def list_sql_tables() -> str:
    """List all available SQL tables with their schema summary."""
    if not DB_PATH.exists():
        return '[Database not found. Run sql_loader.py first.]'

    conn = sqlite3.connect(str(DB_PATH))
    try:
        rows = conn.execute(
            'SELECT table_name, row_count, columns FROM _table_registry ORDER BY table_name'
        ).fetchall()
        if not rows:
            return 'No tables in database.'
        lines = ['Available SQL tables:\n']
        for table_name, row_count, cols_json in rows:
            cols = json.loads(cols_json)[:5] if cols_json else []
            lines.append(f'  {table_name:45s} {row_count:5d} rows  cols: {", ".join(cols)}')
        return '\n'.join(lines)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Tool definitions for Gemini function calling
# ---------------------------------------------------------------------------

TOOLS = [
    get_wiki_index,
    search_wiki_in_category,
    search_wiki,
    get_wiki_page,
    follow_link,
    query_table,
    list_sql_tables,
]

SYSTEM_PROMPT = """\
You are a knowledge base assistant. You answer questions based solely on the documents that \
have been uploaded into this knowledge base.

You have access to a structured wiki knowledge base and SQL tables derived from the uploaded documents.

CRITICAL RULE: You MUST call at least one tool before answering ANY question. You do NOT have \
prior knowledge of these documents. ALL your answers must come from the wiki pages and SQL tables \
available through the tools. NEVER answer from memory or training data.

Navigation strategy:
1. Start with get_wiki_index() to see what pages and topics are available
2. Use search_wiki(query) to find relevant pages across the knowledge base
3. Use get_wiki_page(slug) to read a specific page in full
4. If a page mentions [[WikiLink]], use follow_link(slug) to explore related pages
5. If a page says "Data available in SQL: {doc_id}", use query_table(doc_id) for tabular data

Rules:
- You MUST call tools to retrieve information — never skip tool calls
- Only report what is actually present in the uploaded documents
- Cite your sources: include the wiki page slug or SQL table name
- If information is not in the knowledge base, say so clearly — do not guess
- Do NOT mention engineering disciplines (0-9) or chemical engineering concepts \
  unless they explicitly appear in the uploaded documents
"""


# ---------------------------------------------------------------------------
# Agent runner
# ---------------------------------------------------------------------------

TOOL_MAP = {fn.__name__: fn for fn in TOOLS}


TOOL_LABELS = {
    'get_wiki_index':        'Reading wiki index…',
    'search_wiki_in_category': 'Searching in discipline {discipline}…',
    'search_wiki':           'Searching across all pages…',
    'get_wiki_page':         'Reading page: {slug}',
    'follow_link':           'Following link: {slug}',
    'query_table':           'Querying table: {doc_id}',
    'list_sql_tables':       'Listing SQL tables…',
}


def _step_label(fn_name: str, fn_args: dict) -> str:
    template = TOOL_LABELS.get(fn_name, fn_name)
    try:
        return template.format(**fn_args)
    except (KeyError, IndexError):
        return template


def _generate_with_retry(client, contents, tool_config, max_retries=1, stream=False):
    """Call generate_content with one automatic retry on rate-limit (429) errors."""
    for attempt in range(max_retries + 1):
        try:
            return client.models.generate_content(
                model=GENERATION_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    tools=TOOLS,
                    tool_config=tool_config,
                    temperature=0.1,
                ),
            )
        except (google_exceptions.ResourceExhausted, google_exceptions.TooManyRequests) as e:
            if attempt == max_retries:
                raise
            m = re.search(r'retryDelay.*?(\d+)s', str(e))
            delay = min(int(m.group(1)), 15) if m else 10
            if stream:
                print(json.dumps({
                    'type': 'step', 'tool': '_retry',
                    'label': f'Rate limited — retrying in {delay}s…', 'turn': 0,
                }), flush=True)
            time.sleep(delay)
        except Exception as e:
            err_str = str(e).lower()
            if '429' in err_str or 'resource_exhausted' in err_str or 'quota' in err_str:
                if attempt == max_retries:
                    raise
                delay = 10
                if stream:
                    print(json.dumps({
                        'type': 'step', 'tool': '_retry',
                        'label': f'Rate limited — retrying in {delay}s…', 'turn': 0,
                    }), flush=True)
                time.sleep(delay)
            else:
                raise


def run_query(question: str, client: genai.Client, verbose: bool = False,
              stream: bool = False) -> str:
    """Run the query agent with manual tool-call loop for full observability."""

    contents = [types.Content(role='user', parts=[types.Part.from_text(text=question)])]
    max_turns = 10
    has_read_pages = False

    for turn in range(max_turns):
        force_tools = turn < 3 and not has_read_pages
        tool_config = None
        if force_tools:
            tool_config = types.ToolConfig(
                function_calling_config=types.FunctionCallingConfig(mode='ANY')
            )

        response = _generate_with_retry(client, contents, tool_config, stream=stream)

        candidate = response.candidates[0] if response.candidates else None
        if not candidate:
            answer = '[No response generated]'
            if stream:
                print(json.dumps({'type': 'answer', 'content': answer}), flush=True)
            return answer

        parts = candidate.content.parts
        fn_calls = [p for p in parts if p.function_call]

        if not fn_calls:
            text_parts = [p.text for p in parts if p.text]
            answer = '\n'.join(text_parts) if text_parts else '[No response generated]'
            if stream:
                print(json.dumps({'type': 'answer', 'content': answer}), flush=True)
            return answer

        contents.append(candidate.content)

        fn_response_parts = []
        for part in fn_calls:
            fc = part.function_call
            fn_name = fc.name
            fn_args = dict(fc.args) if fc.args else {}

            label = _step_label(fn_name, fn_args)

            if stream:
                print(json.dumps({
                    'type': 'step',
                    'tool': fn_name,
                    'label': label,
                    'turn': turn + 1,
                }), flush=True)

            if verbose:
                args_short = ', '.join(f'{k}={repr(v)[:60]}' for k, v in fn_args.items())
                print(f'  [{turn+1}] → {fn_name}({args_short})')

            if fn_name in ('get_wiki_page', 'follow_link'):
                has_read_pages = True

            fn = TOOL_MAP.get(fn_name)
            if fn:
                try:
                    result = fn(**fn_args)
                except Exception as e:
                    result = f'[ERROR: {e}]'
            else:
                result = f'[Unknown tool: {fn_name}]'

            if verbose:
                preview = result[:200].replace('\n', ' ')
                print(f'       ← {preview}...')

            fn_response_parts.append(
                types.Part.from_function_response(
                    name=fn_name,
                    response={'result': result},
                )
            )

        contents.append(types.Content(role='user', parts=fn_response_parts))

    answer = '[Max tool-call turns reached]'
    if stream:
        print(json.dumps({'type': 'answer', 'content': answer}), flush=True)
    return answer


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def sep(w=65):
    print('─' * w)


def main():
    parser = argparse.ArgumentParser(description='Query the engineering wiki knowledge base')
    parser.add_argument('question', help='Question to answer')
    parser.add_argument('--verbose', action='store_true', help='Show tool call details')
    parser.add_argument('--json-stream', action='store_true',
                        help='Output JSON lines: {type:"step",...} then {type:"answer",...}')
    args = parser.parse_args()

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    client = genai.Client(api_key=api_key)

    if args.json_stream:
        run_query(args.question, client, stream=True)
    else:
        print(f'\nQuestion: {args.question}')
        sep()
        answer = run_query(args.question, client, verbose=args.verbose)
        sep()
        print(answer)
        sep()


if __name__ == '__main__':
    main()
