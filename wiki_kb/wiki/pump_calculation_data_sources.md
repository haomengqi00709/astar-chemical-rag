---
slug: pump_calculation_data_sources
title: Pump Calculation Data Sources
source_doc: 4-PRC-0007
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Pump Calculation Data Sources

Accurate pump calculations rely on comprehensive and up-to-date data from various project documents and specifications. This page details the primary sources of information utilized by the Hydraulic Engineer and Requisition Originator throughout the pump sizing process.

**Process Data Sheet (PDS)**
The [[4-PDS-XXXX-R2_template_pump_datasheet_administration|Process Data Sheet (PDS)]] is a critical source for fluid properties and process conditions.
*   **Fluid Properties:**
    *   Design Temperature
    *   Design Specific gravity
    *   Design Vapour Pressure
    *   Design Viscosity
*   **Sheet 2 of the PDS will show:**
    *   Liquid levels/pressures at origins/destinations.
    *   Branch flows.
    *   Equipment pressure drops.

**Data Sheet (DST)**
The [[4-DST-XXXX-R2_template_pump_datasheet_administration|Data Sheet (DST)]] is prepared by the Requisition Originator and incorporates applicable information from the PDS and the results of hydraulic calculations.

**Site Conditions**
*   [[site_design_conditions_1_dst_0001|Site conditions]] provide atmospheric pressure adjusted for plant elevation, which is crucial for NPSH calculations.

**Pipe Specifications**
*   [[pipe_specifications|Pipe Specifications]] detail the dimensions of piping, essential for calculating friction losses.

**Preliminary Equipment General Arrangement**
*   [[4-gad-xxxx_equipment_layout_drawing|Preliminary Equipment General Arrangement]] drawings provide information on pipe routing and equipment elevations, which are used to determine static head components.

**Preliminary P&IDs**
*   [[piping_and_instrumentation_drawings|Preliminary P & IDs]] are used to determine valve counts and line sizes, which contribute to dynamic head calculations.

**Battery Limit List**
*   The [[battery_limits_conditions_1_lst_0001|Battery Limit List]] provides stream pressures, which are important for calculating TDH, especially when based on tie-point conditions. Data available in SQL: 1-LST-0001.

**Equipment Files**
*   For the Final Impeller Trim stage, final equipment pressure drop figures are obtained from equipment files.

**Isometrics**
*   [[isometrics|Isometrics]] from the design office provide final pipe routing information for precise calculations during the Final Impeller Trim.

**Instrument Data**
*   [[instrument_data|Instrument Data]] is consulted for control valve pressure drops and pressure drop figures for any instruments that may have significant pressure drops (e.g., Coriolis meters).

The **Process Engineer** is responsible for creating the PDS.

**Process Data Sheet (PDS) Details:**
The PDS is a critical source for fluid properties, operating conditions, and other process-related data essential for pump sizing. This document is utilized by the Hydraulic Engineer and Requisition Originator throughout the pump sizing process.

Key fluid properties to be included in the PDS are:
*   Design Temperature
*   Design Specific gravity
*   Design Vapour Pressure
*   Design Viscosity

Sheet 2 of the PDS will specifically detail:
*   Liquid levels/pressures at origins/destinations
*   Branch flows
*   Equipment pressure drops

**Data Specification Table (DST):**
The **Requisition Originator** will produce the DST and enter applicable information from the PDS and hydraulic calculation results into it.

**Additional Information Sources for RFQ Stage:**
At the Request for Quotation (RFQ) stage, the Hydraulic Engineer will obtain crucial information from:
*   **Preliminary Equipment General Arrangement:** For pipe routing and equipment elevations.
*   **Preliminary P & IDs:** For valve count and line sizes.
*   **Battery Limit List:** For stream pressures.
---