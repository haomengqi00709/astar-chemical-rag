"""
PDF parser for RAG compliance system.

Parses PDF files in List and Procedure folders across all disciplines.

Strategy:
  - Skip PDFs that share a doc_id with an already-parsed .doc file (duplicates)
  - Skip PDFs with no standard doc_id (stamps, diagrams, etc.)
  - For unique PDFs (e.g., comment-annotated versions):
      * Extract body text as section chunks (Authority: Standard)
      * Extract annotations as separate chunks (Authority: Human_Comment)
        — these are excluded from compliance decisions but preserved for context

Usage:
    python parse_pdf.py <root_dir>
    python parse_pdf.py .

Dependencies:
    pip install pymupdf
"""

import re
import json
from pathlib import Path

import fitz  # PyMuPDF


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ALLOWED_FOLDERS = {'List', 'Procedure', 'Procedures'}

DISCIPLINE_NAMES = {
    0: 'Administration',
    1: 'Process Technology',
    2: 'Civil & Structural',
    3: 'Mechanical',
    4: 'Equipment',
    5: 'Piping & Layout',
    6: 'Insulation',
    7: 'Coatings',
    8: 'Instrumentation & Control',
    9: 'Electrical',
}

CONSTRAINT_PATTERN = re.compile(
    r'\b(must|shall|required|mandatory|not permitted|shall not)\b|[<>≤≥]=?\s*\d',
    re.IGNORECASE
)


# ---------------------------------------------------------------------------
# Filename metadata detection
# ---------------------------------------------------------------------------

def detect_discipline(filename: str) -> int | None:
    match = re.match(r'^(\d+)-', filename)
    return int(match.group(1)) if match else None

def detect_doc_id(filename: str) -> str | None:
    """Returns None if filename has no standard doc_id pattern."""
    match = re.match(r'^(\d+-[A-Z]+-[\d\-]+)', filename)
    return match.group(1).rstrip('-') if match else None

def detect_doc_type(filename: str) -> str:
    for t in ('LST', 'PRC', 'DST', 'SPC'):
        if f'-{t}-' in filename:
            return t
    return 'UNKNOWN'

def detect_revision(filename: str) -> str | None:
    match = re.search(r'-R(\d+)', filename, re.IGNORECASE)
    return f'R{match.group(1)}' if match else None

def detect_source_folder(file_path: Path) -> str:
    for part in reversed(file_path.parts):
        if part in ('Procedure', 'Procedures'):
            return 'Procedure'
        if part in ('List', 'Datasheet'):
            return part
    return 'Unknown'

def detect_discipline_name(discipline: int | None) -> str:
    return DISCIPLINE_NAMES.get(discipline, 'Unknown')

def is_comment_pdf(filename: str) -> bool:
    """PDFs with 'comment' in the name carry human annotations — always parse these."""
    return 'comment' in filename.lower()


# ---------------------------------------------------------------------------
# Heading detection via font size
# ---------------------------------------------------------------------------

def extract_blocks_with_size(page) -> list[dict]:
    """Extract text blocks with their dominant font size."""
    blocks = []
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:  # 0 = text block
            continue
        lines_text = []
        sizes = []
        for line in block.get('lines', []):
            for span in line.get('spans', []):
                t = span.get('text', '').strip()
                if t:
                    lines_text.append(t)
                    sizes.append(span.get('size', 0))
        if lines_text:
            blocks.append({
                'text': ' '.join(lines_text),
                'size': max(sizes) if sizes else 0,
            })
    return blocks


def classify_blocks(pages_blocks: list[list[dict]]) -> list[dict]:
    """
    Tag each block as heading or body based on relative font size.
    Blocks with size >= 90th percentile of all sizes → heading.
    """
    all_sizes = [b['size'] for page in pages_blocks for b in page if b['size'] > 0]
    if not all_sizes:
        return [b for page in pages_blocks for b in page]

    all_sizes_sorted = sorted(all_sizes)
    threshold = all_sizes_sorted[int(len(all_sizes_sorted) * 0.85)]

    result = []
    for page_blocks in pages_blocks:
        for b in page_blocks:
            result.append({
                'text': b['text'],
                'is_heading': b['size'] >= threshold and len(b['text']) < 120,
            })
    return result


# ---------------------------------------------------------------------------
# Body text parser — section chunking
# ---------------------------------------------------------------------------

def parse_body(pdf_doc, meta: dict) -> list[dict]:
    """Extract body text as section chunks."""
    pages_blocks = [extract_blocks_with_size(page) for page in pdf_doc]
    blocks = classify_blocks(pages_blocks)

    chunks = []
    current_heading = None
    current_body = []

    def flush(heading, body):
        text = '\n'.join(body).strip()
        if not text:
            return
        full_text = f'{heading}\n{text}' if heading else text
        chunks.append({
            'text': full_text,
            'metadata': {
                **meta,
                'authority': 'Standard',
                'section': heading or '',
                'is_constraint': bool(CONSTRAINT_PATTERN.search(full_text)),
                'chunk_type': 'section',
            }
        })

    for block in blocks:
        text = block['text'].strip()
        if not text:
            continue
        if block['is_heading']:
            flush(current_heading, current_body)
            current_heading = text
            current_body = []
        else:
            current_body.append(text)

    flush(current_heading, current_body)
    return chunks


# ---------------------------------------------------------------------------
# Annotation parser
# ---------------------------------------------------------------------------

