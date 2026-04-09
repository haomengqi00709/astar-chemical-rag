---
doc_id: 4-PDS-XXXX-R1 (Template Hypo Unit Package)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
revision: R1
is_template: True
track: A
---

# 4-PDS-XXXX-R1 (Template Hypo Unit Package) — Datasheet


## Sheet: Sheet1
- 1.0 | 2.0 | 3.0 | 4.0 | 5.0 | 6.0 | 7.0 | 8.0 | 9.0 | 10.0 | 11.0 | 12.0 | 13.0 | 14.0 | 15.0 | 16.0 | 17.0 | 18.0 | 19.0 | 20.0 | 21.0 | 22.0 | 23.0 | 24.0
- Client Name | Process Data Sheet | Aker Kvaerner
- Project Title | [Template - Hypo Unit Package]
Tag No.: [     ] | Chemetics
- Location | A Division of Aker Kvaerner Canada Inc.
- Client Document Number | Standard-4-PDS-XXXX-R1
- Rev: | Date: | Status: | Prepared By: | Checked By: | Approved By:
- 1.0 | 38113.0 | Standard | H. Lee | G. Schwab | T. Ueki
- 0.0 | 37966.0 | Comments Requested | H. Lee | G. Schwab | T. Ueki
- PROCESS DESIGN CONDITIONS
- Case Description | Under emergency conditions, Hypo will absorb 10 minutes of maximum Cl2 production
- from the electrolyzers.
- Design Basis
- Bleach Unit Gas Feed | Scrubber Unit Gas Feed
- Fluid Description | Cooled, wet chlorine gas (note 1&2) | Fluid Description | Storage Tank Vent Sweeps
- Composition | Composition
- Cl2 | kg/h | Cl2 | kg/h
- H2O | kg/h | H2O | kg/h
- Air | kg/h | Air | kg/h
- HCl | kg/h
- Temperature | oC | (note 2) | Temperature | oC
- Minimum pressure | kPa(g) | Minimum pressure | kPa(g)
- Normal pressure | kPa(g) | Note 2 | Normal pressure | kPa(g)
- Maximum pressure | kPa(g) | (note 8) | Maximum pressure | kPa(g)
- Product | Chlorine Scrubber Vent Gases
- Fluid Description | Sodium hypochlorite solution | Fluid Description | Wet air with trace of chlorine and HCl
- Composition | Composition
- NaOCl | %w/w | Cl2 | g/s | xx (max)
- NaClO3 | ppm w/w | xx Max. | HCl | %v/v | VTA
- NaOH | %w/w | 0.1 - 0.5 | Air | %v/v | VTA
- H2O | %w/w | Balance | H2O | %v/v | VTA
- Normal Flow Rate | kg/h | VTA | Normal Flow Rate | kg/h | VTA
- Maximum Flow Rate | kg/h | VTA | Maximum Flow Rate | kg/h
- Temperature | oC | 40 (max) | Temperature | oC
- Pressure | kPa(g) | xx (max) | Pressure | kPa(g) | Atmospheric
- Utilities
- Demineralized Water
- Flow Rate | m3/h | VTA | Temperature | oC | Pressure | kPa(g)
- Supply Caustic
- NaOH strength | % w/w | Temperature | oC | Pressure | kPa(g)
- Flow Rate | m3/h | VTA
- Cooling Water
- Supply Pressure | kPa(g) | Supply Temperature | oC | Flow Rate | m3/h | VTA
- Return Pressure | kPa(g) | Return Temperature | oC
- PROCESS GUARANTEES
- Vent Gas
- Maximum Cl2 | mg Cl2/Nm3
- NOTES
- 1.0 | Unit will normally operate in stand-by mode with only the Brine Dechlorinator Vent to the Bleach Tower and tank vents to the scrubber. The bleach unit must be able to process 100% of the specified Bleach Unit Feed diverted from the HCl plant to the bleach unit, without tripping the bleach unit on high ORP or other process upset.  Vendor to incorporate a logic control scheme c/w preset valve positions upon an HCl unit trip.
- 2.0 | Normal flow will be Brine Dechlorinator Vent with approximately X kg/h Cl2, XXX kg/h air and XXX kg/h H2O at XX C, drawn into the Bleach Tower by the suction of the Scrubber Fans.  This stream will be sent to the Bleach Tower to prevent depletion of scrubber liquor.  Under these conditions, the bleach will be dilute with a wide range of possible caustic level.  The off spec, dilute bleach will be sent to the Hypo Destruct Unit, direct off the Hypo Tower Pump.  The bleach is exported on level control, therfore the bleach and caustic strength will tend to dilute from the water in the feed gas.  The ORP control must be set up to control the normal operating case (ie there is sufficient turn down).
- 3.0 | Unit to have 2 scrubber pumps and 2 scrubber fans c/w auto switch over, all on emergency power.  The unit may have only 1 bleach recycle pump which does not have to be on e-power.
- 4.0 | The Scrubber system will normally be exposed to non-Cl2 vent gases and caustic only, but during hypo production, gas from the bleach tower will contain Cl2 and produce some bleach in the Scrubber.  Therefore, allowances must be made to address materials of construction in the Scrubber or a small kickback added from the bleach unit to provide an oxidation passivator.
- 5.0 | Base case will be 100% DCS controlled c/w a local junction box.  The Vendor shall provide logic and control narratives to allow DCS programming.
- 6.0 | Maximum possible pressure off cellroom, relief pressure of Cl2 pressure seal.