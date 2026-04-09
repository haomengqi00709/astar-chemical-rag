---
slug: construction_subcontract_agreement_structure_and_data
title: Construction Subcontract Agreement Structure and Data
source_doc: 0-PRC-6002
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Construction Subcontract Agreement Structure and Data

This page details the specific structure and data points that **must** be included within a Construction Subcontract Agreement, as outlined in the [[construction_subcontract_agreement_procedure_0_prc_6002]]. The Agreement is systematically organized into "Agreement Details" and "Subcontract Data," with the latter further subdivided into eight distinct parts.

### Agreement Details
The "Agreement Details" section **must** clearly state the following fundamental information:
*   The date on which the Agreement is formally executed.
*   The full legal name and address of the Aker Kvaerner Chemetics entity or business name entering into the subcontract.
*   The full legal name and address of the Subcontractor.

### Subcontract Data (Part 1)
The "Subcontract Data" section is dedicated to providing comprehensive commercial and administrative information pertinent to the subcontract. It is structured into eight distinct parts:

*   **Part 1.1. General**
    This section **must** provide a general description of both the scope of the works to be performed and the characteristics of the site where the works will take place.

*   **Part 1.2. Time**
    This section **must** specify critical dates and periods for the subcontract:
    *   The official starting date for the works.
    *   The scheduled completion date for the works.
    *   The stipulated period within which a reply to any communication **must** be provided.
    *   The defects date, expressed as a number of weeks after the Completion date.
    *   The defects correction period, expressed in weeks.
    All dates and periods defined in Part 1.2 are referenced by [[construction_subcontract_standard_conditions_0_spc_6001]].

*   **Part 1.3. Payment**
    This section **must** detail all financial aspects of the subcontract:
    *   The total of the Prices, clearly indicating the appropriate currency code.
    *   A reference to [[construction_subcontract_price_list_0_lst_6x11]], which provides a detailed breakdown for lump sum subcontracts or a complete listing of units and prices for unit price subcontracts. Data available in SQL: 0-LST-6X11.
    *   The designated assessment day for payments.
    *   The retention amount, expressed as a percentage.
    *   The security amount, expressed as a percentage of the total Price.
    *   The specific method for the provision of security.
    *   [[delay_damages_commercial_terms]] as a fixed cost per day.
    All payment information specified in Part 1.3 is referenced by [[construction_subcontract_standard_conditions_0_spc_6001]].

*   **Part 1.4. Assessment of Compensation Events**
    This section defines the methodology and documents to be used for assessing future compensation events:
    *   **For a lump sum subcontract:** It **must** reference [[construction_subcontract_pricing_lump_sum_0_spc_6011]], [[construction_subcontract_labour_rates_0_lst_6x12]], [[construction_subcontract_crew_rates_0_lst_6x13]], [[construction_subcontract_indirect_labour_schedule_0_lst_6x14]], and [[construction_subcontract_equipment_schedule_0_lst_6x15]]. Data available in SQL: 0-LST-6X12, 0-LST-6X13, 0-LST-6X14, 0-LST-6X15.
    *   **For a unit price subcontract:** It **must** reference [[construction_subcontract_pricing_unit_price_0_spc_6012]], [[construction_subcontract_labour_rates_0_lst_6x12]], [[construction_subcontract_crew_rates_0_lst_6x13]], [[construction_subcontract_indirect_labour_schedule_0_lst_6x14]], and [[construction_subcontract_equipment_schedule_0_lst_6x15]]. Data available in SQL: 0-LST-6X12, 0-LST-6X13, 0-LST-6X14, 0-LST-6X15.
    *   This part **must** also reference the Subcontractor’s quoted mark-ups on costs.
    *   Related procedures for managing compensation events can be found in [[engineering_subcontract_compensation_event_procedure]].

*   **Part 1.5. Liability and Insurance**
    This section **must** specify insurance and liability provisions:
    *   What insurance coverage will be supplied by Aker Kvaerner Chemetics or by the Owner.
    *   The insured amount for the Subcontractor’s liability for loss of or damage to property.
    *   The insured amount for the Subcontractor’s liability for bodily injury to or death of a person arising from or in connection with the Subcontractor’s Providing the Works.
    *   Further details on insurance requirements are available in [[engineering_subcontractor_insurance_requirements]].

