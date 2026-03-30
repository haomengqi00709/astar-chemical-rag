"""
Compliance calculation agent.

Combines RAG retrieval with Python engineering calculations.
The agent:
  1. Retrieves relevant requirements from the vector store (e.g. corrosion allowance for BR service)
  2. Passes retrieved values + engineer's input to Gemini with calculation tools
  3. Gemini calls the appropriate tool, runs the math, and returns a compliance verdict

To add a new skill: add a file to the skills/ folder and register it in skills/__init__.py.

Usage:
    GOOGLE_API_KEY=your_key python calc_agent.py \\
        "My brine feed pipe is Carbon Steel, corrosion rate 0.125mm/yr, design life 20 years. Does it comply?"

    GOOGLE_API_KEY=your_key python calc_agent.py \\
        "Is fluid code WC within our approved project scope?"

    GOOGLE_API_KEY=your_key python calc_agent.py \\
        "My AVC vent pipe has design pressure 200 kPa, test pressure 280 kPa. Is the pressure test adequate?"

Dependencies:
    pip install google-genai chromadb python-dotenv
"""

import argparse
import os

import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types

from query import retrieve, COLLECTION_NAME, CHROMA_PATH
from skills import TOOLS

load_dotenv()

GENERATION_MODEL = 'gemini-2.5-flash'


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are a compliance engineer assistant for Aker Kvaerner Chemetics.
You check whether an engineer's design inputs comply with project standards.

You have access to calculation tools. Use them when the engineer provides
specific numerical inputs that can be checked against retrieved requirements.

Workflow:
1. Read the retrieved engineering standards/lists in the context.
2. Extract the specific requirement value (e.g. required corrosion allowance,
   scope classification, required test method) from the context.
3. Call the appropriate calculation tool with both the retrieved requirement
   and the engineer's input values.
4. Report the verdict clearly: COMPLIANT or NON-COMPLIANT.
5. Show the numbers — calculated value, required value, margin.
6. Cite the source document for the requirement.

If the context does not contain the required standard value, say so clearly
and do not run a calculation with assumed values.
"""


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

def run_calc_agent(
    question: str,
    collection,
    client: genai.Client,
    top_k: int = 6,
) -> str:
    """
    1. Retrieve relevant standards/list data via RAG.
    2. Build prompt with context + question.
    3. Call Gemini with calculation tools — automatic function calling handles the loop.
    4. Return final answer text.
    """
    # Step 1: Retrieve
    chunks = retrieve(question, collection, client, n_results=top_k, include_comments=False)
    standard_chunks = chunks['standard']

    if not standard_chunks:
        return 'No relevant standards or list data found for this question.'

    # Step 2: Build prompt with retrieved context
    context_parts = ['## Retrieved Engineering Standards & Lists\n']
    for c in standard_chunks:
        m = c['metadata']
        ref = f"[{m.get('doc_id', '?')} | {m.get('source_folder', '?')} | {m.get('discipline_name', '?')}]"
        context_parts.append(f'{ref}\n{c["text"]}\n')

    prompt = '\n'.join(context_parts) + f'\n## Engineer\'s Question\n{question}\n'

    # Step 3: Call Gemini with tools (automatic function calling handles the loop)
    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
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
# CLI
# ---------------------------------------------------------------------------

def sep(w=65):
    print('─' * w)


def main():
    parser = argparse.ArgumentParser(description='Compliance calculation agent')
    parser.add_argument('question', help='Engineering compliance question with input values')
    parser.add_argument('--top-k', type=int, default=6, help='Chunks to retrieve (default: 6)')
    args = parser.parse_args()

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')
    client = genai.Client(api_key=api_key)

    chroma = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = chroma.get_collection(COLLECTION_NAME)

    print(f'\nQuestion: {args.question}')
    sep()

    answer = run_calc_agent(args.question, collection, client, top_k=args.top_k)
    print(answer)
    sep()


if __name__ == '__main__':
    main()
