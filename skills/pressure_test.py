"""
Skill: Pressure Test Check

Checks whether a pressure test meets the minimum test pressure requirement
based on the test method from the piping service list (5-LST-0003).

Hydrostatic test: minimum 1.5x design pressure (ASME B31.3)
Pneumatic test:   minimum 1.1x design pressure (ASME B31.3)
"""

import json


def check_pressure_test(
    design_pressure_kpa: float,
    actual_test_pressure_kpa: float,
    required_test_method: str,
) -> str:
    """
    Check whether a pressure test meets the minimum test pressure requirement.
    For hydrostatic tests, ASME B31.3 requires >= 1.5x design pressure.
    For pneumatic tests, minimum is 1.1x design pressure.

    Args:
        design_pressure_kpa: Pipe design pressure in kPa.
        actual_test_pressure_kpa: The test pressure actually applied in kPa.
        required_test_method: Test method from 5-LST-0003 (e.g. 'Hydro', 'Pneumatic').

    Returns:
        JSON string with minimum required test pressure, actual test pressure,
        compliant (bool), and verdict.
    """
    method = required_test_method.strip().lower()
    if 'hydro' in method:
        factor = 1.5
        method_label = 'Hydrostatic'
    elif 'pneum' in method:
        factor = 1.1
        method_label = 'Pneumatic'
    else:
        factor = 1.5
        method_label = required_test_method

    minimum_required = round(design_pressure_kpa * factor, 1)
    compliant = actual_test_pressure_kpa >= minimum_required

    result = {
        'required_test_method': method_label,
        'design_pressure_kpa': design_pressure_kpa,
        'minimum_test_pressure_kpa': minimum_required,
        'actual_test_pressure_kpa': actual_test_pressure_kpa,
        'pressure_factor_applied': factor,
        'compliant': compliant,
        'verdict': 'COMPLIANT' if compliant else 'NON-COMPLIANT',
    }
    return json.dumps(result)