*   **Part 1.6. Disputes**
    This section **must** outline the process for dispute resolution:
    *   The form of tribunal for a dispute under the subcontract, which **must** be arbitration.
    *   The location where arbitration is to be conducted.
    *   The governing rules that will apply to the arbitration proceedings.
    *   The governing law for arbitration.
    *   The number of arbitrators to be appointed.
    *   The form of tribunal for a dispute arising under the Head Contract.

*   **Part 1.7. Commercial**
    This section **must** list the two specific documents that define the commercial conditions applicable to the subcontract. For general commercial terms, refer to [[commercial_terms_for_purchase_0_prc_5004]].

*   **Part 1.8. Coordination and Communication**
    This section **must** reference [[construction_subcontractor_coordination_0_spc_6003]] to define requirements for:
    *   Reporting protocols.
    *   Communication procedures.
    *   Site coordination meetings.
    *   Notification of Compensation Events.
    This part **must** also list the authorised representatives of both Aker Kvaerner Chemetics and the Subcontractor. General project communication guidelines are detailed in [[project_communication_management]].

The Agreement itself is standardized, utilizing the template identified as 0-SUB-6X00: [Template] Construction Subcontract Agreement.

The 'Subcontract Data' section is meticulously organized into eight distinct parts, each addressing specific commercial and operational aspects of the subcontract:

### Part 1.1. General
This section provides a general description of both the works to be performed and the site where the works will take place.

### Part 1.2. Time
This part specifies critical dates and periods, including:
*   The starting date of the subcontract.
*   The completion date for the works.
*   The period allowed for a reply to any communication.
*   The defects date, expressed as weeks after Completion.
*   The defects correction period, also expressed in weeks.
All dates and periods defined in Part 1.2 are referenced by the 0-SPC-6001 Standard Conditions for Construction Subcontract.

### Part 1.3. Payment
This section details all financial aspects of the subcontract, including:
*   The total of the Prices, specified with the appropriate currency code.
*   A reference to 0-LST-6X11: Construction Subcontract Price List, which provides a breakdown for lump sum subcontracts or a complete listing of units and prices for unit price subcontracts.
*   The designated assessment day for payments.
*   The retention amount, expressed as a percentage.
*   The security amount, expressed as a percentage of the Price.
*   The method of provision for security.
*   Delay damages, specified as a fixed cost per day.
All payment information in Part 1.3 is referenced by the 0-SPC-6001 Standard Conditions for Construction Subcontract.

### Part 1.4. Assessment of Compensation Events
This part outlines the basis for assessing future compensation events:
*   **For a lump sum subcontract:** References 0-SPC-6011: Construction Subcontract Pricing: Lump Sum, 0-LST-6X12: Construction Subcontract Labour Rates, 0-LST-6X13: Construction Subcontract Crew Rates, 0-LST-6X14: Construction Subcontract Indirect Labour Schedule, and 0-LST-6X15: Construction Subcontract Equipment Schedule.
*   **For a unit price subcontract:** References 0-SPC-6012: Construction Subcontract Pricing: Unit Price, 0-LST-6X12: Construction Subcontract Labour Rates, 0-LST-6X13: Construction Subcontract Crew Rates, 0-LST-6X14: Construction Subcontract Indirect Labour Schedule, and 0-LST-6X15: Construction Subcontract Equipment Schedule.
Additionally, this section will reference the Subcontractor’s quoted mark-ups on costs.

### Part 1.5. Liability and Insurance
This section specifies insurance provisions:
*   It states what insurance will be supplied by Aker Kvaerner Chemetics or by the Owner.
*   It specifies the insured amount for the Subcontractor’s liability for loss of or damage to property.
*   It specifies the insured amount for the Subcontractor’s liability for bodily injury to or death of a person arising from or in connection with the Subcontractor’s Providing the Works.

### Part 1.6. Disputes
This part defines the framework for dispute resolution:
*   It describes the form of tribunal for a dispute under the subcontract as arbitration.
*   It states the location where arbitration is to be conducted.
*   It states the governing rules for arbitration.
*   It states the governing law for arbitration.
*   It states the number of arbitrators.
*   It states the form of tribunal for a dispute under the Head Contract.

### Part 1.7. Commercial
This section lists the two specific documents that define the commercial conditions applicable to the subcontract.

### Part 1.8. Coordination and Communication
This part outlines requirements for interaction and information exchange:
*   It references 0-SPC-6003: Construction Subcontractor Coordination to define requirements for reporting, communication, site coordination meetings, and notification of Compensation Events.
*   It lists the authorised representatives of both Parties for formal communication.
---