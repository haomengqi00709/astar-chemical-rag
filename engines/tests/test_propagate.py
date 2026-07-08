"""Phase 4: change propagation. Change a room area -> the room's load + the board
total recompute correctly, and a before/after trace is produced. In-memory DB."""
import json
from pathlib import Path

import pytest

from engines import db, load_density, transformer

FIX = json.loads((Path(__file__).parent.parent / "fixtures" / "lv01_offices.json").read_text())
ROOMS = FIX["rooms_input"]
FOOTER = FIX["_meta"]["footer_total_kva"]
PID = "proj_prop"


@pytest.fixture
def conn():
    c = db.connect(":memory:")
    db.upsert_project(c, PID)
    db.seed_rooms(c, PID, ROOMS)
    db.compute_offices_board(c, PID, footer_total_kva=FOOTER)
    yield c
    c.close()


def test_change_recomputes_load_and_board(conn):
    # Baseline
    base = db.compute_offices_board(conn, PID, footer_total_kva=FOOTER)
    assert base["total_demand_kva"] == pytest.approx(877.369, abs=0.1)

    # Change Coffee shop 197.8 -> 250 (enlarge). Expected new load computed by the engine.
    r = db.propagate_room_change(conn, PID, "Coffee shop", 250.0, footer_total_kva=FOOTER)
    # Independent recompute of the coffee-shop row via the pure engine:
    exp = load_density.calc_room({"name": "Coffee shop", "area_m2": 250.0, "category": "C6",
                                  "is_double_height": True, "height_m": 7.0})

    assert r["old_area"] == 197.8
    assert r["new_area"] == 250.0
    # The stored/recomputed load matches the pure engine (no fabrication).
    load_after = next(s for s in r["trace"] if s["field"] == "demand_kva")
    assert load_after["after"] == pytest.approx(exp["demand_kva"], abs=1e-3)
    assert load_after["before"] == pytest.approx(32.2809, abs=1e-3)  # was 197.8's demand

    # Board total went up (bigger coffee shop) and the delta equals the row delta.
    board_step = next(s for s in r["trace"] if s["record"] == "MDB-OFFICES")
    assert board_step["after"] > board_step["before"]
    row_delta = load_after["after"] - load_after["before"]
    board_delta = board_step["after"] - board_step["before"]
    assert board_delta == pytest.approx(row_delta, abs=1e-2)


def test_trace_has_before_after(conn):
    r = db.propagate_room_change(conn, PID, "Coffee shop", 250.0, footer_total_kva=FOOTER)
    fields = {s["field"] for s in r["trace"]}
    assert {"area_m2", "connected_kva", "demand_kva", "breaker_a", "total_demand_kva"} <= fields
    for s in r["trace"]:
        assert "before" in s and "after" in s and "changed" in s


def test_unknown_room(conn):
    r = db.propagate_room_change(conn, PID, "Nonexistent", 100.0, footer_total_kva=FOOTER)
    assert "error" in r


def test_propagation_reaches_transformer_loading(conn):
    # The board demand feeds the transformer loading -> cross-document propagation.
    r = db.propagate_room_change(conn, PID, "Coffee shop", 250.0, footer_total_kva=FOOTER)
    new_demand = next(s for s in r["trace"] if s["record"] == "MDB-OFFICES")["after"]
    tx_inp = json.loads((Path(__file__).parent.parent / "fixtures" / "transformer.json").read_text())["inputs"]
    tx = transformer.calc_transformer({**tx_inp, "building_demand_kva": new_demand})
    assert tx["loading"]["loading_pct"] == pytest.approx(round(new_demand / 1000 * 100, 2), abs=0.01)
    assert tx["loading"]["loading_pct"] > 87.7  # bigger than the 877/1000 baseline
