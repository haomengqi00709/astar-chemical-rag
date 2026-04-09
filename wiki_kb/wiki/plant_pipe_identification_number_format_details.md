---
slug: plant_pipe_identification_number_format_details
title: Plant Pipe Identification Number Format Details
source_doc: 5-PRC-0001
doc_type: PRC
discipline: 5
discipline_name: Piping & Layout
source_folder: Procedure
track: A
---

# Plant Pipe Identification Number Format Details

This page details the standard format for plant pipe identification numbers as defined in [[plant_pipe_numbering_5_prc_0001]]. This structured format ensures clarity, consistency, and ease of reference for all pipelines within a plant.

**Standard Line Number Format Example:**
`100-SAS-CS6B-780302`

Each segment of the line number provides specific information:

1.  **Nominal Diameter (e.g., `100`)**
    *   Represents the nominal diameter of the pipeline in millimeters.
    *   If the nominal diameter is shown in inches, it **must** be indicated with an inch symbol (e.g., `4”`).

2.  **Code (e.g., `SAS`)**
    *   Designates the fluid present in the pipeline.
    *   The responsible entity **shall** develop and maintain standard codes for their assigned technologies, which **shall** be consistent with those used on the [[piping_and_instrumentation_drawings]].
    *   Identical codes **shall** be used for common services (e.g., utilities, commodity chemicals) across projects.

3.  **Pipe Material Specification (e.g., `CS6`)**
    *   References a [[pipe_specifications]] document that details the material of construction, wall thickness, connection type, and other relevant specifications for the piping components.

4.  **Gasket Code (e.g., `B`)**
    *   References a specification that defines the [[gasket_material_selection]], thickness, type, and other characteristics for gaskets used in the pipeline.

5.  **Associated Equipment Number (e.g., `7803`)**
    *   This segment refers to the standard equipment number as defined in [[plant_equipment_identification_4_prc_0001]].
    *   It identifies the equipment to which the pipeline "belongs," regardless of whether that equipment item is physically present in the plant.
    *   **Assignment Rules:**
        *   **Interconnecting Many Items:**
            *   A distribution header belongs to the "primary delivering equipment" (e.g., Boiler, Compressor, Tank).
            *   A collection header belongs to the "collecting equipment" (e.g., Sump, Tank, Cooling Tower).
            *   Branches off a header belong to the "served equipment" (e.g., Heat Exchanger, Tower, Tank).
        *   **Connecting Two Items:** The pipeline belongs to the upstream equipment item.
        *   **Pump Discharge and Suction:** These pipelines belong to the equipment item immediately upstream of the pump.

6.  **Serial Number (e.g., `02`)**
    *   A unique two-digit number assigned per pipeline.
    *   The serial number **must** change if there is a change in piping material.
    *   The serial number **must** also change if there is a change in service condition (design pressure or temperature).
    *   In general, serial numbers **should** ascend in the direction of major process flow.
    *   **Equipment Trim:** Equipment trim is also assigned a line number following this procedure. For equipment trim, the serial number assigned **shall** be the associated nozzle designation. A zero **must** be inserted as necessary to create two characters for the serial number (e.g., `78030A`, `7803AA`).