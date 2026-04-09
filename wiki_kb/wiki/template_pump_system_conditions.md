---
slug: template_pump_system_conditions
title: Template Pump System Conditions
source_doc: 4-PDS-XXXX-R2 (Template Pump)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Template Pump System Conditions

This page describes the system conditions relevant to the operation of a template pump, as detailed in document 4-PDS-XXXX-R2. Understanding these conditions is essential for integrating the pump into the overall plant design and ensuring its reliable performance. The "SYSTEM CONDITIONS" section on Sheet1 of the datasheet includes a "DESIGN" category, which specifies the parameters for various nodes within the system.

**System Description:**
The system description indicates that caustic is fed to a Concentrator and also routed through a Cooler. Some users within the system require a continuous supply of fluid, while other users operate with intermittent flow. Cases 1, 2, and 3 specifically describe these intermittent flow scenarios, providing critical data for pump sizing and control system design.

**Key System Parameters per Node:**
For each relevant node in the system, the following parameters are specified to define the hydraulic and operational characteristics:

*   **Node:** The identification tag for a specific point in the process (e.g., a tank, heat exchanger, or pipeline junction).
*   **Flow:** The volumetric flow rate at the node in m3/h (cubic meters per hour).
*   **Equipment Loss:** Pressure loss across equipment at the node in kPa (kilopascals).
*   **Pressure:** The gauge pressure at the node in kPa(g) (kilopascals gauge).
*   **Liquid Level:** The liquid level at the node in meters (m), particularly relevant for tanks or vessels.
*   **Source Node:** The upstream origin of the flow, indicating where the fluid is coming from.
*   **Discharge Node:** The downstream destination of the flow, indicating where the fluid is going.
*   **Continuous Operation:** An indication if the flow at the node is continuous, implying steady-state conditions.
*   **Intermittent Operation:** An indication if the flow at the node is intermittent, requiring consideration for start-up/shut-down cycles and variable flow rates.

**Detailed System Conditions Data:**
Specific flow, pressure, equipment loss, and liquid level data for various nodes and operational cases (Cases 1, 2, and 3) are provided in [[template_pump_system_conditions_data]]. This detailed data is crucial for hydraulic calculations, pump sizing, and the design of associated control schemes.

For administrative information regarding the datasheet, refer to [[4-PDS-XXXX-R2_template_pump_datasheet_administration]]. The pump's specific design and material requirements are detailed in [[template_pump_process_design_conditions]], [[template_pump_equipment_specifications]], and [[template_pump_material_specifications]].