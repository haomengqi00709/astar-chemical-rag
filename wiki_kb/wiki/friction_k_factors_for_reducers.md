---
slug: friction_k_factors_for_reducers
title: Friction K Factors for Reducers
source_doc: 4-PRC-0007
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Friction K Factors for Reducers

This page provides specific commentary on the impact of incorrectly sized pipe reducers on friction K factors, particularly in piping systems with very small approaches.

**Impact of Reducer Sizing:**
Incorrectly sized pipe reducers can lead to significant discrepancies in friction K factors, especially in systems where the approach to the reducer is very small. This issue is particularly pronounced with certain piping materials like PVC and CPVC.

**Consequences:**
*   **Inaccurate Hydraulic Calculations:** Errors in K factors directly affect the calculated dynamic head, leading to inaccurate TDH (Total Dynamic Head) values.
*   **Pump Performance Mismatches:** If the calculated TDH is incorrect, the selected pump may be undersized or oversized, leading to inefficient operation, cavitation, or excessive power consumption.
*   **System Pressure Drop:** The actual pressure drop across the reducer and the entire piping system may deviate significantly from design, impacting overall system performance.

**Mitigation:**
During the [[pump_sizing_stages|Final Impeller Trim]] stage, it is crucial to update calculations using pipe reducers that are based on the quoted pump suction and discharge connection sizes. This ensures that the most accurate dimensions are used, minimizing errors in friction loss calculations. Careful attention to reducer geometry and material properties is essential for reliable hydraulic design.