---
slug: template_heat_exchanger_process_design_conditions
title: Template Heat Exchanger Process Design Conditions
source_doc: 4-PDS-XXXX-R2 (Template Heat Exchanger)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Template Heat Exchanger Process Design Conditions

This page outlines the standard process design conditions and associated units for heat exchangers, as detailed in document 4-PDS-XXXX-R2. These parameters are crucial for the proper sizing and operation of the equipment.

**General Design Parameters:**
*   **Flowrate Design Allowance:** Specified in %. This accounts for potential variations in flow.
*   **Heat Duty:** Specified in kW. This is the total heat transferred by the exchanger.
*   **Heat Duty Design Allowance:** Specified in %. This provides a margin for heat transfer capacity.
*   **Minimum Excess Area:** Specified in %. This ensures sufficient heat transfer surface.
*   **Fouling Resistance:** Unit m2·oC/W. This accounts for the reduction in heat transfer efficiency due to fouling.

**Fluid Data Categories:**
Process data is categorized for both the **Hot Side** and **Cold Side** of the heat exchanger.
*   **Fluid Description:** A field to be filled with details about the fluid.
*   **Component Flows:** A category for specifying the individual component flow rates within the fluid mixture.
*   **Inlet Conditions:** Parameters describing the fluid at the entry point of the exchanger.
*   **Outlet Conditions:** Parameters describing the fluid at the exit point of the exchanger.

**Units of Measurement:**
The following units are standard for the respective process parameters:
*   **Total Flowrate:** kg/h
*   **Temperature:** oC
*   **Pressure:** kPa(abs) (absolute pressure)
*   **Liquid Flow:** kg/h
*   **Liquid Density:** kg/m3
*   **Liquid Viscosity:** cP
*   **Liquid Specific Heat:** kJ/kg·oC
*   **Liquid Thermal Conductivity:** W/m·oC
*   **Bubble Point:** oC
*   **Liquid Enthalpy:** kJ/kg
*   **Vapour Flow:** kg/h
*   **Vapour Density:** kg/m3
*   **Vapour Viscosity:** cP
*   **Vapour Specific Heat:** kJ/kg·oC
*   **Vapour Thermal Conductivity:** W/m·oC
*   **Vapour Molecular Weight:** kg/kgmol
*   **Dew Point:** oC
*   **Vapour Enthalpy:** kJ/kg
*   **Non-Condensable Flow:** kg/h
*   **Non-Condensable Density:** kg/m3
*   **Non-Condensable Viscosity:** cP
*   **Non-Condensable Specific Heat:** kJ/kg·oC
*   **Non-Condensable Thermal Conductivity:** W/m·oC
*   **Non-Condensable Molecular Weight:** kg/kgmol
*   **Allowable Pressure Drop:** kPa
*   **Maximum Pressure:** kPa(g) (gauge pressure)
*   **Maximum Temperature:** oC

Related topics include [[process_design_criteria_document]], [[heat_transfer_coefficients]], [[pressure_drop_calculations]], and [[shell_and_tube_heat_exchanger_datasheet_units_of_measurement]].
This page is part of the [[4-pds-xxxx-r2_template_heat_exchanger_datasheet_overview]].

**General Design Parameters:**
*   **Minimum Excess Area:** Specified in %
    *   **Location:** A field to be filled to specify where this minimum excess area applies.

**Design Case Information:**
*   **Case Description:** A field to be filled describing the specific design scenario.
*   **Design Basis:** A field to be filled outlining the fundamental principles and data used for design.
*   **Design Case:** A field to be filled to identify the specific design case being considered.

**Fluid Process Data Structure:**
Process data is typically categorized for:
*   **Hot Side**
*   **Cold Side**
For each fluid, the following fields are specified:
*   **Fluid Description:** A field to be filled with details about the fluid.
*   **Component Flows:** A category for specifying individual component flow rates.
*   **Inlet conditions:** Specified for the fluid entering the exchanger.
*   **Outlet conditions:** Specified for the fluid exiting the exchanger.

**Standard Units:**
The following units are typically used for various process parameters:
*   **Total Flowrate:** kg/h
*   **Temperature:** oC
*   **Pressure:** kPa(abs)
*   **Liquid Flow:** kg/h
*   **Liquid Density:** kg/m3
*   **Liquid Viscosity:** cP
*   **Liquid Specific Heat:** kJ/kg·oC
*   **Liquid Thermal Conductivity:** W/m·oC
*   **Bubble Point:** oC
*   **Liquid Enthalpy:** kJ/kg
*   **Vapour Flow:** kg/h
*   **Vapour Density:** kg/m3
*   **Vapour Viscosity:** cP
*   **Vapour Specific Heat:** kJ/kg·oC
*   **Vapour Thermal Conductivity:** W/m·oC
*   **Vapour Molecular Weight:** kg/kgmol
*   **Dew Point:** oC
*   **Vapour Enthalpy:** kJ/kg
*   **Non-Condensable Flow:** kg/h
*   **Non-Condensable Density:** kg/m3
*   **Non-Condensable Viscosity:** cP
*   **Non-Condensable Specific Heat:** kJ/kg·oC
*   **Non-Condensable Thermal Conductivity:** W/m·oC
*   **Non-Condensable Molecular Weight:** kg/kgmol
*   **Allowable Pressure Drop:** kPa
*   **Maximum Pressure:** kPa(g)
*   **Maximum Temperature:** oC
*   **Fouling Resistance:** m2·oC/W
---