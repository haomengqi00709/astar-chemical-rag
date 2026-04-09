---
slug: template_vessel_nozzle_table
title: Template Vessel Nozzle Table (4-PDS-XXXX-R2)
source_doc: 4-PDS-XXXX-R2 (Template Vessel)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Template Vessel Nozzle Table (4-PDS-XXXX-R2)

The "Nozzle Table" section of the Template Vessel Process Data Sheet (4-PDS-XXXX-R2) provides comprehensive details for all nozzles on the vessel. This information is critical for piping design, fabrication, and ensuring proper functionality and access.

**Nozzle Table Columns:**
The nozzle table **must** include the following columns:
*   **Nozzle Description:** A descriptive name for the nozzle (e.g., Inlet, Outlet, Drain, Vent, Instrument Connection).
*   **Mark:** A unique identifier or tag for the nozzle.
*   **Size (mm):** The nominal pipe size of the nozzle in millimeters.
*   **Quantity:** The number of identical nozzles.
*   **Sizing Criteria / Accessories / Notes:** This combined column provides specific instructions or details for each nozzle.

**Sizing Criteria and Notes:**
*   **Process Lines:** For nozzles attached to process lines, "Line Sizing" **will be entered** as the sizing criteria. This indicates that the nozzle size is determined by the overall line sizing criteria for the connected piping system.
*   **Overflow Nozzles:** Overflow nozzles are inherently self-venting. For these nozzles, the flow rate and its basis **will be entered**. An example is "50 m3/h = max flow from feed pump," clearly stating the expected flow and the reason for that flow.
*   **Drain Nozzles:** For drain nozzles, the minimum time required to drain the tank contents **will be entered**. This is a critical safety and operational parameter.
*   **Accessories:** This sub-section **will describe** any accessories associated with the nozzle, such as internal dip pipes, vortex breakers, or thermal wells.
*   **Notes:** This sub-section **will describe** additional items such as access requirements for maintenance or inspection, or specific orientation needs.

The detailed information in the nozzle table, often complemented by the [[equipment_sketch_requirements_for_vessels]], ensures that all connections to the vessel are accurately specified and integrated into the plant design.

**Related Topics:**
*   [[template_vessel_datasheet_administration]]
*   [[5_piping_and_layout_document_structure]]
*   [[plant_pipe_numbering_5_prc_0001]]