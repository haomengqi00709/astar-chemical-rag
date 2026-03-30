"""
RAG evaluation — runs 10 test questions and saves results to evaluation_results.md.

Covers: procedure retrieval, list retrieval, cross-document, and compliance-style questions.

Usage:
    GOOGLE_API_KEY=your_key python evaluate.py
    GOOGLE_API_KEY=your_key python evaluate.py --use-agent   # slower but with decomposition

Dependencies:
    pip install google-genai chromadb python-dotenv
"""

import argparse
import os
import time
from pathlib import Path
from datetime import datetime

import chromadb
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Import pipelines
from query import answer_question
from agent import run_agent

CHROMA_PATH = Path(__file__).parent / 'chroma_db'
RESULTS_PATH = Path(__file__).parent / 'evaluation_results.md'
COLLECTION_NAME = 'compliance_docs'


# ---------------------------------------------------------------------------
# Test questions
# ---------------------------------------------------------------------------

QUESTIONS = [
    # ── Easy: direct procedure lookup ────────────────────────────────────
    {
        'id': 'Q01',
        'difficulty': 'Easy',
        'category': 'Procedure retrieval',
        'question': 'What are the stages of P&ID development and who approves each stage?',
        'expected_docs': ['1-PRC-0003'],
        'note': 'Core procedure — should retrieve cleanly',
    },
    {
        'id': 'Q02',
        'difficulty': 'Easy',
        'category': 'Procedure retrieval',
        'question': 'What is the purpose of the process flowsheet development procedure and what must it contain?',
        'expected_docs': ['1-PRC-0002'],
        'note': 'Direct match to 1-PRC-0002',
    },
    {
        'id': 'Q03',
        'difficulty': 'Easy',
        'category': 'Procedure retrieval',
        'question': 'What are the mandatory control system design requirements?',
        'expected_docs': ['8-PRC-0004'],
        'note': 'Tests discipline 8 retrieval',
    },

    # ── Medium: list retrieval and numerical data ─────────────────────────
    {
        'id': 'Q04',
        'difficulty': 'Medium',
        'category': 'List retrieval',
        'question': 'What fluid codes exist and what do they represent?',
        'expected_docs': ['1-LST-0002'],
        'note': 'Tests LST retrieval from list folder',
    },
    {
        'id': 'Q05',
        'difficulty': 'Medium',
        'category': 'List retrieval',
        'question': 'What are the approved piping service classifications and their material requirements?',
        'expected_docs': ['5-LST-0003'],
        'note': 'Piping service list — numerical data from XLS',
    },
    {
        'id': 'Q06',
        'difficulty': 'Medium',
        'category': 'Procedure retrieval',
        'question': 'What are the instrument and control design criteria that must be followed?',
        'expected_docs': ['8-PRC-0002'],
        'note': 'Tests discipline 8 second procedure',
    },

    # ── Hard: compliance-style, cross-document ────────────────────────────
    {
        'id': 'Q07',
        'difficulty': 'Hard',
        'category': 'Compliance check',
        'question': 'A new heat exchanger is being added to the plant. What documentation, approvals, and P&ID updates are required before it can be installed?',
        'expected_docs': ['1-PRC-0003', '1-PRC-0002'],
        'note': 'Multi-step compliance — tests cross-document retrieval',
    },
    {
        'id': 'Q08',
        'difficulty': 'Hard',
        'category': 'Compliance check',
        'question': 'During construction, the client requests a change to a valve specification. What process must be followed and who must approve it?',
        'expected_docs': ['1-PRC-0003'],
        'note': 'MOC procedure — tests change management retrieval',
    },
    {
        'id': 'Q09',
        'difficulty': 'Hard',
        'category': 'Compliance check — list vs procedure',
        'question': 'A designer wants to use a butterfly valve in a toxic fluid service. What restrictions or requirements apply?',
        'expected_docs': ['1-PRC-0003', '5-LST-0003', '1-LST-0002'],
        'note': 'Requires both procedure rules and fluid/service list data',
    },
    {
        'id': 'Q10',
        'difficulty': 'Hard',
        'category': 'Gap test',
        'question': 'What are the civil and structural design requirements for equipment foundations?',
        'expected_docs': [],
        'note': 'Disciplines 2 & 3 are missing from dataset — expect "insufficient information"',
    },
]


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

def run_simple(question: str, collection, client: genai.Client) -> dict:
    text, chunks = answer_question(question, collection, client)
    source_map = {}
    for c in chunks['standard']:
        doc_id = c['metadata'].get('doc_id', '?')
        if doc_id not in source_map:
            source_map[doc_id] = {
                'doc_id': doc_id,
                'source_folder': c['metadata'].get('source_folder', ''),
                'discipline_name': c['metadata'].get('discipline_name', ''),
                'chunk_count': 0,
                'constraint_count': 0,
            }
        source_map[doc_id]['chunk_count'] += 1
        if c['metadata'].get('is_constraint'):
            source_map[doc_id]['constraint_count'] += 1
    return {
        'answer': text,
        'source_map': source_map,
        'sub_questions': [],
        'comments': chunks['comments'],
    }


