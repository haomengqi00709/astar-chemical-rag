"""
Electrical Engineer Agent (Nova) — electrical load calculation (EL-CAL-5002).

Unlike the pump chain (PM -> Process -> Mechanical, where each engineer reads the
previous engineer's output), a commercial building has no process/mechanical stage.
This agent reads the **PM project context** directly, pulls the office room data from
the electrical SQLite store, and runs the deterministic DPS power-density engine.

The number path contains NO LLM: the load table, currents and breaker picks are all
computed by engines/load_density.py from extracted inputs + versioned Ref-Tables.
The report is rendered deterministically from that result. Gemini is not used here.

CLI:
    python "work_agents/Nova - Electrical Engineer/electrical_agent.py" --context path/to/project_context.json --json
    python "work_agents/Nova - Electrical Engineer/electrical_agent.py" --json     # uses the LV-01 demo fixture
"""
import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

# Allow importing sibling scripts + the engines package at RAG root
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines import db as edb            # noqa: E402
from engines import transformer as etx    # noqa: E402
from engines import panelboard as epb     # noqa: E402

AGENT_DIR        = Path(__file__).parent
WORK_AGENTS      = AGENT_DIR.parent
RAG_ROOT         = WORK_AGENTS.parent
DELIVERABLES_DIR = AGENT_DIR / 'deliverables'
FIXTURES_DIR     = RAG_ROOT / 'engines' / 'fixtures'
FIXTURE          = FIXTURES_DIR / 'lv01_offices.json'
TX_FIXTURE       = FIXTURES_DIR / 'transformer.json'
PANEL_FIXTURE    = FIXTURES_DIR / 'panels.json'

EL_CAL_DOC_ID    = 'PRJ.23026-EL-CAL-5002'   # load
EL_TX_DOC_ID     = 'PRJ.23026-EL-CAL-5006'   # transformer / MV sizing
EL_PBS_DOC_ID    = 'PRJ.23026-EL-PBS-5001'   # panelboard schedule


def emit_progress(step: int, message: str, status: str = 'running', data: dict = None):
    payload = {'step': step, 'message': message, 'status': status}
    if data:
        payload['data'] = data
    print(json.dumps(payload), file=sys.stderr, flush=True)


# ─────────────────────────────────────────────────────────────────────────────
# Inputs — PM context + room data
# ─────────────────────────────────────────────────────────────────────────────

def load_pm_context(path: Path) -> dict:
    """Read the PM project_context.json. Tolerant: returns {} if absent (demo mode)."""
    if path and path.exists():
        return json.loads(path.read_text())
    return {}


def load_fixture_rooms() -> tuple[list, float]:
    fx = json.loads(FIXTURE.read_text())
    return fx['rooms_input'], fx['_meta'].get('footer_total_kva')


def get_project_rooms(conn, project_id: str) -> tuple[list, float, list]:
    """Return (rooms, footer_total, notes). If the project has no rooms in the DB yet,
    seed from the real LV-01 fixture so the demo runs, and note that this happened."""
    notes = []
    rooms = edb.get_rooms(conn, project_id)
    footer = None
    if not rooms:
        fixture_rooms, footer = load_fixture_rooms()
        edb.seed_rooms(conn, project_id, fixture_rooms)
        rooms = edb.get_rooms(conn, project_id)
        notes.append(
            f'No room data on record for {project_id}; seeded {len(rooms)} offices from the '
            'real LV-01 register (EL-CAL-5002) for this run. Replace with project extraction when available.'
        )
    else:
        # footer only known for the fixture; real extraction carries its own
        _, footer = load_fixture_rooms()
    return rooms, footer, notes


# ─────────────────────────────────────────────────────────────────────────────
# Deterministic report (no LLM — rendered straight from the engine result)
# ─────────────────────────────────────────────────────────────────────────────

