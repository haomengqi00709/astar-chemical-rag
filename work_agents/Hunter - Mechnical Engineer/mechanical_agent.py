"""
Mechanical Engineer Agent (Hunter)

Reads process_output.json from the Process Agent and produces:
  1. mechanical_output.json — full calculation results + material specs
  2. pump_datasheet.md      — filled pump datasheet (4-PDS-XXXX equivalent)

Calculation formulas follow Pump_Calculation_Template.csv exactly.
All engineering knowledge (specs, material requirements) comes from RAG.

Steps:
  1. Load process_output.json from Aria
  2. Query RAG for pump spec requirements (4-SPC-0002, 4-SPC-0001, 4-PRC-0007)
  3. Query RAG for material selection (5-LST-0003, corrosive service)
  4. Run pump hydraulic + motor sizing calculations (Python — follows CSV template)
  5. Show thinking chain → human confirmation
  6. Gemini writes filled pump datasheet
  7. Save outputs

Usage:
    python "work_agents/Hunter - Mechnical Engineer/mechanical_agent.py"
    python "work_agents/Hunter - Mechnical Engineer/mechanical_agent.py" --context path/to/process_output.json
    python "work_agents/Hunter - Mechnical Engineer/mechanical_agent.py" --json
"""

import argparse
import json
import math
import os
import sys
from datetime import datetime
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

AGENT_DIR    = Path(__file__).parent
WORK_AGENTS  = AGENT_DIR.parent
RAG_ROOT     = WORK_AGENTS.parent
CHROMA_PATH  = RAG_ROOT / 'chroma_db'
PROCESS_DIR  = WORK_AGENTS / 'Aria - Process Engineer'

COLLECTION_NAME  = 'compliance_docs'
EMBEDDING_MODEL  = 'models/gemini-embedding-001'
GENERATION_MODEL = 'gemini-2.5-flash'

G    = 9.81    # m/s²
PATM = 1.01325 # bar (atmospheric pressure at sea level)


# ─────────────────────────────────────────────────────────────────────────────
# Load process context
# ─────────────────────────────────────────────────────────────────────────────

