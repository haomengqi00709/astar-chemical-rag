---
slug: tgas_2_data_input_methods
title: TGAS/2 Data Input Methods
source_doc: 4-PRC-0008
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# TGAS/2 Data Input Methods

The [[tgas_2_thermal_design_software|TGAS/2 program]] supports flexible data input methods, allowing users to either input data directly or import it from the Aspen process simulator. It is a mandatory requirement that all input data for Section 4 **must** be converted to Imperial units, as TGAS/2 operates internally using Imperial units.

**Direct Data Input:**
*   **Imperial Units:** For direct input in Imperial units, users **must** fill in the blue cells located in the “Input Sheet IMP” worksheet.
*   **SI Units:** For direct input in SI units, users **must** fill in the blue cells in the “Input Sheet SI” worksheet. After entering the data, the “Convert to Imperial units” button **must** be pressed. This action converts the SI input to Imperial units and automatically populates the “Input Sheet IMP”.

**Aspen Process Simulator Import:**
To import data from the Aspen process simulator, follow these steps:
1.  **Export from Aspen:** Select the desired streams within Aspen and utilize its export to Excel feature.
2.  **Paste to Worksheet:** Paste the Aspen output into the “Aspen Input” worksheet within TGAS/2.
3.  **Atmospheric Pressure:** Fill in the atmospheric pressure value in the designated field on the “Aspen Input” worksheet.
4.  **Stream Specification:** Specify the shell side and tube side streams in the “Aspen Input” worksheet.
5.  **Sort Data:** Press the “Sort Aspen Data” button. The program will then sort the Aspen data into a TGAS/2 readable format, convert it to Imperial units, and populate the appropriate cells in the “Input Sheet IMP” worksheet.