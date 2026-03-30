"""
Skills package — engineering calculation tools for compliance checking.

To add a new skill:
  1. Create a new .py file in this folder (e.g. skills/insulation_thickness.py)
  2. Define a single function with type hints and a clear docstring
  3. Import it here and add to TOOLS

The TOOLS list is passed directly to Gemini's function calling API.
Gemini infers the parameter schema from type hints and the docstring.
"""

from skills.corrosion_allowance import check_corrosion_allowance
from skills.fluid_scope import check_fluid_scope
from skills.pressure_test import check_pressure_test

TOOLS = [
    check_corrosion_allowance,
    check_fluid_scope,
    check_pressure_test,
]
