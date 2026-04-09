---
slug: gas_gas_heat_exchanger_design_temperature_calculation_commentary
title: Gas/Gas Heat Exchanger Design Temperature Calculation Commentary and Assumptions
source_doc: 4-CAL-0008
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Gas/Gas Heat Exchanger Design Temperature Calculation Commentary and Assumptions

This page provides important commentary, assumptions, and limitations related to the design temperature calculations for the internal gas/gas heat exchanger, as outlined in [[4-CAL-0008_document_details|4-CAL-0008]]. Adherence to these guidelines is crucial for the validity of the results.

**General Assumptions and Configuration**
*   A hot exchanger configuration with integral exchanger shell/convertor core is assumed.
*   A countercurrent configuration with flow upwards in shell is assumed.
*   The exchanger sits between beds 1 and 2.
*   Temperatures may not be valid for other configurations.
*   [[gas_gas_heat_exchanger_bulk_and_mean_metal_temperatures|Bulk fluid temperatures]] are based on the average fluid temperatures.

**Temperature Data and Validation**
*   Output from TGAS/2 **shall** be used for temperatures.
*   TGAS/2 temperatures have been validated.
*   The spreadsheet used for these calculations does not check for valid temperatures.

**Design Temperature Derivation**
*   [[gas_gas_heat_exchanger_design_temperature_calculations|Design temperature]] is calculated as the [[gas_gas_heat_exchanger_maximum_metal_temperatures|maximum metal temperature]] plus 25 C.
*   Design temperature results are rounded to the nearest 5 degrees.

For specific temperature values, refer to the pages on [[gas_gas_heat_exchanger_operating_temperatures|Operating Temperatures]], [[gas_gas_heat_exchanger_bulk_and_mean_metal_temperatures|Bulk Fluid and Mean Metal Temperatures]], [[gas_gas_heat_exchanger_maximum_metal_temperatures|Maximum Metal Temperatures]], and [[gas_gas_heat_exchanger_design_temperature_calculations|Design Temperatures]].