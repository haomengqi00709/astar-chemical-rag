"""
Skill: Fluid Scope Check

Checks whether a fluid code is within the approved project scope
based on the scope classification from the fluid code list (1-LST-0002).
"""

import json


def check_fluid_scope(
    fluid_code: str,
    scope_classification: str,
) -> str:
    """
    Check whether a fluid code is within the approved project scope.
    The scope classification is retrieved from the fluid code list (1-LST-0002).

    Args:
        fluid_code: The fluid code to check (e.g. 'WA', 'BR', 'AC').
        scope_classification: The scope field from 1-LST-0002
                              (e.g. 'A', 'B', 'C', 'D', or empty if not in scope).

    Returns:
        JSON string with fluid_code, scope_classification, in_scope (bool), and verdict.
    """
    in_scope = bool(
        scope_classification
        and scope_classification.strip()
        and scope_classification.strip() not in ('-', 'N/A', 'none')
    )
    result = {
        'fluid_code': fluid_code,
        'scope_classification': scope_classification or 'Not assigned',
        'in_scope': in_scope,
        'verdict': 'IN SCOPE' if in_scope else 'OUT OF SCOPE',
    }
    return json.dumps(result)