def parse_annotations(pdf_doc, meta: dict) -> list[dict]:
    """Extract human annotations as separate Human_Comment chunks."""
    chunks = []
    for page_num, page in enumerate(pdf_doc):
        for annot in page.annots():
            content = annot.info.get('content', '').strip()
            annot_type = annot.type[1]

            # Skip non-content annotation types
            if not content or annot_type in ('Link', 'Highlight', 'Underline', 'StrikeOut'):
                continue

            chunks.append({
                'text': content,
                'metadata': {
                    **meta,
                    'authority': 'Human_Comment',
                    'page': page_num + 1,
                    'annotation_type': annot_type,
                    'chunk_type': 'annotation',
                    'is_constraint': False,
                }
            })

    return chunks


# ---------------------------------------------------------------------------
# File-level parser
# ---------------------------------------------------------------------------

def parse_pdf_file(file_path: Path, parsed_doc_ids: set) -> list[dict]:
    """
    Parse a single PDF. Returns list of chunks.
    Skips duplicates and files with no standard doc_id.
    """
    filename = file_path.name
    doc_id = detect_doc_id(filename)

    # Skip files with no standard doc_id (stamps, diagrams, etc.)
    if not doc_id:
        return []

    # Skip if a .doc version was already parsed — unless this is a comment PDF
    if doc_id in parsed_doc_ids and not is_comment_pdf(filename):
        return []

    discipline = detect_discipline(filename)
    meta = {
        'doc_id': doc_id,
        'doc_type': detect_doc_type(filename),
        'discipline': discipline,
        'discipline_name': detect_discipline_name(discipline),
        'source_folder': detect_source_folder(file_path),
        'revision': detect_revision(filename),
        'is_template': False,
    }

    pdf_doc = fitz.open(str(file_path))
    chunks = parse_body(pdf_doc, meta)
    chunks += parse_annotations(pdf_doc, meta)

    return chunks


# ---------------------------------------------------------------------------
# Batch runner
# ---------------------------------------------------------------------------

def parse_all_pdfs(root_dir: str | Path, parsed_doc_ids: set = None) -> tuple[list, list]:
    """
    Walk root_dir and parse all PDFs in List and Procedure subfolders.
    parsed_doc_ids: set of doc_ids already parsed from .doc files (to skip duplicates).
    Returns (all_chunks, report).
    """
    root = Path(root_dir)
    parsed_doc_ids = parsed_doc_ids or set()
    all_chunks = []
    report = []

    pdf_files = sorted(
        f for f in root.rglob('*.pdf')
        if any(part in ALLOWED_FOLDERS for part in f.parts)
    )

    for pdf_file in pdf_files:
        rel = pdf_file.relative_to(root)
        filename = pdf_file.name
        doc_id = detect_doc_id(filename)

        # Report skipped files clearly
        if not doc_id:
            print(f'Skip (no doc_id): {rel}')
            report.append({'file': str(rel), 'status': 'skipped', 'reason': 'no doc_id'})
            continue

        if doc_id in parsed_doc_ids and not is_comment_pdf(filename):
            print(f'Skip (duplicate of .doc): {rel}')
            report.append({'file': str(rel), 'status': 'skipped', 'reason': 'duplicate of .doc'})
            continue

        print(f'Parsing: {rel}')
        try:
            chunks = parse_pdf_file(pdf_file, parsed_doc_ids)
            body = [c for c in chunks if c['metadata']['chunk_type'] == 'section']
            annots = [c for c in chunks if c['metadata']['chunk_type'] == 'annotation']
            all_chunks.extend(chunks)
            report.append({
                'file': str(rel),
                'status': 'ok',
                'chunks': len(chunks),
                'body_chunks': len(body),
                'annotation_chunks': len(annots),
            })
            print(f'  → {len(body)} body chunks, {len(annots)} annotation chunks')
        except Exception as e:
            print(f'  ERROR: {e}')
            report.append({'file': str(rel), 'status': 'error', 'error': str(e)})

    return all_chunks, report


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    import sys

    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    out_dir = Path(__file__).parent

    # Load existing chunks to extract already-parsed doc_ids
    existing_path = out_dir / 'parsed_chunks.json'
    existing = []
    parsed_doc_ids = set()
    if existing_path.exists():
        with open(existing_path) as f:
            existing = json.load(f)
        parsed_doc_ids = {c['metadata']['doc_id'] for c in existing}
        print(f'Loaded {len(existing)} existing chunks, {len(parsed_doc_ids)} unique doc_ids')

    chunks, report = parse_all_pdfs(root, parsed_doc_ids)

    # Merge and save
    all_chunks = existing + chunks
    with open(existing_path, 'w') as f:
        json.dump(all_chunks, f, indent=2, default=str)
    print(f'\nSaved {len(all_chunks)} total chunks → {existing_path}')

    # Save PDF-only chunks for inspection
    pdf_path = out_dir / 'parsed_chunks_pdf.json'
    with open(pdf_path, 'w') as f:
        json.dump(chunks, f, indent=2, default=str)
    print(f'Saved {len(chunks)} PDF chunks → {pdf_path}')

    # Summary
    print('\n--- Parse Report ---')
    for entry in report:
        status = entry['status']
        if status == 'ok':
            print(f'  OK      {entry["file"]} — {entry["body_chunks"]} body, {entry["annotation_chunks"]} annotations')
        elif status == 'skipped':
            print(f'  SKIP    {entry["file"]} ({entry["reason"]})')
        else:
            print(f'  ERROR   {entry["file"]}: {entry["error"]}')

    ok = [r for r in report if r['status'] == 'ok']
    skipped = [r for r in report if r['status'] == 'skipped']
    errors = [r for r in report if r['status'] == 'error']
    print(f'\nTotal: {len(chunks)} PDF chunks, {len(ok)} parsed, {len(skipped)} skipped, {len(errors)} errors')
