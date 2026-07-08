"""
Generate engines/fixtures/lv01_offices.json from the real EL-CAL-5002 LV-01 table.

INPUTS (what the engine receives): name, area_m2, category, is_double_height, height_m.
EXPECTED (golden, from the PDF, for pytest assertions): connected/additional/total/
demand/current_690/breaker per row + the printed footer total.

Source: PRJ.23026-EL-CAL-5002-01 pp.10-13. Coffee shop area is displayed as 198 but
the printed loads are computed from 197.8 (37.1864 = 197.8*188/1000); we store 197.8.
Double-height rooms all have total height 7.0 m (adder = 24*3.5*area/1000 = 0.084*area).
"""
import json
from pathlib import Path

# (name, area, category, expected_connected, expected_additional_or_None, expected_demand, expected_I690, expected_breaker)
# additional None = single height. Coffee shop area override = 197.8.
ROWS = [
    ("Coffee shop",               197.8, "C6", 37.1864, 16.6152, 32.2809, 46.784,     50),
    ("Office Double H(38)",       208,   "C7", 36.608,  17.472,  32.448,  47.026087,  50),
    ("Office Duplex(37,62)",      169,   "C7", 29.744,  None,    17.8464, 25.8643478, 30),
    ("Office Double H(34,65)",    121,   "C7", 21.296,  10.164,  18.876,  27.3565217, 30),
    ("Office(39)",                175,   "C7", 30.8,    None,    18.48,   26.7826087, 30),
    ("Office(54)",                179,   "C7", 31.504,  None,    18.9024, 27.3947826, 30),
    ("Office(84)",                79,    "C7", 13.904,  None,    8.3424,  12.0904348, 20),
    ("Office Duplex(79,112)",     245,   "C7", 43.12,   None,    25.872,  37.4956522, 40),
    ("Office(86)",                203,   "C7", 35.728,  None,    21.4368, 31.0678261, 40),
    ("Office(82)",                101,   "C7", 17.776,  None,    10.6656, 15.4573913, 20),
    ("Office(111)",               79,    "C7", 13.904,  None,    8.3424,  12.0904348, 20),
    ("Office(113)",               201,   "C7", 35.376,  None,    21.2256, 30.7617391, 40),
    ("Office(99)",                151,   "C7", 26.576,  None,    15.9456, 23.1095652, 30),
    ("Office(127)",               145,   "C7", 25.52,   None,    15.312,  22.1913043, 30),
    ("Office Double H(128,383)",  200,   "C7", 35.2,    16.8,    31.2,    45.2173913, 50),
    ("Office Duplex(145,129)",    263,   "C7", 46.288,  None,    27.7728, 40.2504348, 50),
    ("Office(142)",               146,   "C7", 25.696,  None,    15.4176, 22.3443478, 30),
    ("Office(157)",               166,   "C7", 29.216,  None,    17.5296, 25.4052174, 30),
    ("Office Double H(152)",      142,   "C7", 24.992,  11.928,  22.152,  32.1043478, 40),
    ("Office(175)",               163,   "C7", 28.688,  None,    17.2128, 24.946087,  30),
    ("Office(370)",               91,    "C7", 16.016,  None,    9.6096,  13.9269565, 20),
    ("Office(379)",               154,   "C7", 27.104,  None,    16.2624, 23.5686957, 30),
    ("Office(377)",               136,   "C7", 23.936,  None,    14.3616, 20.813913,  30),
    ("Office Duplex(281,359)",    158,   "C7", 27.808,  None,    16.6848, 24.1808696, 30),
    ("Office Double H(283)",      133,   "C7", 23.408,  11.172,  20.748,  30.0695652, 40),
    ("Office(290)",               136,   "C7", 23.936,  None,    14.3616, 20.813913,  30),
    ("Office(360)",               135,   "C7", 23.76,   None,    14.256,  20.6608696, 30),
    ("Office(262)",               92,    "C7", 16.192,  None,    9.7152,  14.08,      20),
    ("Office(271)",               133,   "C7", 23.408,  None,    14.0448, 20.3547826, 30),
    ("Office(270)",               129,   "C7", 22.704,  None,    13.6224, 19.7426087, 20),
    ("Office(241)",               127,   "C7", 22.352,  None,    13.4112, 19.4365217, 20),
    ("Office(242)",               131,   "C7", 23.056,  None,    13.8336, 20.0486957, 30),
    ("Office Duplex(247,357)",    158,   "C7", 27.808,  None,    16.6848, 24.1808696, 30),
    ("Office(254)",               125,   "C7", 22.0,    None,    13.2,    19.1304348, 20),
    ("Office(256)",               128,   "C7", 22.528,  None,    13.5168, 19.5895652, 20),
    ("Office(396)",               126,   "C7", 22.176,  None,    13.3056, 19.2834783, 20),
    ("Office(395)",               123,   "C7", 21.648,  None,    12.9888, 18.8243478, 20),
    ("Office Duplex(393,409)",    158,   "C7", 27.808,  None,    16.6848, 24.1808696, 30),
    ("Office(402)",               99,    "C7", 17.424,  None,    10.4544, 15.1513043, 20),
    ("Office(404)",               124,   "C7", 21.824,  None,    13.0944, 18.9773913, 20),
    ("Office(415)",               92,    "C7", 16.192,  None,    9.7152,  14.08,      20),
    ("Office(421)",               99,    "C7", 17.424,  None,    10.4544, 15.1513043, 20),
    ("Office(422)",               122,   "C7", 21.472,  None,    12.8832, 18.6713043, 20),
    ("Office(450)",               74,    "C7", 13.024,  None,    7.8144,  11.3252174, 20),
    ("Office(453)",               142,   "C7", 24.992,  None,    14.9952, 21.7321739, 30),
    ("Office(452)",               69,    "C7", 12.144,  None,    7.2864,  10.56,      20),
    ("Office(440)",               74,    "C7", 13.024,  None,    7.8144,  11.3252174, 20),
    ("Office(441)",               136,   "C7", 23.936,  None,    14.3616, 20.813913,  30),
    ("Office(442)",               64,    "C7", 11.264,  None,    6.7584,  9.79478261, 20),
    ("Office(449)",               74,    "C7", 13.024,  None,    7.8144,  11.3252174, 20),
    ("Office Duplex(448)",        414,   "C7", 72.864,  None,    43.7184, 63.36,      70),
    ("Office(33)",                74,    "C7", 13.024,  None,    7.8144,  11.3252174, 20),
    ("Office Duplex(197,415)",    379,   "C7", 66.704,  None,    40.0224, 58.0034783, 70),
    ("Office(430)",               74,    "C7", 13.024,  None,    7.8144,  11.3252174, 20),
]

