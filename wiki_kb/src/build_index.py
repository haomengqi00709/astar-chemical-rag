"""
build_index.py — Generate hierarchical Index.md from compiled wiki pages.

Reads all wiki/*.md files + corpus_map.json, outputs wiki/Index.md.
The index is one-level (by discipline), with Piping Spec sub-grouped by material.

Usage:
    python src/build_index.py
"""

import json
import re
from pathlib import Path

from config import WIKI_KB, WIKI_DIR, CORPUS_MAP_PATH, DB_PATH

DISCIPLINE_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
DISCIPLINE_NAMES = {
    0: 'Administration',
    1: 'Process Technology',
    2: 'Civil & Structural',
    3: 'Structural',
    4: 'Equipment',
    5: 'Piping & Layout',
    6: 'Insulation',
    7: 'Coatings',
    8: 'Instrumentation & Control',
    9: 'Electrical',
}


# ---------------------------------------------------------------------------
# Read wiki page metadata
# ---------------------------------------------------------------------------

def read_wiki_pages() -> dict[str, dict]:
    """Read frontmatter from all wiki pages. Returns {slug: meta}."""
    pages = {}
    for md_file in sorted(WIKI_DIR.glob('*.md')):
        if md_file.name == 'Index.md':
            continue
        content = md_file.read_text(encoding='utf-8', errors='ignore')
        meta = {'slug': md_file.stem, 'title': md_file.stem}
        fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if fm_match:
            for line in fm_match.group(1).splitlines():
                if ':' in line:
                    k, v = line.split(':', 1)
                    meta[k.strip()] = v.strip()
        pages[md_file.stem] = meta
    return pages


# ---------------------------------------------------------------------------
# Read SQL table registry
# ---------------------------------------------------------------------------

def get_sql_tables() -> dict[str, dict]:
    """
    Returns {doc_id: {table_name, row_count, columns}} for all loaded SQL tables.
    """
    if not DB_PATH.exists():
        return {}

    import sqlite3
    conn = sqlite3.connect(str(DB_PATH))
    try:
        rows = conn.execute(
            'SELECT table_name, csv_source, row_count, columns FROM _table_registry'
        ).fetchall()
    except Exception:
        return {}
    finally:
        conn.close()

    result = {}
    for table_name, csv_source, row_count, cols_json in rows:
        # Extract doc_id from csv_source filename
        fname = Path(csv_source).stem  # e.g. "5-LST-0003_Sheet1" or "5-LST-0003"
        doc_id_match = re.match(r'^(\d+-[A-Z]+-[\d\-]+)', fname)
        doc_id = doc_id_match.group(1).rstrip('-') if doc_id_match else fname

        if doc_id not in result:
            result[doc_id] = {
                'table_name': table_name,
                'row_count': row_count,
                'columns': json.loads(cols_json) if cols_json else [],
            }
        else:
            # Multiple sheets — merge row counts
            result[doc_id]['row_count'] += row_count

    return result


# ---------------------------------------------------------------------------
# Build index sections
# ---------------------------------------------------------------------------