def run_agentic(question: str, collection, client: genai.Client) -> dict:
    return run_agent(question, collection, client)


# ---------------------------------------------------------------------------
# Report writer
# ---------------------------------------------------------------------------

def write_report(results: list[dict], use_agent: bool):
    lines = [
        f'# RAG Evaluation Results',
        f'',
        f'**Date:** {datetime.now().strftime("%Y-%m-%d %H:%M")}',
        f'**Pipeline:** {"Agentic (agent.py)" if use_agent else "Simple (query.py)"}',
        f'**Total questions:** {len(results)}',
        f'',
        '---',
        '',
    ]

    for r in results:
        q = r['question_meta']
        lines += [
            f'## {q["id"]} — {q["difficulty"]} | {q["category"]}',
            f'',
            f'**Question:** {q["question"]}',
            f'**Expected docs:** {", ".join(q["expected_docs"]) if q["expected_docs"] else "None (gap test)"}',
            f'**Note:** {q["note"]}',
            f'',
        ]

        if r.get('error'):
            lines += [f'**ERROR:** {r["error"]}', '']
            continue

        if r.get('sub_questions'):
            lines.append('**Sub-questions generated:**')
            for i, sq in enumerate(r['sub_questions'], 1):
                lines.append(f'{i}. {sq}')
            lines.append('')

        lines += [
            '**Answer:**',
            '',
            r['answer'],
            '',
        ]

        # Source map
        source_map = r.get('source_map', {})
        if source_map:
            lines.append('**Documents used:**')
            for entry in sorted(source_map.values(), key=lambda x: x['chunk_count'], reverse=True):
                flags = []
                if entry.get('constraint_count'):
                    flags.append(f'{entry["constraint_count"]} constraints')
                if entry.get('fetched_directly'):
                    flags.append('fetched via reference')
                flag_str = f' [{", ".join(flags)}]' if flags else ''
                lines.append(
                    f'- `{entry["doc_id"]}` | {entry["source_folder"]} | '
                    f'{entry["discipline_name"]} | {entry["chunk_count"]} chunks{flag_str}'
                )
            lines.append('')

        # Expected vs actual
        retrieved_ids = set(source_map.keys())
        expected_ids = set(q['expected_docs'])
        if expected_ids:
            hit = expected_ids & retrieved_ids
            missed = expected_ids - retrieved_ids
            unexpected = retrieved_ids - expected_ids
            lines += [
                f'**Retrieval check:**',
                f'- Hit: {", ".join(hit) if hit else "none"}',
                f'- Missed: {", ".join(missed) if missed else "none"}',
                f'- Unexpected: {", ".join(unexpected) if unexpected else "none"}',
                '',
            ]

        if r.get('comments'):
            lines.append('**Reviewer notes surfaced:**')
            for c in r['comments']:
                m = c['metadata']
                lines.append(f'- [{m.get("doc_id")} p.{m.get("page")}] {c["text"][:100]}')
            lines.append('')

        lines += ['---', '']

    RESULTS_PATH.write_text('\n'.join(lines))
    print(f'\nResults saved → {RESULTS_PATH}')


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--use-agent', action='store_true', help='Use agentic pipeline (slower)')
    args = parser.parse_args()

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')
    client = genai.Client(api_key=api_key)

    chroma = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = chroma.get_collection(COLLECTION_NAME)

    pipeline = 'AGENTIC' if args.use_agent else 'SIMPLE'
    print(f'Running {len(QUESTIONS)} questions [{pipeline} pipeline]\n')

    results = []
    for i, q in enumerate(QUESTIONS, 1):
        print(f'[{i}/{len(QUESTIONS)}] {q["id"]} — {q["question"][:60]}...')
        try:
            if args.use_agent:
                result = run_agentic(q['question'], collection, client)
            else:
                result = run_simple(q['question'], collection, client)
            result['question_meta'] = q
            results.append(result)
        except Exception as e:
            print(f'  ERROR: {e}')
            results.append({'question_meta': q, 'error': str(e)})

        # Small pause to avoid rate limits between questions
        if i < len(QUESTIONS):
            time.sleep(2)

    write_report(results, args.use_agent)

    # Print quick summary
    print('\n--- Summary ---')
    for r in results:
        q = r['question_meta']
        if r.get('error'):
            status = 'ERROR'
        else:
            retrieved = set(r.get('source_map', {}).keys())
            expected = set(q['expected_docs'])
            if not expected:
                status = 'GAP TEST'
            elif expected & retrieved:
                status = 'HIT' if expected <= retrieved else 'PARTIAL'
            else:
                status = 'MISS'
        print(f'  {q["id"]} [{q["difficulty"]:6s}] {status:8s} — {q["question"][:55]}')


if __name__ == '__main__':
    main()
