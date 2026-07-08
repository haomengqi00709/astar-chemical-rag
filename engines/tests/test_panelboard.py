"""Golden test: panelboard engine reproduces real EL-PBS panels (single-phase convention).
Panel roll-ups (EPP-SERVICE-8 demand current 31.5 A, BS-02 5.1 A) + per-circuit selection."""
import json
from pathlib import Path

import pytest

from engines import panelboard

FIX = json.loads((Path(__file__).parent.parent / "fixtures" / "panels.json").read_text())
R = panelboard.calc_board(FIX["panels"], FIX["circuits"])
BY_REF = {p["ref"]: p for p in R["panels"]}


@pytest.mark.parametrize("panel", FIX["panels"], ids=[p["ref"] for p in FIX["panels"]])
def test_panel_rollup(panel):
    got = BY_REF[panel["ref"]]
    exp = panel["expected"]
    assert got["total_connected_va"] == pytest.approx(exp["total_connected_va"], abs=1.0)
    assert got["total_demand_va"] == pytest.approx(exp["total_demand_va"], abs=1.0)
    assert got["demand_current_a"] == pytest.approx(exp["demand_current_a"], abs=0.1)   # 31.5 / 5.1


def test_demand_factors_applied():
    epp8 = BY_REF["EPP-SERVICE-8"]
    assert epp8["per_class"]["MTR"]["df"] == 0.8
    assert epp8["per_class"]["LTG"]["df"] == 0.9
    assert epp8["per_class"]["MTR"]["demand_va"] == pytest.approx(19600.0, abs=1.0)


def test_main_margin_flagged():
    # BS-02: demand 5.1 A but mains 20 A -> spare margin flagged.
    bs02 = BY_REF["EPP-SERVICE-BS-02"]
    assert bs02["min_main_breaker_a"] == 10       # next standard >= 5.1
    assert bs02["mains_rating_a"] == 20
    assert bs02["main_margin_note"] is not None


@pytest.mark.parametrize("c", FIX["circuits"], ids=[c["desc"] for c in FIX["circuits"]])
def test_circuit_selection(c):
    sel = panelboard.select_circuit(c["current_a"], c["type"])
    assert sel["breaker_a"] == c["expected_breaker_a"], f"{c['desc']} breaker"
    assert sel["wire_mm2"] == c["expected_wire_mm2"], f"{c['desc']} wire"


def test_missing_input_noted():
    r = panelboard.calc_board([{"ref": "X", "classifications_connected_va": {}}], [])
    assert any("no classification" in n for n in r["calculation_notes"])
