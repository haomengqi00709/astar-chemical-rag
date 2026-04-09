---
slug: alarms_interlocks_and_setpoints
title: Alarms, Interlocks and Setpoints (8-LST-0103)
source_doc: 8-PRC-0004
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Alarms, Interlocks and Setpoints (8-LST-0103)

The **Alarms, Interlocks and Setpoints** document (8-LST-0103) provides process-specific information crucial for the DCS programmer to configure the control system's safety and operational parameters.

**Document ID:** 8-LST-0103
**Usage:** Design
**Data available in SQL:** 8-LST-0103

**Content Requirements:**
This document **WILL CONTAIN** process-specific information needed for the DCS programmer to configure the control system. It **MUST** contain:
*   Instrument number.
*   Description of the control element.
*   Units of measure.
*   Set point for normal operation.
*   Process Instrument Alarm Set Points (LoLo, Lo, HiHi, Hi).

Specific interlocks, alarms, and trips will be implemented within the [[process_control_application_software_configuration]] as per the Instrument Set Points, Alarms and Interlocks section in the operating manual.

**Responsibilities:**
*   **Prepared By:** Process
*   **Checked By:** Technology
*   **Approved By:** Process

**Related Topics:**
*   [[control_system_design_procedure_overview]]
*   [[roles_and_responsibilities_control_system]]
*   [[control_system_documentation_types_and_usage]]
*   [[process_logic_narrative]]
*   [[dcs_configuration_parameters]]
*   [[process_control_application_software_configuration]]
---