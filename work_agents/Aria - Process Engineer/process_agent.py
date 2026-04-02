"""
Process Engineer Agent (Aria)

Reads project_context.json from the PM Agent and produces:
  1. process_output.json  — structured handoff to Mechanical Engineer
  2. process_calc_summary.md — human-readable calculation summary

All engineering knowledge comes from RAG (company standards indexed in ChromaDB).
No direct file reads of the agent folder templates — those are output targets, not inputs.

Steps:
  1. Load project context from PM
  2. Query RAG for fluid code and physical properties
  3. Query RAG for design criteria rules (margins, pressure class, corrosion)
  4. Calculate TDH and NPSHa (Python maths)
  5. Show thinking chain → human confirmation
  6. Gemini writes calculation summary
  7. Save outputs

Usage:
    python "work_agents/Aria - Process Engineer/process_agent.py"
    python "work_agents/Aria - Process Engineer/process_agent.py" --context path/to/project_context.json
    python "work_agents/Aria - Process Engineer/process_agent.py" --json
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

AGENT_DIR        = Path(__file__).parent                    # Aria - Process Engineer/
WORK_AGENTS      = AGENT_DIR.parent                         # work_agents/
RAG_ROOT         = WORK_AGENTS.parent                       # project root
CHROMA_PATH      = RAG_ROOT / 'chroma_db'
PM_DIR           = WORK_AGENTS / 'Daniel - Project Manager '
DELIVERABLES_DIR = AGENT_DIR / 'deliverables'

COLLECTION_NAME  = 'compliance_docs'
EMBEDDING_MODEL  = 'models/gemini-embedding-001'
GENERATION_MODEL = 'gemini-2.5-flash'

G = 9.81  # m/s²


# ─────────────────────────────────────────────────────────────────────────────
# SSE progress helper (mirrors PM agent pattern)
# ─────────────────────────────────────────────────────────────────────────────

def emit_progress(step: int, message: str, status: str = 'running', data: dict = None):
    payload = {'step': step, 'message': message, 'status': status}
    if data:
        payload['data'] = data
    print(json.dumps(payload), file=sys.stderr, flush=True)


# ─────────────────────────────────────────────────────────────────────────────
# Load PM context
# ─────────────────────────────────────────────────────────────────────────────

def load_project_context(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f'project_context.json not found at {path}. '
            'Run the PM Agent first.'
        )
    return json.loads(path.read_text())


# ─────────────────────────────────────────────────────────────────────────────
# RAG query
# ─────────────────────────────────────────────────────────────────────────────

def query_rag(question: str, collection, client: genai.Client, top_k: int = 5) -> list[dict]:
    resp = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=question,
        config=types.EmbedContentConfig(task_type='RETRIEVAL_QUERY'),
    )
    results = collection.query(
        query_embeddings=[resp.embeddings[0].values],
        n_results=top_k,
        where={'authority': 'Standard'},
    )
    chunks = []
    for i, text in enumerate(results['documents'][0]):
        meta = results['metadatas'][0][i]
        chunks.append({
            'doc_id': meta.get('doc_id', '?'),
            'text':   text[:300],
        })
    return chunks


def rag_text(chunks: list[dict]) -> str:
    return '\n'.join(f"[{c['doc_id']}] {c['text']}" for c in chunks)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Fluid properties from RAG
# ─────────────────────────────────────────────────────────────────────────────

def get_fluid_properties(summary: dict, collection, client: genai.Client) -> dict:
    fluid   = summary.get('fluid', '')
    density = summary.get('fluid_density_kgm3')
    temp    = summary.get('temperature_c')

    # Query RAG for fluid code (1-LST-0002 is indexed in RAG)
    code_chunks = query_rag(
        f'fluid code for {fluid} in fluid codes master list 1-LST-0002',
        collection, client, top_k=5
    )
    # Query RAG for physical properties
    prop_chunks = query_rag(
        f'physical properties {fluid}: viscosity vapor pressure at {temp}°C',
        collection, client, top_k=4
    )

    all_chunks = code_chunks + prop_chunks

    prompt = f"""You are a process engineer. Determine the fluid code and physical properties for this project fluid.

Fluid: {fluid}
Operating temperature: {temp} °C
Density from SOW: {density} kg/m³

RAG results from company standards (includes 1-LST-0002 Fluid Codes Master List):
{rag_text(all_chunks)}

