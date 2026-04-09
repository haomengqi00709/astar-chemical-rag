---
slug: line_list_data_field_definitions
title: Line List Data Field Definitions
source_doc: 5-PRC-0004
doc_type: PRC
discipline: 5
discipline_name: Piping & Layout
source_folder: Procedure
track: A
---

# Line List Data Field Definitions

This page provides detailed definitions and requirements for the various data fields included in the Piping Line List, as outlined in [[5-prc-0004_piping_line_list_procedure_overview|5-PRC-0004]].

**General Fields:**
*   **P&ID Reference**: Refers to the [[piping_and_instrumentation_drawings|P&ID]] that indicates the line source.
*   **Line Number**: Refer to [[5-PRC-0001_plant_pipe_numbering|Plant Pipe Numbering Procedure (5-PRC-0001)]] for numbering conventions.
*   **Design Flow**: Represents 100 % Design flow from the [[process_flow_diagram|Process Flow Diagram]].
*   **Preliminary Line Size**: Will be calculated using standardized velocity criteria and the design flow.
*   **Utility Header Information**: Will come from piping studies and hydraulic network analysis.
*   **Estimated Maximum Operating Pressure**: The pressure expected during normal operation including expected process excursions, but excluding mal-operation and equipment failure. This is specified with respect to the lowest point of piping.
*   **Estimated Minimum Operating Pressure**: The minimum pressure expected during normal operation including expected process excursions, but excluding mal-operation and equipment failure. This is specified with respect to the lowest point of piping. If no possibility of vacuum, **shall** show N/A.
*   **Operating Temperature (Maximum and Minimum)**: The maximum and minimum temperature expected during normal operation including expected process excursions, but excluding mal-operation and equipment failure.
*   **Preliminary Insulation Requirements**: Process **will** provide the preliminary insulation requirements.
    *   **Insulation Type HC**: Heat Conservation
    *   **Insulation Type CC**: Cold Conservation
    *   **Insulation Type AS**: Anti-Sweat
    *   **Insulation Type PP**: Personnel Protection
    *   **Insulation Type ET**: Electric Heat Tracing
*   **Pipe and Gasket Material**: Refer to [[1-PRC-0005_piping_service_list|Piping Service List (1-PRC-0005)]].

**Piping Design Conditions:**
*   **Design Pressure – Maximum**: **Must** refer to [[ASME_b31_3_chemical_plant_and_petroleum_refinery_piping]], Section 301.2. Design pressure **will not** be less than the pressure at the most severe condition of coincident internal or external pressure and temperature (minimum or maximum) expected in service. Design pressure is specified with respect to the lowest point of piping. Maximum operating pressure, pump dead head, set pressure of relief device, battery limit pressure, etc., **will** be considered.
*   **Design Pressure – Minimum**: Minimum operating pressure, blocked-in vertical liquid lines, set pressure of vacuum relief devices, etc., **will** be considered.
*   **Design Temperature – Maximum**: **Must** refer to [[ASME_b31_3_chemical_plant_and_petroleum_refinery_piping]], Section 301.3. Design temperature is the temperature at which, under the coincident pressure, the greatest thickness or highest component rating is required. **Must** verify that the design temperature is covered by the pipe specification. Maximum fluid operating temperature, heating medium temperature, ambient temperature, solar radiation, and all sources of heating, etc., **will** be considered.
*   **Design Temperature – Minimum**: Minimum fluid operating temperature, auto-refrigeration, ambient temperature, and all sources of cooling, etc., **will** be considered.
*   **B31.3 Fluid Code**: **Must** refer to [[ASME_b31_3_chemical_plant_and_petroleum_refinery_piping]], Section 300.2, fluid service.
    *   **B31.3 Fluid Code D**: Category D
    *   **B31.3 Fluid Code M**: Category M
    *   **B31.3 Fluid Code NFS**: Normal Fluid Service (other than Category D or M)

**Pressure Relief Information:**
*   **Pressure Relief Device**: Identify the pressure relief device, where applicable.
    *   **PDH**: Pump dead head
    *   **Tag No.**: Relief device (rupture disc, PSV, etc.)
    *   **BL**: Battery limit pressure
    *   **ATM**: Vent to atmosphere
    *   **S**: Source
    *   **D**: Destination
*   **Pressure Relief Setting**: **Must** refer to the pressure relief device data sheet. **Must** record pump dead head value.

