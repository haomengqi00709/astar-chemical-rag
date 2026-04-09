---
slug: detail_code_listings_and_usage
title: Detail Code Listings and Usage
source_doc: 0-PRC-4001
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Detail Code Listings and Usage

The Detail Code is a four-digit code that forms the final, most granular component of the [[cost_code_structure]]. These codes provide specific identification for activities, materials, or services within a given [[cost_type_definitions]] and [[major_work_division_codes]].

It is important to note that Detail Codes **shall** be unique only when used in conjunction with both the Work Type code and the Major Work Division code. This ensures a precise and unambiguous classification of every cost item.

**Specific Detail Code Listings:**
*   Detail Codes for **ENG (Engineering)** activities are comprehensively listed. Data available in SQL: 0-LST-4001 (Engineering Cost Codes).
    *   For engineering cost codes, work **shall** be coded by activity. There is no reference to the position or department of the worker when assigning these codes, ensuring a focus on the task performed rather than the organizational unit.
*   Detail Codes for **MAT (Materials)** are listed. Data available in SQL: 0-LST-4002 (Materials Cost Codes).
*   Detail Codes for **CST (Construction)** activities are listed. Data available in SQL: 0-LST-4003 (Construction Cost Codes).
*   Detail Codes for **FLD (Field Services)** are listed. Data available in SQL: 0-LST-4004 (Field Services Cost Codes).
*   Detail Codes for **RES (Reserves)** are listed. Data available in SQL: 0-LST-4005 (Reserves Cost Codes).

These detailed listings are essential for accurate cost allocation and project financial management.

It is important to note that Detail Codes will be unique only when used in conjunction with the [[cost_type_definitions|Cost Type]] code and the [[major_work_division_codes|Major Work Division]] code.

Specific Detail Code listings are maintained in separate documents based on Cost Type:
*   For Engineering (`ENG`): 0-LST-4001: Engineering Cost Codes
*   For Materials (`MAT`): 0-LST-4002: Materials Cost Codes
*   For Construction (`CST`): 0-LST-4003: Construction Cost Codes
*   For Field Services (`FLD`): 0-LST-4004: Field Services Cost Codes
*   For Reserves (`RES`): 0-LST-4005: Reserves Cost Codes
---