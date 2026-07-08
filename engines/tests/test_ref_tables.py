"""Ref-Table lookups: two breaker ladders + breaker->cable + cable props."""
import pytest

from engines import refstd


def test_next_up_basic():
    assert refstd.next_up(45.5, [20, 30, 40, 50, 63]) == 50
    assert refstd.next_up(50, [20, 30, 40, 50, 63]) == 50     # exact rung
    assert refstd.next_up(0, [20, 30]) is None
    assert refstd.next_up(-5, [20, 30]) is None
    assert refstd.next_up(999, [20, 30]) == 30                # clamp to top


def test_dps_ladder_picks():
    # From the real LV-01 table: 46.784 A -> 50 A, 63.36 A -> 70 A, 12.09 A -> 20 A.
    assert refstd.dps_breaker(46.784) == 50
    assert refstd.dps_breaker(63.36) == 70
    assert refstd.dps_breaker(12.09) == 20


def test_iec_ladder_picks():
    # DB-1: 52.40 A continuous -> 63 A.
    assert refstd.iec_breaker(52.4033575581) == 63
    assert refstd.iec_breaker(16) == 16      # exact rung
    assert refstd.iec_breaker(17) == 20


def test_dps_and_iec_ladders_differ():
    # The two standards genuinely differ (e.g. 63 exists in IEC but not DPS).
    assert refstd.dps_breaker(55) == 70      # DPS has no 63
    assert refstd.iec_breaker(55) == 63      # IEC does


def test_breaker_to_cable():
    assert refstd.iec_min_cable(63) == 16
    assert refstd.iec_min_cable(400) == 240
    assert refstd.iec_min_cable(16) == 2.5


def test_cable_props():
    p = refstd.iec_cable_props(2.5)
    assert p["ampacity_a"] == 24 and p["mv_per_a_per_m"] == 18
    p6 = refstd.iec_cable_props(6)
    assert p6["ampacity_a"] == 41 and p6["mv_per_a_per_m"] == 7.3


def test_density_and_factors_from_table():
    assert refstd.dps_density("C6") == 188
    assert refstd.dps_density("C7") == 176
    assert refstd.dps_density("C9") is None       # not enumerated -> None, not a guess
    assert refstd.dps_demand_factor("office") == 0.6
    rate, std_h = refstd.dps_double_height()
    assert rate == 24 and std_h == 3.5