def generate_load_report_md(project_title: str, board: dict) -> str:
    lines = []
    lines.append(f'# Electrical Load Calculation Report — {project_title or "Y-Tower"}')
    lines.append('')
    lines.append('## 1. Method')
    lines.append(f'{board["method"]}. Demand current from the load table uses Demand×1000/(3×230); '
                 'the main incomer breaker is the next standard rating (DPS 2022 Table 27).')
    lines.append('')
    lines.append('## 2. Board MDB-OFFICES — per-office load schedule')
    lines.append('')
    lines.append('| Office | Area m² | Cat | Connected kVA | Add\'l kVA | Total kVA | Demand kVA | Current A | Breaker A |')
    lines.append('|---|---|---|---|---|---|---|---|---|')
    for r in board['rooms']:
        def f(x, nd=2):
            return f'{x:.{nd}f}' if isinstance(x, (int, float)) else '—'
        lines.append(
            f'| {r["name"]} | {f(r["area_m2"],1)} | {r["category"] or "—"} | {f(r["connected_kva"])} '
            f'| {f(r["additional_kva"])} | {f(r["total_connected_kva"])} | {f(r["demand_kva"])} '
            f'| {f(r["current_690_a"])} | {r["breaker_a"] if r["breaker_a"] is not None else "—"} |'
        )
    lines.append('')
    lines.append('## 3. Board summary')
    lines.append('')
    lines.append(f'- Offices: {board["row_count"]}')
    lines.append(f'- Total demand (sum of rows): {board["total_demand_kva"]:.2f} kVA')
    fc = board.get('footer_check')
    if fc:
        lines.append(f'- ⚠ Data-quality flag: {fc["message"]}')
    lines.append('')
    if board.get('calculation_notes'):
        lines.append('## 4. Calculation notes')
        lines.append('')
        for n in board['calculation_notes']:
            lines.append(f'- {n}')
    return '\n'.join(lines)


def generate_transformer_report_md(project_title: str, tx: dict) -> str:
    lines = [f'# Transformer & Short-Circuit Calculation — {project_title or "Y-Tower"}', '']
    lines.append('## 1. Method')
    lines.append(f'{tx["method"]}. Supply and transformer impedances in series; '
                 'Isc = U20 / (√3 × Z_total).')
    lines.append('')
    inp = tx.get('inputs', {})
    lines.append('## 2. Inputs')
    lines.append('')
    lines.append('| Parameter | Value |')
    lines.append('|---|---|')
    lines.append(f'| System voltage U20 | {inp.get("u20_v")} V |')
    lines.append(f'| Utility SC power Psc | {inp.get("psc_kva")} kVA |')
    lines.append(f'| Transformer rating Sn | {inp.get("sn_kva")} kVA |')
    lines.append(f'| Short-circuit voltage Usc | {inp.get("usc_pct")} % |')
    lines.append(f'| Copper loss Pcu | {inp.get("pcu_w")} W |')
    lines.append('')
    if tx.get('transformer'):
        t = tx['transformer']; tot = tx['total']
        lines.append('## 3. Results')
        lines.append('')
        lines.append('| Quantity | Value |')
        lines.append('|---|---|')
        lines.append(f'| Rated current In | {t["in_a"]} A |')
        lines.append(f'| Transformer impedance Z | {t["z_mohm"]} mΩ |')
        lines.append(f'| Total impedance Z_total | {tot["z_mohm"]} mΩ |')
        lines.append(f'| **Short-circuit current Isc** | **{tx["isc_ka"]} kA** |')
    if tx.get('calculation_notes'):
        lines += ['', '## 4. Calculation notes', ''] + [f'- {n}' for n in tx['calculation_notes']]
    return '\n'.join(lines)


def generate_panel_report_md(project_title: str, pb: dict) -> str:
    lines = [f'# Panelboard Schedule — {project_title or "Y-Tower"}', '']
    lines.append('## 1. Method')
    lines.append(f'{pb["method"]}.')
    lines.append('')
    lines.append('## 2. Panel roll-ups')
    lines.append('')
    lines.append('| Panel | Total connected VA | Total demand VA | Demand current A | Min main A | Mains A |')
    lines.append('|---|---|---|---|---|---|')
    for p in pb.get('panels', []):
        lines.append(f'| {p["ref"]} | {p["total_connected_va"]} | {p["total_demand_va"]} '
                     f'| {p["demand_current_a"]} | {p["min_main_breaker_a"]} | {p.get("mains_rating_a","—")} |')
    lines.append('')
    if pb.get('circuits'):
        lines.append('## 3. Circuit selection')
        lines.append('')
        lines.append('| Circuit | Type | Current A | Breaker A | Wire mm² |')
        lines.append('|---|---|---|---|---|')
        for c in pb['circuits']:
            lines.append(f'| {c["desc"]} | {c["type"]} | {c["current_a"]} | {c["breaker_a"]} | {c["wire_mm2"]} |')
    if pb.get('calculation_notes'):
        lines += ['', '## 4. Calculation notes', ''] + [f'- {n}' for n in pb['calculation_notes']]
    return '\n'.join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Deliverables (.md + .docx per doc; .xlsx for the load calc)
# ─────────────────────────────────────────────────────────────────────────────