Return ONLY a JSON object:
{{
  "fluid_name": "{fluid}",
  "fluid_code": "code from 1-LST-0002 if found, else best estimate",
  "fluid_code_source": "1-LST-0002 or estimated",
  "density_kgm3": {density},
  "specific_gravity": <density / 1000>,
  "dynamic_viscosity_mPas": <number from RAG or engineering estimate>,
  "vapor_pressure_kPa_at_temp": <number from RAG or engineering estimate>,
  "corrosive": <true/false>,
  "notes": "brief engineering note on handling considerations"
}}"""

    resp = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.1),
    )
    text = resp.text.strip()
    if text.startswith('```'):
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    props = json.loads(text.strip())
    props['rag_sources'] = list({c['doc_id'] for c in all_chunks})
    return props


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Design criteria from RAG
# ─────────────────────────────────────────────────────────────────────────────

def build_design_criteria(summary: dict, risk_flags: list[dict],
                          collection, client: genai.Client) -> dict:
    normal_flow     = summary.get('flow_rate_m3h', 0)
    design_P        = summary.get('design_pressure_bar', 0)
    design_T        = summary.get('temperature_c', 0)
    flag_conditions = [f['condition'] for f in risk_flags]

    # Query RAG for design margin rules (1-PRC-0001 content is indexed)
    criteria_chunks = query_rag(
        'process design criteria flow margin hydraulic capacity nameplate 110%',
        collection, client, top_k=4
    )
    corrosion_chunks = query_rag(
        'corrosion allowance requirements material selection corrosive service',
        collection, client, top_k=4
    )

    prompt = f"""You are a process engineer applying design criteria for a pump project.

Project parameters:
- Normal flow: {normal_flow} m³/h
- Design pressure: {design_P} bar
- Design temperature: {design_T} °C
- Active risk flags: {', '.join(flag_conditions) or 'none'}

RAG results from company standards (includes 1-PRC-0001 Process Design Criteria):
{rag_text(criteria_chunks)}

RAG results for corrosion requirements:
{rag_text(corrosion_chunks)}

