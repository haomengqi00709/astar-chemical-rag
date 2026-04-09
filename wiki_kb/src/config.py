"""
Centralised path configuration for the wiki knowledge base pipeline.

Every module imports paths from here so the entire pipeline can be
re-rooted to an arbitrary project directory by setting the environment
variable ``WIKI_KB_ROOT`` before importing any pipeline module.
"""

import os
from pathlib import Path


def get_project_root() -> Path:
    env = os.environ.get('WIKI_KB_ROOT')
    if env:
        return Path(env).resolve()
    return Path(__file__).resolve().parent.parent


WIKI_KB         = get_project_root()
RAW_DIR         = WIKI_KB / 'raw'
RAW_NARRATIVE   = WIKI_KB / 'raw' / 'narrative'
RAW_TABLES      = WIKI_KB / 'raw' / 'tables'
WIKI_DIR        = WIKI_KB / 'wiki'
DB_PATH         = WIKI_KB / 'db' / 'engineering.db'
MANIFEST_PATH   = WIKI_KB / 'manifest.json'
CORPUS_MAP_PATH = WIKI_KB / 'corpus_map.json'
STATUS_PATH     = WIKI_KB / 'compile_status.json'
TEMP_DIR        = WIKI_KB / '_tmp'
