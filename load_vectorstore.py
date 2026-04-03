"""
Vector store loader for RAG compliance system.

Embeds all chunks from parsed_chunks.json using Gemini text-embedding-004
and indexes them into a local ChromaDB collection.

Usage:
    GOOGLE_API_KEY=your_key python load_vectorstore.py
    GOOGLE_API_KEY=your_key python load_vectorstore.py --chunks parsed_chunks.json

Dependencies:
    pip install google-genai chromadb
"""

import argparse
import json
import os
import re
import time
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
COLLECTION_NAME = 'compliance_docs'
BATCH_SIZE = 50           # Smaller batches to stay within rate limits
CHROMA_PATH = Path(__file__).parent / 'chroma_db'
CHUNKS_PATH = Path(__file__).parent / 'parsed_chunks.json'


# ---------------------------------------------------------------------------
# Metadata cleaning
# ---------------------------------------------------------------------------

_SKIP_KEYS = {'raw'}  # dict values — ChromaDB can't store these


def clean_metadata(meta: dict) -> dict:
    """
    ChromaDB only accepts str, int, float, bool metadata values.
    Convert None to type-safe defaults; drop complex types.
    Defaults authority to 'Standard' if not set (XLS/DOC parsers don't set it).
    """
    cleaned = {}
    for k, v in meta.items():
        if k in _SKIP_KEYS:
            continue
        if v is None:
            cleaned[k] = -1 if k == 'discipline' else ''
        elif isinstance(v, (str, int, float, bool)):
            cleaned[k] = v
        else:
            cleaned[k] = str(v)

    if 'authority' not in cleaned:
        cleaned['authority'] = 'Standard'

    return cleaned


# ---------------------------------------------------------------------------
# Embedding
# ---------------------------------------------------------------------------

def embed_batch(client: genai.Client, texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts. Returns list of embedding vectors."""
    # Guard: Gemini rejects empty strings
    texts = [t if t.strip() else ' ' for t in texts]
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(task_type='RETRIEVAL_DOCUMENT'),
    )
    return [e.values for e in response.embeddings]


def embed_all(client: genai.Client, texts: list[str]) -> list[list[float]]:
    """Embed all texts in batches with progress reporting and rate-limit retry."""
    all_embeddings = []
    total = len(texts)

    for i in range(0, total, BATCH_SIZE):
        batch = texts[i:i + BATCH_SIZE]
        end = i + len(batch)
        print(f'  Embedding {end}/{total}...', end='\r')

        while True:
            try:
                all_embeddings.extend(embed_batch(client, batch))
                break
            except Exception as e:
                err = str(e)
                # Parse retry delay from 429 response (e.g. "retry in 25.04s")
                match = re.search(r'retry[^\d]*(\d+(?:\.\d+)?)\s*s', err, re.IGNORECASE)
                wait = float(match.group(1)) + 2 if match else 30
                print(f'\n  Rate limited — waiting {wait:.0f}s...')
                time.sleep(wait)

    print(f'  Embedded {total}/{total} chunks.          ')
    return all_embeddings


# ---------------------------------------------------------------------------
# Main loader
# ---------------------------------------------------------------------------

def load_vectorstore(chunks_path: Path = CHUNKS_PATH, reset: bool = True):
    # 1. Load chunks
    print(f'Loading chunks from {chunks_path}...')
    with open(chunks_path) as f:
        chunks = json.load(f)
    print(f'Loaded {len(chunks)} chunks.')

    # 2. Configure Gemini client
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')
    client = genai.Client(api_key=api_key)

    # 3. Set up ChromaDB
    print(f'Connecting to ChromaDB at {CHROMA_PATH}...')
    chroma = chromadb.PersistentClient(path=str(CHROMA_PATH))

    if reset:
        existing = [c.name for c in chroma.list_collections()]
        if COLLECTION_NAME in existing:
            print(f'  Dropping existing collection "{COLLECTION_NAME}"...')
            chroma.delete_collection(COLLECTION_NAME)

    collection = chroma.create_collection(
        name=COLLECTION_NAME,
        metadata={'hnsw:space': 'cosine'},
    )

    # 4. Prepare data — skip chunks with empty text (Gemini rejects empty parts)
    original = len(chunks)
    chunks = [c for c in chunks if c.get('text', '').strip()]
    if len(chunks) < original:
        print(f'  Skipped {original - len(chunks)} empty-text chunks.')

    texts = [c['text'] for c in chunks]
    metadatas = [clean_metadata(c['metadata']) for c in chunks]
    ids = [f'chunk_{i}' for i in range(len(chunks))]

    # 5. Embed
    print(f'Embedding {len(texts)} chunks with {EMBEDDING_MODEL}...')
    embeddings = embed_all(client, texts)

    # 6. Insert into ChromaDB in batches
    print('Inserting into ChromaDB...')
    for i in range(0, len(chunks), BATCH_SIZE):
        collection.add(
            ids=ids[i:i + BATCH_SIZE],
            embeddings=embeddings[i:i + BATCH_SIZE],
            documents=texts[i:i + BATCH_SIZE],
            metadatas=metadatas[i:i + BATCH_SIZE],
        )
        print(f'  Inserted {min(i + BATCH_SIZE, len(chunks))}/{len(chunks)}...', end='\r')
    print(f'  Inserted {len(chunks)}/{len(chunks)}.          ')

    count = collection.count()
    print(f'\nDone. {count} chunks indexed in collection "{COLLECTION_NAME}".')

    # 7. Sanity check
    print('\n--- Sanity check: "piping design pressure" ---')
    q_response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents='piping design pressure',
        config=types.EmbedContentConfig(task_type='RETRIEVAL_QUERY'),
    )
    q_embed = q_response.embeddings[0].values

    results = collection.query(
        query_embeddings=[q_embed],
        n_results=3,
        where={'authority': 'Standard'},
        include=['documents', 'metadatas', 'distances'],
    )
    for doc, meta, dist in zip(
        results['documents'][0],
        results['metadatas'][0],
        results['distances'][0],
    ):
        score = 1 - dist
        print(f'  [{score:.2f}] {meta.get("doc_id")} | {doc[:90]}...')


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load chunks into ChromaDB vector store')
    parser.add_argument(
        '--chunks',
        default=str(CHUNKS_PATH),
        help='Path to parsed_chunks.json (default: project root)',
    )
    parser.add_argument(
        '--no-reset',
        action='store_true',
        help='Do not drop existing collection (append instead)',
    )
    parser.add_argument(
        '--skip-if-exists',
        action='store_true',
        help='Do nothing if the collection already has data (used at container startup)',
    )
    args = parser.parse_args()

    if args.skip_if_exists:
        chroma = chromadb.PersistentClient(path=str(CHROMA_PATH))
        existing = [c.name for c in chroma.list_collections()]
        if COLLECTION_NAME in existing and chroma.get_collection(COLLECTION_NAME).count() > 0:
            print(f'Vector store already populated ({chroma.get_collection(COLLECTION_NAME).count()} chunks). Skipping build.')
            exit(0)
        print('Vector store empty or missing — building now...')

    load_vectorstore(
        chunks_path=Path(args.chunks),
        reset=not args.no_reset,
    )
