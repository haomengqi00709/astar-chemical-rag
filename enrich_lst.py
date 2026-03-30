"""
LLM enrichment for LST (List) chunks.

Each table row chunk gets a richer natural language description while
preserving one-chunk-per-row granularity. Batches 20 rows per LLM call
to stay within rate limits.

What it does:
  - Reads all LST chunks from parsed_chunks.json
  - For each row, asks Gemini to describe that specific row in plain English
  - Saves the enriched text back to parsed_chunks.json (original text kept as backup)
  - Re-running is safe — already-enriched chunks are skipped

After running, re-index:
    python load_vectorstore.py

Usage:
    GOOGLE_API_KEY=your_key python enrich_lst.py
    GOOGLE_API_KEY=your_key python enrich_lst.py --dry-run   # preview without saving
    GOOGLE_API_KEY=your_key python enrich_lst.py --doc-id 1-LST-0002  # single doc only
"""

import argparse
import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

CHUNKS_PATH = Path(__file__).parent / 'parsed_chunks.json'
GENERATION_MODEL = 'gemini-2.5-flash'
BATCH_SIZE = 20      # rows per LLM call
SAVE_EVERY = 200     # save progress every N enriched chunks


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You convert individual rows from engineering data tables into clear natural language descriptions.

Rules:
- Describe ONLY the single row provided — never summarise the whole table.
- Lead with the primary identifier (code, tag, document number, item number, etc.) if present.
- Include every non-empty field value. Do not invent values not present in the data.
- Write 1-3 sentences per row. Be specific and literal.
- If a field is empty or blank, omit it — do not say "unknown" or "not specified".
- Output ONLY a JSON object: {"descriptions": ["desc for row 0", "desc for row 1", ...]}
- The array must have exactly one entry per input row, in the same order.
"""

BATCH_PROMPT_TEMPLATE = """\
Document: {doc_id} ({doc_type}) — {discipline_name} — {source_folder}
Sheet / table: {sheet}

Rows to describe (each is one data row from the table):
{rows_json}

Return a JSON object with a "descriptions" array — one description per row, in order.
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_lst_chunk(chunk: dict) -> bool:
    return chunk['metadata'].get('doc_type') == 'LST'


def has_real_data(chunk: dict) -> bool:
    """True if the raw dict has at least one non-empty, non-null value."""
    raw = chunk['metadata'].get('raw', {})
    return any(
        v and str(v).strip() and str(v).strip().lower() not in ('nan', 'none', '-')
        for v in raw.values()
    )


def already_enriched(chunk: dict) -> bool:
    return 'original_text' in chunk['metadata']


def clean_raw(raw: dict) -> dict:
    """Strip nan/None values before sending to LLM."""
    return {
        k: v for k, v in raw.items()
        if v and str(v).strip() and str(v).strip().lower() not in ('nan', 'none', '-')
    }


# ---------------------------------------------------------------------------
# LLM enrichment
# ---------------------------------------------------------------------------

