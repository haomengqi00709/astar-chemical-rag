---
slug: template_vessel_notes_and_ancillary_equipment
title: Template Vessel Notes and Ancillary Equipment (4-PDS-XXXX-R2)
source_doc: 4-PDS-XXXX-R2 (Template Vessel)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Template Vessel Notes and Ancillary Equipment (4-PDS-XXXX-R2)

The "NOTES" section and the details regarding "Ancillary Equipment" within the Template Vessel Process Data Sheet (4-PDS-XXXX-R2) provide crucial supplementary information that enhances the overall design and operational understanding of the vessel.

**NOTES Section:**
The "NOTES" section is a dedicated header within the document, intended for any general remarks, clarifications, or specific instructions that do not fit into other structured fields. This ensures that all pertinent information, including design philosophies, operational considerations, or special fabrication requirements, is captured.

**Ancillary Equipment:**
The "Ancillary Equipment" section lists various options that can be integrated with the vessel to support its function or enhance its performance. These options include:
*   Jacket
*   Coil
*   Baffles
*   Cooling
*   Heating
*   Tracing
*   Mist Separator
*   Agitation (e.g., an [[agitator_datasheet_administration]] is a common example of ancillary equipment)
*   Insulation
*   Other (for any additional, unspecified equipment)

**Information Flow for Ancillary Equipment:**
It is a mandatory requirement that the information communicated by the Vessel PDS (4-PDS-XXXX-R2) and any associated ancillary equipment PDS (Process Data Sheet) **is required** for the ancillary equipment DST (Data Sheet). This ensures a consistent and complete data transfer for the procurement and design of integrated components. For instance, the [[template_vessel_equipment_data]] and [[template_vessel_process_design_conditions]] will inform the design of an agitator or a mist separator.

When creating the [[equipment_sketch_requirements_for_vessels]] for the vessel, the requirements for these ancillary components **should be considered** to accurately represent their relative positions and interfaces.

**Related Topics:**
*   [[template_vessel_datasheet_administration]]
*   [[template_vessel_equipment_data]]
*   [[template_vessel_process_design_conditions]]
*   [[4-PDS-XXXX-R2_agitator_datasheet_administration]]
*   [[mist_separator_datasheet_administration]]