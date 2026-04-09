---
slug: request_for_quotation_and_purchase_order_structure_and_content
title: Request for Quotation and Purchase Order Structure and Content
source_doc: 0-PRC-5001
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Request for Quotation and Purchase Order Structure and Content

Request for Quotations (RFQs) and Purchase Orders (POs) are structured into distinct Line Items and Text Sections to ensure comprehensive coverage of all necessary information. The format ensures that all deliverables, technical requirements, commercial terms, and contact information are clearly articulated.

**Line Items**
Line Items are used to detail all deliverables associated with the Goods and Services being procured. Each line item **must** contain:
*   A clear description of the deliverables.
*   Associated tag numbers (e.g., 7520P-A/B).
*   Relevant cost codes (e.g., 4-7520).
*   Pricing information.

*Example Line Items from Sample PO 99H10600-4005-R1:*
*   Line Item 1.1: 2 only Dry Pumps, Tag # 7520P-A/B, Cost Code 4-7520.
*   Line Item 1.2: 3 only Absorber Pumps, Tag # 7540P-A/B/C, Cost Code 4-7540.
*   Line Item 2.1: 1 lot Documentation, costs included above.
*   Line Item 3.1: 1 lot Packaging in Wooden Crating, Cost Code 0-5001.
*   Line Item 3.2: 1 lot Shipping FAS Port of Miami, Cost Code 0-5002.

**Text Sections**
Seven distinct Text Sections provide detailed information and references for the procurement.

*   **Text Section 1: Scope of Supply**
    This section **must** list all documents that define the technical requirements of the Goods and Services.
    *Example:* Vendor will supply Goods and Services in accordance with [[dry_pump_data_sheet_4_dst_7520]] (99H10600-4-DST-7520 R1 - Dry Pump 7520P), [[absorber_pump_data_sheet_4_dst_7540]] (99H10600-4-DST-7540 R1 - Absorber Pump 7540P), [[site_design_conditions_1_dst_0001]] (99H10600-1-DST-0001 R1 - Site Design Conditions), and [[general_mechanical_design_requirements_0_spc_0010]] (99H10600-4-SPC-0010 R1 - General Mechanical Design Requirements).

*   **Text Section 2: Documentation**
    This section **must** list all documents that define the requirements for documentation to be supplied by the Vendor.
    *Example:* Vendor will supply documentation in accordance with [[vendor_document_requirements_4_vdr_4005]] (99H10600-4-VDR-4005 R1 - Vendor Document Requirements) and [[vendor_document_supply]] (Data available in SQL: 0-SPC-0001 - Vendor Document Supply).

*   **Text Section 3: Delivery**
    This section **must** list all documents that define the requirements for packaging and **must** state the Delivery Date(s).
    *Example:* Vendor will supply packaging in accordance with [[packaging_marine_transport]] (Data available in SQL: 0-SPC-5004 - Packaging Marine Transport). The Delivery Date for Documentation is "As given in Section 2: Documentation". The Delivery Date for All other items is 12 August 2000.

*   **Text Section 4: Quality Assurance**
    This section **must** list all documents that define the requirements for the Vendor’s quality assurance and the requirements for review, inspection, and verification.
    *Example:* Vendor will comply with quality assurance requirements set out in [[quality_data_sheet_4_qds_4520]] (99H10600-4-QDS-4520 R1 - Quality Data Sheet), [[quality_data_sheet_4_qds_4540]] (99H10600-4-QDS-4540 R1 - Quality Data Sheet), and [[vendor_quality_assurance]] (Data available in SQL: 0-SPC-7001 - Vendor Quality Assurance).

*   **Text Section 5: Commercial**
    This section **must** list all documents that define the commercial conditions and **must** contain Order-Specific Conditions. These conditions are further defined in [[commercial_terms_for_purchase_0_prc_5004]].

*   **Text Section 6: References**
    This section **must** list all pertinent Vendor documents, including the original quotation and any subsequent clarifications or modifications.
    *Example:* Vendor supply is generally described in Quotation dated January 26, 2000.

*   **Text Section 7: Contact**
    This section **must** state the name and details of the Aker Kvaerner Chemetics contact persons (Project Buyer, Lead Engineer, and Inspector) and the Vendor contact persons, including any Vendor Key Personnel.

For specific responsibilities related to each section, refer to [[request_for_quotation_and_purchase_order_responsibilities]].