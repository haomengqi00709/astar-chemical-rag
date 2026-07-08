"""SQLite round-trip: seed the 54 real offices, compute the board from the DB,
verify persistence + computed_from lineage. Uses an in-memory DB (no side effects)."""
import json
from pathlib import Path

import pytest

from engines import db

FIX = json.loads((Path(__file__).parent.parent / "fixtures" / "lv01_offices.json").read_text())
ROOMS = FIX["rooms_input"]
FOOTER = FIX["_meta"]["footer_total_kva"]
PID = "proj_test"


@pytest.fixture
def conn():
    c = db.connect(":memory:")
    db.upsert_project(c, PID, title="Y-Tower test", project_type="commercial_building")
    db.seed_rooms(c, PID, ROOMS)
    yield c
    c.close()


def test_rooms_seeded(conn):
    rooms = db.get_rooms(conn, PID)
    assert len(rooms) == 54
    coffee = next(r for r in rooms if r["name"] == "Coffee shop")
    assert coffee["area_m2"] == 197.8
    assert coffee["category"] == "C6"
    assert coffee["source_doc"].startswith("PRJ.23026-EL-CAL-5002")


def test_compute_persists_board_and_loads(conn):
    result = db.compute_offices_board(conn, PID, footer_total_kva=FOOTER)
    assert result["total_demand_kva"] == pytest.approx(877.369, abs=0.1)

    board = conn.execute("SELECT * FROM boards WHERE project_id=?", (PID,)).fetchone()
    assert board["row_count"] == 54
    assert board["demand_kva"] == pytest.approx(877.369, abs=0.1)
    # footer_check persisted as JSON
    fc = json.loads(board["footer_check"])
    assert fc is not None and abs(fc["difference_kva"]) > 30

    loads = conn.execute("SELECT * FROM loads WHERE project_id=? ORDER BY load_id", (PID,)).fetchall()
    assert len(loads) == 54
    coffee = next(l for l in loads if l["name"] == "Coffee shop")
    assert coffee["breaker_a"] == 50
    assert coffee["demand_kva"] == pytest.approx(32.2809, abs=1e-3)
    # lineage: each load records which room it was computed from
    cf = json.loads(coffee["computed_from"])
    assert isinstance(cf, list) and len(cf) == 1


def test_recompute_bumps_rev(conn):
    db.compute_offices_board(conn, PID, footer_total_kva=FOOTER)
    db.compute_offices_board(conn, PID, footer_total_kva=FOOTER)
    board = conn.execute("SELECT rev FROM boards WHERE project_id=?", (PID,)).fetchone()
    assert board["rev"] == 2   # second compute bumped the revision
