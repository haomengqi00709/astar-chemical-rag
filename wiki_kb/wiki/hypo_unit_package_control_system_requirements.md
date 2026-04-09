---
slug: hypo_unit_package_control_system_requirements
title: Hypo Unit Package Control System Requirements
source_doc: 4-PDS-XXXX-R1 (Template Hypo Unit Package)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Hypo Unit Package Control System Requirements

This page outlines the control system and instrumentation requirements for the Hypo Unit Package, ensuring safe and efficient operation under various conditions.

**Control System Architecture:**
*   The base case for the unit's control system will be 100% [[basic_control_system_specification|DCS controlled]], complemented by a local junction box.
*   The Vendor **shall** provide detailed [[process_logic_narrative|logic and control narratives]] to facilitate [[dcs_configuration_parameters|DCS programming]].

**Operational Control Requirements:**
*   **HCl Unit Trip Logic**: The vendor **must** incorporate a logic control scheme, including preset valve positions, to manage an [[hcl_synthesis_unit_safety_interlocks|HCl unit trip]]. This is crucial for maintaining unit stability during [[hypo_unit_package_operational_modes_and_emergency_conditions|emergency conditions]].
*   **ORP Control**: The ORP (Oxidation-Reduction Potential) control system **must** be set up to effectively manage the normal operating case, ensuring sufficient turn-down capability. This involves careful selection and configuration of [[process_analysers]] and [[control_valves_general]].
*   **Pump and Fan Redundancy**: The unit **must** include two scrubber pumps and two scrubber fans, both equipped with auto-switchover functionality. All these components **must** be connected to [[electrical_power_specifications|emergency power]].
*   **Bleach Recycle Pump**: The unit may have only one bleach recycle pump, which is not required to be on emergency power.

These requirements ensure robust and reliable operation, aligning with overall [[control_system_design_and_specification_8_prc_0004]] principles.

**Control Logic and Strategy:**
*   Vendor to incorporate a logic control scheme c/w preset valve positions upon an HCl unit trip.
*   The bleach is exported on level control.
*   The ORP control must be set up to control the normal operating case (ie there is sufficient turn down).
---