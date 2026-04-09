---
slug: template_voc_scr_package_equipment_specifications_and_vendor_scope
title: Template VOC-SCR Package Equipment Specifications and Vendor Scope
source_doc: 4-PDS-XXXX-R1 (Template VOC-SCR Package)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Template VOC-SCR Package Equipment Specifications and Vendor Scope

This page outlines the mandatory and optional equipment inclusions, as well as the overall scope of supply for the Template VOC-SCR Package, as specified in document 4-PDS-XXXX-R1. This defines the expected deliverables from the vendor to ensure a complete and functional unit.

**Mandatory Vendor Package Inclusions:**

The vendor package **must** include the following components and features:
*   Burner chambers
*   VOC catalyst section
*   NOx analyser: For continuous monitoring of nitrogen oxide levels. Refer to [[process_analysers]] for general analyser requirements.
*   Ammonia sparger: For the introduction and distribution of ammonia into the gas stream. [[ammonia_sparger_specifications]]
*   NOx catalyst section
*   The entire unit **must** be skid mounted, facilitating ease of installation and transport. Refer to [[plant_modularization_design]] for modularization guidelines.
*   The unit **must** be complete with controls, integrating all necessary operational logic. Refer to [[control_system_design_and_specification_8_prc_0004]] for control system design.
*   The unit **must** be complete with all necessary internals. [[voc_scr_internals_specifications]]
*   The unit **must** be complete with all required ducting. Refer to [[piping_design_and_specification_5_prc_0003]] for ducting design.
*   The unit **must** be complete with all field instruments required for its operation and monitoring. Refer to [[field_instrument_design_and_specification_8_prc_0003]] for field instrument specifications.
*   Input/Output (I/O) to the Distributed Control System (DCS) is required for monitoring of the unit, including both digital and analog signals as needed. Refer to [[control_philosophy_and_dcs]] for DCS integration.

**Optional Vendor Offerings:**

Vendors **must** offer the following options in their proposals:
*   Option for electric resistance heating. [[electric_resistance_heating_options]]
*   Optional process gas fan. Refer to [[fan_datasheet_administration]] for fan specifications.

**Conditional Inclusions (If Gas Fired):**

If the unit is designed for gas firing, the following components **must** be included:
*   Combustion air fan (if needed). Refer to [[fan_datasheet_administration]].
*   Burner controls. Refer to [[burner_installation_requirements]].
*   Gas train. [[gas_train_specifications]]

**Vendor Evaluation Requirement:**

*   The vendor **must** evaluate whether a gas/gas heat exchanger/recuperator will be included in the package to optimize energy efficiency. Refer to [[gas_gas_heat_exchanger_design_conditions]] for heat exchanger design considerations.

These specifications ensure that the vendor provides a comprehensive and functional VOC-SCR package, meeting all operational and integration requirements. For general equipment requirements, refer to [[general_equipment_requirements_specification]].

Source document: 4-PDS-XXXX-R1 (Template VOC-SCR Package) (Equipment)