**Piping Testing and Finishing:**
*   **Test Method**: **Must** refer to [[ASME_b31_3_chemical_plant_and_petroleum_refinery_piping]], Section 345.
    *   **Hydro**: Hydrostatic Leak Test
    *   **Pneumatic**: Pneumatic Leak Test
    *   **Service**: Initial Service Leak Test
    *   **Flood**: Service Leak Test for equipment trim
    *   **Chlorine**: Special cleaning and testing for chlorine lines
*   **Test Pressure**: Is specified with respect to the lowest point in the pipe.
*   **Paint**: **Must** show paint system only if applicable.

**General Fields:**
*   **P&ID Reference**: Refers to the [[piping_and_instrumentation_drawings|P&ID]] that shows the line source.
*   **Line Number**: Refer to [[5-PRC-0001_plant_pipe_numbering_procedure|5-PRC-0001: Plant Pipe Numbering Procedure]].
*   **Design Flow Rate**: Represents 100% Design flow from the Process flow diagram.
*   **Preliminary Line Size**: Calculated using standardized velocity criteria and design flow.
*   **Utility Header Information**: Sourced from piping studies and hydraulic network analysis.
*   **Estimated Operating Pressure - Maximum**: The pressure expected during normal operation, including expected process excursions, but excluding mal-operation and equipment failure. This is specified with respect to the lowest point of piping.
*   **Estimated Operating Pressure - Minimum**: The minimum pressure expected during normal operation, including expected process excursions, but excluding mal-operation and equipment failure. This is specified with respect to the lowest point of piping. If there is no possibility of vacuum, show N/A.
*   **Operating Temperature**: The maximum and minimum temperature expected during normal operation, including expected process excursions, but excluding mal-operation and equipment failure.
*   **Insulation Requirements**: Preliminary insulation requirements are provided by Process.
    *   **Insulation Type Codes:**
        *   HC: Heat Conservation
        *   CC: Cold Conservation
        *   AS: Anti-Sweat
        *   PP: Personnel Protection
        *   ET: Electric Heat Tracing
*   **Pipe and Gasket Material**: Refer to [[1-PRC-0005_piping_service|1-PRC-0005: Piping Service]].
*   **Design Pressure - Maximum**: Refer to ASME B31.3 Section 301.2. The design pressure will not be less than the pressure at the most severe condition of coincident internal or external pressure and temperature (minimum or maximum) expected in service. It is specified with respect to the lowest point of piping. Considerations include maximum operating pressure, pump dead head, set pressure of relief device, battery limit pressure, etc.
*   **Design Pressure - Minimum**: Considerations include minimum operating pressure, blocked-in vertical liquid lines, set pressure of vacuum relief devices, etc.
*   **Design Temperature - Maximum**: Refer to ASME B31.3 Section 301.3. This is the temperature at which, under the coincident pressure, the greatest thickness or highest component rating is required. Verify that the design temperature is covered by the pipe specification. Considerations include maximum fluid operating temperature, heating medium temperature, ambient temperature, solar radiation, and all sources of heating, etc.
*   **Design Temperature - Minimum**: Considerations include minimum fluid operating temperature, auto-refrigeration, ambient temperature, and all sources of cooling, etc.
*   **B31.3 Fluid Code**: Refer to ASME B31.3, Section 300.2, fluid service.
    *   **Fluid Code Definitions:**
        *   D: Category D
        *   M: Category M
        *   NFS: Normal Fluid Service (other than Category D or M)
*   **Pressure Relief Device**: Identify the pressure relief device, where applicable.
    *   **Pressure Relief Codes:**
        *   PDH: Pump dead head
        *   Tag No.: Relief device (rupture disc, PSV, etc)
        *   BL: Battery limit pressure
        *   ATM: Vent to atmosphere
        *   S: Source
        *   D: Destination
*   **Pressure Relief Setting**: Refer to the pressure relief device data sheet. Record the pump dead head value.
*   **Test Method**: Refer to ASME B31.3, Section 345.
    *   **Test Method Codes:**
        *   Hydro: Hydrostatic Leak Test
        *   Pneumatic: Pneumatic Leak Test
        *   Service: Initial Service Leak Test
        *   Flood: Service Leak Test for equipment trim
        *   Chlorine: Special cleaning and testing for chlorine lines
*   **Test Pressure**: Specified with respect to the lowest point in the pipe.
*   **Paint**: Show paint system only if applicable.
---