"""
SQLite data layer for the electrical engines — records-first.

Every computed record carries `source_doc` (where an input came from),
`computed_from` (JSON list of the record ids that fed it), `rev`, and `stale`.
These fields aren't used for propagation yet (Phase 4), but storing them now means
"change one input -> mark everything computed_from it stale -> recompute" is a query,
not a rewrite. The electrical discipline uses this DB; pump stays on JSON snapshots.

Phase 2 flow:  seed_rooms(...)  ->  compute_offices_board(...)  reads rooms, runs the
DPS density engine, and writes one `boards` row + one `loads` row per room.
"""
import json
import sqlite3
from pathlib import Path

from . import load_density

DEFAULT_DB = Path(__file__).parent / "electrical.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    title      TEXT,
    project_type TEXT
);
CREATE TABLE IF NOT EXISTS documents (
    doc_id     TEXT,
    project_id TEXT,
    title      TEXT,
    status     TEXT DEFAULT 'pending',
    rev        INTEGER DEFAULT 1,
    PRIMARY KEY (project_id, doc_id)
);
CREATE TABLE IF NOT EXISTS rooms (
    room_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id       TEXT,
    name             TEXT,
    area_m2          REAL,
    category         TEXT,
    is_double_height INTEGER DEFAULT 0,
    height_m         REAL,
    feeder_length_m  REAL,
    source_doc       TEXT,
    rev              INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS boards (
    board_id      TEXT,
    project_id    TEXT,
    demand_kva    REAL,
    row_count     INTEGER,
    method        TEXT,
    footer_check  TEXT,
    computed_from TEXT,
    rev           INTEGER DEFAULT 1,
    stale         INTEGER DEFAULT 0,
    PRIMARY KEY (project_id, board_id)
);
CREATE TABLE IF NOT EXISTS loads (
    load_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id       TEXT,
    board_id         TEXT,
    name             TEXT,
    category         TEXT,
    connected_kva    REAL,
    additional_kva   REAL,
    demand_kva       REAL,
    current_690_a    REAL,
    current_400_a    REAL,
    breaker_a        REAL,
    source_doc       TEXT,
    computed_from    TEXT,
    rev              INTEGER DEFAULT 1,
    stale            INTEGER DEFAULT 0
);
"""


def connect(path: str | Path = DEFAULT_DB) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    # Lightweight migration for DBs created before feeder_length_m existed.
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(rooms)").fetchall()}
    if "feeder_length_m" not in cols:
        conn.execute("ALTER TABLE rooms ADD COLUMN feeder_length_m REAL")
        conn.commit()
    return conn


def upsert_project(conn, project_id, title=None, project_type=None):
    conn.execute(
        "INSERT INTO projects(project_id,title,project_type) VALUES(?,?,?) "
        "ON CONFLICT(project_id) DO UPDATE SET title=excluded.title, project_type=excluded.project_type",
        (project_id, title, project_type),
    )
    conn.commit()


def seed_rooms(conn, project_id, rooms: list):
    """Replace the room set for a project (idempotent re-seed)."""
    conn.execute("DELETE FROM rooms WHERE project_id=?", (project_id,))
    for r in rooms:
        conn.execute(
            "INSERT INTO rooms(project_id,name,area_m2,category,is_double_height,height_m,feeder_length_m,source_doc) "
            "VALUES(?,?,?,?,?,?,?,?)",
            (project_id, r.get("name"), r.get("area_m2"), r.get("category"),
             1 if r.get("is_double_height") else 0, r.get("height_m"),
             r.get("feeder_length_m"), r.get("source_doc")),
        )
    conn.commit()


def get_rooms(conn, project_id) -> list:
    rows = conn.execute(
        "SELECT room_id,name,area_m2,category,is_double_height,height_m,feeder_length_m,source_doc "
        "FROM rooms WHERE project_id=? ORDER BY room_id", (project_id,)).fetchall()
    return [
        {"room_id": r["room_id"], "name": r["name"], "area_m2": r["area_m2"],
         "category": r["category"], "is_double_height": bool(r["is_double_height"]),
         "height_m": r["height_m"], "feeder_length_m": r["feeder_length_m"],
         "source_doc": r["source_doc"]}
        for r in rows
    ]


def compute_offices_board(conn, project_id, board_id="MDB-OFFICES", footer_total_kva=None) -> dict:
    """Read this project's rooms, run the DPS density engine, and persist the board
    + per-room load records (each `computed_from` its room_id). Returns the engine result."""
    rooms = get_rooms(conn, project_id)
    result = load_density.calc_board(rooms, footer_total_kva=footer_total_kva)

    conn.execute("DELETE FROM loads WHERE project_id=? AND board_id=?", (project_id, board_id))
    room_ids = []
    for room, res in zip(rooms, result["rooms"]):
        rid = room.get("room_id")
        room_ids.append(rid)
        conn.execute(
            "INSERT INTO loads(project_id,board_id,name,category,connected_kva,additional_kva,"
            "demand_kva,current_690_a,current_400_a,breaker_a,source_doc,computed_from) "
            "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            (project_id, board_id, res["name"], res["category"], res["connected_kva"],
             res["additional_kva"], res["demand_kva"], res["current_690_a"],
             res["current_400_a"], res["breaker_a"], room.get("source_doc"),
             json.dumps([rid])),
        )
    conn.execute(
        "INSERT INTO boards(project_id,board_id,demand_kva,row_count,method,footer_check,computed_from) "
        "VALUES(?,?,?,?,?,?,?) "
        "ON CONFLICT(project_id,board_id) DO UPDATE SET demand_kva=excluded.demand_kva, "
        "row_count=excluded.row_count, method=excluded.method, footer_check=excluded.footer_check, "
        "computed_from=excluded.computed_from, rev=boards.rev+1, stale=0",
        (project_id, board_id, result["total_demand_kva"], result["row_count"],
         result["method"], json.dumps(result["footer_check"]), json.dumps(room_ids)),
    )
    conn.commit()
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Change propagation (Phase 4)
#   Change one input (a room area) -> recompute downstream along the computed_from
#   graph -> return a before/after trace. rooms is the root input; loads/board are
#   its products (loads.computed_from=[room_id], board.computed_from=[all room ids]).
# ─────────────────────────────────────────────────────────────────────────────

def update_room(conn, project_id, room_name, area_m2):
    """Update one room's area (an extracted input) and bump its rev. Returns
    (room_id, old_area) or (None, None) if the room isn't found."""
    row = conn.execute(
        "SELECT room_id, area_m2 FROM rooms WHERE project_id=? AND name=?",
        (project_id, room_name)).fetchone()
    if not row:
        return None, None
    old = row["area_m2"]
    conn.execute("UPDATE rooms SET area_m2=?, rev=rev+1 WHERE room_id=?", (area_m2, row["room_id"]))
    conn.commit()
    return row["room_id"], old


def _board_load_snapshot(conn, project_id, room_name, board_id="MDB-OFFICES"):
    board = conn.execute(
        "SELECT demand_kva FROM boards WHERE project_id=? AND board_id=?",
        (project_id, board_id)).fetchone()
    load = conn.execute(
        "SELECT connected_kva, additional_kva, demand_kva, current_690_a, breaker_a "
        "FROM loads WHERE project_id=? AND board_id=? AND name=?",
        (project_id, board_id, room_name)).fetchone()
    return (dict(board) if board else {}), (dict(load) if load else {})


def propagate_room_change(conn, project_id, room_name, new_area, board_id="MDB-OFFICES",
                          footer_total_kva=None) -> dict:
    """Change a room area, recompute the board along the computed_from graph, and
    return a before/after trace + the new board result. Deterministic; no fabrication."""
    board_before, load_before = _board_load_snapshot(conn, project_id, room_name, board_id)

    room_id, old_area = update_room(conn, project_id, room_name, new_area)
    if room_id is None:
        return {"error": f"room '{room_name}' not found", "trace": [], "board": None}

    result = compute_offices_board(conn, project_id, board_id=board_id, footer_total_kva=footer_total_kva)
    board_after, load_after = _board_load_snapshot(conn, project_id, room_name, board_id)

    def step(record, field, before, after):
        return {"record": record, "field": field,
                "before": before, "after": after,
                "changed": (before != after)}

    trace = [
        step(room_name, "area_m2", old_area, new_area),
        step(f"{room_name} (load)", "connected_kva", load_before.get("connected_kva"), load_after.get("connected_kva")),
        step(f"{room_name} (load)", "demand_kva", load_before.get("demand_kva"), load_after.get("demand_kva")),
        step(f"{room_name} (load)", "breaker_a", load_before.get("breaker_a"), load_after.get("breaker_a")),
        step(board_id, "total_demand_kva", board_before.get("demand_kva"), board_after.get("demand_kva")),
    ]
    return {
        "changed_room": room_name,
        "old_area": old_area,
        "new_area": new_area,
        "trace": trace,
        "board": result,
    }
