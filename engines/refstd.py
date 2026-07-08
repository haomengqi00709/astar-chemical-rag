"""
Reference-standard helpers shared by the electrical engines.

Loads the versioned Ref-Tables (DPS / IEC) and exposes deterministic lookups:
next standard breaker, breaker->cable, cable properties. No engineering values
are hard-coded here — every number comes from engines/ref_tables/*.json, each
tagged with its source (DPS 2022 table / IEC / Templates Master). Engineers edit
the JSON to re-target a jurisdiction; the code never changes.
"""
import json
from pathlib import Path

REF_DIR = Path(__file__).parent / "ref_tables"


def load_table(name: str) -> dict:
    """Load a ref-table JSON by stem (e.g. 'dps', 'iec')."""
    return json.loads((REF_DIR / f"{name}.json").read_text())


def next_up(value: float, ladder: list) -> float | None:
    """Smallest rung in an ascending ladder that is >= value.

    Returns the top rung if value exceeds it (clamp — matches the workbook's
    nested-IF that terminates at its largest size), and None if value <= 0.
    """
    if value is None or value <= 0:
        return None
    for rung in ladder:
        if rung >= value:
            return rung
    return ladder[-1]


# ---- DPS (real-project density method) -------------------------------------

_DPS = load_table("dps")


def dps_density(category: str):
    """VA/m2 for a DPS power-density category (e.g. 'C6', 'C7'). None if unknown."""
    return _DPS["power_density_va_per_m2"].get(category)


def dps_demand_factor(kind: str = "office"):
    return _DPS["demand_factor"].get(kind)


def dps_double_height():
    d = _DPS["double_height_adder"]
    return d["rate_va_per_m3"], d["standard_height_m"]


def dps_breaker(value: float):
    return next_up(value, _DPS["breaker_ladder_a"]["values"])


def dps_load_current_divisor() -> float:
    return _DPS["load_table_current_divisor"]["divisor"]


# ---- IEC (Templates Master itemized method) --------------------------------

_IEC = load_table("iec")


def iec_breaker(value: float):
    return next_up(value, _IEC["breaker_ladder_a"]["values"])


def iec_min_cable(breaker_a: float):
    """Minimum cable CSA (mm2) for a breaker rating, per BreakerCable table."""
    return _IEC["breaker_to_min_cable_mm2"].get(str(int(breaker_a)))


def iec_cable_props(cable_mm2: float) -> dict | None:
    """{'ampacity_a', 'mv_per_a_per_m'} for a cable CSA, per CableProps table."""
    # keys are stored without trailing .0 for integers (e.g. "4"), with decimal for "1.5"
    key = str(int(cable_mm2)) if float(cable_mm2).is_integer() else str(cable_mm2)
    return _IEC["cable_props"].get(key)


def iec_defaults() -> dict:
    return _IEC["itemized_defaults"]