def load_process_output(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f'process_output.json not found at {path}. '
            'Run the Process Agent first.'
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
        chunks.append({'doc_id': meta.get('doc_id', '?'), 'text': text[:300]})
    return chunks


def rag_text(chunks: list[dict]) -> str:
    return '\n'.join(f"[{c['doc_id']}] {c['text']}" for c in chunks)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Pump hydraulic + motor sizing calculations
#           Follows Pump_Calculation_Template.csv exactly
# ─────────────────────────────────────────────────────────────────────────────

def run_pump_calculations(process_out: dict) -> dict:
    summary  = process_out['project_summary']
    fluid    = process_out['fluid_properties']
    hydro    = process_out['hydraulic_results']
    criteria = process_out['design_criteria']

    rho   = fluid.get('density_kgm3', 1000)
    Pv    = fluid.get('vapor_pressure_kPa_at_temp', 0) / 100  # kPa → bar
    Q     = hydro.get('rated_flow_m3h')
    eta   = 0.72   # typical centrifugal pump efficiency (confirmed with vendor)

    Ps_v  = summary.get('suction_pressure_barg')
    Pd_v  = summary.get('discharge_pressure_barg')
    zs    = summary.get('suction_static_head_m') or 0
    zd    = summary.get('discharge_static_head_m') or 0
    hf_s  = summary.get('suction_friction_loss_m') or 0
    hf_d  = summary.get('discharge_friction_loss_m') or 0

    notes = []

    # ── Total Suction Head (m) ────────────────────────────────────────────────
    if Ps_v is not None:
        Hs = ((Ps_v + PATM) * 100000 / (rho * G)
              + zs - hf_s
              - Pv * 100000 / (rho * G))
        Hs = round(Hs, 2)
    else:
        Hs = None
        notes.append('Suction pressure not provided — Hs cannot be calculated.')

    # ── Total Discharge Head (m) ──────────────────────────────────────────────
    if Pd_v is not None:
        Hd = ((Pd_v + PATM) * 100000 / (rho * G)
              + zd + hf_d)
        Hd = round(Hd, 2)
    else:
        Hd = None
        notes.append('Discharge pressure not provided — Hd cannot be calculated.')

    # ── TDH (Differential Head) ───────────────────────────────────────────────
    if Hs is not None and Hd is not None:
        TDH = round(Hd - Hs, 2)
    else:
        # Fall back to Process Agent's pressure differential head
        TDH = hydro.get('pressure_differential_head_m')
        if TDH:
            notes.append(f'Using pressure differential head from Process Agent ({TDH} m) — static heads and friction losses TBD.')
        else:
            TDH = None
            notes.append('TDH cannot be calculated — insufficient data.')

    # ── Hydraulic Power (kW) ──────────────────────────────────────────────────
    if Q and TDH:
        P_hyd = round(Q * rho * G * TDH / 3_600_000, 2)
    else:
        P_hyd = None
        notes.append('Hydraulic power cannot be calculated — Q or TDH missing.')

    # ── Brake Horsepower / Shaft Power (kW) ──────────────────────────────────
    BHP = round(P_hyd / eta, 2) if P_hyd else None

    # ── API 610 Motor Margin ──────────────────────────────────────────────────
    if BHP is not None:
        if BHP < 22:
            motor_margin = 1.25
        elif BHP <= 55:
            motor_margin = 1.15
        else:
            motor_margin = 1.10
        P_motor = round(BHP * motor_margin, 2)
    else:
        motor_margin = None
        P_motor = None

    # ── Specific Speed (dimensionless, SI) ────────────────────────────────────
    # Ns = N × Q^0.5 / H^0.75  (N in rpm, Q in m³/s, H in m)
    pump_speed = 1450  # standard 4-pole motor at 50 Hz
    if Q and TDH:
        Q_m3s = Q / 3600
        Ns = round(pump_speed * math.sqrt(Q_m3s) / (TDH ** 0.75), 1)
        if Ns < 25:
            impeller_type = 'Radial flow'
        elif Ns < 100:
            impeller_type = 'Mixed flow'
        else:
            impeller_type = 'Axial flow'
    else:
        Ns = None
        impeller_type = 'TBD'

    # ── NPSHa vs NPSHr check ──────────────────────────────────────────────────
    NPSHa = hydro.get('NPSHa_m')
    # Rough NPSHr estimate: typically 3-6 m for standard centrifugal pumps
    # Vendor confirms actual value; use conservative estimate of 4 m
    NPSHr_est = 4.0
    if NPSHa is not None:
        npsh_margin = round(NPSHa - NPSHr_est, 1)
        npsh_status = 'PASS' if npsh_margin >= 0.6 else 'VERIFY WITH VENDOR'
    else:
        npsh_margin = None
        npsh_status = 'TBD'

    return {
        'rated_flow_m3h':          Q,
        'fluid_density_kgm3':      rho,
        'specific_gravity':        round(rho / 1000, 3),
        'pump_speed_rpm':          pump_speed,
        'assumed_efficiency':      eta,
        'total_suction_head_m':    Hs,
        'total_discharge_head_m':  Hd,
        'total_dynamic_head_m':    TDH,
        'hydraulic_power_kW':      P_hyd,
        'shaft_power_kW':          BHP,
        'api610_motor_margin':     motor_margin,
        'required_motor_kW':       P_motor,
        'specific_speed_Ns':       Ns,
        'impeller_type':           impeller_type,
        'NPSHa_m':                 NPSHa,
        'NPSHr_estimated_m':       NPSHr_est,
        'npsh_margin_m':           npsh_margin,
        'npsh_status':             npsh_status,
        'calculation_notes':       notes,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Material selection from RAG
# ─────────────────────────────────────────────────────────────────────────────

def get_material_selection(process_out: dict, collection, client: genai.Client) -> dict:
    fluid      = process_out['fluid_properties']
    risk_flags = process_out.get('risk_flags', [])
    fluid_name = fluid.get('fluid_name', '')
    corrosive  = fluid.get('corrosive', False)
    flags      = [f['condition'] for f in risk_flags]

    # Query RAG for material requirements
    mat_chunks = query_rag(
        f'material selection wetted parts {fluid_name} corrosive service pump casing impeller shaft seal',
        collection, client, top_k=5
    )
    spec_chunks = query_rag(
        'centrifugal pump specification general equipment requirements 4-SPC-0002 4-SPC-0001',
        collection, client, top_k=4
    )

    all_chunks = mat_chunks + spec_chunks

    prompt = f"""You are a Mechanical Engineer specifying materials for a centrifugal pump.

Fluid: {fluid_name}
Corrosive service: {corrosive}
Active risk flags: {', '.join(flags) or 'none'}
Fluid density: {fluid.get('density_kgm3')} kg/m³

RAG results from company standards (4-SPC-0001, 4-SPC-0002, 5-LST-0003):
{rag_text(all_chunks)}

Based on the company standards above, return ONLY a JSON object:
{{
  "casing_material": "recommended material and grade",
  "impeller_material": "recommended material and grade",
  "shaft_material": "recommended material and grade",
  "mechanical_seal_type": "seal type recommendation",
  "seal_plan": "API seal plan recommendation (e.g. Plan 11, Plan 53B)",
  "baseplate_material": "recommended material",
  "material_source": "RAG document reference",
  "special_requirements": "any special requirements for this fluid service",
  "vendor_items_to_confirm": ["list of items vendor must confirm"]
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
    result = json.loads(text.strip())
    result['rag_sources'] = list({c['doc_id'] for c in all_chunks})
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Gemini writes the pump datasheet
# ─────────────────────────────────────────────────────────────────────────────

def generate_pump_datasheet(process_out: dict, calcs: dict,
                            materials: dict, client: genai.Client) -> str:
    summary  = process_out['project_summary']
    fluid    = process_out['fluid_properties']
    criteria = process_out['design_criteria']
    risk_flags = process_out.get('risk_flags', [])

    prompt = f"""You are a Mechanical Engineer filling in a Pump Data Sheet (4-PDS-XXXX) for a centrifugal pump project.

PROJECT INFORMATION
Client: {summary.get('client')}
Project: {summary.get('project_title')}
Location: {summary.get('location')}
Equipment tag: P-001 A/B (1 duty + 1 standby)

FLUID DATA (from Process Engineer)
Fluid: {fluid.get('fluid_name')} (Code: {fluid.get('fluid_code')})
Density: {fluid.get('density_kgm3')} kg/m³  |  SG: {fluid.get('specific_gravity')}
Viscosity: {fluid.get('dynamic_viscosity_mPas')} mPa·s
Vapour pressure: {fluid.get('vapor_pressure_kPa_at_temp')} kPa at {summary.get('temperature_c')}°C
Corrosive: {fluid.get('corrosive')}

DESIGN CONDITIONS
Rated flow: {calcs.get('rated_flow_m3h')} m³/h
Total Dynamic Head: {calcs.get('total_dynamic_head_m')} m
Design pressure: {criteria.get('design_pressure_bar')} bar ({criteria.get('pressure_class')})
Design temperature: {summary.get('temperature_c')} °C
NPSHa: {calcs.get('NPSHa_m')} m

CALCULATED RESULTS (follows 4-PRC-0007 / Pump_Calculation_Template)
Total suction head: {calcs.get('total_suction_head_m')} m
Total discharge head: {calcs.get('total_discharge_head_m')} m
TDH: {calcs.get('total_dynamic_head_m')} m
Hydraulic power: {calcs.get('hydraulic_power_kW')} kW
Shaft power (BHP): {calcs.get('shaft_power_kW')} kW (at η = {calcs.get('assumed_efficiency')})
Required motor: {calcs.get('required_motor_kW')} kW (API 610 margin {calcs.get('api610_motor_margin')}×)
Specific speed: {calcs.get('specific_speed_Ns')} → {calcs.get('impeller_type')}
NPSHr estimate: {calcs.get('NPSHr_estimated_m')} m | NPSHa: {calcs.get('NPSHa_m')} m | Status: {calcs.get('npsh_status')}

MATERIALS (from RAG / 4-SPC-0001, 4-SPC-0002, 5-LST-0003)
Casing: {materials.get('casing_material')}
Impeller: {materials.get('impeller_material')}
Shaft: {materials.get('shaft_material')}
Mechanical seal: {materials.get('mechanical_seal_type')} — {materials.get('seal_plan')}
Baseplate: {materials.get('baseplate_material')}
Special requirements: {materials.get('special_requirements')}

ACTIVE RISK FLAGS: {', '.join(f['condition'] for f in risk_flags) or 'none'}

Write a complete Pump Data Sheet in professional engineering format with these sections:
1. Equipment Identification — tag, service, quantity
2. Operating Conditions — fluid, flow, heads, pressures, temperature
3. Hydraulic Calculation Summary — show the TDH breakdown and motor sizing steps
4. Materials of Construction — all wetted and non-wetted parts with justification
5. Mechanical Seal Specification — type, plan, barrier fluid if needed
6. Vendor Requirements — what the vendor must confirm, submit, and test
7. Open Items — what is TBD and what needs vendor data to finalize

Be specific with numbers. Reference company standards (4-SPC-0002, 4-SPC-0001, 5-LST-0003) where applicable."""

    resp = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.3),
    )
    return resp.text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Display — thinking chain
# ─────────────────────────────────────────────────────────────────────────────

def print_thinking(process_out: dict, calcs: dict, materials: dict):
    sep = '─' * 64
    summary  = process_out['project_summary']
    fluid    = process_out['fluid_properties']
    criteria = process_out['design_criteria']

    print(f'\n{"="*64}')
    print('  MECHANICAL AGENT — THINKING')
    print(f'{"="*64}')

    print(f'\n  [1] PROCESS HANDOFF')
    print(f'  {sep}')
    print(f'  Client   : {summary.get("client")}')
    print(f'  Project  : {summary.get("project_title")}')
    print(f'  Fluid    : {fluid.get("fluid_name")}  (code: {fluid.get("fluid_code")})')
    print(f'  Rated Q  : {calcs.get("rated_flow_m3h")} m³/h  |  '
          f'ρ: {fluid.get("density_kgm3")} kg/m³  |  SG: {fluid.get("specific_gravity")}')
    print(f'  NPSHa    : {calcs.get("NPSHa_m")} m  |  '
          f'Design P: {criteria.get("design_pressure_bar")} bar')

    print(f'\n  [2] PUMP CALCULATIONS  (follows Pump_Calculation_Template.csv)')
    print(f'  {sep}')
    print(f'  Total suction head  : {calcs.get("total_suction_head_m")} m')
    print(f'  Total discharge head: {calcs.get("total_discharge_head_m")} m')
    print(f'  TDH                 : {calcs.get("total_dynamic_head_m")} m')
    print(f'  Hydraulic power     : {calcs.get("hydraulic_power_kW")} kW')
    print(f'  Shaft power (BHP)   : {calcs.get("shaft_power_kW")} kW  '
          f'(η = {calcs.get("assumed_efficiency")})')
    print(f'  Required motor      : {calcs.get("required_motor_kW")} kW  '
          f'(API 610 ×{calcs.get("api610_motor_margin")})')
    print(f'  Specific speed      : {calcs.get("specific_speed_Ns")} → {calcs.get("impeller_type")}')
    print(f'  NPSHa / NPSHr est.  : {calcs.get("NPSHa_m")} m / '
          f'{calcs.get("NPSHr_estimated_m")} m  → {calcs.get("npsh_status")}')
    for note in calcs.get('calculation_notes', []):
        print(f'  ⚠ {note}')

    print(f'\n  [3] MATERIAL SELECTION  (source: RAG / {materials.get("material_source", "4-SPC-0001, 5-LST-0003")})')
    print(f'  {sep}')
    print(f'  Casing     : {materials.get("casing_material")}')
    print(f'  Impeller   : {materials.get("impeller_material")}')
    print(f'  Shaft      : {materials.get("shaft_material")}')
    print(f'  Mech. seal : {materials.get("mechanical_seal_type")}  —  {materials.get("seal_plan")}')
    print(f'  Baseplate  : {materials.get("baseplate_material")}')
    if materials.get('special_requirements'):
        print(f'  Special    : {materials.get("special_requirements")}')
    if materials.get('vendor_items_to_confirm'):
        print(f'  Vendor to confirm:')
        for item in materials['vendor_items_to_confirm']:
            print(f'    - {item}')

    print()


# ─────────────────────────────────────────────────────────────────────────────
# Confirmation
# ─────────────────────────────────────────────────────────────────────────────

def ask_confirmation(json_mode: bool) -> bool:
    if json_mode:
        return True
    print('─' * 64)
    print('  Do you confirm these mechanical calculations? (yes / no)')
    print('  Type "yes" to save mechanical_output.json and pump_datasheet.md.')
    print('─' * 64)
    answer = input('  > ').strip().lower()
    return answer in ('yes', 'y', 'confirm')


# ─────────────────────────────────────────────────────────────────────────────
# Main pipeline
# ─────────────────────────────────────────────────────────────────────────────

def run_mechanical_agent(context_path: Path, json_mode: bool = False) -> dict | None:

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Set GOOGLE_API_KEY environment variable.')

    client     = genai.Client(api_key=api_key)
    chroma     = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = chroma.get_collection(COLLECTION_NAME)

    if not json_mode:
        print('\nLoading process output from Process Agent...')
    process_out = load_process_output(context_path)

    if not json_mode:
        print('Running pump calculations (Pump_Calculation_Template)...')
    calcs = run_pump_calculations(process_out)

    if not json_mode:
        print('Querying RAG for material selection...')
    materials = get_material_selection(process_out, collection, client)

    if not json_mode:
        print_thinking(process_out, calcs, materials)
        confirmed = ask_confirmation(json_mode=False)
        if not confirmed:
            print('\n  Calculations cancelled. No files written.')
            return None

    if not json_mode:
        print('\nGenerating pump datasheet...')
    datasheet = generate_pump_datasheet(process_out, calcs, materials, client)

    if not json_mode:
        print(f'\n{"="*64}')
        print('  MECHANICAL AGENT — PUMP DATASHEET')
        print(f'{"="*64}\n')
        print(datasheet)
        print()

    output = {
        'generated_at':      datetime.now().isoformat(),
        'project_title':     process_out.get('project_title'),
        'client':            process_out.get('client'),
        'project_summary':   process_out['project_summary'],
        'fluid_properties':  process_out['fluid_properties'],
        'design_criteria':   process_out['design_criteria'],
        'pump_calculations': calcs,
        'material_selection': materials,
        'risk_flags':        process_out.get('risk_flags', []),
        'pump_datasheet':    datasheet,
        'ready_for_bid':     True,
    }

    return output


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Mechanical Engineer Agent — pump calculations + datasheet'
    )
    parser.add_argument(
        '--context',
        default=str(PROCESS_DIR / 'process_output.json'),
        help='Path to process_output.json from Process Agent'
    )
    parser.add_argument(
        '--save',
        default=str(AGENT_DIR / 'mechanical_output.json'),
        help='Where to save mechanical_output.json'
    )
    parser.add_argument(
        '--json', action='store_true',
        help='Output raw JSON only (skips confirmation)'
    )
    args = parser.parse_args()

    result = run_mechanical_agent(Path(args.context), json_mode=args.json)

    if result is None:
        sys.exit(0)

    if args.json:
        print(json.dumps(result, indent=2, default=str))
    else:
        out = Path(args.save)
        out.write_text(json.dumps(result, indent=2, default=str))
        print(f'\n  ✓ mechanical_output.json saved → {out}')

        datasheet_out = AGENT_DIR / 'pump_datasheet.md'
        datasheet_out.write_text(result.get('pump_datasheet', ''))
        print(f'  ✓ pump_datasheet.md saved      → {datasheet_out}')
        print('  Mechanical engineering complete. Ready for bid package.\n')
