---
slug: gas_gas_heat_exchanger_tube_design
title: Gas/Gas Heat Exchanger Tube Design
source_doc: 4-PRC-0008
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Gas/Gas Heat Exchanger Tube Design

Effective tube design is crucial for the performance and longevity of radial flow gas/gas heat exchangers. The following guidelines pertain to tube selection and configuration:

**Tube Diameters:**
*   Common tube diameters include 1”, 1¼”, 1½”, 2”, 2½”, and 3”.
*   Tube diameters under 1½” **should be avoided** on the cold exchanger, as this unit is particularly prone to significant sulphate build-ups, which can impede flow and heat transfer.

**Tube Wall Thickness:**
*   Standard tube wall thickness for stainless steel tubes is 16 BWG (0.065”).
*   Standard tube wall thickness for carbon steel tubes is 12 BWG (0.109”).

**Tube Lengths:**
*   Tube lengths exceeding 40’ are generally not practical. This is often due to small Log Mean Temperature Differences (LMTDs), which tend to result in very long exchangers if the full allowable pressure drop is utilized.
*   Smaller diameter tubes **should be tried** as a strategy to reduce overall tube length when necessary.

**Tube Pitch:**
*   The standard TEMA pitch of 1.25 times the tube diameter is typically used.
*   Larger pitches can be employed to mitigate noise or to reduce excessive shell side pressure drop.
*   **Avoid** using the minimum pitch for small tube diameters on the cold exchanger, again due to potential fouling issues.
*   Tube pitch can only be changed for the first tube group. The pitch for subsequent groups is calculated automatically by the [[tgas_2_thermal_design_software|TGAS/2 program]].

**Tube Groups:**
*   The [[tgas_2_thermal_design_software|TGAS/2 program]] allows for up to three tube groups.
*   Layouts with no more than two tube groups **should be selected** for practical design.
*   Pitch (P) remains constant for all tubes within a given tube group.
*   The number of tubes per row (NTR) is also constant for a given tube group.
*   NTR for groups 2 and 3 is set such that Theta (a geometric parameter) is approximately equal for each group.