SRC = "PRJ.23026-EL-CAL-5002-01, LV-01 MDB-OFFICES table (pp.10-13)"
CABLE_SRC = "PRJ.23026-EL-CAL-5002-01, LV-01 cable/voltage-drop sheet (p.15)"
FOOTER_TOTAL = 846.33216   # printed footer — KNOWN inconsistent with row sum

# Per-feeder F1..F54 from the real cable sheet (p.15), aligned by row order:
# (feeder_length_m, expected_cable_csa_mm2, expected_vd_pct)
CABLE = [
    (55, 25, 0.9), (65, 25, 1.1), (65, 10, 1.5), (80, 10, 1.9), (80, 10, 1.9),
    (85, 10, 2.0), (90, 6, 1.6), (90, 16, 1.8), (75, 16, 1.3), (75, 6, 1.7),
    (95, 6, 1.7), (80, 16, 1.3), (80, 10, 1.6), (100, 10, 1.9), (85, 25, 1.3),
    (85, 25, 1.2), (105, 10, 2.0), (90, 10, 2.0), (110, 16, 1.9), (95, 10, 2.1),
    (120, 6, 2.4), (105, 10, 2.2), (120, 6, 3.6), (110, 10, 2.3), (125, 16, 2.1),
    (110, 6, 3.3), (115, 6, 3.4), (120, 6, 2.4), (120, 6, 3.5), (135, 6, 3.8),
    (140, 6, 3.9), (125, 6, 3.6), (125, 10, 2.6), (145, 6, 4.0), (130, 6, 3.7),
    (135, 6, 3.8), (150, 10, 2.5), (135, 10, 2.8), (155, 6, 3.4), (140, 6, 3.8),
    (145, 6, 2.9), (160, 6, 3.5), (145, 6, 3.9), (150, 6, 2.5), (165, 10, 3.1),
    (150, 6, 2.3), (175, 6, 2.9), (160, 10, 2.9), (175, 6, 2.5), (165, 6, 2.7),
    (180, 35, 3.1), (170, 6, 2.8), (175, 35, 2.8), (175, 6, 2.9),
]
assert len(CABLE) == len(ROWS), f"cable rows {len(CABLE)} != office rows {len(ROWS)}"

rooms_input = []
expected = []
for (name, area, cat, conn, add, dem, i690, brk), (length, csa, vd) in zip(ROWS, CABLE):
    is_dh = add is not None
    rooms_input.append({
        "name": name, "area_m2": area, "category": cat,
        "is_double_height": is_dh, "height_m": 7.0 if is_dh else None,
        "feeder_length_m": length,
        "source_doc": SRC, "feeder_length_source": CABLE_SRC,
    })
    expected.append({
        "name": name, "connected_kva": conn, "additional_kva": (add if add is not None else 0.0),
        "demand_kva": dem, "current_690_a": i690, "breaker_a": brk,
        "cable_csa": csa, "vd_pct": vd,
    })

out = {
    "_meta": {"source": SRC, "footer_total_kva": FOOTER_TOTAL,
              "note": "footer_total is the stale printed value; true row sum differs (~877.37)."},
    "rooms_input": rooms_input,
    "expected": expected,
}
path = Path(__file__).parent / "lv01_offices.json"
path.write_text(json.dumps(out, indent=2, ensure_ascii=False))
print("wrote", path, "rows:", len(rooms_input),
      "| true demand sum:", round(sum(e["demand_kva"] for e in expected), 5),
      "| footer:", FOOTER_TOTAL)
