---
slug: hypo_unit_package_operational_modes_and_emergency_conditions
title: Hypo Unit Package Operational Modes and Emergency Conditions
source_doc: 4-PDS-XXXX-R1 (Template Hypo Unit Package)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Hypo Unit Package Operational Modes and Emergency Conditions

The Hypo Unit Package is designed to operate under both normal standby conditions and specific emergency scenarios, particularly concerning chlorine absorption.

**Operational Modes:**
*   **Stand-by Mode**: The unit will normally operate in stand-by mode. During this mode, only the [[hypo_unit_package_bleach_unit_feed_specifications|Brine Dechlorinator Vent]] is directed to the Bleach Tower, and tank vents are routed to the [[hypo_unit_package_scrubber_unit_feed_specifications|Scrubber]].
*   **Normal Flow Conditions**: Under normal flow conditions (Note 2), the bleach produced will be dilute with a wide range of possible caustic levels. The bleach and caustic strength will tend to dilute from the water in the feed gas.
*   **Bleach Export**: The bleach product is exported based on [[level_measurement_general|level control]].
*   **Off-Spec Bleach Handling**: Any off-specification, dilute bleach will be sent directly to the [[hydecat_hypo_destruction_reactor_datasheet_administration|Hypo Destruct Unit]] from the Hypo Tower Pump.

**Emergency Conditions:**
*   **Chlorine Absorption Capacity**: Under emergency conditions, the Hypo Unit **must** be capable of absorbing 10 minutes of maximum Cl2 production from the [[bipolar_electrolyzer_equipment_specifications|electrolyzers]].
*   **HCl Unit Trip Response**: The bleach unit **must** be able to process 100% of the specified [[hypo_unit_package_bleach_unit_feed_specifications|Bleach Unit Feed]] diverted from the HCl plant to the bleach unit, without tripping the bleach unit on high ORP or other process upset. The vendor **shall** incorporate a logic control scheme, complete with preset valve positions, to manage an [[hcl_synthesis_unit_safety_interlocks|HCl unit trip]].
*   **Brine Dechlorinator Vent Diversion**: In normal operation, the Brine Dechlorinator Vent stream will be sent to the Bleach Tower, drawn by the suction of the Scrubber Fans, to prevent depletion of scrubber liquor.

For details on the control systems governing these operations, refer to [[hypo_unit_package_control_system_requirements]].

**Design Requirements:**
*   The bleach unit must be able to process 100% of the specified Bleach Unit Feed diverted from the HCl plant to the bleach unit, without tripping the bleach unit on high ORP or other process upset.

**Normal Flow Paths:**
*   Normal flow will be Brine Dechlorinator Vent, drawn into the Bleach Tower by the suction of the Scrubber Fans.
*   This stream will be sent to the Bleach Tower to prevent depletion of scrubber liquor.
---