def build_discipline_section(disc: int, pages: dict, sql_tables: dict,
                              corpus_map: dict) -> str | None:
    disc_name = DISCIPLINE_NAMES.get(disc, f'Discipline {disc}')
    disc_str = str(disc)

    # Get pages and SQL tables for this discipline
    disc_pages = [p for p in pages.values()
                  if str(p.get('discipline', '')) == disc_str]
    disc_sql = {doc_id: info for doc_id, info in sql_tables.items()
                if doc_id.startswith(f'{disc}-')}

    if not disc_pages and not disc_sql:
        return None

    lines = [f'\n## {disc} {disc_name}']

    # Add discipline description from corpus_map if available
    disc_info = corpus_map.get('disciplines', {}).get(disc_str, {})
    if disc_info.get('notes'):
        lines.append(f'_{disc_info["notes"]}_\n')

    # Group wiki pages by source_folder
    by_folder: dict[str, list] = {}
    for page in disc_pages:
        folder = page.get('source_folder', 'Other')
        by_folder.setdefault(folder, []).append(page)

    # Check for subgroups in corpus_map
    subgroups = {}
    for sg in corpus_map.get('subgroups', []):
        if sg.get('discipline') == disc:
            subgroups = sg.get('groups', {})

    for folder in ['Procedure', 'Specification', 'List', 'Datasheet', 'Other']:
        folder_pages = by_folder.get(folder, [])
        if not folder_pages:
            continue

        lines.append(f'\n**{folder}**')

        if subgroups and folder == 'Specification':
            # Write subgrouped spec pages
            placed = set()
            for group_name, group_doc_ids in subgroups.items():
                group_pages = [p for p in folder_pages
                               if p.get('source_doc') in group_doc_ids]
                if group_pages:
                    lines.append(f'  _{group_name}_')
                    for page in group_pages:
                        lines.append(f'  - [[{page["slug"]}]] — {page.get("title", page["slug"])}')
                        placed.add(page['slug'])
            # Remaining ungrouped
            for page in folder_pages:
                if page['slug'] not in placed:
                    lines.append(f'- [[{page["slug"]}]] — {page.get("title", page["slug"])}')
        else:
            for page in folder_pages:
                lines.append(f'- [[{page["slug"]}]] — {page.get("title", page["slug"])}')

    # SQL tables for this discipline
    if disc_sql:
        lines.append('\n**SQL Tables** _(query with query_table())_')
        for doc_id, info in sorted(disc_sql.items()):
            cols_preview = ', '.join(info['columns'][:4])
            lines.append(
                f'- `{doc_id}` → table `{info["table_name"]}` '
                f'({info["row_count"]} rows) — cols: {cols_preview}...'
            )

    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def build_index():
    pages = read_wiki_pages()
    sql_tables = get_sql_tables()
    corpus_map = json.loads(CORPUS_MAP_PATH.read_text()) if CORPUS_MAP_PATH.exists() else {}

    print(f'Building index from {len(pages)} wiki pages, {len(sql_tables)} SQL tables')

    lines = [
        '# Engineering Knowledge Base — Index',
        '',
        '_Navigate by discipline. Wiki pages = compiled knowledge. SQL tables = queryable row data._',
        '',
        '---',
    ]

    sections_written = 0
    missing_disciplines = []

    for disc in DISCIPLINE_ORDER:
        section = build_discipline_section(disc, pages, sql_tables, corpus_map)
        if section:
            lines.append(section)
            sections_written += 1
        else:
            disc_name = DISCIPLINE_NAMES.get(disc, f'Discipline {disc}')
            missing_disciplines.append(f'{disc} {disc_name}')

    # Missing disciplines note
    if missing_disciplines:
        lines.append('\n---')
        lines.append('\n## Missing Disciplines')
        lines.append('_No files uploaded for these disciplines:_')
        for d in missing_disciplines:
            lines.append(f'- {d}')

    # Cross-references section
    xrefs = corpus_map.get('cross_references', [])
    if xrefs:
        lines.append('\n---')
        lines.append('\n## Key Cross-References')
        for xref in xrefs[:20]:  # cap at 20 to keep index compact
            lines.append(
                f'- `{xref.get("from_doc")}` → `{xref.get("to_doc")}`: {xref.get("reason", "")}'
            )

    index_content = '\n'.join(lines) + '\n'

    index_path = WIKI_DIR / 'Index.md'
    WIKI_DIR.mkdir(parents=True, exist_ok=True)
    index_path.write_text(index_content, encoding='utf-8')

    print(f'Index written → {index_path}')
    print(f'  {sections_written} discipline sections')
    print(f'  {len(missing_disciplines)} disciplines missing: {", ".join(missing_disciplines)}')

    return index_path


if __name__ == '__main__':
    build_index()
