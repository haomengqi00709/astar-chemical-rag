"""Golden test: the cable-sizing + voltage-drop engine reproduces the real Y-Tower
EL-CAL-5002 cable sheet (p.15), feeder by feeder (F1-F54).

Inputs: each office's feeder current (from load_density's current_400) + feeder length
(extracted). The engine must reproduce the real CSA + VD% for every feeder. Nothing
hard-coded: mv/a/m, derated ampacity and the 4% ceiling come from the Ref-Table.
"""
import json
from pathlib import Path

import pytest

from engines import cable_vd, load_density

FIX = json.loads((Path(__file__).parent.parent / "fixtures" / "lv01_offices.json").read_text())
ROOMS = FIX["rooms_input"]
LEN_BY_NAME = {r["name"]: r["feeder_length_m"] for r in ROOMS}
EXP = {e["name"]: e for e in FIX["expected"]}

BOARD = load_density.calc_board(ROOMS, footer_total_kva=FIX["_meta"]["footer_total_kva"])
CURRENT_400 = {r["name"]: r["current_400_a"] for r in BOARD["rooms"]}


@pytest.mark.parametrize("name", list(EXP.keys()))
def test_feeder_cable_matches_pdf(name):
    exp = EXP[name]
    r = cable_vd.size_cable(CURRENT_400[name], LEN_BY_NAME[name])
    assert r["csa"] == exp["cable_csa"], f"{name} CSA (got {r['csa']}, exp {exp['cable_csa']})"
    assert r["vd_pct"] == pytest.approx(exp["vd_pct"], abs=0.06), f"{name} VD%"


def test_all_54_feeders():
    assert len(EXP) == 54
    assert all("feeder_length_m" in r for r in ROOMS)


def test_anchor_feeders():
    # F1 Coffee shop: 46.59 A, 55 m -> 25 mm² / 0.9% (ampacity-driven).
    c = cable_vd.size_cable(46.59361, 55)
    assert c["csa"] == 25 and c["vd_pct"] == pytest.approx(0.9, abs=0.06) and c["driver"] == "ampacity"
    # F34 Office(254): 19.05 A, 145 m -> 6 mm², VD sits exactly at 4.0% (rounded).
    c = cable_vd.size_cable(19.05, 145)
    assert c["csa"] == 6 and c["vd_pct"] == pytest.approx(4.0, abs=0.06)
    # F48 Office(441): 20.73 A, 160 m -> 10 mm² (VD-driven: 6 mm² would exceed 4%).
    c = cable_vd.size_cable(20.73, 160)
    assert c["csa"] == 10 and c["driver"] == "vd"
    # F51 Office Duplex(448): 63.10 A, 180 m -> 35 mm² (ampacity-driven).
    c = cable_vd.size_cable(63.10, 180)
    assert c["csa"] == 35 and c["driver"] == "ampacity"


def test_vd_formula():
    # VD% = I·L·(mv/a/m)/1000 / 400 · 100. F1: 46.59×55×1.4/1000 = 3.587 V -> 0.897% -> 0.9%.
    pct, vd_v = cable_vd.vd_pct(46.59, 55, 25)
    assert vd_v == pytest.approx(3.59, abs=0.01)
    assert pct == pytest.approx(0.9, abs=0.06)


def test_missing_length_noted():
    r = cable_vd.size_cable(46.59, None)
    assert r["csa"] is None
    assert "length not provided" in r["note"]