def enrich_batch(
    chunks: list[dict],
    client: genai.Client,
) -> list[str]:
    """
    Send a batch of chunks to Gemini. Returns list of enriched descriptions
    in the same order. Falls back to original text on failure.
    """
    # Use the first chunk's metadata as document context (all same doc in a batch)
    m = chunks[0]['metadata']
    rows_json = json.dumps(
        [clean_raw(c['metadata'].get('raw', {})) for c in chunks],
        indent=2,
    )
    prompt = BATCH_PROMPT_TEMPLATE.format(
        doc_id=m.get('doc_id', '?'),
        doc_type=m.get('doc_type', '?'),
        discipline_name=m.get('discipline_name', '?'),
        source_folder=m.get('source_folder', '?'),
        sheet=m.get('sheet', '?'),
        rows_json=rows_json,
    )

    while True:
        try:
            response = client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0,
                    response_mime_type='application/json',
                ),
            )
            data = json.loads(response.text)
            descriptions = data.get('descriptions', [])

            # Validate length — must match input
            if len(descriptions) == len(chunks):
                return [str(d).strip() for d in descriptions]

            # Length mismatch — fall back to originals
            print(f'\n  Warning: got {len(descriptions)} descriptions for {len(chunks)} rows — using originals')
            return [c['text'] for c in chunks]

        except Exception as e:
            err = str(e)
            match = re.search(r'retry[^\d]*(\d+(?:\.\d+)?)\s*s', err, re.IGNORECASE)
            wait = float(match.group(1)) + 2 if match else 30
            print(f'\n  Rate limited — waiting {wait:.0f}s...')
            time.sleep(wait)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def enrich(doc_id_filter: str | None = None, dry_run: bool = False):
    print(f'Loading {CHUNKS_PATH}...')
    with open(CHUNKS_PATH) as f:
        chunks = json.load(f)
    print(f'Loaded {len(chunks)} chunks.')

    # Select candidates: LST, has real data, not already enriched
    candidates = [
        (i, c) for i, c in enumerate(chunks)
        if is_lst_chunk(c)
        and has_real_data(c)
        and not already_enriched(c)
        and (doc_id_filter is None or c['metadata'].get('doc_id', '').startswith(doc_id_filter))
    ]

    print(f'Candidates to enrich: {len(candidates)}')
    if not candidates:
        print('Nothing to do.')
        return

    if dry_run:
        print('\n--- DRY RUN: showing first 5 candidates ---')
        for _, c in candidates[:5]:
            m = c['metadata']
            print(f'\n  [{m["doc_id"]}] sheet={m.get("sheet", "?")}')
            print(f'  Current text: {c["text"][:120]}')
            print(f'  Raw: {str(clean_raw(m.get("raw", {})))[:120]}')
        return

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')
    client = genai.Client(api_key=api_key)

    # Group candidates by doc_id + sheet for coherent batches
    from itertools import groupby
    def batch_key(item):
        m = item[1]['metadata']
        return (m.get('doc_id', ''), m.get('sheet', ''))

    candidates.sort(key=batch_key)
    enriched_count = 0
    total = len(candidates)

    for (doc_id, sheet), group in groupby(candidates, key=batch_key):
        group = list(group)
        print(f'\n  {doc_id} / {sheet} — {len(group)} rows')

        # Process in batches of BATCH_SIZE
        for batch_start in range(0, len(group), BATCH_SIZE):
            batch = group[batch_start:batch_start + BATCH_SIZE]
            idxs = [item[0] for item in batch]
            batch_chunks = [item[1] for item in batch]

            descriptions = enrich_batch(batch_chunks, client)

            for idx, chunk, desc in zip(idxs, batch_chunks, descriptions):
                # Keep original text as backup
                chunks[idx]['metadata']['original_text'] = chunk['text']
                chunks[idx]['text'] = desc

            enriched_count += len(batch)
            print(f'    {enriched_count}/{total} enriched...', end='\r')

            # Save checkpoint periodically
            if enriched_count % SAVE_EVERY == 0:
                with open(CHUNKS_PATH, 'w') as f:
                    json.dump(chunks, f, indent=2, default=str)
                print(f'\n  Checkpoint saved ({enriched_count} enriched so far)')

    # Final save
    with open(CHUNKS_PATH, 'w') as f:
        json.dump(chunks, f, indent=2, default=str)

    print(f'\nDone. {enriched_count} chunks enriched → {CHUNKS_PATH}')
    print('Now re-index: python load_vectorstore.py')


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='LLM enrichment for LST chunks')
    parser.add_argument(
        '--doc-id',
        default=None,
        help='Enrich only chunks matching this doc_id prefix (e.g. 1-LST-0002)',
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview candidates without calling the LLM or saving',
    )
    args = parser.parse_args()

    enrich(doc_id_filter=args.doc_id, dry_run=args.dry_run)
