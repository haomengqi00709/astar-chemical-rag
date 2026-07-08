"""
Electrical load — itemized method (IEC 60364), matches the Hunter Templates Master
DB-1 worked board.

Per-item: P_conn = basis * unit_load; P_dem = P_conn * DF.
Board:    demand = ΣP_dem; kVA = demand / PF; I = kVA*1000/(√3*V_LL);
          I_design = 1.25 * I; main breaker = next standard >= I_design (IEC ladder).
Essential loads (life-safety) are summed separately for the emergency board.

Pure/deterministic. Defaults (PF, V_LL, 1.25) and the breaker ladder come from the
IEC Ref-Table (engines/ref_tables/iec.json). Missing inputs -> notes, never a guess.
"""
import math
from . import refstd

SQRT3 = math.sqrt(3)


def calc_item(load: dict) -> dict:
    notes = []
    lid = load.get("id", "?")
    basis = load.get("basis")
    unit = load.get("unit_load")
    df = load.get("demand_factor")
    if basis is None or unit is None:
        connected = None
        notes.append(f"{lid}: basis or unit load missing — connected load unknown.")
    else:
        connected = basis * unit          # W
    if connected is None or df is None:
        demand = None
        if df is None:
            notes.append(f"{lid}: demand factor missing.")
    else:
        demand = connected * df
    return {
        "id": lid, "description": load.get("description", ""),
        "category": load.get("category", ""),
        "essential": bool(load.get("essential")),
        "connected_w": connected, "demand_factor": df,
        "demand_w": demand, "notes": notes,
    }


def calc_board(loads: list, pf: float | None = None, v_ll: float | None = None) -> dict:
    d = refstd.iec_defaults()
    pf = d["power_factor"] if pf is None else pf
    v_ll = d["system_voltage_ll"] if v_ll is None else v_ll
    cont = d["continuous_factor"]

    items = [calc_item(x) for x in loads]
    notes = []
    for it in items:
        notes.extend(it["notes"])

    conn_vals = [it["connected_w"] for it in items if it["connected_w"] is not None]
    dem_vals = [it["demand_w"] for it in items if it["demand_w"] is not None]
    total_connected_kw = round(sum(conn_vals) / 1000, 6)
    total_demand_kw = round(sum(dem_vals) / 1000, 6)
    kva = round(total_demand_kw / pf, 10)
    design_i = round(kva * 1000 / (SQRT3 * v_ll), 10)
    i_cont = round(design_i * cont, 10)
    main_breaker = refstd.iec_breaker(i_cont)

    essential_demand_kw = round(
        sum(it["demand_w"] for it in items if it["essential"] and it["demand_w"] is not None) / 1000, 6)

    return {
        "board": "DB-1",
        "items": items,
        "total_connected_kw": total_connected_kw,
        "total_demand_kw": total_demand_kw,
        "power_factor": pf,
        "kva": kva,
        "voltage_ll": v_ll,
        "design_current_a": design_i,
        "continuous_current_a": i_cont,
        "main_breaker_a": main_breaker,
        "essential_demand_kw": essential_demand_kw,
        "calculation_notes": notes,
        "method": "IEC 60364 itemized (basis x unit load x demand factor)",
    }
