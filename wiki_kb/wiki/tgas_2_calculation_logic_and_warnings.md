---
slug: tgas_2_calculation_logic_and_warnings
title: TGAS/2 Calculation Logic and Warnings
source_doc: 4-PRC-0008
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# TGAS/2 Calculation Logic and Warnings

The [[tgas_2_thermal_design_software|TGAS/2 program]] incorporates robust calculation logic and warning systems to ensure the accuracy and reliability of heat exchanger designs.

**Heat Balance Check:**
*   The program performs a heat balance check based on the input mass flows, temperatures, and molar compositions.
*   **Warning Threshold:** If heat loads differ by more than 2%, a warning dialog is issued, but execution continues. In such cases, the program utilizes the higher heat load as the design value.
*   **Error Threshold:** If heat loads differ by more than 5%, an error dialog is issued, and execution terminates, requiring user intervention to correct the input data.
*   **Missing Value Calculation:** If the mass flow or either temperature for one side is input as zero, the program calculates the missing value based on the heat load of the other side.
*   **Mass Flow Overwrite:** The program **will not** overwrite mass flows based on molar flows. Molar flows are exclusively used for the calculation of fluid physical properties.

**Physical Properties:**
*   Physical properties for individual components are calculated using correlations from the Acid Technology Division “Physical Property Data Manual”.
*   Gas mixtures are assumed to behave ideally for these calculations.

**Rating Mode Specific Checks:**
*   **Duct Velocity:** In [[tgas_2_design_and_rating_modes|rating mode]], if the duct velocity exceeds 80 ft/s, a warning is issued to the user.
*   **Acoustic Baffles:** If the required (calculated) number of acoustic baffles surpasses the input amount in [[tgas_2_design_and_rating_modes|rating mode]], a dialog is issued. It is important to note that the number of baffles present **cannot** be changed during rating mode execution.