"""
sql_loader.py — Load Track B CSVs into SQLite database.

Each CSV file becomes a table in db/engineering.db.
Table name = doc_id with non-alphanumeric chars replaced by underscores.

Usage:
    python src/sql_loader.py
    python src/sql_loader.py --db ../db/engineering.db --tables ../raw/tables
"""

import argparse
import csv
import json
import re
import sqlite3
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

from config import DB_PATH, RAW_TABLES as TABLES_DIR, MANIFEST_PATH


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def to_table_name(csv_path: Path) -> str:
    """Convert CSV filename to a safe SQL table name."""
    stem = csv_path.stem  # e.g. "5-LST-0003_Sheet1"
    return re.sub(r'[^a-zA-Z0-9]', '_', stem).strip('_')


def clean_column_name(col: str) -> str:
    """Convert column header to safe SQL column name."""
    col = re.sub(r'[^a-zA-Z0-9_]', '_', col.strip())
    col = re.sub(r'_+', '_', col).strip('_')
    return col.lower() or 'col'


def infer_type(values: list[str]) -> str:
    """Infer SQL column type from sample values."""
    non_empty = [v for v in values if v.strip()]
    if not non_empty:
        return 'TEXT'
    numeric = 0
    for v in non_empty[:20]:
        try:
            float(v.replace(',', ''))
            numeric += 1
        except ValueError:
            pass
    return 'REAL' if numeric / len(non_empty[:20]) > 0.8 else 'TEXT'


# ---------------------------------------------------------------------------
# Loader
# ---------------------------------------------------------------------------

