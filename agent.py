"""
Agentic compliance query pipeline.

Steps:
  1. Decompose  — Gemini breaks the question into focused sub-questions
  2. Retrieve   — vector search for each sub-question independently
  3. Follow     — detect doc_id references in results, fetch those docs directly
  4. Synthesize — Gemini answers with full context, source citations, and optional calculations

Two modes:
  Natural query  — AI decides whether to run a calculation or just answer in text
  /skill_name    — Forces a specific calculation skill; AI extracts parameters from your input

Usage:
    # Natural query — AI decides
    python agent.py "What are the PID approval stages?"
    python agent.py "My brine pipe corrosion rate is 0.125mm/yr, design life 20 years. Does it comply?"

    # Slash command — force a specific skill
    python agent.py "/corrosion_allowance brine feed pipe, rate 0.15mm/yr, design life 25 years"
    python agent.py "/fluid_scope Is fluid code AA in our approved scope?"
    python agent.py "/pressure_test AVC pipe, design pressure 200 kPa, hydro test at 280 kPa"

    # List available slash commands
    python agent.py /help

Dependencies:
    pip install google-genai chromadb python-dotenv
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types

from skills import TOOLS

load_dotenv()


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

EMBEDDING_MODEL = 'models/gemini-embedding-001'
GENERATION_MODEL = 'gemini-2.5-flash'
COLLECTION_NAME = 'compliance_docs'
CHROMA_PATH = Path(__file__).parent / 'chroma_db'
DEFAULT_TOP_K = 8
MAX_SUB_QUESTIONS = 5
MAX_DOC_FOLLOW = 3

DOC_ID_PATTERN = re.compile(r'\b(\d+-(?:PRC|LST|SPC|DST|FRM|REP)-[\d][\d\-]*\d)', re.IGNORECASE)

# Map slash command names to tool functions
# e.g. /corrosion_allowance → check_corrosion_allowance
SKILL_MAP = {fn.__name__.replace('check_', ''): fn for fn in TOOLS}


# ---------------------------------------------------------------------------
# Slash command parsing
# ---------------------------------------------------------------------------

def parse_slash_command(question: str) -> tuple[str | None, str]:
    """
    If the input starts with /skill_name, return (skill_name, rest_of_input).
    Otherwise return (None, question).
    """
    match = re.match(r'^/(\w+)\s*(.*)', question.strip(), re.DOTALL)
    if match:
        return match.group(1).lower(), match.group(2).strip()
    return None, question


def list_skills():
    print('\nAvailable slash commands:\n')
    for name, fn in SKILL_MAP.items():
        # First non-empty line of docstring after the blank line
        doc_lines = [l.strip() for l in (fn.__doc__ or '').splitlines() if l.strip()]
        desc = doc_lines[0] if doc_lines else ''
        print(f'  /{name}')
        print(f'    {desc}')
    print()


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

DECOMPOSE_PROMPT = """\
You are a compliance query analyst for an engineering firm.
Break the following question into {max_q} or fewer focused sub-questions \
that together cover everything needed for a complete compliance answer.
Each sub-question must be independently answerable from engineering procedures or lists.

Return ONLY a JSON object — no explanation, no markdown:
{{"sub_questions": ["q1", "q2", ...]}}

Question: {question}
"""

SYNTHESIS_SYSTEM = """\
You are a compliance engineer assistant for Aker Kvaerner Chemetics.

You have access to engineering calculation tools. Use them when:
- The engineer provides specific numerical inputs (rates, pressures, thicknesses, life spans)
- The retrieved context contains the required threshold or standard value to compare against
- A clear pass/fail calculation is possible

If the question is general or informational, answer in text without calling tools.

