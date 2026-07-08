"""
Golden-file test: the DPS power-density engine reproduces the real Y-Tower
EL-CAL-5002 LV-01 office table, row by row.

Inputs are the extracted office data (name/area/category/height). The engine must
reproduce each row's connected / additional / demand / current(÷690) / breaker
exactly as printed in the PDF. Nothing is hard-coded: densities/DF/adder/ladder
come from the DPS Ref-Table; the fixture supplies only the extracted inputs.
"""
import json
import math
from pathlib import Path

import pytest

from engines import load_density

FIX = json.loads((Path(__file__).parent.parent / "fixtures" / "lv01_offices.json").read_text())
ROOMS = FIX["rooms_input"]
EXPECT = {e["name"]: e for e in FIX["expected"]}
FOOTER = FIX["_meta"]["footer_total_kva"]

RESULT = load_density.calc_board(ROOMS, footer_total_kva=FOOTER)
BY_NAME = {r["name"]: r for r in RESULT["rooms"]}

TOL = dict(rel=1e-3, abs=1e-3)  # PDF prints ~4-6 sig figs; loose enough for rounding, tight enough to catch method errors


@pytest.mark.parametrize("name", list(EXPECT.keys()))
def test_row_matches_pdf(name):
    got = BY_NAME[name]
    exp = EXPECT[name]
    assert got["connected_kva"] == pytest.approx(exp["connected_kva"], **TOL), f"{name} connected"
    assert got["additional_kva"] == pytest.approx(exp["additional_kva"], **TOL), f"{name} additional"
    assert got["demand_kva"] == pytest.approx(exp["demand_kva"], **TOL), f"{name} demand"
    assert got["current_690_a"] == pytest.approx(exp["current_690_a"], **TOL), f"{name} I690"
    assert got["breaker_a"] == exp["breaker_a"], f"{name} breaker (got {got['breaker_a']}, exp {exp['breaker_a']})"


def test_coffee_shop_full_chain():
    """The anchor chain, spelled out: 197.8 -> 37.1864 -> +16.6152 -> 53.8016 -> x0.6 -> 32.2809 -> /690 -> 46.784 -> 50A."""
    c = BY_NAME["Coffee shop"]
    assert c["area_m2"] == 197.8            # not the displayed 198
    assert c["density_va_m2"] == 188        # C6, from Ref-Table
    assert c["connected_kva"] == pytest.approx(37.1864, abs=1e-4)
    assert c["additional_kva"] == pytest.approx(16.6152, abs=1e-4)
    assert c["total_connected_kva"] == pytest.approx(53.8016, abs=1e-4)
    assert c["demand_kva"] == pytest.approx(32.2809, abs=1e-4)
    assert c["current_690_a"] == pytest.approx(46.784, abs=1e-3)
    assert c["breaker_a"] == 50


def test_all_54_rows_present():
    assert RESULT["row_count"] == 54
    assert len(EXPECT) == 54


def test_true_total_and_footer_flag():
    """True row sum ~= 877.37; the printed footer 846.33 must be flagged as inconsistent."""
    assert RESULT["total_demand_kva"] == pytest.approx(877.369, abs=0.1)
    assert RESULT["footer_check"] is not None, "engine should flag the stale footer"
    fc = RESULT["footer_check"]
    assert fc["footer_printed_kva"] == FOOTER
    assert abs(fc["difference_kva"]) > 30    # ~31 kVA discrepancy
    assert "does not match" in fc["message"]


def test_no_fabrication_on_missing_input():
    """A room with no area/category must yield None + a note, never a guessed number."""
    res = load_density.calc_room({"name": "Mystery", "area_m2": None, "category": None})
    assert res["connected_kva"] is None
    assert res["breaker_a"] is None
    assert any("area not provided" in n for n in res["notes"])
    assert any("category not provided" in n for n in res["notes"])
