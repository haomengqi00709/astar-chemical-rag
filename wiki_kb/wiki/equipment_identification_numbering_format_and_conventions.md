---
slug: equipment_identification_numbering_format_and_conventions
title: Equipment Identification Numbering Format and Conventions
source_doc: 4-PRC-0001
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Equipment Identification Numbering Format and Conventions

The [[plant_equipment_identification_system|Plant Equipment Identification System]] mandates a specific format and set of conventions for identifying and naming plant equipment. Adherence to these guidelines ensures consistency and clarity across all project documentation.

**Equipment Identification Number Format**
The standard format for equipment identification numbers is a combination of process area, serial number, and equipment type, exemplified as `1016P`. This format is broken down as follows:
*   The first two digits (e.g., '10') represent the Process Area.
*   The middle two digits (e.g., '16') represent the Serial Number.
*   The single letter (e.g., 'P') represents the [[equipment_type_codes|Equipment Type]].

**Process Area Identification**
*   Each technology **must** be subdivided into distinct process areas.
*   A process area is defined as a section of the plant that fulfills a distinct process function and is typically located within a continuous physical area.
*   Each process area **must** be assigned a unique two-digit identification number.
*   Process area numbers beginning with '0' **must not** be used.
*   Process area numbers may be repeated across different technologies, provided they maintain uniqueness within their respective technology context.

**Equipment Serial Numbering**
*   A unique two-digit number **must** be assigned as the serial number for each individual equipment item.
*   Individual equipment items within "equipment packages" **must** also be given unique serial numbers; the equipment packages themselves **must not** be numbered.
*   Serial numbers should ascend in the direction of major process flow to logically represent the process sequence.
*   The serial number is unique per basic process function.
*   The same serial number may be assigned different [[equipment_type_codes|equipment type identifiers]] if there are different methods or types of equipment used to achieve that specific function.
    *   *Example*:
        *   1056U refers to Weak Brine Dechlorinator (Packed Column type).
        *   1056T refers to Weak Brine Dechlorinator (Drum type).

**Equipment Identification Suffixes**
*   Where multiple pieces of the same equipment are installed, a suffix **must** be used for identification to differentiate between them.
*   Duplicate equipment that is part of parallel processing systems **must** be identified with a numeric suffix (e.g., -1, -2, etc.).
*   Duplicate equipment within a single processing system **must** be identified with a letter suffix (e.g., -A, -B, etc.).
*   Combinations of suffixes may also be used for more complex arrangements (e.g., –1A, -1B, etc.).

**Equipment Naming Conventions**
*   Equipment names **must** clearly indicate their process function. This ensures that the purpose of the equipment is immediately understandable.
*   Equipment names should be generic rather than overly specific as to the exact type or manufacturer of the equipment.
    *   *Example*: "Sulphur Pit Heater" is preferred over "Sulphur Pit Steam Coil" to maintain a functional and generic description.