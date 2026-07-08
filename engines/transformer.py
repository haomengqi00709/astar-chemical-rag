"""
Transformer + short-circuit calculation (EL-CAL-5006 / MV sizing), reproduces the
real Y-Tower EL-CAL-5002 SC sheet.

Chain (IEC 60909-style, as printed on the real sheet):
  Supply network (MV):   Z = U20^2 / Psc ;  X = 0.995*Z ;  R = 0.1*X
  Transformer:           In = Sn / (sqrt(3)*U20)
                         Z  = U20^2 * Usc% / (Sn * 100)
                         R  = Pcu / (3 * In^2)            (in ohm -> mOhm)
                         X  = sqrt(Z^2 - R^2)
  Series total:          R_t = R_sup + R_tx ; X_t = X_sup + X_tx ; Z_t = sqrt(R_t^2 + X_t^2)
  Short circuit:         Isc = U20 / (sqrt(3) * Z_t)

Pure/deterministic. Inputs are real extracted values (fixture, tagged source_doc);
Psc is a given utility figure. Missing inputs -> calculation_notes, never a guess.
All impedances in milliohm (mOhm) to match the sheet.
"""
import math

SQRT3 = math.sqrt(3)


def calc_transformer(inp: dict) -> dict:
    notes = []
    u20 = inp.get("u20_v")
    psc = inp.get("psc_kva")
    sn = inp.get("sn_kva")
    usc = inp.get("usc_pct")
    pcu = inp.get("pcu_w")

    for key, label in [("u20_v", "system voltage U20"), ("psc_kva", "utility SC power Psc"),
                       ("sn_kva", "transformer rating Sn"), ("usc_pct", "short-circuit voltage Usc%"),
                       ("pcu_w", "copper loss Pcu")]:
        if inp.get(key) is None:
            notes.append(f"{label} not provided — short-circuit result cannot be calculated.")

    if any(v is None for v in (u20, psc, sn, usc, pcu)):
        return {
            "board": "MV / Transformer", "inputs": inp,
            "supply": None, "transformer": None, "total": None,
            "isc_ka": None, "calculation_notes": notes,
            "method": "IEC 60909 short-circuit (supply + transformer impedance in series)",
        }

    # Supply network (mOhm). U20 in V, Psc in kVA -> U20^2/(Psc*1000) ohm -> *1000 mOhm = U20^2/Psc
    z_sup = round(u20 ** 2 / psc, 5)          # mOhm
    x_sup = round(0.995 * z_sup, 5)
    r_sup = round(0.1 * x_sup, 5)

    # Transformer
    tx_in = round(sn * 1000 / (SQRT3 * u20), 2)                 # A  (Sn kVA -> VA)
    z_tx = round(u20 ** 2 * usc / (sn * 100), 4)                # mOhm  (=U20^2*Usc/(Sn*1000*100)*1000)
    r_tx = round(pcu * 1000 / (3 * tx_in ** 2), 4)             # mOhm  (Pcu W -> mOhm: *1000)
    x_tx = round(math.sqrt(max(z_tx ** 2 - r_tx ** 2, 0.0)), 4)

    # Series total
    r_t = round(r_sup + r_tx, 3)
    x_t = round(x_sup + x_tx, 3)
    z_t = round(math.sqrt(r_t ** 2 + x_t ** 2), 3)

    # Short-circuit current (Z_t mOhm -> ohm: /1000; U20 V -> kA: /1000 => net /1e6 then the two cancel to /1000)
    isc_ka = round(u20 / (SQRT3 * z_t), 3)   # z_t in mOhm gives A/1000 = kA directly

    # Transformer loading — consumes the served building demand (kVA), making the
    # transformer a downstream of the load calc: loading% = demand / Sn * 100.
    # This is the propagation link (change a room -> board demand -> loading -> overload flag).
    loading = None
    demand = inp.get("building_demand_kva")
    if demand is not None:
        pct = round(demand / sn * 100, 2)
        status = "OVERLOAD" if pct > 100 else ("WARNING" if pct > 80 else "OK")
        loading = {"building_demand_kva": demand, "sn_kva": sn, "loading_pct": pct, "status": status}
        if status == "OVERLOAD":
            notes.append(f"Transformer overloaded: {demand} kVA demand on {sn} kVA unit = {pct}% — upsize required.")
        elif status == "WARNING":
            notes.append(f"Transformer loading {pct}% (> 80%) — limited spare capacity.")

    return {
        "board": "MV / Transformer",
        "inputs": inp,
        "supply": {"z_mohm": z_sup, "x_mohm": x_sup, "r_mohm": r_sup},
        "transformer": {"in_a": tx_in, "z_mohm": z_tx, "r_mohm": r_tx, "x_mohm": x_tx},
        "total": {"r_mohm": r_t, "x_mohm": x_t, "z_mohm": z_t},
        "isc_ka": isc_ka,
        "loading": loading,
        "calculation_notes": notes,
        "method": "IEC 60909 short-circuit (supply + transformer impedance in series)",
    }
