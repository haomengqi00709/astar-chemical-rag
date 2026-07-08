"""
Cable sizing + voltage drop for a feeder — reproduces the real Y-Tower EL-CAL-5002
cable sheet (p.15). Consumes the feeder current (the load engine's `current_400`)
plus the feeder route length.

Selection rule (verified on all 54 LV-01 feeders):
    pick the smallest standard CSA in {6,10,16,25,35} such that
        (1) derated_ampacity(CSA) >= current   AND
        (2) VD% = current * length * mv_per_a_per_m(CSA) / 1000 / V_LL * 100  <=  4.0%
Whichever constraint forces the upsize is reported as `driver` ('ampacity' | 'vd').

Pure/deterministic. mv/a/m, derated ampacity and the 4% ceiling come from the
Ref-Table (engines/ref_tables/cable_vd.json, each value tagged with its source).
A missing length -> None + note, never a guessed number.
"""
from . import refstd

_C = refstd.load_table("cable_vd")
_LADDER = _C["csa_ladder_mm2"]["values"]
_MVAM = _C["mv_per_a_per_m"]
_AMP = _C["derated_ampacity_a"]
_VD_CEILING = _C["vd_ceiling_pct"]["value"]
_V_LL = _C["system_voltage_ll"]["value"]


def _mvam(csa):
    return _MVAM[str(int(csa))]


def _ampacity(csa):
    return _AMP[str(int(csa))]


def vd_pct(current_a, length_m, csa):
    """Voltage drop % for a given feeder + cable: VD = I·L·(mv/a/m)/1000; VD% = VD/V_LL·100.
    VD% is rounded to 1 decimal to match the real sheet — which also rounds before applying
    the 4.0% ceiling (F34 computes to 4.005% but is shown/accepted as 4.0% at 6 mm²)."""
    vd_v = current_a * length_m * _mvam(csa) / 1000.0
    return round(vd_v / _V_LL * 100, 1), round(vd_v, 2)


def size_cable(current_a, length_m):
    """Select the cable CSA + compute its VD for one feeder. Returns a result dict
    that always includes a `note` list for missing/uncomputable inputs."""
    if current_a is None or length_m is None:
        return {"csa": None, "mv_a_m": None, "vd_v": None, "vd_pct": None,
                "driver": None, "status": None,
                "note": "feeder current or length not provided — cable cannot be sized."}

    for csa in _LADDER:
        amp_ok = _ampacity(csa) >= current_a
        pct, vd_v = vd_pct(current_a, length_m, csa)
        vd_ok = pct <= _VD_CEILING
        if amp_ok and vd_ok:
            # which constraint would the *previous* (smaller) size have failed?
            driver = "baseline"
            i = _LADDER.index(csa)
            if i > 0:
                prev = _LADDER[i - 1]
                prev_pct, _ = vd_pct(current_a, length_m, prev)
                if _ampacity(prev) < current_a:
                    driver = "ampacity"
                elif prev_pct > _VD_CEILING:
                    driver = "vd"
            return {"csa": csa, "mv_a_m": _mvam(csa), "vd_v": vd_v, "vd_pct": pct,
                    "driver": driver, "status": "OK", "note": None}

    # No standard size satisfies both constraints — flag it (don't fabricate).
    top = _LADDER[-1]
    pct, vd_v = vd_pct(current_a, length_m, top)
    return {"csa": top, "mv_a_m": _mvam(top), "vd_v": vd_v, "vd_pct": pct,
            "driver": "over-limit", "status": "CHECK",
            "note": f"largest cable {top} mm² still fails ampacity/VD at {current_a} A / {length_m} m — verify."}
