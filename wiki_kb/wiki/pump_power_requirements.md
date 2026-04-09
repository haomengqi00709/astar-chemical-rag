---
slug: pump_power_requirements
title: Pump Power Requirements
source_doc: 4-PRC-0007
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Pump Power Requirements

Accurate calculation of pump power requirements is essential for motor sizing and overall system efficiency.

**Seal Drag:**
Ensure that the Vendor has factored in seal drag when calculating power requirements. Many applications employ SiC vs. SiC inboard seal faces with an external flush, which results in significant seal drag.

**Power Calculation Formula:**
Pump kilowatts (kW) can be calculated using the formula:
kW = Q * H * Sg / (367 * h)
Where:
*   Q = Flow rate
*   H = Head
*   Sg = Specific gravity
*   h = Efficiency