Based on the company standards above, return ONLY a JSON object:
{{
  "flow_margin_pct": <% margin to apply to normal flow — from company standard>,
  "flow_margin_source": "document reference from RAG",
  "pressure_class": "PN10 / PN16 / PN25 based on design pressure",
  "corrosion_allowance_mm": <mm — higher if corrosive_fluid flag active>,
  "corrosion_allowance_source": "document reference from RAG",
  "material_note": "material requirement — reference 5-LST-0003 and 4-SPC-0001 if corrosive",
  "pressure_test_note": "test requirement — mandatory hydrostatic test if high_pressure flag active"
}}"""

    resp = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.1),
    )
    text = resp.text.strip()
    if text.startswith('```'):
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    criteria = json.loads(text.strip())

    # Add calculated fields
    flow_margin     = criteria.get('flow_margin_pct', 10)
    criteria['normal_flow_m3h']   = normal_flow
    criteria['rated_flow_m3h']    = round(normal_flow * (1 + flow_margin / 100), 1)
    criteria['design_pressure_bar']  = design_P
    criteria['design_temperature_c'] = design_T
    criteria['rag_sources'] = list({c['doc_id'] for c in criteria_chunks + corrosion_chunks})
    return criteria


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Hydraulic calculations (pure Python maths)
# ─────────────────────────────────────────────────────────────────────────────

def calculate_hydraulics(summary: dict, fluid_props: dict, design_criteria: dict) -> dict:
    rho  = fluid_props.get('density_kgm3') or summary.get('fluid_density_kgm3') or 1000
    Ps_v = summary.get('suction_pressure_barg')
    Pd_v = summary.get('discharge_pressure_barg')
    Hs_s = summary.get('suction_static_head_m')
    Hs_d = summary.get('discharge_static_head_m')
    Hf_s = summary.get('suction_friction_loss_m')
    Hf_d = summary.get('discharge_friction_loss_m')
    Pvp  = fluid_props.get('vapor_pressure_kPa_at_temp') or 0

    notes = []

    # Pressure differential head
    if Ps_v is not None and Pd_v is not None:
        Hp = (Pd_v - Ps_v) * 100 * 1000 / (rho * G)
    else:
        Hp = None
        notes.append('Suction/discharge pressures not in SOW — Hp cannot be calculated.')

    # Static head
    if Hs_d is not None and Hs_s is not None:
        Hs = Hs_d - Hs_s
    elif Hs_d is not None:
        Hs = Hs_d
        notes.append('Suction static head not stated — assumed 0 m.')
    else:
        Hs = None
        notes.append('Static heads not in SOW — Hs marked TBD.')

    # Friction losses
    if Hf_s is not None and Hf_d is not None:
        Hf = Hf_s + Hf_d
    else:
        Hf = None
        notes.append('Pipe details not in SOW — friction losses TBD. '
                     'To be confirmed when P&ID and pipe routing are available.')

    # TDH
    if Hp is not None and Hs is not None:
        tdh_base  = round(Hp + Hs, 1)
        tdh_value = tdh_base if Hf is None else round(tdh_base + Hf, 1)
        tdh_str   = f'{tdh_base} m (excl. friction losses)' if Hf is None else f'{tdh_value} m'
    else:
        tdh_value = None
        tdh_str   = 'TBD'

    # NPSHa
    if Ps_v is not None:
        Ps_abs_kPa = (Ps_v + 1.01325) * 100
        NPSHa = round(
            Ps_abs_kPa * 1000 / (rho * G)
            + (Hs_s or 0)
            - (Hf_s or 0)
            - Pvp * 1000 / (rho * G),
            1
        )
    else:
        NPSHa = None
        notes.append('NPSHa cannot be calculated — suction pressure not provided.')

    return {
        'rated_flow_m3h':               design_criteria['rated_flow_m3h'],
        'fluid_density_kgm3':           rho,
        'specific_gravity':             round(rho / 1000, 3),
        'pressure_differential_head_m': round(Hp, 1) if Hp is not None else None,
        'static_head_m':                round(Hs, 1) if Hs is not None else None,
        'friction_loss_m':              round(Hf, 1) if Hf is not None else 'TBD',
        'total_dynamic_head_m':         tdh_value,
        'tdh_display':                  tdh_str,
        'NPSHa_m':                      NPSHa,
        'vapor_pressure_kPa':           Pvp,
        'calculation_notes':            notes,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — Gemini writes the calculation summary
# ─────────────────────────────────────────────────────────────────────────────

def generate_calc_summary(pm_summary: dict, fluid_props: dict,
                          design_criteria: dict, hydraulics: dict,
                          risk_flags: list[dict], client: genai.Client) -> str:
    prompt = f"""You are a Process Engineer writing a calculation summary for a centrifugal pump project.

Project: {pm_summary.get('project_title')} — {pm_summary.get('client')}
Location: {pm_summary.get('location')}

Fluid Properties (from RAG / 1-LST-0002):
- Fluid: {fluid_props.get('fluid_name')} (code: {fluid_props.get('fluid_code')}, source: {fluid_props.get('fluid_code_source')})
- Density: {fluid_props.get('density_kgm3')} kg/m³  |  SG: {fluid_props.get('specific_gravity')}
- Viscosity: {fluid_props.get('dynamic_viscosity_mPas')} mPa·s
- Vapour pressure at {pm_summary.get('temperature_c')}°C: {fluid_props.get('vapor_pressure_kPa_at_temp')} kPa
- Corrosive: {fluid_props.get('corrosive')}

Design Criteria (from RAG / 1-PRC-0001):
- Normal flow: {design_criteria.get('normal_flow_m3h')} m³/h → Rated: {design_criteria.get('rated_flow_m3h')} m³/h ({design_criteria.get('flow_margin_pct')}% margin, source: {design_criteria.get('flow_margin_source')})
- Design pressure: {design_criteria.get('design_pressure_bar')} bar ({design_criteria.get('pressure_class')})
- Corrosion allowance: {design_criteria.get('corrosion_allowance_mm')} mm (source: {design_criteria.get('corrosion_allowance_source')})
- Material: {design_criteria.get('material_note')}
- Pressure test: {design_criteria.get('pressure_test_note')}

Hydraulic Results:
- Pressure differential head: {hydraulics.get('pressure_differential_head_m')} m
- Static head: {hydraulics.get('static_head_m')} m
- Friction losses: {hydraulics.get('friction_loss_m')}
- TDH: {hydraulics.get('tdh_display')}
- NPSHa: {hydraulics.get('NPSHa_m')} m
- Notes: {'; '.join(hydraulics.get('calculation_notes', [])) or 'None'}

