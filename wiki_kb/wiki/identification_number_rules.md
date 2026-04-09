---
slug: identification_number_rules
title: Identification Number Rules
source_doc: 0-PRC-0002
doc_type: PRC
discipline: 0
discipline_name: Administration
source_folder: Procedure
track: A
---

# Identification Number Rules

The Identification Number is a variable-length code that uniquely identifies the specific subject matter of a document within its Major Work Division and Document Type, as defined in [[document_numbering_procedure_0_prc_0002]]. This number is the fourth segment in the document number format (e.g., `98C12300-4-DTL-**7801**-5-R2`).

The assignment of the Identification Number depends on the type of item or area the document pertains to:

**1. Equipment-Related Documents:**
*   If a document is associated with a single equipment item, the identification number shall be the 4-digit standard equipment number, as defined in [[plant_equipment_identification_4_prc_0001]].
*   If a document is associated with an equipment package, the identification number shall be the 4-digit standard equipment number of the primary equipment item within that package.

**2. Piping Line-Related Documents:**
*   If a document is associated with a single line (piping), the identification number shall be the standard 6-digit line identifier, as defined in [[plant_pipe_numbering_5_prc_0001]].

**3. Instrument-Related Documents:**
*   If a document is associated with a single instrument item, the identification number shall be the multi-digit standard instrument number, as defined in [[plant_instrument_numbering_8_prc_0001]].
*   If a document is associated with an instrument loop, the identification number shall be the standard 6-digit loop identifier, as defined in [[plant_instrument_numbering_8_prc_0001]].

**4. Administration Documents (Major Work Division 0):**
*   For documents within Major Work Division 0: Administration, the identification number shall be a 4-digit sequential number. Specific ranges are designated for different administrative functions:
    *   **0XXX**: Documentation
    *   **1XXX**: Sales and Proposals
    *   **2XXX**: Project Administration
    *   **3XXX**: Planning
    *   **4XXX**: Cost Control
    *   **5XXX**: Procurement
    *   **6XXX**: Construction
    *   **7XXX**: Quality Assurance
    *   **8XXX**: HSE (Health, Safety & Environment)
    *   **9XXX**: Corporate
    *   **90XX**: General
    *   **91XX**: Human Resources
    *   **92XX**: Finance
    *   **93XX**: Information Technology
    *   *Note: The 8XXX series within Major Work Division 0: Administration was changed in a past revision.*

**5. Process Area Documents:**
*   If a document is associated with a particular process area, the identification number shall be a 4-digit number.
    *   The first two digits of the identification number shall be the process area identifier.
    *   The last two digits of the identification number shall be a sequential series beginning with 01.
    *   *Example:* `1-PID-6502` is the second piping and instrument diagram for the Gas Cleaning area (area 65) of an acid plant.

**6. Generic Templates:**
*   If a standard document is a generic template, the identification number shall be "XXXX".
*   The associated equipment, line, or instrument number shall replace "XXXX" when a template is used to create a project document.

**7. Unassigned Identification Numbers:**
*   For documents not assigned an identification number by this or any other procedure, the identification number shall be a 4-digit sequential number beginning with 0001.
*   The first digit of identification numbers not assigned by other procedures shall always be 0.

**Standard Document Derivation:**
The identification number for a document used in a project is intended to be the same as the standard document from which it is derived, or which deals with the same subject matter. For technology-specific versions of standard documents, the same identification number will be used, with differentiation provided by the title wording (see [[technology_specific_standard_documents]]).

These rules ensure that each document is uniquely and logically identified, facilitating efficient document management and retrieval as part of the [[document_number_format_and_components]].