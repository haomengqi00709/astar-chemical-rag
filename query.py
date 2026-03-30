"""
RAG query pipeline for engineering compliance checking.

Retrieves relevant chunks from ChromaDB and uses Gemini to generate
a compliance answer with source citations.

Usage:
    GOOGLE_API_KEY=your_key python query.py "What is the max design pressure for piping?"
    GOOGLE_API_KEY=your_key python query.py "PID approval requirements" --discipline 1
    GOOGLE_API_KEY=your_key python query.py "insulation thickness rules" --source procedure
    GOOGLE_API_KEY=your_key python query.py "fluid codes" --source list --no-comments

Filters:
    --discipline 0-9       Restrict to a specific engineering discipline
    --source procedure     Restrict to Procedure documents only (client's original scope)
    --source list          Restrict to List documents only
    --no-comments          Exclude human annotation chunks from context
    --top-k N              Number of standard chunks to retrieve (default: 8)

Dependencies:
    pip install google-genai chromadb
"""

import argparse
import os
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

EMBEDDING_MODEL = 'models/gemini-embedding-001'
GENERATION_MODEL = 'gemini-2.5-flash'
COLLECTION_NAME = 'compliance_docs'
CHROMA_PATH = Path(__file__).parent / 'chroma_db'
DEFAULT_TOP_K = 8


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are a compliance engineer assistant for Aker Kvaerner Chemetics.
Your job is to help engineers determine whether a new design or product \
complies with the company's engineering standards and procedures.