Active risk flags: {', '.join(f['condition'] for f in risk_flags) or 'None'}

Write a professional process calculation summary with these sections:
1. Scope
2. Fluid Identification — code, properties, engineering significance
3. Design Criteria Summary — margins applied, sources referenced
4. Hydraulic Calculation — TDH breakdown, NPSHa
5. Risk Considerations — engineering implications of active flags
6. Handover to Mechanical Engineer — explicit parameter list Mechanical must use

Be specific with numbers. Write in plain English suitable for an engineering record."""

    resp = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.3),
    )
    return resp.text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Display — thinking chain
# ─────────────────────────────────────────────────────────────────────────────

def print_thinking(pm_summary: dict, fluid_props: dict,
                   design_criteria: dict, hydraulics: dict,
                   risk_flags: list[dict]):
    sep = '─' * 64

    print(f'\n{"="*64}')
    print('  PROCESS AGENT — THINKING')
    print(f'{"="*64}')

    print(f'\n  [1] PROJECT CONTEXT (from PM)')
    print(f'  {sep}')
    print(f'  Client   : {pm_summary.get("client")}')
    print(f'  Project  : {pm_summary.get("project_title")}')
    print(f'  Fluid    : {pm_summary.get("fluid")}')
    print(f'  Flow     : {pm_summary.get("flow_rate_m3h")} m³/h  |  '
          f'P: {pm_summary.get("design_pressure_bar")} bar  |  '
          f'T: {pm_summary.get("temperature_c")} °C')
    if risk_flags:
        print(f'  Risk flags : {", ".join(f["condition"] for f in risk_flags)}')

    print(f'\n  [2] FLUID PROPERTIES  (source: RAG / 1-LST-0002)')
    print(f'  {sep}')
    print(f'  Code        : {fluid_props.get("fluid_code")}  ({fluid_props.get("fluid_code_source")})')
    print(f'  Density     : {fluid_props.get("density_kgm3")} kg/m³  (SG = {fluid_props.get("specific_gravity")})')
    print(f'  Viscosity   : {fluid_props.get("dynamic_viscosity_mPas")} mPa·s')
    print(f'  Vapour P    : {fluid_props.get("vapor_pressure_kPa_at_temp")} kPa at {pm_summary.get("temperature_c")} °C')
    print(f'  Corrosive   : {fluid_props.get("corrosive")}')
    if fluid_props.get('notes'):
        print(f'  Note        : {fluid_props["notes"]}')

    print(f'\n  [3] DESIGN CRITERIA  (source: RAG / 1-PRC-0001)')
    print(f'  {sep}')
    print(f'  Normal flow  : {design_criteria.get("normal_flow_m3h")} m³/h')
    print(f'  Rated flow   : {design_criteria.get("rated_flow_m3h")} m³/h  '
          f'({design_criteria.get("flow_margin_pct")}% — {design_criteria.get("flow_margin_source")})')
    print(f'  Pressure     : {design_criteria.get("design_pressure_bar")} bar → {design_criteria.get("pressure_class")}')
    print(f'  Corr. allow. : {design_criteria.get("corrosion_allowance_mm")} mm  '
          f'({design_criteria.get("corrosion_allowance_source")})')
    print(f'  Material     : {design_criteria.get("material_note")}')

    print(f'\n  [4] HYDRAULIC CALCULATION  (Python)')
    print(f'  {sep}')
    print(f'  Pressure head : {hydraulics.get("pressure_differential_head_m")} m')
    print(f'  Static head   : {hydraulics.get("static_head_m")} m')
    print(f'  Friction loss : {hydraulics.get("friction_loss_m")}')
    print(f'  TDH           : {hydraulics.get("tdh_display")}')
    print(f'  NPSHa         : {hydraulics.get("NPSHa_m")} m')
    for note in hydraulics.get('calculation_notes', []):
        print(f'  ⚠ {note}')

    print()


# ─────────────────────────────────────────────────────────────────────────────
# Confirmation
# ─────────────────────────────────────────────────────────────────────────────

def ask_confirmation(json_mode: bool) -> bool:
    if json_mode:
        return True
    print('─' * 64)
    print('  Do you confirm these process calculations? (yes / no)')
    print('  Type "yes" to save process_output.json and hand off to Mechanical.')
    print('─' * 64)
    answer = input('  > ').strip().lower()
    return answer in ('yes', 'y', 'confirm')


# ─────────────────────────────────────────────────────────────────────────────
# Main pipeline
# ─────────────────────────────────────────────────────────────────────────────

def run_process_agent(context_path: Path, json_mode: bool = False) -> dict | None:

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    client     = genai.Client(api_key=api_key)
    chroma     = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = chroma.get_collection(COLLECTION_NAME)

    if not json_mode:
        print('\nLoading project context from PM Agent...')
    pm_ctx     = load_project_context(context_path)
    pm_summary = pm_ctx['project_summary']
    risk_flags = pm_ctx.get('risk_flags_fired', [])

    if json_mode: emit_progress(1, 'Fetching fluid properties from RAG...')
    if not json_mode:
        print('Querying RAG for fluid properties...')
    fluid_props = get_fluid_properties(pm_summary, collection, client)
    if json_mode: emit_progress(1, 'Fluid Properties', status='done', data=fluid_props)

    if json_mode: emit_progress(2, 'Applying design criteria from RAG...')
    if not json_mode:
        print('Querying RAG for design criteria...')
    design_criteria = build_design_criteria(pm_summary, risk_flags, collection, client)
    if json_mode: emit_progress(2, 'Design Criteria', status='done', data=design_criteria)

    if json_mode: emit_progress(3, 'Running hydraulic calculations...')
    if not json_mode:
        print('Running hydraulic calculations...')
    hydraulics = calculate_hydraulics(pm_summary, fluid_props, design_criteria)
    if json_mode: emit_progress(3, 'Hydraulic Calculations', status='done', data=hydraulics)

    if not json_mode:
        print_thinking(pm_summary, fluid_props, design_criteria, hydraulics, risk_flags)
        confirmed = ask_confirmation(json_mode=False)
        if not confirmed:
            print('\n  Calculations cancelled. No files written.')
            return None

    if json_mode: emit_progress(4, 'Writing calculation summary...')
    if not json_mode:
        print('\nGenerating calculation summary...')
    calc_summary = generate_calc_summary(
        pm_summary, fluid_props, design_criteria, hydraulics, risk_flags, client
    )
    if json_mode: emit_progress(4, 'Calculation Summary', status='done')

    if not json_mode:
        print(f'\n{"="*64}')
        print('  PROCESS AGENT — CALCULATION SUMMARY')
        print(f'{"="*64}\n')
        print(calc_summary)
        print()

    # Step 5 — Generate deliverable documents (1-PRC-0001.docx, 1-CAL-XXXX.docx)
    if json_mode: emit_progress(5, 'Generating process deliverables...')
    else: print('\nGenerating process deliverables...')
    deliverables = save_process_deliverables(
        pm_summary, fluid_props, design_criteria, hydraulics, risk_flags, calc_summary, client
    )
    if json_mode: emit_progress(5, 'Process Deliverables', status='done',
                                data={'doc_ids': list(deliverables.keys())})
    else:
        for doc_id, content in deliverables.items():
            ok = '✓' if not content.startswith('[Generation failed') else '✗'
            print(f'  {ok} {doc_id}')

    output = {
        'generated_at':         datetime.now().isoformat(),
        'project_title':        pm_summary.get('project_title'),
        'client':               pm_summary.get('client'),
        'project_summary':      pm_summary,
        'fluid_properties':     fluid_props,
        'design_criteria':      design_criteria,
        'hydraulic_results':    hydraulics,
        'risk_flags':           risk_flags,
        'calc_summary':         calc_summary,
        'deliverables':         deliverables,
        'ready_for_mechanical': True,
    }

    return output


# ─────────────────────────────────────────────────────────────────────────────
# Single-step runner (used when --step N is passed)
# ─────────────────────────────────────────────────────────────────────────────

STEP_LABELS = {
    1: 'Fluid Properties',
    2: 'Design Criteria',
    3: 'Hydraulic Calculations',
    4: 'Calculation Summary',
}

def run_single_step(step_num: int, context_path: Path, prior_path: Path | None) -> dict:
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    client     = genai.Client(api_key=api_key)
    chroma     = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = chroma.get_collection(COLLECTION_NAME)

    pm_ctx     = load_project_context(context_path)
    pm_summary = pm_ctx['project_summary']
    risk_flags = pm_ctx.get('risk_flags_fired', [])

    prior: dict = {}
    if prior_path and prior_path.exists():
        prior = json.loads(prior_path.read_text())

    if step_num == 1:
        result = get_fluid_properties(pm_summary, collection, client)

    elif step_num == 2:
        result = build_design_criteria(pm_summary, risk_flags, collection, client)

    elif step_num == 3:
        fluid_props     = prior.get('step1', {}).get('result') or {}
        design_criteria = prior.get('step2', {}).get('result') or {}
        if not fluid_props or not design_criteria:
            raise ValueError('Steps 1 and 2 must be completed before step 3.')
        result = calculate_hydraulics(pm_summary, fluid_props, design_criteria)

    elif step_num == 4:
        fluid_props     = prior.get('step1', {}).get('result') or {}
        design_criteria = prior.get('step2', {}).get('result') or {}
        hydraulics      = prior.get('step3', {}).get('result') or {}
        if not fluid_props or not design_criteria or not hydraulics:
            raise ValueError('Steps 1, 2, and 3 must be completed before step 4.')
        result = generate_calc_summary(
            pm_summary, fluid_props, design_criteria, hydraulics, risk_flags, client
        )

    else:
        raise ValueError(f'Unknown step: {step_num}')

    return {'step': step_num, 'label': STEP_LABELS[step_num], 'result': result}


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Generate process deliverable documents
# ─────────────────────────────────────────────────────────────────────────────

def generate_prc_0001(pm_summary: dict, fluid_props: dict, design_criteria: dict,
                      hydraulics: dict, risk_flags: list[dict], client: genai.Client) -> str:
    """Generate 1-PRC-0001 Process Design Criteria as markdown."""
    prompt = f"""You are a Process Engineer writing a formal Process Design Criteria document (1-PRC-0001).

