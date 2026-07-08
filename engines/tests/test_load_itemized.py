"""
Golden-file test: the IEC itemized engine reproduces the Hunter Templates Master
DB-1 worked board (LOAD-Calc). Zero-tolerance on the demand chain and the 63 A main.

Inputs are the 8 DB-1 loads (basis x unit_load x demand factor). Nothing hard-coded:
PF/voltage/1.25 and the breaker ladder come from the IEC Ref-Table.
"""
import pytest

from engines import load_itemized

# DB-1 loads — Templates Master LOAD-Input (R1), incl. cross-discipline HVAC/plumbing/FF rows.
DB1 = [
    {"id": "L1", "description": "Lighting — office area",        "category": "Lighting",    "basis": 96, "unit_load": 11,   "demand_factor": 0.9},
    {"id": "S1", "description": "Small power — sockets",          "category": "Small power", "basis": 96, "unit_load": 25,   "demand_factor": 0.7},
    {"id": "H1", "description": "FCU units",                      "category": "HVAC",        "basis": 4,  "unit_load": 750,  "demand_factor": 0.8},
    {"id": "H2", "description": "AHU-1 supply fan",               "category": "HVAC",        "basis": 1,  "unit_load": 5500, "demand_factor": 0.9},
    {"id": "H3", "description": "Exhaust & pressurization fans",  "category": "HVAC",        "basis": 2,  "unit_load": 1100, "demand_factor": 0.8},
    {"id": "P1", "description": "Domestic water booster pump",    "category": "Plumbing",    "basis": 1,  "unit_load": 4000, "demand_factor": 0.8},
    {"id": "F1", "description": "Fire jockey pump",               "category": "Firefighting","basis": 1,  "unit_load": 2200, "demand_factor": 1.0, "essential": True},
    {"id": "W1", "description": "Water heater",                   "category": "Small power", "basis": 1,  "unit_load": 9000, "demand_factor": 1.0},
]

R = load_itemized.calc_board(DB1)
BY = {it["id"]: it for it in R["items"]}

# Per-item demand (kW) from Templates Master LOAD-Calc.
EXPECT_DEMAND_KW = {
    "L1": 0.9504, "S1": 1.68, "H1": 2.4, "H2": 4.95,
    "H3": 1.76, "P1": 3.2, "F1": 2.2, "W1": 9.0,
}


@pytest.mark.parametrize("lid,kw", EXPECT_DEMAND_KW.items())
def test_item_demand(lid, kw):
    assert BY[lid]["demand_w"] / 1000 == pytest.approx(kw, abs=1e-6)


def test_board_totals():
    assert R["total_connected_kw"] == pytest.approx(29.356, abs=1e-4)
    assert R["total_demand_kw"] == pytest.approx(26.1404, abs=1e-4)
    assert R["power_factor"] == 0.9
    assert R["kva"] == pytest.approx(29.0448888889, abs=1e-6)
    assert R["voltage_ll"] == 400
    assert R["design_current_a"] == pytest.approx(41.9226860465, abs=1e-6)
    assert R["continuous_current_a"] == pytest.approx(52.4033575581, abs=1e-6)
    assert R["main_breaker_a"] == 63


def test_essential_segregated():
    # Only F1 (jockey pump) is essential -> 2.2 kW to the emergency board.
    assert R["essential_demand_kw"] == pytest.approx(2.2, abs=1e-6)


def test_missing_input_noted():
    r = load_itemized.calc_board([{"id": "X", "basis": None, "unit_load": None, "demand_factor": 0.8}])
    assert r["items"][0]["connected_w"] is None
    assert any("basis or unit load missing" in n for n in r["calculation_notes"])
