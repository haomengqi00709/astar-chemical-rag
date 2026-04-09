---
slug: absorber_tower_calculation_data_banks
title: Absorber Tower Calculation Data Banks
source_doc: 1-Cal-7567-R1 (Template Absorber Tower)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Absorber Tower Calculation Data Banks

This page lists the SQL data banks and associated data structures referenced in the Absorber Tower calculation document [[1-cal-7567-r1_absorber_tower_calculation_document_details]]. These data banks are critical for the underlying calculations and simulations.

**SQL Data Bank References:**
*   **VISD:** Data available in SQL: VISD (dimensions 5,6)
*   **DEND:** Data available in SQL: DEND (dimensions 6,3)
*   **AW:** Data available in SQL: AW (dimension 6)
*   **PACK:** Data available in SQL: PACK (dimensions 18,13)
*   **GASES:** Data available in SQL: GASES (dimensions 3,2)
*   **VS:** Data available in SQL: VS (dimensions 5,11)
*   **PC:** Data available in SQL: PC (dimension 5)
*   **TP:** Data available in SQL: TP (dimension 11)
*   **VPSO3:** Data available in SQL: VPSO3 (dimensions 16,14)

**Initial Table Values:**
*   The first column values in the initial table range from 93.0 to 100.0.
*   Header row values in the initial table are 0.0, 0.0, 0.0, 0.0001, 0.0002, 0.0006, 0.0012, 0.0025, 0.0051.

**NTU Calculation Sheet:**
*   The sheet "NTU_calc" is specifically used for Partial pressure of SO3 calculation.

For more information on process calculations and data management, refer to [[process_calculations]] and [[stream_data_calculation_and_integration]].