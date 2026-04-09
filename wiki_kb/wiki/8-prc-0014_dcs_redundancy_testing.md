---
slug: 8-prc-0014_dcs_redundancy_testing
title: DCS Redundancy Testing (8-PRC-0014)
source_doc: 8-PRC-0014
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Redundancy Testing (8-PRC-0014)

This page outlines the procedures for conducting redundancy tests on Distributed Control Systems (DCS) as part of the [[dcs_field_hardware_checkout_8_prc_0014|DCS Hardware Checkout Procedure (8-PRC-0014)]]. Redundancy testing is exclusively performed on redundant DCS systems to verify their ability to switch over to alternate components in the event of a primary device failure.

The purpose of the Redundancy Test is to verify the seamless switchover to the alternate controller, [[dcs_power_supplies]] (new slug), [[dcs_data_highways]] (new slug), and [[dcs_io_modules]] (new slug) in the event of a failure of the primary device.

**Process Controllers Redundancy Test:**
1.  Force the primary [[dcs_controllers]] (new slug) to fail.
2.  Observe that the switchover to the alternate controller occurs.
3.  Observe and record the switchover time.
4.  Check if data integrity is maintained throughout the switchover.
5.  Check the [[dcs_alarm_messages]] (new slug) and messages on an operator station to ensure the switchover is logged, complete with a timestamp.
6.  The current controller **must** operate stable for a minimum of two minutes after the switchover.
7.  Repeat the same procedures to ensure the controller switches back over to the original controller.

**Data Control Network Redundancy Test:**
1.  Disconnect one of the data control network cables.
2.  Verify the alarm messages on operator consoles.
3.  Verify the uninterrupted operation of all outputs.
4.  Verify that the event is logged in the system.
5.  Repeat the same procedure on the alternate data control network cable.

**DCS Power Supplies Redundancy Test:**
1.  Turn off one of the [[dcs_power_supplies]] (new slug).
2.  Observe that an alarm message appears on the operator station.
3.  Check the controller and I/O modules status.
4.  Repeat the same procedure for the alternate power supplies.

Redundancy testing is exclusively performed on redundant DCS systems to verify their ability to switch over to the alternate controller, power supplies, data highways, and I/O modules in the event of the failure of the primary device.

**Process Controllers Redundancy Test:**
1.  Force the primary controller to fail.
2.  Observe that the switchover to the alternate controller occurs.
3.  Observe the switch over time.
4.  Check if the data integrity is maintained.
5.  Check the alarms and messages on an operator station to make sure the switchover is logged complete with timestamp.
6.  Ensure the current controller operates stable for a minimum of two minutes.
7.  Repeat the same procedures to make sure the controller switches over to the original controller.

**Data Control Network Redundancy Test:**
1.  Disconnect one of the data control network paths.
2.  Verify the alarm messages on operator consoles.
3.  Verify the uninterrupted operation of all outputs.
4.  Verify the event is logged.
5.  Repeat the same procedure on the alternate data control network path.

**DCS Power Supplies Redundancy Test:**
1.  Turn off one of the power supplies.
2.  Observe an alarm message appears on the operator station.
3.  Check the controller and I/O modules status.
4.  Repeat the same procedure for the alternate power supplies.
---