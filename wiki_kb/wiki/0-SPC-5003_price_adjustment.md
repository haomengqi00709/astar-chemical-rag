---
slug: 0-SPC-5003_price_adjustment
title: Price Adjustment for Goods and Services (0-SPC-5003)
source_doc: 0-SPC-5003
doc_type: SPC
discipline: 0
discipline_name: Administration
source_folder: Specification
track: A
---

# Price Adjustment for Goods and Services (0-SPC-5003)

This section details the mandatory requirements for price adjustment for Goods and Services under document **0-SPC-5003**. Prices **shall** be adjusted at each payment due date to account for the effects of rise and fall.

**Purchase Order Requirements:**
The [[purchase_order_commercial_and_contractual_terms|Purchase Order]] **must** include a table of relevant indexes for each category of Goods and Services. This table is further detailed in [[0-SPC-5003_table_1]].

**Index Definitions:**
*   **Base Date Index (B):** Defined as the latest available index prior to the base date.
*   **Latest Index (P):** Defined as the latest available index prior to the date of assessment for an amount due.

**Price Adjustment Factor Calculation:**
The Price Adjustment Factor is calculated as the total of the products of each proportion stated in the [[purchase_order_commercial_and_contractual_terms|Purchase Order]] (as referenced in [[0-SPC-5003_table_2]]) multiplied by the ratio (L - B)/B for the index linked to that proportion.
Should an index be changed after its use in a Price Adjustment Factor calculation, the calculation **shall** be repeated, and any necessary correction **must** be included in the subsequent assessment of the amount due.
For price adjustments occurring after the Completion Date, the Price Adjustment Factor calculated at the Completion Date for the entirety of the Goods and Services **shall** be utilized.

**Compensation Events:**
The Cost of Providing the Goods and Services for [[compensation_events]] **shall** be assessed using costs current at the time of the compensation event assessment. These costs are then adjusted to the base date by dividing by one plus the Price Adjustment Factor for the last assessment of the amount due.
For amounts calculated from rates specified in the [[purchase_order_commercial_and_contractual_terms|Purchase Order]] for employees and the Vendor’s plant and equipment, the Cost of Providing the Goods and Services for [[compensation_events]] **shall** be assessed using base date level costs.

**Inclusion in Amounts Due:**
Each amount due **must** incorporate an amount for price adjustment. This amount is the sum of:
*   The change in the amount due since the last assessment, multiplied by the Price Adjustment Factor for the current assessment date.
*   The price adjustment amount included in the previous amount due.
*   Any correcting amounts, not otherwise included, that result from changes to indices used for assessing previous amounts for price adjustment.