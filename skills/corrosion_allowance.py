"""
Skill: Corrosion Allowance Check

Checks whether a pipe's expected corrosion over its design life stays within
the required corrosion allowance from the piping service list (5-LST-0003).
"""

import json


def check_corrosion_allowance(
    corrosion_rate_mm_per_year: float,
    design_life_years: float,
    required_allowance_mm: float,
) -> str:
    """
    Check whether expected pipe corrosion over the design life meets the required
    corrosion allowance from the piping service classification (5-LST-0003).

    Args:
        corrosion_rate_mm_per_year: Expected metal loss per year in mm.
        design_life_years: Intended service life of the pipe in years.
        required_allowance_mm: Corrosion allowance required by the piping service
                               classification (retrieved from 5-LST-0003).

    Returns:
        JSON string with calculated_allowance_mm, required_allowance_mm,
        margin_mm, compliant (bool), and verdict.
    """
    calculated = round(corrosion_rate_mm_per_year * design_life_years, 3)
    margin = round(required_allowance_mm - calculated, 3)
    compliant = calculated <= required_allowance_mm

    result = {
        'calculated_allowance_mm': calculated,
        'required_allowance_mm': required_allowance_mm,
        'margin_mm': margin,
        'compliant': compliant,
        'verdict': 'COMPLIANT' if compliant else 'NON-COMPLIANT',
        'note': (
            'Zero margin — recommend engineering review.'
            if compliant and margin == 0
            else ('Negative margin — design does not meet requirement.' if not compliant else '')
        ),
    }
    return json.dumps(result)
