---
slug: template_vessel_equipment_data
title: Template Vessel Equipment Data (4-PDS-XXXX-R2)
source_doc: 4-PDS-XXXX-R2 (Template Vessel)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Template Vessel Equipment Data (4-PDS-XXXX-R2)

The "Equipment Data" section of the Template Vessel Process Data Sheet (4-PDS-XXXX-R2) provides essential physical and operational characteristics of the vessel. This information is crucial for mechanical design, layout, and integration into the overall plant.

**General Equipment Specifications:**
The following data points **must** be provided:
*   **Orientation:** Specify whether the vessel is Horizontal or Vertical.
*   **Side Wall Height / Length (m):** The height of the straight side wall for vertical vessels or the length for horizontal vessels, in meters.
*   **Inside Diameter (m):** The internal diameter of the vessel in meters.
*   **Aspect Ratio:** The ratio of height to diameter for vertical vessels, or length to diameter for horizontal vessels.
    *   **Note:** Specifying both the height/length and diameter AND the aspect ratio is not required; one set of dimensions is sufficient.
*   **Height (m):** Overall height of the vessel in meters.
*   **Width (m):** Overall width of the vessel in meters.
*   **Depth (m):** Overall depth of the vessel in meters.
*   **Residence Time (min):** The average time a fluid particle spends within the vessel, in minutes.
*   **Working Volume (m3):** The operational volume of the vessel in cubic meters.

**Quantity Requirements:**
The "Quantity" field includes sub-fields for:
*   **Operating:** The number of units required for normal operation.
*   **Installed Spare:** The number of spare units installed and ready for use.

**Vessel Configuration Options:**
Specific checkboxes are provided for different vessel styles:
*   **Roof Type (Vertical):** Options include Floating, Cone, Dished, Flat, or Other.
*   **Floor Type (Vertical):** Options include Flat, Cone, Dished, or Other.
*   **Head Type (Horizontal):** Options include Dished, Cone, Flat, or Other.
    *   **Note:** Some equipment data checkboxes only apply to certain tank styles (e.g., "Roof Type" does not apply to Horizontal vessels).

**Working Volume Criteria:**
The criteria for defining the working volume **must** be selected from:
*   Centerline Pump Suction to Invert of Overflow
*   Bottom of Tank to Invert of Overflow
*   Other (with specific details provided)

This comprehensive equipment data ensures that the vessel's physical attributes and operational capacity are clearly defined for all project phases.

**Related Topics:**
*   [[template_vessel_datasheet_administration]]
*   [[template_vessel_process_design_conditions]]
*   [[template_vessel_notes_and_ancillary_equipment]]
*   [[equipment_data_sheets_4_dst_xxxx]]