def load_csv_to_db(csv_path: Path, conn: sqlite3.Connection) -> dict:
    """Load one CSV file into a SQLite table. Returns summary dict."""
    table_name = to_table_name(csv_path)

    with open(csv_path, encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return {'table': table_name, 'status': 'empty', 'rows': 0}

    # First row may be a metadata comment (starts with #)
    meta_comment = ''
    data_start = 0
    if rows[0] and rows[0][0].startswith('#'):
        meta_comment = rows[0][0]
        data_start = 1

    if len(rows) <= data_start:
        return {'table': table_name, 'status': 'no_data', 'rows': 0}

    # Headers
    raw_headers = rows[data_start]
    headers = [clean_column_name(h) for h in raw_headers]

    # Deduplicate headers
    seen = {}
    clean_headers = []
    for h in headers:
        if not h:
            h = 'col'
        if h in seen:
            seen[h] += 1
            h = f'{h}_{seen[h]}'
        else:
            seen[h] = 0
        clean_headers.append(h)

    data_rows = rows[data_start + 1:]

    # Infer column types from data
    col_types = []
    for i in range(len(clean_headers)):
        sample = [r[i] if i < len(r) else '' for r in data_rows[:50]]
        col_types.append(infer_type(sample))

    # Drop existing table and recreate
    conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')

    col_defs = ', '.join(
        f'"{h}" {t}' for h, t in zip(clean_headers, col_types)
    )
    # Add metadata columns
    conn.execute(f'''
        CREATE TABLE "{table_name}" (
            _row_id INTEGER PRIMARY KEY AUTOINCREMENT,
            _source TEXT,
            {col_defs}
        )
    ''')

    # Insert rows
    placeholders = ', '.join(['?'] * (len(clean_headers) + 1))  # +1 for _source
    col_list = ', '.join(f'"{h}"' for h in clean_headers)
    insert_sql = f'INSERT INTO "{table_name}" (_source, {col_list}) VALUES ({placeholders})'

    inserted = 0
    for row in data_rows:
        # Pad/trim row to match header count
        padded = (row + [''] * len(clean_headers))[:len(clean_headers)]
        # Skip fully empty rows
        if not any(v.strip() for v in padded):
            continue
        try:
            conn.execute(insert_sql, [csv_path.name] + padded)
            inserted += 1
        except Exception as e:
            print(f'    [WARN] Row insert failed in {table_name}: {e}')

    conn.commit()

    # Store metadata about this table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS _table_registry (
            table_name TEXT PRIMARY KEY,
            csv_source TEXT,
            meta_comment TEXT,
            row_count INTEGER,
            columns TEXT
        )
    ''')
    conn.execute('''
        INSERT OR REPLACE INTO _table_registry VALUES (?, ?, ?, ?, ?)
    ''', (
        table_name,
        str(csv_path),
        meta_comment,
        inserted,
        json.dumps(clean_headers),
    ))
    conn.commit()

    return {
        'table': table_name,
        'status': 'ok',
        'rows': inserted,
        'columns': clean_headers,
    }


def load_all(tables_dir: Path, db_path: Path) -> list[dict]:
    """Load all CSVs in tables_dir into SQLite."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))

    csv_files = sorted(tables_dir.glob('*.csv'))
    print(f'Loading {len(csv_files)} CSV files into {db_path}')
    print()

    results = []
    for csv_path in csv_files:
        result = load_csv_to_db(csv_path, conn)
        status = result['status']
        rows = result.get('rows', 0)
        cols = len(result.get('columns', []))
        print(f'  {status:8s} {result["table"]:45s} {rows:5d} rows  {cols} cols')
        results.append(result)

    conn.close()

    total_rows = sum(r.get('rows', 0) for r in results)
    ok_count = sum(1 for r in results if r['status'] == 'ok')
    print(f'\nDone: {ok_count}/{len(csv_files)} tables loaded, {total_rows} total rows')
    return results


# ---------------------------------------------------------------------------
# Query helper (used by ask.py)
# ---------------------------------------------------------------------------

def query_table(table_name: str, filters: dict | None = None,
                db_path: Path = DB_PATH, limit: int = 50) -> str:
    """
    Query a table with optional column filters.
    Returns results as formatted text for LLM consumption.

    Example:
        query_table('1_LST_0002', {'fluid_code': 'AA'})
    """
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    # Check table exists
    tables = [r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()]

    # Fuzzy match: try exact, then underscore-normalized
    normalized = re.sub(r'[^a-zA-Z0-9]', '_', table_name)
    matched = None
    for t in tables:
        if t == table_name or t == normalized:
            matched = t
            break

    if not matched:
        conn.close()
        return f'Table "{table_name}" not found. Available tables: {", ".join(t for t in tables if not t.startswith("_"))}'

    # Build WHERE clause
    where_parts = []
    params = []
    if filters:
        for col, val in filters.items():
            where_parts.append(f'LOWER("{col}") LIKE LOWER(?)')
            params.append(f'%{val}%')

    where_sql = f'WHERE {" AND ".join(where_parts)}' if where_parts else ''
    sql = f'SELECT * FROM "{matched}" {where_sql} LIMIT {limit}'

    rows = conn.execute(sql, params).fetchall()
    conn.close()

    if not rows:
        return f'No rows found in {matched}' + (f' matching {filters}' if filters else '')

    # Format as readable text
    keys = [k for k in rows[0].keys() if not k.startswith('_')]
    lines = [' | '.join(keys)]
    lines.append('-' * len(lines[0]))
    for row in rows:
        lines.append(' | '.join(str(row[k]) for k in keys))

    return f'Table: {matched} ({len(rows)} rows)\n\n' + '\n'.join(lines)


def list_tables(db_path: Path = DB_PATH) -> str:
    """Return a summary of all tables in the database."""
    conn = sqlite3.connect(str(db_path))
    try:
        rows = conn.execute(
            'SELECT table_name, row_count, columns FROM _table_registry ORDER BY table_name'
        ).fetchall()
        lines = []
        for table_name, row_count, cols_json in rows:
            cols = json.loads(cols_json)[:5]  # show first 5 cols
            lines.append(f'  {table_name:45s} {row_count:5d} rows  cols: {", ".join(cols)}...')
        return '\n'.join(lines)
    except Exception:
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_%'"
        ).fetchall()
        return '\n'.join(t[0] for t in tables)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Load Track B CSVs into SQLite')
    parser.add_argument('--db', default=str(DB_PATH), help='Path to SQLite database')
    parser.add_argument('--tables', default=str(TABLES_DIR), help='Path to raw/tables/ directory')
    args = parser.parse_args()

    results = load_all(Path(args.tables), Path(args.db))

    # Save load report
    report_path = Path(args.db).parent / 'load_report.json'
    report_path.write_text(json.dumps(results, indent=2))
    print(f'Load report saved → {report_path}')


if __name__ == '__main__':
    main()
