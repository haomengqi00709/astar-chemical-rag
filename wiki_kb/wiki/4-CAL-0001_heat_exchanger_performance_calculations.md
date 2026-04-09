---
slug: 4-CAL-0001_heat_exchanger_performance_calculations
title: Heat Exchanger Performance and Calculations (4-CAL-0001)
source_doc: 4-CAL-0001
doc_type: CAL
discipline: 4
discipline_name: Equipment
source_folder: Calculation
track: A
---

# Heat Exchanger Performance and Calculations (4-CAL-0001)

This page details the performance metrics and calculation results for the Intermediate Exchanger Replacement, as documented in 4-CAL-0001.

**Overall Performance Metrics:**
*   **HI (Heat Transfer Coefficient, Internal):** 19.26338638094323 Btu/hr ft2 OF (109.38257414161386 W/m2 OC)
*   **HO (Heat Transfer Coefficient, External):** 14.560376404486698 Btu/hr ft2 OF (82.67764660366986 W/m2 OC)
*   **U (Overall Heat Transfer Coefficient):** 8.070770992665619 Btu/hr ft2 OF (45.82796030912645 W/m2 OC)
*   **LMTD (Log Mean Temperature Difference):** 324.89916897337463 OF (180.49953831854145 OC)
*   **Safety Factor:** 1.4584338769277807
*   **Aeff (Effective Heat Transfer Area):** 3160.6194909865317 ft2 (293.63115899590144 m2)
*   **Agross (Gross Heat Transfer Area):** 3204.424506661586 ft2 (297.7007781193616 m2)
*   **Qcalc (Calculated Heat Duty):** 8287734.672713541 Btu/hr (1665.413380642161 kW)
*   **Twall (Wall Temperature):** 734.7005972477735 F
*   **gamma:** 1.011203125

**Flow Rates and Properties (from Spec Sheet):**
*   **Quantity Operating:** 1.0
*   **Quantity Installed Spare:** 0.0
*   **Hot Side Total Flowrate:** 144150.0 kg/h
*   **Cold Side Total Flowrate:** 143900.0 kg/h
*   **Hot Side Inlet Temperature:** 490.0 oC
*   **Hot Side Outlet Temperature:** 451.0 oC
*   **Cold Side Inlet Temperature:** 270.0 oC
*   **Cold Side Outlet Temperature:** 310.0 oC
*   **Hot Side Inlet Pressure:** 93.66000184471798 kPa(abs)
*   **Hot Side Outlet Pressure:** 91.41800180055978 kPa(abs)
*   **Cold Side Inlet Pressure:** 121.00000238320389 kPa(abs)
*   **Cold Side Outlet Pressure:** 119.50500235375851 kPa(abs)
*   **Hot Side Non-Condensable Flow:** 144150.0 kg/h
*   **Cold Side Non-Condensable Flow:** 143900.0 kg/h
*   **Hot Side Allowable Pressure Drop:** 2.2420000441582077 kPa
*   **Cold Side Allowable Pressure Drop:** 1.4950000294453705 kPa
*   **Exchanger Type:** Plate and Frame
*   **Hot Fluid:** Shell Side
*   **Shellside Flow:** Up
*   **Removable Bundle:** No
*   **Frame to accept:** ____% additional plates minimum (value not specified)

**Pressure Drop Calculations (Imperial Units):**
*   **Total Shell Side Pressure Drop:** 4.639415185789576 "H2O
*   **Shell Side Inlet/Outlet Losses:** 2.4096243290363994 "H2O
*   **Total Tube Side Pressure Drop:** 11.109375582693769 "H2O
*   **Tube Side Inlet/Outlet Losses:** 0.3788503178053275 "H2O

**Pressure Drop Calculations (SI Units):**
*   **Total Shell Side Pressure Drop:** 1.155626825271621 kPa
*   **Shell Side Inlet/Outlet Losses:** 0.6002106735329148 kPa
*   **Total Tube Side Pressure Drop:** 2.76722214358005 kPa
*   **Tube Side Inlet/Outlet Losses:** 0.09436740892677944 kPa

**Detailed Shell Side Pressure Drop Components (Imperial Units):**
*   **Bundle Pressure Loss:** 2.2297908567531763
*   **Inlet Vestibule Loss (Shellside):** 1.693804579587424
*   **Outlet Vestibule Loss (Shellside):** 0.7158197494489756
*   **DeltaPS1 - Bundle crossflow (per pass):** 0.5752640754770951 (2.0 crossflow passes)
*   **DeltaPS2 - Bundle entrance (from annulus):** 0.09792723376839055 (1.0 bundle entrances)
*   **DeltaPS3 - Bundle entrance (from core):** 0.08540065566784327 (1.0 bundle entrances)
*   **DeltaPS4 - Bundle exit (to annulus):** 0.1468793739326343 (1.0 bundle exits)
*   **DeltaPS5 - Bundle exit (to core):** 0.11170593527992062 (1.0 bundle exits)
*   **DeltaPS6 - Longitudinal friction (in annulus):** 0.02119002221355974 (0.0 longflow passes)
*   **DeltaPS7 - Longitudinal friction (in core):** 0.11503011774826198 (1.0 longflow passes)
*   **DeltaPS8 - Direction change (annulus to bundle):** 0.26115969470096767 (0.0 direction changes)
*   **DeltaPS9 - Direction change (core to bundle):** 0.26115969470096767 (2.0 direction changes)
*   **DeltaPS10 - Inlet nozzle friction (type 4 top vestibule only):** 0.0
*   **DeltaPS11 - Nozzle/slot entrance:** 0.002857977797722533
*   **DeltaPS12 - Flow direction change (type 4 bottom vestibule only):** 0.0
*   **DeltaPS13 - Vestibule to core contraction (type 4 bottom vestibule only):** 0.0
*   **DeltaPS14 - Vestibule core friction (type 4 bottom vestibule only):** 0.0
*   **DeltaPS15 - Impingement on tube bundle:** 0.9188802852479898
*   **DeltaPS16 - Flow direction change (radial to circumferential):** 0.7720663165417115
*   **DeltaPS17 - Flow direction change (circumferential to radial):** 0.6336050881539216
*   **DeltaPS18 - Vestibule core friction (type 4 bottom vestibule only):** 0.0
*   **DeltaPS19 - Core to vestibule expansion (type 4 bottom vestibule only):** 0.0
*   **DeltaPS20 - Flow direction change (type 4 bottom vestibule only):** 0.0
*   **DeltaPS21 - Nozzle/slot exit:** 0.08221466129505403
*   **DeltaPS22 - Outlet nozzle friction (type 4 top vestibule only):** 0.0

