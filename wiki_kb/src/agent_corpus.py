"""
agent_corpus.py — Agent 1: Corpus Analysis

Reads all files in raw/narrative/ and raw/tables/, produces corpus_map.json.

corpus_map.json tells Agent 2:
  - What disciplines exist and what files they contain
  - Which files cross-reference each other (WikiLink candidates)
  - Which SPC files should be sub-grouped
  - Which files are templates vs real data

Usage:
    python src/agent_corpus.py
"""

import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

from config import WIKI_KB, RAW_NARRATIVE, RAW_TABLES, MANIFEST_PATH, CORPUS_MAP_PATH

GENERATION_MODEL = 'gemini-2.5-flash'

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
# Read manifest and build file inventory
# ---------------------------------------------------------------------------

def build_inventory() -> dict:
    """
    Build a structured inventory from manifest.json and the actual raw/ files.
    Groups by discipline and track.
    """
    manifest = []
    if MANIFEST_PATH.exists():
        manifest = json.loads(MANIFEST_PATH.read_text())

    inventory = {}

    # Process manifest entries
    for entry in manifest:
        disc = entry.get('discipline')
        if disc is None:
            disc = -1
        disc_str = str(disc)

        if disc_str not in inventory:
            inventory[disc_str] = {
                'discipline': disc,
                'discipline_name': entry.get('discipline_name', DISCIPLINE_NAMES.get(disc, 'Unknown')),
                'track_a': [],
                'track_b': [],
            }

        item = {
            'doc_id': entry.get('doc_id'),
            'doc_type': entry.get('doc_type'),
            'source_folder': entry.get('source_folder'),
            'revision': entry.get('revision'),
            'is_template': entry.get('is_template', False),
            'source_file': Path(entry.get('source_file', '')).name,
        }

        if entry.get('track') == 'B':
            item['row_count'] = entry.get('row_count', 0)
            inventory[disc_str]['track_b'].append(item)
        else:
            inventory[disc_str]['track_a'].append(item)

    return inventory


# ---------------------------------------------------------------------------
# Sample narrative content for LLM analysis
# ---------------------------------------------------------------------------

def sample_narrative_files(max_files: int = 30, max_chars_per_file: int = 800) -> str:
    """Read a sample of narrative files to give LLM context about content."""
    lines = []
    count = 0
    for md_file in sorted(RAW_NARRATIVE.rglob('*.md')):
        if count >= max_files:
            break
        content = md_file.read_text(encoding='utf-8', errors='ignore')
        # Strip frontmatter
        content = re.sub(r'^---.*?---\n', '', content, flags=re.DOTALL)
        preview = content.strip()[:max_chars_per_file]
        lines.append(f'=== {md_file.stem} ===\n{preview}\n')
        count += 1

    if not lines:
        return '[No narrative files found yet]'
    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# LLM corpus analysis
# ---------------------------------------------------------------------------

CORPUS_PROMPT = """\
You are analyzing an engineering document corpus for a chemical engineering firm.

Here is the file inventory grouped by discipline:

{inventory}

Here are content samples from some narrative files:

{samples}

Your task: produce a corpus_map.json that will guide the wiki compilation agent.

The JSON must have this structure:
{{
  "disciplines": {{
    "0": {{
      "name": "Administration",
      "track_a_files": ["list of doc_ids going to wiki"],
      "track_b_files": ["list of doc_ids going to SQL"],
      "notes": "brief description of what this discipline contains and any grouping observations"
    }},
    ...
  }},
  "cross_references": [
    {{
      "from_doc": "doc_id that references another",
      "to_doc": "doc_id being referenced",
      "reason": "why these are related — becomes a WikiLink"
    }}
  ],
  "subgroups": [
    {{
      "discipline": 5,
      "parent_doc_type": "SPC",
      "groups": {{
        "Carbon Steel": ["5-SPC-CS4", "5-SPC-CS6", "5-SPC-CS7"],
        "Stainless Steel": ["5-SPC-S42", "5-SPC-S43"],
        "FRP": ["5-SPC-FR5", "5-SPC-FR22"],
        "Special Alloy": ["5-SPC-NI1", "5-SPC-S20", "5-SPC-S23", "5-SPC-S35"]
      }},
      "reason": "why subgrouping is needed for navigation"
    }}
  ],
  "compilation_order": ["doc_ids in recommended order for Agent 2 to compile"],
  "notes": "overall observations about corpus quality, gaps, or special handling needed"
}}

Rules:
- Base observations only on what you can see in the inventory and samples
- Cross-references should be grounded in actual document relationships (e.g. a procedure that says "refer to 1-LST-0002")
- Subgroups are only needed when a discipline has many similar files that need navigation structure
- compilation_order: put foundational docs first (design criteria, fluid codes) before derived docs
- Return ONLY valid JSON, no explanation, no markdown fences
"""


def run_corpus_analysis(client: genai.Client) -> dict:
    inventory = build_inventory()
    samples = sample_narrative_files()

    prompt = CORPUS_PROMPT.format(
        inventory=json.dumps(inventory, indent=2),
        samples=samples,
    )

    print('Sending corpus to Gemini for analysis...')
    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0,
            response_mime_type='application/json',
        ),
    )

    text = response.text.strip()
    # Strip markdown fences if present
    if text.startswith('```'):
        text = re.sub(r'^```\w*\n?', '', text)
        text = re.sub(r'\n?```$', '', text)

    corpus_map = json.loads(text)

    # Merge in our own inventory as ground truth
    corpus_map['_inventory'] = inventory

    return corpus_map


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    client = genai.Client(api_key=api_key)

    # Check we have something to analyse
    narrative_count = len(list(RAW_NARRATIVE.rglob('*.md')))
    table_count = len(list(RAW_TABLES.glob('*.csv')))

    if narrative_count == 0 and table_count == 0:
        print('No raw files found. Run ingest.py first.')
        return

    print(f'Found {narrative_count} narrative files, {table_count} table CSVs')
    print()

    corpus_map = run_corpus_analysis(client)

    CORPUS_MAP_PATH.write_text(json.dumps(corpus_map, indent=2))
    print(f'\nCorpus map saved → {CORPUS_MAP_PATH}')

    # Print summary
    print()
    for disc_str, disc_data in corpus_map.get('disciplines', {}).items():
        a = len(disc_data.get('track_a_files', []))
        b = len(disc_data.get('track_b_files', []))
        print(f'  Discipline {disc_str}: {disc_data.get("name", "")}  — {a} wiki, {b} SQL')

    xrefs = corpus_map.get('cross_references', [])
    subs = corpus_map.get('subgroups', [])
    print(f'\n  {len(xrefs)} cross-references (WikiLink candidates)')
    print(f'  {len(subs)} subgroup(s) identified')


if __name__ == '__main__':
    main()