Rules for all answers:
- Cite every factual claim with its source document ID, e.g. [1-PRC-0003].
- Clearly distinguish mandatory requirements (must / shall) from recommendations.
- If context is insufficient, say so — do not speculate.
- Human reviewer comments are informal notes, not standards.
- For calculation results: show the numbers, the required value, the margin, and a clear COMPLIANT / NON-COMPLIANT verdict.
"""


# ---------------------------------------------------------------------------
# Retrieval helpers
# ---------------------------------------------------------------------------

def embed(text: str, client: genai.Client, task_type: str = 'RETRIEVAL_QUERY') -> list[float]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type=task_type),
    )
    return response.embeddings[0].values


def _build_where(base: dict, extra: list[dict]) -> dict:
    return {'$and': [base] + extra} if extra else base


def vector_search(query: str, collection, client: genai.Client,
                  n_results: int, extra_filters: list[dict]) -> list[dict]:
    q_embed = embed(query, client)
    results = collection.query(
        query_embeddings=[q_embed],
        n_results=n_results,
        where=_build_where({'authority': 'Standard'}, extra_filters),
        include=['documents', 'metadatas', 'distances'],
    )
    return [
        {'text': doc, 'metadata': meta, 'distance': dist, 'retrieved_by': 'search'}
        for doc, meta, dist in zip(
            results['documents'][0],
            results['metadatas'][0],
            results['distances'][0],
        )
    ]


def fetch_by_doc_id(doc_id: str, collection) -> list[dict]:
    results = collection.get(
        where=_build_where({'doc_id': doc_id}, [{'authority': 'Standard'}]),
        include=['documents', 'metadatas'],
    )
    return [
        {'text': doc, 'metadata': meta, 'distance': None, 'retrieved_by': f'doc_lookup:{doc_id}'}
        for doc, meta in zip(results['documents'], results['metadatas'])
    ]


def fetch_comments(query: str, collection, client: genai.Client, n: int = 3) -> list[dict]:
    try:
        q_embed = embed(query, client)
        results = collection.query(
            query_embeddings=[q_embed],
            n_results=n,
            where={'authority': 'Human_Comment'},
            include=['documents', 'metadatas', 'distances'],
        )
        return [
            {'text': doc, 'metadata': meta, 'distance': dist}
            for doc, meta, dist in zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0],
            )
        ]
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Decompose
# ---------------------------------------------------------------------------

def decompose(question: str, client: genai.Client) -> list[str]:
    prompt = DECOMPOSE_PROMPT.format(question=question, max_q=MAX_SUB_QUESTIONS)
    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0,
            response_mime_type='application/json',
        ),
    )
    try:
        data = json.loads(response.text)
        sub_qs = data.get('sub_questions', [])
        if sub_qs and isinstance(sub_qs, list):
            return [str(q) for q in sub_qs[:MAX_SUB_QUESTIONS]]
    except Exception:
        pass
    return [question]


# ---------------------------------------------------------------------------
# Deduplication and source map
# ---------------------------------------------------------------------------

def deduplicate(chunks: list[dict]) -> list[dict]:
    seen, unique = set(), []
    for c in chunks:
        key = c['text'][:200]
        if key not in seen:
            seen.add(key)
            unique.append(c)
    return unique


def build_source_map(all_chunks: list[dict], sub_question_chunks: dict) -> dict:
    source_map: dict[str, dict] = {}
    for c in all_chunks:
        m = c['metadata']
        doc_id = m.get('doc_id', 'unknown')
        if doc_id not in source_map:
            source_map[doc_id] = {
                'doc_id': doc_id,
                'doc_type': m.get('doc_type', ''),
                'source_folder': m.get('source_folder', ''),
                'discipline_name': m.get('discipline_name', ''),
                'revision': m.get('revision', ''),
                'chunk_count': 0,
                'constraint_count': 0,
                'retrieved_for': [],
                'fetched_directly': False,
            }
        entry = source_map[doc_id]
        entry['chunk_count'] += 1
        if m.get('is_constraint'):
            entry['constraint_count'] += 1
        if c['retrieved_by'].startswith('doc_lookup:'):
            entry['fetched_directly'] = True

    for sub_q, chunks in sub_question_chunks.items():
        for c in chunks:
            doc_id = c['metadata'].get('doc_id', 'unknown')
            if doc_id in source_map and sub_q not in source_map[doc_id]['retrieved_for']:
                source_map[doc_id]['retrieved_for'].append(sub_q)

    return source_map


# ---------------------------------------------------------------------------
# Synthesis (with optional forced skill)
# ---------------------------------------------------------------------------

def build_prompt(question: str, sub_questions: list[str],
                 chunks: list[dict], comments: list[dict]) -> str:
    parts = [f'## Original Question\n{question}\n']
    if len(sub_questions) > 1:
        parts.append('## Sub-questions Investigated')
        for i, sq in enumerate(sub_questions, 1):
            parts.append(f'{i}. {sq}')
        parts.append('')
    parts.append('## Retrieved Context (Engineering Standards & Lists)\n')
    for c in chunks:
        m = c['metadata']
        ref = f"[{m.get('doc_id', '?')} | {m.get('source_folder', '?')} | {m.get('discipline_name', '?')}]"
        parts.append(f'{ref}\n{c["text"]}\n')
    if comments:
        parts.append('\n## Reviewer Notes (informal context only)\n')
        for c in comments:
            m = c['metadata']
            parts.append(f"[{m.get('doc_id', '?')} p.{m.get('page', '?')}] {c['text']}\n")
    parts.append('\n## Answer\n')
    return '\n'.join(parts)


def synthesize(question: str, sub_questions: list[str], chunks: list[dict],
               comments: list[dict], client: genai.Client,
               forced_skill: str | None = None) -> str:
    prompt = build_prompt(question, sub_questions, chunks, comments)

    # For slash commands, prepend a clear instruction to the prompt
    if forced_skill:
        fn = SKILL_MAP.get(forced_skill)
        fn_name = fn.__name__ if fn else forced_skill
        prompt = (
            f'INSTRUCTION: You must call the `{fn_name}` tool to answer this question. '
            f'Extract all required parameter values from the retrieved context and the user input.\n\n'
        ) + prompt

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYNTHESIS_SYSTEM,
            tools=TOOLS,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=False,
                maximum_remote_calls=5,
            ),
            temperature=0.1,
        ),
    )
    return response.text


# ---------------------------------------------------------------------------
# Main agent runner
# ---------------------------------------------------------------------------

def run_agent(
    question: str,
    collection,
    client: genai.Client,
    discipline: int | None = None,
    source_folder: str | None = None,
    include_comments: bool = True,
    top_k: int = DEFAULT_TOP_K,
    verbose: bool = False,
    forced_skill: str | None = None,
) -> dict:
    extra_filters = []
    if discipline is not None:
        extra_filters.append({'discipline': discipline})
    if source_folder:
        extra_filters.append({'source_folder': source_folder.capitalize()})

    # Step 1: Decompose (skip for slash commands — question is already focused)
    if forced_skill:
        sub_questions = [question]
    else:
        print('Decomposing question...', file=sys.stderr)
        sub_questions = decompose(question, client)
        if verbose:
            for i, q in enumerate(sub_questions, 1):
                print(f'  {i}. {q}', file=sys.stderr)

    # Step 2: Retrieve
    print(f'Retrieving across {len(sub_questions)} sub-question(s)...', file=sys.stderr)
    sub_question_chunks: dict[str, list[dict]] = {}
    all_chunks: list[dict] = []
    seen_doc_ids: set[str] = set()

    for sq in sub_questions:
        chunks = vector_search(sq, collection, client, top_k, extra_filters)
        sub_question_chunks[sq] = chunks
        all_chunks.extend(chunks)
        for c in chunks:
            seen_doc_ids.add(c['metadata'].get('doc_id', ''))

    # Step 3: Follow doc_id references
    referenced = {m.rstrip('-') for c in all_chunks for m in DOC_ID_PATTERN.findall(c['text'])}
    to_follow = list(referenced - seen_doc_ids)[:MAX_DOC_FOLLOW]
    if to_follow:
        print(f'Following {len(to_follow)} doc reference(s): {", ".join(to_follow)}', file=sys.stderr)
        for doc_id in to_follow:
            fetched = fetch_by_doc_id(doc_id, collection)
            if fetched:
                all_chunks.extend(fetched)
                seen_doc_ids.add(doc_id)

    # Step 4: Deduplicate
    all_chunks = deduplicate(all_chunks)
    unique_docs = len({c['metadata'].get('doc_id') for c in all_chunks})
    print(f'Context: {len(all_chunks)} chunks from {unique_docs} document(s)', file=sys.stderr)

    comments = fetch_comments(question, collection, client) if include_comments else []

    # Step 5: Synthesize
    print('Generating answer...', file=sys.stderr)
    answer = synthesize(question, sub_questions, all_chunks, comments, client,
                        forced_skill=forced_skill)

    source_map = build_source_map(all_chunks, sub_question_chunks)
    return {
        'answer': answer,
        'sub_questions': sub_questions,
        'source_map': source_map,
        'all_chunks': all_chunks,
        'comments': comments,
        'forced_skill': forced_skill,
    }


# ---------------------------------------------------------------------------
# CLI output helpers
# ---------------------------------------------------------------------------

def sep(w=65):
    print('─' * w)


def print_source_map(source_map: dict):
    entries = sorted(source_map.values(), key=lambda x: x['chunk_count'], reverse=True)
    print(f'\nDocuments used ({len(entries)}):')
    for e in entries:
        flags = []
        if e['constraint_count']:
            flags.append(f'{e["constraint_count"]} constraint(s)')
        if e['fetched_directly']:
            flags.append('fetched via reference')
        flag_str = f'  [{", ".join(flags)}]' if flags else ''
        print(f'\n  {e["doc_id"]:25s} {e["source_folder"]:12s} {e["discipline_name"]}')
        print(f'    Revision: {e["revision"] or "N/A"} | Chunks used: {e["chunk_count"]}{flag_str}')
        if e['retrieved_for']:
            print('    Retrieved for:')
            for sq in e['retrieved_for']:
                print(f'      → {sq[:80]}')


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description='Agentic compliance query — with optional calculation skills'
    )
    parser.add_argument('question', help='Question, or /skill_name input, or /help')
    parser.add_argument('--discipline', type=int, default=None, metavar='0-9')
    parser.add_argument('--source', default=None, choices=['procedure', 'list'])
    parser.add_argument('--no-comments', action='store_true')
    parser.add_argument('--top-k', type=int, default=DEFAULT_TOP_K)
    parser.add_argument('--verbose', action='store_true')
    parser.add_argument('--json', action='store_true', help='Output result as JSON (for API use)')
    args = parser.parse_args()

    # /help — list available skills
    if args.question.strip().lower() in ('/help', '/skills'):
        list_skills()
        return

    # Parse slash command
    forced_skill, question = parse_slash_command(args.question)

    if forced_skill and forced_skill not in SKILL_MAP:
        print(f'\nUnknown skill: /{forced_skill}')
        list_skills()
        return

    # Setup clients
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')
    client = genai.Client(api_key=api_key)

    chroma = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = chroma.get_collection(COLLECTION_NAME)

    # Header (suppress when outputting JSON)
    if not args.json:
        if forced_skill:
            print(f'\n/{forced_skill}: {question}')
        else:
            print(f'\nQuestion: {args.question}')

        filters = []
        if args.discipline is not None:
            filters.append(f'discipline={args.discipline}')
        if args.source:
            filters.append(f'source={args.source}')
        if filters:
            print(f'Filters:  {", ".join(filters)}')

        sep()

    result = run_agent(
        question,
        collection,
        client,
        discipline=args.discipline,
        source_folder=args.source,
        include_comments=not args.no_comments,
        top_k=args.top_k,
        verbose=args.verbose,
        forced_skill=forced_skill,
    )

    if args.json:
        output = {
            'answer': result['answer'],
            'sub_questions': result['sub_questions'],
            'source_map': list(result['source_map'].values()),
            'comments': [
                {
                    'text': c['text'],
                    'doc_id': c['metadata'].get('doc_id', ''),
                    'page': c['metadata'].get('page', ''),
                }
                for c in result['comments']
            ],
            'forced_skill': result['forced_skill'],
        }
        print(json.dumps(output))
        return

    sep()
    print(result['answer'])
    sep()

    if len(result['sub_questions']) > 1:
        print('Sub-questions used:')
        for i, sq in enumerate(result['sub_questions'], 1):
            print(f'  {i}. {sq}')

    print_source_map(result['source_map'])

    if result['comments']:
        print(f'\nReviewer notes ({len(result["comments"])}):')
        for c in result['comments']:
            m = c['metadata']
            print(f'  [{m.get("doc_id")} p.{m.get("page")}] {c["text"][:90]}')


if __name__ == '__main__':
    main()
