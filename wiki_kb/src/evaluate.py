"""
evaluate.py — Evaluation runner for the wiki knowledge base.

Runs a set of questions through ask.py and scores answers against expected keywords.

Scoring:
  - For each question, checks how many expected_keywords appear in the answer
  - HIT:     >= 60% of keywords found
  - PARTIAL: >= 30% of keywords found
  - MISS:    < 30% of keywords found

Usage:
    python src/evaluate.py
    python src/evaluate.py --questions ../eval_questions.json
    python src/evaluate.py --verbose
    python src/evaluate.py --ids Q01 Q05 Q15
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai

load_dotenv(override=True)

sys.path.insert(0, str(Path(__file__).parent))
from ask import run_query

from config import WIKI_KB

DEFAULT_QUESTIONS = WIKI_KB / 'eval_questions.json'
RESULTS_PATH = WIKI_KB / 'eval_results.md'

MAX_RETRIES = 3
COOLDOWN_BETWEEN_QUESTIONS = 8  # seconds between questions to stay under rate limit


def _normalize(text: str) -> str:
    """Normalize text for fuzzy keyword matching: lowercase, strip hyphens/underscores."""
    return re.sub(r'[-_]', ' ', text.lower()).strip()


def score_answer(answer: str, expected_keywords: list[str]) -> tuple[str, float, list[str], list[str]]:
    answer_norm = _normalize(answer)
    found = [kw for kw in expected_keywords if _normalize(kw) in answer_norm]
    missed = [kw for kw in expected_keywords if _normalize(kw) not in answer_norm]
    ratio = len(found) / len(expected_keywords) if expected_keywords else 0

    if answer.startswith('[ERROR:'):
        return 'ERROR', 0, [], expected_keywords

    if ratio >= 0.6:
        verdict = 'HIT'
    elif ratio >= 0.3:
        verdict = 'PARTIAL'
    else:
        verdict = 'MISS'

    return verdict, ratio, found, missed


def _run_with_retry(question: str, client: genai.Client, verbose: bool) -> str:
    """Run a query with rate-limit retry logic."""
    for attempt in range(MAX_RETRIES):
        try:
            answer = run_query(question, client, verbose=verbose)
            if '[ERROR: 429' in answer or 'RESOURCE_EXHAUSTED' in answer:
                wait = 45 + attempt * 15
                print(f'  [rate limit] waiting {wait}s before retry {attempt+2}/{MAX_RETRIES}...')
                time.sleep(wait)
                continue
            return answer
        except Exception as e:
            err_str = str(e)
            if '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                wait = 45 + attempt * 15
                print(f'  [rate limit] waiting {wait}s before retry {attempt+2}/{MAX_RETRIES}...')
                time.sleep(wait)
                continue
            return f'[ERROR: {e}]'
    return '[ERROR: rate limit — max retries exceeded]'


def run_eval(questions: list[dict], client: genai.Client, verbose: bool = False) -> list[dict]:
    results = []

    for i, q in enumerate(questions):
        qid = q['id']
        difficulty = q.get('difficulty', '?')
        question = q['question']

        print(f'\n[{i+1}/{len(questions)}] {qid} ({difficulty}) — {question[:60]}...')

        t0 = time.time()
        answer = _run_with_retry(question, client, verbose)
        elapsed = time.time() - t0

        verdict, ratio, found, missed = score_answer(answer, q.get('expected_keywords', []))

        icon = {'HIT': '+', 'PARTIAL': '~', 'MISS': 'X', 'ERROR': '!'}[verdict]
        print(f'  [{icon}] {verdict} ({ratio:.0%}) — {elapsed:.1f}s')
        if missed and verbose:
            print(f'      missed keywords: {missed}')

        results.append({
            'id': qid,
            'difficulty': difficulty,
            'discipline': q.get('discipline'),
            'question': question,
            'source_doc': q.get('source_doc', ''),
            'ground_truth': q.get('ground_truth', ''),
            'answer': answer,
            'verdict': verdict,
            'keyword_ratio': ratio,
            'keywords_found': found,
            'keywords_missed': missed,
            'elapsed_s': round(elapsed, 1),
        })

        # Cooldown between questions to avoid rate limit
        if i < len(questions) - 1:
            print(f'  [cooldown {COOLDOWN_BETWEEN_QUESTIONS}s]')
            time.sleep(COOLDOWN_BETWEEN_QUESTIONS)

    return results


def write_report(results: list[dict], out_path: Path):
    hits = sum(1 for r in results if r['verdict'] == 'HIT')
    partials = sum(1 for r in results if r['verdict'] == 'PARTIAL')
    misses = sum(1 for r in results if r['verdict'] == 'MISS')
    total = len(results)
    avg_time = sum(r['elapsed_s'] for r in results) / total if total else 0

    lines = [
        '# Wiki Knowledge Base — Evaluation Results',
        '',
        f'**Date:** {time.strftime("%Y-%m-%d %H:%M")}',
        f'**Questions:** {total}',
        f'**Score:** {hits} HIT, {partials} PARTIAL, {misses} MISS',
        f'**Hit rate:** {hits}/{total} ({hits/total:.0%})',
        f'**Average response time:** {avg_time:.1f}s',
        '',
        '---',
        '',
        '## Summary Table',
        '',
        '| # | Diff | Disc | Question | Verdict | Keywords | Time |',
        '|---|------|------|----------|---------|----------|------|',
    ]

    for r in results:
        q_short = r['question'][:50] + ('...' if len(r['question']) > 50 else '')
        icon = {'HIT': 'HIT', 'PARTIAL': 'PARTIAL', 'MISS': '**MISS**', 'ERROR': '**ERROR**'}.get(r['verdict'], r['verdict'])
        lines.append(
            f'| {r["id"]} | {r["difficulty"]} | {r["discipline"]} '
            f'| {q_short} | {icon} | {r["keyword_ratio"]:.0%} | {r["elapsed_s"]}s |'
        )

    # By difficulty breakdown
    lines.extend(['', '---', '', '## By Difficulty', ''])
    for diff in ('easy', 'medium', 'hard'):
        subset = [r for r in results if r['difficulty'] == diff]
        if not subset:
            continue
        h = sum(1 for r in subset if r['verdict'] == 'HIT')
        lines.append(f'- **{diff.capitalize()}:** {h}/{len(subset)} HIT')

    # Detailed results
    lines.extend(['', '---', '', '## Detailed Results', ''])

    for r in results:
        icon = {'HIT': '+', 'PARTIAL': '~', 'MISS': 'X', 'ERROR': '!'}.get(r['verdict'], '?')
        lines.append(f'### [{icon}] {r["id"]} — {r["question"]}')
        lines.append(f'**Difficulty:** {r["difficulty"]} | **Source:** {r["source_doc"]} | **Verdict:** {r["verdict"]} ({r["keyword_ratio"]:.0%})')
        lines.append('')
        lines.append(f'**Expected:** {r["ground_truth"]}')
        lines.append('')
        if r['keywords_missed']:
            lines.append(f'**Missed keywords:** {", ".join(r["keywords_missed"])}')
            lines.append('')
        lines.append(f'**Answer:**')
        # Truncate very long answers
        answer_preview = r['answer'][:1500]
        if len(r['answer']) > 1500:
            answer_preview += '\n\n...(truncated)'
        lines.append(f'> {answer_preview.replace(chr(10), chr(10) + "> ")}')
        lines.append('')

    out_path.write_text('\n'.join(lines), encoding='utf-8')
    print(f'\nFull report saved → {out_path}')


def main():
    parser = argparse.ArgumentParser(description='Evaluate wiki knowledge base query quality')
    parser.add_argument('--questions', default=str(DEFAULT_QUESTIONS), help='Path to eval questions JSON')
    parser.add_argument('--verbose', action='store_true', help='Show tool call details per question')
    parser.add_argument('--ids', nargs='*', help='Run only these question IDs (e.g. Q01 Q05)')
    parser.add_argument('--out', default=str(RESULTS_PATH), help='Output report path')
    args = parser.parse_args()

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    questions = json.loads(Path(args.questions).read_text())

    if args.ids:
        ids_set = set(args.ids)
        questions = [q for q in questions if q['id'] in ids_set]
        if not questions:
            print(f'No questions matched IDs: {args.ids}')
            sys.exit(1)

    print(f'Running {len(questions)} evaluation questions...')
    print(f'  Easy: {sum(1 for q in questions if q.get("difficulty") == "easy")}')
    print(f'  Medium: {sum(1 for q in questions if q.get("difficulty") == "medium")}')
    print(f'  Hard: {sum(1 for q in questions if q.get("difficulty") == "hard")}')

    client = genai.Client(api_key=api_key)
    results = run_eval(questions, client, verbose=args.verbose)

    # Print summary
    hits = sum(1 for r in results if r['verdict'] == 'HIT')
    partials = sum(1 for r in results if r['verdict'] == 'PARTIAL')
    misses = sum(1 for r in results if r['verdict'] == 'MISS')
    total = len(results)

    print(f'\n{"="*60}')
    print(f'RESULTS: {hits} HIT, {partials} PARTIAL, {misses} MISS  ({hits}/{total} = {hits/total:.0%})')
    print(f'{"="*60}')

    write_report(results, Path(args.out))


if __name__ == '__main__':
    main()
