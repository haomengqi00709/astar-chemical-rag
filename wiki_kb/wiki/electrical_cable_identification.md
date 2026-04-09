---
slug: electrical_cable_identification
title: Electrical Cable Identification
source_doc: 9-PRC-0021
doc_type: PRC
discipline: 9
discipline_name: Electrical
source_folder: Procedure
track: A
---

# Electrical Cable Identification

Consistent and clear identification of electrical cables is mandatory for safe and efficient plant operations, maintenance, and troubleshooting. All single and multi-conductor cables **shall** be identified with a unique number tag at each end. This ensures traceability from origin to destination.

The cable numbering sequence is structured to clearly indicate the cable's origin and destination. The first number in the sequence represents the starting location, and the second number represents the final destination of the cable.

For cables originating at a Motor Control Centre (MCC) and connecting to motors or other loads, the cable number **shall** include the MCC's identification number as the first component and the load's identification number as the second component.

**Cable Identification Number Tag Components (A-B-C-D):**
Cable identification number tags are comprised of four distinct components:

*   **Component A: Starting Location**
    *   This component indicates the origin of the cable (e.g., a Motor Control Centre (MCC) or a distribution panel).
    *   The number used for Component A **shall** be the equipment identification number of the starting location.
    *   *Example:* An MCC identified as "MCC-01" would be "MCC-01" for Component A.

*   **Component B: Final Location**
    *   This component indicates the destination of the cable (e.g., a motor, a control panel, or a field device).
    *   The number used for Component B **shall** be the equipment identification number of the final location.
    *   *Example:* A motor identified as "M-101" would be "M-101" for Component B.

*   **Component C: Purpose of the Cable**
    *   This component specifies the function or type of conductors within the cable.
    *   'P' indicates power conductors or a power feeder cable.
    *   'C' indicates control conductors.
    *   'LV' indicates low voltage signal cables (though not explicitly stated in facts, 'low voltage signal' is mentioned as a purpose, so 'LV' is a logical extension for clarity).

*   **Component D: Sequential Number**
    *   This component is a sequential number assigned to the field device or equipment to which the cable is connected.
    *   For power feeders:
        *   '1' indicates one power feeder for a motor.
        *   '2' indicates a second power feeder cable for a motor (if applicable).
    *   For control cables:
        *   '1' indicates one control cable for a motor.
        *   '2' indicates a second control cable for a motor (if applicable).

**Example Cable Tag Structure:**
A cable from MCC-01 to Motor M-101, carrying power, might be tagged as: MCC-01-M-101-P1.
A control cable from MCC-01 to Motor M-101, as the first control cable, might be tagged as: MCC-01-M-101-C1.

**Instrument Signal Cables:**
Instrument signal cables also require specific numbering. The detailed numbering system for these cables is described in [[8-PRC-0001_plant_instrument_numbering]].

This procedure is part of the overall [[9-PRC-0021_electrical_numbering_and_identification_procedure|electrical numbering and identification framework]].