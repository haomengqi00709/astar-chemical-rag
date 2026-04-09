"""
orchestrator.py — Pipeline driver for the engineering wiki knowledge base.

Runs the full pipeline or individual stages:
  1. ingest    — parse source files → raw/
  2. sql       — load Track B CSVs → SQLite
  3. corpus    — Agent 1: analyse corpus → corpus_map.json
  4. compile   — Agent 2: four-phase compilation → wiki/*.md
  5. index     — build Index.md from wiki pages
  6. all       — run stages 1-5 in order

Usage:
    python src/orchestrator.py --source ../../drive-download-*/ --stage all
    python src/orchestrator.py --stage compile
    python src/orchestrator.py --stage index
    python src/orchestrator.py --stage compile --doc 1-PRC-0003
"""

import argparse
import os
import sys
from pathlib import Path

# Add src to path so we can import siblings
sys.path.insert(0, str(Path(__file__).parent))


def run_ingest(source: str):
    from ingest import ingest, RAW_DIR, MANIFEST_PATH
    import json
    source_path = Path(source).resolve()
    if not source_path.exists():
        print(f'[ERROR] Source directory not found: {source_path}')
        sys.exit(1)
    manifest = ingest(source_path, RAW_DIR)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, default=str))
    print(f'Manifest saved → {MANIFEST_PATH}')


def run_sql():
    from sql_loader import load_all, TABLES_DIR, DB_PATH
    import json
    results = load_all(TABLES_DIR, DB_PATH)
    report_path = DB_PATH.parent / 'load_report.json'
    report_path.write_text(json.dumps(results, indent=2))
    print(f'Load report → {report_path}')


def run_corpus():
    from agent_corpus import run_corpus_analysis, CORPUS_MAP_PATH, RAW_NARRATIVE, RAW_TABLES
    import os, json
    from google import genai
    from dotenv import load_dotenv
    load_dotenv()

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    n_narrative = len(list(RAW_NARRATIVE.rglob('*.md')))
    n_tables = len(list(RAW_TABLES.glob('*.csv')))
    print(f'Analysing corpus: {n_narrative} narrative files, {n_tables} table CSVs')

    client = genai.Client(api_key=api_key)
    corpus_map = run_corpus_analysis(client)
    CORPUS_MAP_PATH.write_text(json.dumps(corpus_map, indent=2))
    print(f'Corpus map saved → {CORPUS_MAP_PATH}')


def run_compile(doc_id: str | None = None, reset: bool = False):
    from agent_compile import run
    run(target_doc_id=doc_id, reset=reset)


def run_table_wikis():
    from agent_compile import compile_all_table_wikis
    compile_all_table_wikis()


def run_index():
    from build_index import build_index
    build_index()


STAGES = {
    'ingest': run_ingest,
    'sql': run_sql,
    'corpus': run_corpus,
    'compile': run_compile,
    'table_wikis': run_table_wikis,
    'index': run_index,
}


def main():
    parser = argparse.ArgumentParser(
        description='Engineering Wiki KB — pipeline orchestrator'
    )
    parser.add_argument(
        '--stage',
        choices=list(STAGES.keys()) + ['all'],
        default='all',
        help='Which stage to run (default: all). Stages: ingest, sql, corpus, compile, table_wikis, index',
    )
    parser.add_argument(
        '--source',
        default=None,
        help='Source documents directory (required for ingest stage)',
    )
    parser.add_argument(
        '--doc',
        default=None,
        help='Compile only this doc_id (compile stage only)',
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Reset compile status and recompile all (compile stage only)',
    )
    parser.add_argument(
        '--project-root',
        default=None,
        help='Override project root directory (sets WIKI_KB_ROOT for all modules)',
    )
    args = parser.parse_args()

    if args.project_root:
        root = str(Path(args.project_root).resolve())
        os.environ['WIKI_KB_ROOT'] = root
        print(f'Project root override → {root}')

    if args.stage == 'all':
        stages_to_run = ['ingest', 'sql', 'corpus', 'compile', 'table_wikis', 'index']
    else:
        stages_to_run = [args.stage]

    for stage in stages_to_run:
        print(f'\n{"="*60}')
        print(f'STAGE: {stage.upper()}')
        print(f'{"="*60}')

        if stage == 'ingest':
            if not args.source:
                print('[ERROR] --source is required for ingest stage')
                sys.exit(1)
            run_ingest(args.source)

        elif stage == 'sql':
            run_sql()

        elif stage == 'corpus':
            run_corpus()

        elif stage == 'compile':
            run_compile(doc_id=args.doc, reset=args.reset)

        elif stage == 'table_wikis':
            run_table_wikis()

        elif stage == 'index':
            run_index()

    print(f'\n{"="*60}')
    print('Done.')
    print(f'{"="*60}')
    print('\nTo query the knowledge base:')
    print('  python src/ask.py "Your question here"')


if __name__ == '__main__':
    main()
