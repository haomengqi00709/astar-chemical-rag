---
slug: 4-CAL-0025_gas_gas_hx_duct_loads_calculation_methodology_and_conventions
title: Gas/Gas Hx Duct Loads Calculation Methodology and Conventions (4-CAL-0025)
source_doc: 4-CAL-0025
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Gas/Gas Hx Duct Loads Calculation Methodology and Conventions (4-CAL-0025)

This page describes the methodology, tools, and conventions used for the Gas/Gas Heat Exchanger (Hx) Duct Loads Calculation, as outlined in document 4-CAL-0025. This calculation is performed to determine the forces and moments exerted by the duct connections on the heat exchanger structure.

**Calculation Process:**
This spreadsheet **is used** once duct stress analysis is complete and actual duct loads are known. The individual duct connection loads are detailed in [[4-CAL-0025_gas_gas_hx_duct_connection_loads]], and these inputs are then used to calculate the [[4-CAL-0025_gas_gas_hx_duct_combined_base_loads]].

**Software and Documentation:**
*   If duct stress analysis is not yet complete, criteria loads **will be entered** into PVElite.
*   The Stress Calculation Report (SCR) **will be generated** using PVElite results.
*   The reference document for Gas/Gas Exchanger Mechanical Calculations is [[4-prc-0009_gas_gas_exchanger_mechanical_calculations]].

**Sign Conventions:**
The following sign conventions **shall** be adhered to for consistency with industry-standard software:
*   Sign convention **will follow** Caesar II defaults.
*   Sign convention **will follow** PVElite defaults.
*   The X axis **is** positive up (Caesar II/PVElite default).
*   The Z axis **is** positive right (Caesar II/PVElite default).
*   The Y axis **is** positive out of page (Caesar II/PVElite default).

These conventions ensure accurate interpretation and integration of the calculation results with other engineering analyses.