PROJECT:
- Client: {pm_summary.get('client')}
- Project: {pm_summary.get('project_title')}
- Location: {pm_summary.get('location')}
- Equipment: {pm_summary.get('equipment_type')}

FLUID DATA (from 1-LST-0002):
- Fluid: {fluid_props.get('fluid_name')} (Code: {fluid_props.get('fluid_code')}, source: {fluid_props.get('fluid_code_source')})
- Density: {fluid_props.get('density_kgm3')} kg/m³  |  SG: {fluid_props.get('specific_gravity')}
- Viscosity: {fluid_props.get('dynamic_viscosity_mPas')} mPa·s
- Vapour pressure at {pm_summary.get('temperature_c')}°C: {fluid_props.get('vapor_pressure_kPa_at_temp')} kPa
- Corrosive: {fluid_props.get('corrosive')}

DESIGN CRITERIA (from 1-PRC-0001 / RAG):
- Normal flow: {design_criteria.get('normal_flow_m3h')} m³/h → Rated: {design_criteria.get('rated_flow_m3h')} m³/h ({design_criteria.get('flow_margin_pct')}% margin, source: {design_criteria.get('flow_margin_source')})
- Design pressure: {design_criteria.get('design_pressure_bar')} bar ({design_criteria.get('pressure_class')})
- Design temperature: {design_criteria.get('design_temperature_c')} °C
- Corrosion allowance: {design_criteria.get('corrosion_allowance_mm')} mm (source: {design_criteria.get('corrosion_allowance_source')})
- Material note: {design_criteria.get('material_note')}
- Pressure test: {design_criteria.get('pressure_test_note')}

