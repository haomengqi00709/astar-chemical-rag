---
slug: tgas_2_design_and_rating_modes
title: TGAS/2 Design and Rating Modes
source_doc: 4-PRC-0008
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# TGAS/2 Design and Rating Modes

The [[tgas_2_thermal_design_software|TGAS/2 program]] offers two distinct operational modes: Design Mode and Rating Mode. Program execution for both modes commences by pressing the “Run TGAS/2” button on the “Input Sheet IMP” worksheet.

**Design Mode:**
Design Mode is utilized for optimizing the geometry of a new heat exchanger.
*   **Initial Input:** The user **must** enter process data and general configuration data, including [[gas_gas_heat_exchanger_shell_types|shell and vestibule types]], [[material_selection|materials of construction]], and [[gas_gas_heat_exchanger_tube_design|tube diameter and thickness]].
*   **Preliminary Sizing:** The program calculates a preliminary exchanger size and presents a list of all possible tube layouts that meet the sizing requirements.
*   **Layout Selection & Calculation:** Once a layout is selected, the program calculates duct diameters, heat transfer coefficients, and pressure drops.
*   **Geometric Optimization:** Users can interactively change various geometric parameters to optimize the exchanger design. This is done by selecting an item and pressing the “Recalculate” button.
*   **Layout Regeneration:** If a change requires a new tube layout, the user is prompted and has the option to proceed or not. If a new layout is generated, the program automatically resets the shell and baffle diameters to suit the new configuration.
*   **Acoustic Check:** After a satisfactory design is achieved, the user **must** press the “Continue (check acoustics)” button. The program then checks for acoustic resonance and displays a dialog indicating its possibility.
*   **Acoustic Baffles:** The user has the option to add acoustic baffles. If selected, the program prompts for the number of baffles (defaulting to a calculated value, which can be overridden) and their thickness (default displayed, can be changed).
*   **Final Check:** Once baffle data is entered, the program converts the tube layout to a segmental layout to accommodate the baffles. Heat transfer and pressure drop are rechecked with this new layout before the program terminates.

**Rating Mode:**
Rating Mode is used to evaluate the performance of a given heat exchanger geometry under different process conditions.
*   **Initial Input:** The user **must** enter the same data as for Design Mode, along with additional geometric data specific to the existing exchanger.
*   **Duct Sizes:** In Rating Mode, duct sizes are specified by the user and are not calculated by the program.
*   **Performance Calculation:** The program calculates and displays heat transfer, pressure drop, and acoustic resonance results.
*   **Duct Velocity Warning:** The program checks duct velocities against a maximum recommended value of 80 ft/s. A warning is issued if this value is exceeded.
*   **Acoustic Resonance Check:** Acoustic resonance is checked regardless of whether acoustic baffles are present, and a dialog box indicates if it is possible.
*   **Acoustic Baffle Discrepancy:** If the required (calculated) number of acoustic baffles exceeds the input amount, a dialog is issued. The number of baffles present **cannot** be changed during Rating Mode execution.
*   **Result Persistence:** After all changes are made, rating mode input fields are populated with the results for convenience when the file is opened subsequently.