Rules:
- Base your answers ONLY on the provided context from company documents.
- For every factual claim, cite the source document ID (e.g. [1-PRC-0003]).
- Clearly distinguish mandatory requirements (must / shall) from recommendations.
- If the context does not contain enough information to answer fully, say so — \
do not speculate or fill gaps.
- Human reviewer comments are informal notes, not standards. \
Mention them as additional context only, never as requirements.
- Keep answers concise and structured. Use bullet points for lists of requirements.\
"""


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

def _build_where(base: dict, extra_clauses: list[dict]) -> dict:
    """Combine a base filter with optional extra clauses into a ChromaDB where dict."""
    if not extra_clauses:
        return base
    return {'$and': [base] + extra_clauses}


def retrieve(
    question: str,
    collection,
    client: genai.Client,
    n_results: int = DEFAULT_TOP_K,
    discipline: int | None = None,
    source_folder: str | None = None,
    include_comments: bool = True,
) -> dict:
    """
    Returns {'standard': [...], 'comments': [...]}
    Each item: {'text': str, 'metadata': dict, 'distance': float}
    """
    q_response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=question,
        config=types.EmbedContentConfig(task_type='RETRIEVAL_QUERY'),
    )
    q_embed = q_response.embeddings[0].values

    # Optional filters
    extra = []
    if discipline is not None:
        extra.append({'discipline': discipline})
    if source_folder:
        extra.append({'source_folder': source_folder.capitalize()})

    # Standard (authoritative) chunks
    std_results = collection.query(
        query_embeddings=[q_embed],
        n_results=n_results,
        where=_build_where({'authority': 'Standard'}, extra),
        include=['documents', 'metadatas', 'distances'],
    )
    standard = [
        {'text': doc, 'metadata': meta, 'distance': dist}
        for doc, meta, dist in zip(
            std_results['documents'][0],
            std_results['metadatas'][0],
            std_results['distances'][0],
        )
    ]

    # Human comment chunks (context only)
    comments = []
    if include_comments:
        try:
            cmt_results = collection.query(
                query_embeddings=[q_embed],
                n_results=3,
                where=_build_where({'authority': 'Human_Comment'}, extra),
                include=['documents', 'metadatas', 'distances'],
            )
            comments = [
                {'text': doc, 'metadata': meta, 'distance': dist}
                for doc, meta, dist in zip(
                    cmt_results['documents'][0],
                    cmt_results['metadatas'][0],
                    cmt_results['distances'][0],
                )
            ]
        except Exception:
            pass  # No comment chunks matched — fine

    return {'standard': standard, 'comments': comments}


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

def build_prompt(question: str, standard_chunks: list, comment_chunks: list) -> str:
    parts = ['## Engineering Standards & Procedures\n']

    for c in standard_chunks:
        m = c['metadata']
        ref = f"[{m.get('doc_id', '?')} | {m.get('source_folder', '?')} | {m.get('discipline_name', '?')}]"
        parts.append(f'{ref}\n{c["text"]}\n')

    if comment_chunks:
        parts.append('\n## Reviewer Notes (informal — context only)\n')
        for c in comment_chunks:
            m = c['metadata']
            ref = f"[{m.get('doc_id', '?')} p.{m.get('page', '?')}]"
            parts.append(f'{ref} {c["text"]}\n')

    parts.append(f'\n## Compliance Question\n{question}\n\n## Answer\n')
    return '\n'.join(parts)


# ---------------------------------------------------------------------------
# Answer
# ---------------------------------------------------------------------------

def answer_question(
    question: str,
    collection,
    client: genai.Client,
    n_results: int = DEFAULT_TOP_K,
    discipline: int | None = None,
    source_folder: str | None = None,
    include_comments: bool = True,
) -> tuple[str, dict]:
    """Returns (answer_text, retrieved_chunks_dict)."""
    chunks = retrieve(
        question, collection, client,
        n_results=n_results,
        discipline=discipline,
        source_folder=source_folder,
        include_comments=include_comments,
    )
    prompt = build_prompt(question, chunks['standard'], chunks['comments'])

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2,   # low temperature for factual compliance answers
        ),
    )
    return response.text, chunks


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def print_separator(width=65):
    print('─' * width)


def main():
    parser = argparse.ArgumentParser(
        description='RAG compliance query — ask questions against engineering standards'
    )
    parser.add_argument('question', help='Compliance question to answer')
    parser.add_argument(
        '--discipline', type=int, default=None,
        metavar='0-9', help='Filter by discipline number',
    )
    parser.add_argument(
        '--source', default=None, choices=['procedure', 'list'],
        help='Restrict to Procedure or List documents only',
    )
    parser.add_argument(
        '--no-comments', action='store_true',
        help='Exclude human annotation chunks from context',
    )
    parser.add_argument(
        '--top-k', type=int, default=DEFAULT_TOP_K,
        help=f'Standard chunks to retrieve (default: {DEFAULT_TOP_K})',
    )
    args = parser.parse_args()

    # Setup
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')
    client = genai.Client(api_key=api_key)

    chroma = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = chroma.get_collection(COLLECTION_NAME)

    filters = []
    if args.discipline is not None:
        filters.append(f'discipline={args.discipline}')
    if args.source:
        filters.append(f'source={args.source}')

    print(f'\nQuestion: {args.question}')
    if filters:
        print(f'Filters:  {", ".join(filters)}')
    print_separator()

    response_text, chunks = answer_question(
        args.question,
        collection,
        client,
        n_results=args.top_k,
        discipline=args.discipline,
        source_folder=args.source,
        include_comments=not args.no_comments,
    )

    print(response_text)

    # Sources
    print_separator()
    print(f'Sources ({len(chunks["standard"])} standard chunks retrieved):')
    for c in chunks['standard']:
        m = c['metadata']
        score = 1 - c['distance']
        label = ' [CONSTRAINT]' if m.get('is_constraint') else ''
        print(f'  [{score:.2f}] {m.get("doc_id", "?"):20s} {m.get("source_folder", "?"):12s}{label}')
        print(f'         {c["text"][:80]}...')

    if chunks['comments']:
        print(f'\nReviewer notes ({len(chunks["comments"])} annotations):')
        for c in chunks['comments']:
            m = c['metadata']
            print(f'  [{m.get("doc_id")} p.{m.get("page")}] {c["text"][:90]}')


if __name__ == '__main__':
    main()