HYDRAULICS SUMMARY:
- TDH: {hydraulics.get('tdh_display')}
- NPSHa: {hydraulics.get('NPSHa_m')} m

ACTIVE RISK FLAGS: {', '.join(f['condition'] for f in risk_flags) or 'None'}

Write a complete Process Design Criteria document with these sections:
1. Document Information — a table with: Document ID, Title, Project, Client, Location, Revision, Date, Prepared By
2. Scope — what this document covers and its purpose on this project
3. Fluid Data — fluid code, physical properties table (density, viscosity, vapour pressure, SG), engineering significance
4. Design Conditions — table of: normal flow, rated flow (with margin), design pressure, design temperature, pressure class
5. Design Basis — margins applied and their sources, corrosion allowance rationale, material selection rationale, pressure test requirements
6. Risk Considerations — engineering implications of each active risk flag (or "None identified" if none)
7. References — applicable company standards referenced (1-LST-0002, 5-LST-0003, etc.)

The first line must be exactly: # 1-PRC-0001 — Process Design Criteria
Format as markdown with clear headers and tables."""

    resp = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.2),
    )
    return resp.text.strip()


def save_process_deliverables(pm_summary: dict, fluid_props: dict, design_criteria: dict,
                               hydraulics: dict, risk_flags: list[dict],
                               calc_summary: str, client: genai.Client) -> dict[str, str]:
    """Generate and save .md + .docx for each Process Engineer deliverable.
    Returns dict of {doc_id: markdown_content} for storage in project context.
    Only 1-PRC-0001 is returned for the project store — 1-CAL-XXXX stays as calc sheet.
    """
    import sys as _sys
    _sys.path.insert(0, str(RAG_ROOT))
    from export_docx import md_to_docx  # shared converter

    DELIVERABLES_DIR.mkdir(exist_ok=True)
    generated: dict[str, str] = {}

    # 1-PRC-0001 — generate from process output data
    try:
        content = generate_prc_0001(pm_summary, fluid_props, design_criteria, hydraulics, risk_flags, client)
        (DELIVERABLES_DIR / '1-PRC-0001.md').write_text(content, encoding='utf-8')
        md_to_docx(content, DELIVERABLES_DIR / '1-PRC-0001.docx')
        generated['1-PRC-0001'] = content
    except Exception as e:
        generated['1-PRC-0001'] = f'[Generation failed: {e}]'

    # 1-CAL-XXXX — save calc summary as .docx + structured data as .xlsx
    # (the project store keeps the structured calc sheet JSON — we don't override it)
    try:
        (DELIVERABLES_DIR / '1-CAL-XXXX.md').write_text(calc_summary, encoding='utf-8')
        md_to_docx(calc_summary, DELIVERABLES_DIR / '1-CAL-XXXX.docx')
    except Exception:
        pass

    try:
        import sys as _sys2
        _sys2.path.insert(0, str(RAG_ROOT))
        from export_xlsx import build_process_calc_xlsx
        # Build a full data dict to pass to the xlsx exporter
        xlsx_data = {
            'generated_at':    datetime.now().isoformat(),
            'project_summary': pm_summary,
            'fluid_properties': fluid_props,
            'design_criteria':  design_criteria,
            'hydraulic_results': hydraulics,
        }
        build_process_calc_xlsx(xlsx_data, DELIVERABLES_DIR / '1-CAL-XXXX.xlsx')
    except Exception:
        pass

    return generated


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Process Engineer Agent — hydraulic calculations + design criteria'
    )
    parser.add_argument(
        '--context',
        default=str(PM_DIR / 'project_context.json'),
        help='Path to project_context.json from PM Agent'
    )
    parser.add_argument(
        '--save',
        default=str(AGENT_DIR / 'process_output.json'),
        help='Where to save process_output.json'
    )
    parser.add_argument(
        '--json', action='store_true',
        help='Output raw JSON only (skips confirmation, enables SSE progress)'
    )
    parser.add_argument(
        '--step', type=int, choices=[1, 2, 3, 4],
        help='Run only a single step (requires --json)'
    )
    parser.add_argument(
        '--prior',
        help='Path to JSON file containing prior step results (required for steps 3 and 4)'
    )
    args = parser.parse_args()

    if args.step:
        # Single-step mode — always JSON output
        step_result = run_single_step(
            args.step,
            Path(args.context),
            Path(args.prior) if args.prior else None,
        )
        print(json.dumps(step_result, indent=2, default=str))
        sys.exit(0)

    result = run_process_agent(Path(args.context), json_mode=args.json)

    if result is None:
        sys.exit(0)

    if args.json:
        print(json.dumps(result, indent=2, default=str))
    else:
        out = Path(args.save)
        out.write_text(json.dumps(result, indent=2, default=str))
        print(f'\n  ✓ process_output.json saved  → {out}')

        summary_out = AGENT_DIR / 'process_calc_summary.md'
        summary_out.write_text(result.get('calc_summary', ''))
        print(f'  ✓ process_calc_summary.md    → {summary_out}')
        print('  Ready to hand off to Mechanical Engineer.\n')
