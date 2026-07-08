"""Golden test: transformer/short-circuit engine reproduces the real Y-Tower SC sheet
(EL-CAL-5002 pp.15-16). Isc printed 23.19 kA -> assert within +/-0.5 kA (rounding)."""
import json
from pathlib import Path

import pytest

from engines import transformer

FIX = json.loads((Path(__file__).parent.parent / "fixtures" / "transformer.json").read_text())
R = transformer.calc_transformer(FIX["inputs"])
E = FIX["expected"]


def test_supply_network():
    assert R["supply"]["z_mohm"] == pytest.approx(E["supply_z_mohm"], abs=1e-3)
    assert R["supply"]["x_mohm"] == pytest.approx(E["supply_x_mohm"], abs=1e-3)
    assert R["supply"]["r_mohm"] == pytest.approx(E["supply_r_mohm"], abs=1e-3)


def test_transformer_impedance():
    assert R["transformer"]["in_a"] == pytest.approx(E["tx_in_a"], abs=0.05)     # 1443.38 A
    assert R["transformer"]["z_mohm"] == pytest.approx(E["tx_z_mohm"], abs=1e-2)  # 9.6
    assert R["transformer"]["r_mohm"] == pytest.approx(E["tx_r_mohm"], abs=1e-2)  # 1.504
    assert R["transformer"]["x_mohm"] == pytest.approx(E["tx_x_mohm"], abs=1e-2)  # 9.4815


def test_total_and_isc():
    assert R["total"]["r_mohm"] == pytest.approx(E["total_r_mohm"], abs=1e-2)
    assert R["total"]["x_mohm"] == pytest.approx(E["total_x_mohm"], abs=5e-2)
    assert R["total"]["z_mohm"] == pytest.approx(E["total_z_mohm"], abs=5e-2)     # 9.92
    assert R["isc_ka"] == pytest.approx(E["isc_ka_printed"], abs=E["isc_ka_tolerance"])  # 23.19 +/-0.5


def test_missing_input_noted():
    r = transformer.calc_transformer({"u20_v": 400, "psc_kva": None, "sn_kva": 1000, "usc_pct": 6, "pcu_w": 9400})
    assert r["isc_ka"] is None
    assert any("Psc" in n for n in r["calculation_notes"])


def test_loading_absent_when_no_demand():
    # Without building_demand_kva, loading is None (Phase 2/3 behaviour unchanged).
    assert R["loading"] is None


def test_loading_ok():
    # Real board demand 877.369 on a 1000 kVA transformer -> 87.7% (WARNING band >80%).
    r = transformer.calc_transformer({**FIX["inputs"], "building_demand_kva": 877.369})
    assert r["loading"]["loading_pct"] == pytest.approx(87.74, abs=0.05)
    assert r["loading"]["status"] == "WARNING"


def test_loading_overload_flagged():
    r = transformer.calc_transformer({**FIX["inputs"], "building_demand_kva": 1100})
    assert r["loading"]["loading_pct"] == 110.0
    assert r["loading"]["status"] == "OVERLOAD"
    assert any("overloaded" in n.lower() for n in r["calculation_notes"])
