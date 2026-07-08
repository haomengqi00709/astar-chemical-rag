"""
Electrical load — power-density method (DPS 2022), reproduces the real Y-Tower
EL-CAL-5002 LV-01 office table.

Pure, deterministic. Every number is either an extracted input (room area /
category / height, tagged with its source document), a Ref-Table value (density,
demand factor, breaker ladder — engines/ref_tables/dps.json, tagged DPS 2022),
or a flagged gap in `calculation_notes`. Nothing is fabricated: a missing area or
an unknown category yields a note, not a guess.

Per-room chain (DPS 2022):
    connected_kva = area * density[category] / 1000
    additional_kva = (height - 3.5m) * area * 24 VA/m3 / 1000   (double-height only)
    total_connected = connected + additional
    demand_kva = total_connected * demand_factor          (offices: 0.6)
    current_690 = demand_kva * 1000 / 690                  (load table -> breaker)
    current_400 = demand_kva * 1000 / (sqrt(3) * 400)      (cable sheet)
    breaker_a = next standard >= current_690               (DPS ladder)
"""
import math
from . import refstd
from . import cable_vd

SQRT3 = math.sqrt(3)


def calc_room(room: dict) -> dict:
    """Compute the DPS load chain for one room. Returns a result dict that always
    includes `notes` (list of strings for any missing/uncomputable input)."""
    notes = []
    name = room.get("name", "?")
    area = room.get("area_m2")
    category = room.get("category")
    is_dh = bool(room.get("is_double_height"))
    height = room.get("height_m")

    density = refstd.dps_density(category) if category else None
    if area is None:
        notes.append(f"{name}: area not provided — connected load cannot be calculated.")
    if category is None:
        notes.append(f"{name}: category not provided — density unknown.")
    elif density is None:
        notes.append(f"{name}: category '{category}' not in DPS density table — density unknown.")

    connected = round(area * density / 1000, 4) if (area is not None and density is not None) else None

    # Double-height AC adder
    additional = 0.0
    if is_dh:
        if height is None:
            additional = None
            notes.append(f"{name}: double-height flagged but height not provided — additional AC load unknown.")
        elif area is None:
            additional = None
        else:
            rate, std_h = refstd.dps_double_height()
            additional = round((height - std_h) * area * rate / 1000, 4)

    if connected is None or additional is None:
        total = demand = i690 = i400 = breaker = None
    else:
        total = round(connected + additional, 4)
        df = refstd.dps_demand_factor("office")
        demand = round(total * df, 4)
        divisor = refstd.dps_load_current_divisor()
        i690 = round(demand * 1000 / divisor, 6)
        i400 = round(demand * 1000 / (SQRT3 * 400), 6)
        breaker = refstd.dps_breaker(i690)

    # Feeder cable sizing + voltage drop (downstream of current_400).
    length = room.get("feeder_length_m")
    cable_csa = mv_a_m = vd_pct = vd_status = cable_driver = None
    if i400 is not None:
        cab = cable_vd.size_cable(i400, length)
        cable_csa, mv_a_m = cab["csa"], cab["mv_a_m"]
        vd_pct, vd_status, cable_driver = cab["vd_pct"], cab["status"], cab["driver"]
        if cab["note"]:
            notes.append(f"{name}: {cab['note']}")

    return {
        "name": name,
        "area_m2": area,
        "category": category,
        "is_double_height": is_dh,
        "height_m": height,
        "density_va_m2": density,
        "connected_kva": connected,
        "additional_kva": additional,
        "total_connected_kva": total,
        "demand_factor": refstd.dps_demand_factor("office"),
        "demand_kva": demand,
        "current_690_a": i690,   # load-table current -> breaker
        "current_400_a": i400,   # cable-sheet current
        "breaker_a": breaker,
        "feeder_length_m": length,
        "cable_csa_mm2": cable_csa,
        "cable_mv_a_m": mv_a_m,
        "vd_pct": vd_pct,
        "vd_status": vd_status,
        "cable_driver": cable_driver,
        "notes": notes,
    }


def calc_board(rooms: list, footer_total_kva: float | None = None) -> dict:
    """Compute all rooms on the MDB-OFFICES board, plus the true board total.

    If a `footer_total_kva` (the value printed in the source PDF) is supplied and
    disagrees with the true row sum, a data-quality note is emitted — the tool
    surfaces the discrepancy rather than trusting the stale footer.
    """
    results = [calc_room(r) for r in rooms]
    demands = [r["demand_kva"] for r in results if r["demand_kva"] is not None]
    total_demand_true = round(sum(demands), 5)

    notes = []
    for r in results:
        notes.extend(r["notes"])

    footer_flag = None
    if footer_total_kva is not None:
        diff = round(total_demand_true - footer_total_kva, 5)
        if abs(diff) > 0.01:
            footer_flag = {
                "footer_printed_kva": footer_total_kva,
                "true_row_sum_kva": total_demand_true,
                "difference_kva": diff,
                "message": (
                    f"Printed board total {footer_total_kva} kVA does not match the "
                    f"sum of {len(demands)} row demands ({total_demand_true} kVA); "
                    f"difference {diff} kVA. Row values are authoritative."
                ),
            }
            notes.append(footer_flag["message"])

    vds = [r["vd_pct"] for r in results if r.get("vd_pct") is not None]
    max_vd = max(vds) if vds else None
    over = sum(1 for v in vds if v > 4.0)

    return {
        "board": "MDB-OFFICES",
        "rooms": results,
        "row_count": len(results),
        "total_demand_kva": total_demand_true,
        "footer_check": footer_flag,
        "max_vd_pct": max_vd,
        "feeders_over_4pct": over,
        "calculation_notes": notes,
        "method": "DPS 2022 power-density (area x VA/m2 x demand factor)",
    }