def save_electrical_deliverables(output: dict) -> dict:
    """Write a .md + .docx per deliverable doc, plus the rich .xlsx for the load calc."""
    from export_docx import md_to_docx
    from export_xlsx import build_electrical_calc_xlsx

    DELIVERABLES_DIR.mkdir(parents=True, exist_ok=True)
    deliverables = {}

    for doc_id, md in (output.get('reports') or {}).items():
        if not md:
            continue
        doc_slug = doc_id.replace('/', '_').replace('.', '_')
        (DELIVERABLES_DIR / f'{doc_slug}.md').write_text(md)
        try:
            md_to_docx(md, DELIVERABLES_DIR / f'{doc_slug}.docx')
        except Exception as e:
            print(f'Warning: could not generate {doc_slug}.docx: {e}', file=sys.stderr)
        deliverables[doc_id] = md

    # The load calc keeps its live-formula xlsx (54-office schedule).
    load_slug = EL_CAL_DOC_ID.replace('/', '_').replace('.', '_')
    try:
        build_electrical_calc_xlsx(output, DELIVERABLES_DIR / f'{load_slug}.xlsx')
    except Exception as e:
        print(f'Warning: could not generate {load_slug}.xlsx: {e}', file=sys.stderr)

    return deliverables


# ─────────────────────────────────────────────────────────────────────────────
# Main pipeline
# ─────────────────────────────────────────────────────────────────────────────

def run_electrical_agent(context_path: Path, json_mode: bool = False) -> dict:
    pm_ctx = load_pm_context(context_path)
    project_id = pm_ctx.get('project_id') or pm_ctx.get('id') or 'demo_electrical'
    ps = pm_ctx.get('project_summary') or {}
    project_title = ps.get('project_title') or pm_ctx.get('project_title') or 'Y-Tower'

    if json_mode: emit_progress(1, 'Loading office room data...')
    conn = edb.connect()
    edb.upsert_project(conn, project_id, title=project_title,
                       project_type=pm_ctx.get('project_type', 'commercial_building'))
    rooms, footer, seed_notes = get_project_rooms(conn, project_id)
    if json_mode: emit_progress(1, 'Room data', status='done', data={'offices': len(rooms)})

    if json_mode: emit_progress(2, 'Running electrical load calculation...')
    board = edb.compute_offices_board(conn, project_id, footer_total_kva=footer)
    board['calculation_notes'] = seed_notes + board.get('calculation_notes', [])
    conn.close()
    if json_mode:
        emit_progress(2, 'Load Calculation', status='done',
                      data={'total_demand_kva': board['total_demand_kva'], 'offices': board['row_count']})

    datasheet = generate_load_report_md(project_title, board)

    # ── Transformer / short-circuit + loading (EL-CAL-5006) ─────────────────
    # The board total demand feeds the transformer loading -> transformer is a
    # downstream of the load calc (the propagation link).
    if json_mode: emit_progress(3, 'Running transformer / short-circuit calculation...')
    tx_inp = {**json.loads(TX_FIXTURE.read_text())['inputs'],
              'building_demand_kva': board.get('total_demand_kva')}
    tx = etx.calc_transformer(tx_inp)
    tx['_kind'] = 'transformer'
    tx_report = generate_transformer_report_md(project_title, tx)
    if json_mode: emit_progress(3, 'Transformer', status='done', data={'isc_ka': tx['isc_ka']})

    # ── Panelboard schedule (EL-PBS-5001) ───────────────────────────────────
    if json_mode: emit_progress(4, 'Running panelboard schedule calculation...')
    pf = json.loads(PANEL_FIXTURE.read_text())
    pb = epb.calc_board(pf['panels'], pf['circuits'])
    pb['_kind'] = 'panelboard'
    pb_report = generate_panel_report_md(project_title, pb)
    if json_mode: emit_progress(4, 'Panelboard', status='done', data={'panels': len(pb['panels'])})

    board['_kind'] = 'load'
    results = {
        EL_CAL_DOC_ID: board,
        EL_TX_DOC_ID:  tx,
        EL_PBS_DOC_ID: pb,
    }
    reports = {
        EL_CAL_DOC_ID: datasheet,
        EL_TX_DOC_ID:  tx_report,
        EL_PBS_DOC_ID: pb_report,
    }

    output = {
        'generated_at':           datetime.now().isoformat(),
        'project_title':          project_title,
        'project_id':             project_id,
        'project_summary':        ps,
        'electrical_calculations': board,   # backward compat: the load result
        'electrical_datasheet':   datasheet,
        'results':                results,   # per-doc calc results, each with _kind
        'reports':                reports,   # per-doc markdown
        'ready_for_bid':          True,
    }

    if json_mode: emit_progress(5, 'Saving deliverables...')
    output['deliverables'] = save_electrical_deliverables(output)
    if json_mode: emit_progress(5, 'Complete', status='done')

    if not json_mode:
        print(f'\n{"="*64}\n  ELECTRICAL AGENT — LOAD / TRANSFORMER / PANELBOARD\n{"="*64}\n')
        print(datasheet)
        print('\n' + tx_report + '\n\n' + pb_report)
    return output


