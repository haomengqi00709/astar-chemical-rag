"""
Panelboard schedule (EL-PBS-5001) — real Y-Tower single-phase 230 V branch convention.

Two deterministic parts, both reproduced from the real EL-PBS schedules:
  1) Classification roll-up:  per-type demand = connected * DF[type]
     (DF: LTG 0.9, S.O 0.4, MTR 0.8, MSC 1.0);  total demand = sum;
     panel demand current = total_demand / (sqrt(3) * 400).
  2) Per-circuit selection:  breaker = next standard >= circuit current
     (lighting minimum 10 A);  wire CSA from breaker (2.5@10, 4@16, 6@20, 10@32 ...).

NOTE this is NOT the Templates Master DB-1 3-phase itemized scheme (that stays in
load_itemized.py). The real branch circuits are single-phase; the 3-phase sqrt(3)*V
form appears only at panel/feeder demand-current level.

Main breaker: the real panels are oversized vs a pure next-standard pick (extra margin),
so we report the *minimum* main (next standard >= demand current) and leave the actual
mains rating as an input, flagging when they differ.

Pure/deterministic. DF/ladder/wire come from the Ref-Table; missing inputs -> notes.
"""
import math
from . import refstd

SQRT3 = math.sqrt(3)
_PANEL = refstd.load_table("panel_lv")
_DF = _PANEL["classification_demand_factor"]
_LADDER = _PANEL["breaker_ladder_a"]["values"]
_WIRE = _PANEL["breaker_to_wire_mm2"]
_LTG_MIN = _PANEL["branch_defaults"]["lighting_min_breaker_a"]
_V_LL = _PANEL["branch_defaults"]["system_voltage_ll"]


def _df_for(load_type: str, single_motor: bool = False):
    if load_type == "MTR" and single_motor:
        return _DF.get("MTR_single", _DF.get("MTR"))
    return _DF.get(load_type)


def select_circuit(current_a, load_type="MSC"):
    """Breaker + wire for one circuit. Lighting has a 10 A minimum breaker."""
    if current_a is None:
        return {"breaker_a": None, "wire_mm2": None, "note": "circuit current not provided"}
    breaker = refstd.next_up(current_a, _LADDER)
    if load_type == "LTG" and breaker is not None and breaker < _LTG_MIN:
        breaker = _LTG_MIN
    wire = _WIRE.get(str(int(breaker))) if breaker is not None else None
    return {"breaker_a": breaker, "wire_mm2": wire, "note": None}


def calc_panel(panel: dict) -> dict:
    """Classification roll-up for one panel + its demand current."""
    notes = []
    ref = panel.get("ref", "?")
    conn = panel.get("classifications_connected_va", {}) or {}
    if not conn:
        notes.append(f"{ref}: no classification connected loads provided.")

    per_class = {}
    total_connected = 0.0
    total_demand = 0.0
    for load_type, connected in conn.items():
        df = _df_for(load_type)
        if df is None:
            notes.append(f"{ref}: unknown load type '{load_type}' — no demand factor.")
            continue
        demand = connected * df
        per_class[load_type] = {"connected_va": connected, "df": df, "demand_va": round(demand, 1)}
        total_connected += connected
        total_demand += demand

    demand_current = round(total_demand / (SQRT3 * _V_LL), 2) if total_demand else 0.0
    min_main = refstd.next_up(demand_current, _LADDER)

    mains = panel.get("mains_rating_a")
    main_flag = None
    if mains is not None and min_main is not None and mains > min_main:
        main_flag = (f"Mains rating {mains} A exceeds the minimum {min_main} A "
                     f"for a {demand_current} A demand — spare margin applied by the designer.")

    return {
        "ref": ref,
        "per_class": per_class,
        "total_connected_va": round(total_connected, 1),
        "total_demand_va": round(total_demand, 1),
        "demand_current_a": demand_current,
        "min_main_breaker_a": min_main,
        "mains_rating_a": mains,
        "main_margin_note": main_flag,
        "notes": notes,
    }


def calc_board(panels: list, circuits: list | None = None) -> dict:
    """Compute all panels + optional standalone circuit selections."""
    panel_results = [calc_panel(p) for p in (panels or [])]
    circuit_results = []
    for c in (circuits or []):
        sel = select_circuit(c.get("current_a"), c.get("type", "MSC"))
        circuit_results.append({"desc": c.get("desc", ""), "type": c.get("type"),
                                "current_a": c.get("current_a"), **sel})
    notes = []
    for pr in panel_results:
        notes.extend(pr["notes"])
    return {
        "board": "Panelboards",
        "panels": panel_results,
        "circuits": circuit_results,
        "calculation_notes": notes,
        "method": "Real EL-PBS single-phase convention (classification DF + per-circuit breaker/wire)",
    }