**Detailed Tube Side Pressure Drop Components (Imperial Units):**
*   **Inlet Vestibule Loss (Tubeside):** 0.15769419951726688
*   **Friction Loss Through Tubes:** 10.730525264888442
*   **Outlet Vestibule Loss (Tubeside):** 0.22115611828806064

For general information on calculations, refer to [[process_calculations]]. Specific details on heat transfer coefficients can be found in [[heat_transfer_coefficients]], and further information on pressure drop calculations is available in [[pressure_drop_calculations]].

### Additional Heat Exchanger Specifications
*   Heat Exchanger Tubes ID: 2.37 in (60.19800000000001 mm)
*   Heat Exchanger Estimated Weight: 13.201440539497279 tons (11.976146195535732 tonnes)
*   Heat Exchanger Shell Side Design Temperature: Max. Metal
*   Heat Exchanger Tube Side Design Temperature: Max. Metal
*   Heat Exchanger Tubesheet Joint: Welded
*   Gross Heat Transfer Area (Agross): 3204.424506661586 ft2 (297.7007781193616 m2)
*   Shell Side Flow Area (ASFLOW): 41.86091972878391 ft2 (3.8890067000000013 m2)
*   Wall Resistance (Rwall): 0.0004649129403723875

### Additional Flow Rates
*   Shell side Volume Flow Rate (Inlet): 60044.219939945346 SCFM (102015.7778865444 Nm3/hr)
*   Tube side Volume Flow Rate (Inlet): 57742.594386166755 SCFM (98105.29122342989 Nm3/hr)

### Detailed Pressure Loss Components (Imperial Units)
The total pressure drop values are further broken down into individual components:

**Shell Side Pressure Loss Components:**
*   DeltaPS1 - Bundle crossflow (per pass): 0.5752640754770951 "H2O (for 2.0 crossflow passes)
*   DeltaPS2 - Bundle entrance (from annulus): 0.09792723376839055 "H2O (for 1.0 bundle entrances)
*   DeltaPS3 - Bundle entrance (from core): 0.08540065566784327 "H2O (for 1.0 bundle entrances)
*   DeltaPS4 - Bundle exit (to annulus): 0.1468793739326343 "H2O (for 1.0 bundle exits)
*   DeltaPS5 - Bundle exit (to core): 0.11170593527992062 "H2O (for 1.0 bundle exits)
*   DeltaPS6 - Longitudinal friction (in annulus): 0.02119002221355974 "H2O (for 0.0 longflow passes)
*   DeltaPS7 - Longitudinal friction (in core): 0.11503011774826198 "H2O (for 1.0 longflow passes)
*   DeltaPS8 - Direction change (annulus to bundle): 0.26115969470096767 "H2O (for 0.0 direction changes)
*   DeltaPS9 - Direction change (core to bundle): 0.26115969470096767 "H2O (for 2.0 direction changes)
*   Bundle Pressure Loss: 2.2297908567531763 "H2O
*   DeltaPS10 - Inlet nozzle friction (type 4 top vestibule only): 0.0 "H2O
*   DeltaPS11 - Nozzle/slot entrance: 0.002857977797722533 "H2O
*   DeltaPS12 - Flow direction change (type 4 bottom vestibule only): 0.0 "H2O
*   DeltaPS13 - Vestibule to core contraction (type 4 bottom vestibule only): 0.0 "H2O
*   DeltaPS14 - Vestibule core friction (type 4 bottom vestibule only): 0.0 "H2O
*   DeltaPS15 - Impingement on tube bundle: 0.9188802852479898 "H2O
*   DeltaPS16 - Flow direction change (radial to circumferential): 0.7720663165417115 "H2O
*   Inlet Vestibule Loss (Shellside): 1.693804579587424 "H2O
*   DeltaPS17 - Flow direction change (circumferential to radial): 0.6336050881539216 "H2O
*   DeltaPS18 - Vestibule core friction (type 4 bottom vestibule only): 0.0 "H2O
*   DeltaPS19 - Core to vestibule expansion (type 4 bottom vestibule only): 0.0 "H2O
*   DeltaPS20 - Flow direction change (type 4 bottom vestibule only): 0.0 "H2O
*   DeltaPS21 - Nozzle/slot exit: 0.08221466129505403 "H2O
*   DeltaPS22 - Outlet nozzle friction (type 4 top vestibule only): 0.0 "H2O
*   Outlet Vestibule Loss (Shellside): 0.7158197494489756 "H2O

**Tube Side Pressure Loss Components:**
*   Inlet Vestibule Loss (Tubeside): 0.15769419951726688 "H2O
*   Friction Loss Through Tubes: 10.730525264888442 "H2O
*   Outlet Vestibule Loss (Tubeside): 0.22115611828806064 "H2O
---