"""
Quick test: run ingest on the first 10 eligible files.
Usage: python test_ingest_10.py
"""
import sys, json
sys.path.insert(0, 'src')
from ingest import process_file, SKIP_PATTERNS, RAW_DIR
from pathlib import Path

source = Path('../drive-download-20260327T155115Z-1-001').resolve()
all_files = sorted(source.rglob('*'))
eligible = [
    f for f in all_files
    if f.is_file()
    and not SKIP_PATTERNS.search(f.name)
    and f.suffix.lower() in ('.doc', '.docx', '.xls', '.xlsx', '.pdf')
]

print(f'Total eligible: {len(eligible)} files')
print(f'Running first 10...\n')

RAW_DIR.mkdir(parents=True, exist_ok=True)
manifest = []

for f in eligible[:10]:
    entry = process_file(f, RAW_DIR)
    if entry:
        manifest.append(entry)

print()
print(f'=== Summary: {len(manifest)} processed ===')
for e in manifest:
    tables = e.get('inline_tables', 0)
    line = f"  [{e['track']}] {e['doc_id']:35s} {e['doc_type']:6s}"
    if tables:
        line += f"  → {tables} inline table(s)"
    if 'error' in e:
        line += f"  ERROR: {e['error'][:80]}"
    print(line)

# Show a sample narrative file with [TABLE:] placeholders
samples = [e for e in manifest if e.get('inline_tables')]
if samples:
    sample = samples[0]
    out_path = Path(sample['output'])
    print(f'\n--- Sample: {out_path.name} (first 60 lines) ---')
    lines = out_path.read_text().split('\n')
    for i, line in enumerate(lines[:60]):
        print(line)
