---
slug: mist_separator_entrained_material_data
title: Mist Separator Entrained Material Data
source_doc: 4-PDS-XXXX-R1 (Template Mist Separator)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Mist Separator Entrained Material Data

This page details the characteristics of the entrained material (liquid droplets or solid particles) that the mist separator is designed to remove from the gas stream, as specified in the Template Mist Separator Datasheet (Document ID [[mist_separator_datasheet_administration]]). Understanding these properties is crucial for selecting the appropriate mist elimination technology and achieving the desired collection efficiency.

**Entrained Material Data Parameters**
The following parameters are provided as data fields to characterize the entrained material:

*   **Description:** A data field for a brief description or identifier of the entrained material.
*   **Composition:** Measured in **% w/w**: Specifies the weight percentage of each component within the entrained material.
*   **Inlet Load:** Measured in **mg/Nm3**: The concentration of entrained material in the inlet gas stream, expressed in milligrams per normal cubic meter. This indicates the total amount of material to be removed.
*   **Density:** Measured in **kg/m3**: The density of the entrained material in kilograms per cubic meter. This is a critical factor for gravitational and inertial separation mechanisms.
*   **Viscosity:** Measured in **cP**: The dynamic viscosity of the entrained material in centipoise. Viscosity affects droplet behavior and the ease with which material can be collected and drained.
*   **Size Distribution:** This parameter describes the range and proportion of particle sizes in the entrained material, which is vital for determining the effectiveness of different separation mechanisms.
    *   Measured in **% above microns**: The percentage of particles with a size greater than a specified micron value.
    *   Measured in **% between microns**: The percentage of particles with sizes falling within a specified micron range. (Note: This measurement is listed twice in the source document, indicating its importance).
    *   Measured in **% below microns**: The percentage of particles with a size smaller than a specified micron value.
*   **Particle Type Options:** This field categorizes the physical state of the entrained material, which influences material selection and design:
    *   Solid
    *   Liquid
    *   Solid + Liquid

**Significance for Design**
The detailed characterization of entrained material, particularly its size distribution and physical state, directly impacts the choice of mist separator technology (e.g., [[mist_separator_general_equipment_and_process_data]]). For instance, Brownian diffusion candles are effective for very fine particles, while chevrons are better suited for larger droplets. Accurate data in this section is essential for ensuring the mist separator can meet the specified [[mist_separator_performance_requirements]].

**Entrained Material Data Fields and Units**
The following parameters describe the material to be removed from the gas stream:
*   **Description:** A general descriptive field for the entrained material.
*   **Composition:** Measured in % w/w.
*   **Inlet Load:** Measured in mg/Nm3.
*   **Density:** Measured in kg/m3.
*   **Viscosity:** Measured in cP (centipoise).

**Size Distribution**
The size distribution of the entrained material is specified using the following measurements:
*   **% above microns**
*   **% between microns**
*   **% below microns**

**Particle Type**
*   **Particule Type Options:** The type of entrained material can be specified as Solid, Liquid, or Solid + Liquid.
---