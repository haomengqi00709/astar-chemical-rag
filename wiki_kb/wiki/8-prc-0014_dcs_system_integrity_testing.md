---
slug: 8-prc-0014_dcs_system_integrity_testing
title: DCS System Integrity Testing (Non-Redundant Systems) (8-PRC-0014)
source_doc: 8-PRC-0014
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS System Integrity Testing (Non-Redundant Systems) (8-PRC-0014)

This page describes the System Integrity Test for non-redundant Distributed Control Systems (DCS), conducted as part of the [[dcs_field_hardware_checkout_8_prc_0014|DCS Hardware Checkout Procedure (8-PRC-0014)]]. This test is specifically designed for systems that do not incorporate redundancy.

The purpose of the System Integrity Test is to verify that the database, logic, analog functions, and all I/O configurations are maintained even upon the failure of a non-redundant controller.

**Process Controller and I/O Modules Integrity Test:**
1.  Intentionally fail the [[dcs_controllers]] (new slug) or an [[dcs_io_modules]] (new slug).
2.  Check the [[dcs_alarm_messages]] (new slug) on operator consoles.
3.  The controller or I/O module **must** be left out of service for a minimum of one hour.
4.  Return the controller or I/O module back to service.
5.  Check all system configuration, logic, and functions to ensure they are restored correctly.
6.  Observe the I/O status.
7.  Observe that all alarm messages are cleared from the system.

The purpose of the System Integrity Test is to verify the database, logic, analog functions, and all I/O configurations are maintained on failure of a non-redundant controller.

**Process Controller and I/O Modules Integrity Test:**
1.  Fail the controller or I/O module.
2.  Check the alarm messages on operator consoles.
3.  Leave the controller or I/O module out of service for a minimum of one hour.
4.  Return the controller or I/O module back to service.
5.  Check all system configuration, logic and functions.
6.  Observe the I/O status.
7.  Observe all alarm messages are cleared.
---