---
slug: incoming_vendor_document_processing
title: Incoming Vendor Document Processing
source_doc: 0-PRC-0007
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Incoming Vendor Document Processing

All vendor documents are directed to Document Control for processing upon receipt. This ensures proper registration, numbering, and distribution within the project team.

**Document Conversion and Numbering:**
*   If Vendor Documents are not already in Adobe Portable Document Format (PDF), Document Control **must** convert native digital format documents to PDF.
*   If Vendor Documents are printed paper documents, Document Control **must** scan them to create PDF versions.
*   Document Control **must** affix Aker Kvaerner Chemetics document numbers to these PDF versions of Vendor documents.

**Aker Kvaerner Chemetics Document Number Format:**
The standard document number format is 98C12300-4-VEN-7801-5-R2, where:
*   `98C12300` represents the Project Number.
*   `4` represents the Major Work Division.
*   `VEN` represents the [[document_type_codes|Document Type Code]] for Vendor Documents.
*   `7801` represents the Identification Number.
*   `5` represents the Document Number.
*   `R2` represents the [[revision_numbering_rules|Revision Number]].

Refer to [[document_numbering|Document 0-PRC-0002: Document Numbering]] for further details on Project Number and Major Work Division.

**Identification Number Rules:**
*   For tagged items, the identification number will be identical to the Aker Kvaerner Chemetics standard tag number. Where a document is common to a number of tagged items, it will be assigned the numerically smallest of the tag numbers. Refer to [[identification_number_rules]] for general guidelines.
*   For bulk materials, the identification number will be identical to that of the [[form_of_purchase_order_0_prc_5001|Purchase Order]].
*   The document number will be a sequential number assigned by Document Control.
*   The revision number will be applied incrementally as different versions are received, beginning at R1.

**Filing, Logging, and Distribution:**
*   Document Control **must** file Adobe Portable Document Format versions of Vendor documents in the project electronic file. Refer to [[file_structure|Document 0-PRC-0003: File Structure]] for details on the project electronic file structure.
*   Document Control **must** log Vendor documents into the Document Control Database.
*   Document Control **must** create an Incoming Transmittal, as referenced in [[control_of_project_documents_0_prc_0006|Document 0-PRC-0006: Control of Project Documentation]].
*   Documents will be given a [[document_status_definitions|document status]] of "Issued for Review".
*   Where a document is common to a number of items on the Purchase Order, it will be logged as received for all items, with a reference to the actual document number assigned.
*   Document Control **must** print two paper copies of all documents received.
*   Document Control **must** deliver two paper copies of all documents received to the Project Engineer.
*   Document Control **must** deliver two copies each of the Incoming Transmittal to the Project Engineer.
*   Document Control **must** deliver two copies each of the Vendor Document Status Report to the Project Engineer.