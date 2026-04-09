---
slug: absorber_tower_calculation_parameters
title: Absorber Tower Calculation Parameters
source_doc: 1-Cal-7567-R1 (Template Absorber Tower)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Absorber Tower Calculation Parameters

This page outlines the key input parameters and specifications used in the Absorber Tower calculations (Document ID: [[1-cal-7567-r1_absorber_tower_calculation_document_details]]). These parameters define the operating conditions, material properties, and design constraints for the tower.

**User-Specified Properties:**
*   **User specified Gas density:** 0.034 lb/ft3
*   **User specified Gas viscosity:** 0.0388 cP
*   **User specified Liquid density:** 112.0 lb/ft3
*   **User specified Liquid viscosity:** 9.29 cP
*   **User provide properties setting:** 1.0 (1=No, 2=yes)

**Gas Specifications (lbmol/hr at various points):**
*   **SO2 lbmol/hr (all points):** 21.16416
*   **O2 lbmol/hr (all points):** 261.57579000000004
*   **N2 lbmol/hr (all points):** 4304.834236000001
*   **H2O lbmol/hr (all points):** 0.08818400000000001
*   **CO2 lbmol/hr (all points):** 1488.744334
*   **SO3 lbmol/hr:**
    *   Bottom: 460.10002
    *   at 50.0 point: 230.05736071875833
    *   at 90.0 point: 46.02323329376503
    *   at 99.0 point: 4.61555462314152
    *   Top: 0.014701437516706599

**Gas Temperature Specifications:**
*   **Bottom Temperature:** 180.0 oC
*   **at 50.0 point Temperature:** 125.0 oC
*   **at 90.0 point Temperature:** 81.0 oC
*   **at 99.0 point Temperature:** 71.1 oC
*   **Top Temperature:** 70.0 oC

**Acid Specifications (lbmol/hr at various points):**
*   **H2O lbmol/hr (all points):** 15412.43785907939
*   **SO3 lbmol/hr:**
    *   Bottom: 14431.053419532936
    *   at 50.0 point: 14201.010760251695
    *   at 90.0 point: 14016.976632826701
    *   at 99.0 point: 13975.568954156079
    *   Top: 13970.968100970455

**Acid Temperature Specifications:**
*   **Bottom Temperature:** 100.8 oC
*   **at 50.0 point Temperature:** 85.4 oC
*   **at 90.0 point Temperature:** 73.08 oC
*   **at 99.0 point Temperature:** 70.30799999999999 oC
*   **Top Temperature:** 70.0 oC

**General Design Parameters:**
*   **Type of Packing Support:** Self Sup. Dome
*   **Allowable emissions (SO3):** 0.05 lb/ST (as 100% H2SO4)
*   **H2O Absorption Efficiency:** 99.99680473008527 %
*   **Inlet gas duct sizing Pressure ratio:** 1:10.0
*   **Actual duct diameter:** 52.0 in
*   **Atmospheric pressure:** 1.01325 Bar(a) / 14.692124999999999 psia
*   **H -value (all points):** 1.0 kg/m3/bar
*   **W-C factor (all points):** 1000000.0
*   **Efficiency factor (all points):** 1.0
*   **Safety Factor:** 0.0 %
*   **Maximum Differential Pressure (DP):** 0.0 mm WC

**Packing Type 11 Specific Parameters:**
*   **Mandatory Requirement:** If packing type 11 (user) is selected, the following parameters **must** be specified:
    *   **FLP:** 0.085
    *   **FLQ:** 9.2
    *   **F:** 22.0
    *   **BETA:** 17.5
    *   **ALPHA:** 95.0
    *   **S:** 92.0
    *   **RL:** 0.73
    *   **N:** 0.9
    *   **Dry void:** 0.8
    *   **RG:** 2.4
    *   **A in HU:** 0.001611
    *   **N in Hu:** 0.6327
    *   **FPF:** 0.105

**Process Points for Calculations:**
Calculations are performed at the following process points: Bottom, 50.0, 90.0, 99.0, Top.

For the detailed results derived from these parameters, refer to [[absorber_tower_calculation_results]]. The raw stream data used in these calculations can be found in [[absorber_tower_aspen_stream_data]].