# ─────────────────────────────────────────────────────────────────────────────
# Change propagation (Phase 4) — change one room area, recompute downstream
# ─────────────────────────────────────────────────────────────────────────────

def run_change_room(context_path: Path, room_name: str, new_area: float) -> dict:
    """Change a room area → recompute the load board (SQLite computed_from graph) →
    recompute the transformer loading from the new board demand → return a trace +
    updated per-doc results (load + transformer), matching run_electrical_agent's shape."""
    pm_ctx = load_pm_context(context_path)
    project_id = pm_ctx.get('project_id') or pm_ctx.get('id') or 'demo_electrical'
    ps = pm_ctx.get('project_summary') or {}
    project_title = ps.get('project_title') or pm_ctx.get('project_title') or 'Y-Tower'

    conn = edb.connect()
    edb.upsert_project(conn, project_id, title=project_title,
                       project_type=pm_ctx.get('project_type', 'commercial_building'))
    # Ensure rooms exist (seed from fixture on first touch, same as a normal run).
    _, footer, _ = get_project_rooms(conn, project_id)
    # Ensure a baseline board exists so the propagation trace has valid "before" values
    # (in the normal flow the engineer has already run the full calc; this is a safety net).
    if not conn.execute("SELECT 1 FROM boards WHERE project_id=?", (project_id,)).fetchone():
        edb.compute_offices_board(conn, project_id, footer_total_kva=footer)

    prop = edb.propagate_room_change(conn, project_id, room_name, new_area, footer_total_kva=footer)
    conn.close()
    if prop.get('error'):
        return {'error': prop['error'], 'trace': []}

    board = prop['board']
    board['_kind'] = 'load'

    # Transformer loading recomputes from the new board demand (cross-document hop).
    tx_inp = {**json.loads(TX_FIXTURE.read_text())['inputs'],
              'building_demand_kva': board.get('total_demand_kva')}
    tx = etx.calc_transformer(tx_inp)
    tx['_kind'] = 'transformer'

    # Extend the trace with the transformer loading step.
    trace = list(prop['trace'])
    if tx.get('loading'):
        trace.append({'record': 'Transformer (1000 kVA)', 'field': 'loading_pct',
                      'before': round((next((s['before'] for s in prop['trace']
                                   if s['record'] == 'MDB-OFFICES'), 0) or 0) / tx_inp['sn_kva'] * 100, 2),
                      'after': tx['loading']['loading_pct'],
                      'changed': True, 'status': tx['loading']['status']})

    return {
        'generated_at':  datetime.now().isoformat(),
        'project_id':    project_id,
        'changed_room':  room_name,
        'old_area':      prop['old_area'],
        'new_area':      new_area,
        'trace':         trace,
        'results':       {EL_CAL_DOC_ID: board, EL_TX_DOC_ID: tx},
        'stale_doc_ids': [EL_CAL_DOC_ID, EL_TX_DOC_ID],
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Electrical Engineer Agent — load calculation (EL-CAL-5002)')
    parser.add_argument('--context', default='', help='Path to PM project_context.json (optional; demo uses LV-01 fixture)')
    parser.add_argument('--save', default=str(AGENT_DIR / 'electrical_output.json'), help='Where to save electrical_output.json')
    parser.add_argument('--json', action='store_true', help='Output raw JSON only')
    parser.add_argument('--change-room', default='', help='Propagation: name of the room whose area changed')
    parser.add_argument('--area', type=float, default=None, help='Propagation: the new area (m2) for --change-room')
    args = parser.parse_args()

    ctx_path = Path(args.context) if args.context else None

    if args.change_room:
        result = run_change_room(ctx_path, args.change_room, args.area)
        print(json.dumps(result, indent=2, default=str))
        sys.exit(0)

    result = run_electrical_agent(ctx_path, json_mode=args.json)

    if args.json:
        print(json.dumps(result, indent=2, default=str))
    else:
        out = Path(args.save)
        out.write_text(json.dumps(result, indent=2, default=str))
        print(f'\n  ✓ electrical_output.json saved → {out}')
