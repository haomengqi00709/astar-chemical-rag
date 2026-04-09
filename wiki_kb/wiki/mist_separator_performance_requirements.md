---
slug: mist_separator_performance_requirements
title: Mist Separator Performance Requirements
source_doc: 4-PDS-XXXX-R1 (Template Mist Separator)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Mist Separator Performance Requirements

This page details the critical performance criteria and guarantees for the mist separator, as specified in the Template Mist Separator Datasheet (Document ID [[mist_separator_datasheet_administration]]). These requirements define the expected operational efficiency and limitations of the equipment.

**Collection Efficiency Specifications**
The datasheet specifies the required collection efficiency based on particle size distribution:
*   **Required Collection Efficiency:**
    *   Specified by **% above microns**: The minimum percentage of particles that **must** be collected above a certain micron size.
    *   Specified by **% between microns**: The minimum percentage of particles that **must** be collected within a specified micron range. (Note: This measurement is listed twice in the source document, indicating its importance).
    *   Specified by **% below microns**: The minimum percentage of particles that **must** be collected below a certain micron size.
*   **Overall Collection Efficiency:** Specified by **% VTA** (Volume Throughput Average or similar context-dependent metric): This represents the overall efficiency of the mist separator across the entire gas stream.

**Mandatory Performance Guarantees**
The following are mandatory performance requirements that the vendor **must** meet:
*   **Outlet Load:** The outlet load **must** be **Maximum mg/Nm3**. This sets a strict upper limit on the concentration of entrained material allowed in the gas stream exiting the mist separator.
*   **Maximum Allowable Pressure Drop:** The maximum allowable pressure drop **must** be **kPa VTA**. This defines the permissible resistance to gas flow through the mist separator, which is critical for system energy consumption and fan sizing.

**Pressure Drop Characteristics**
The datasheet also requires specification of pressure drop under different conditions:
*   **Clean Pressure Drop:** Measured in **kPa VTA**: The expected pressure drop across the mist separator when it is clean and operating under design conditions. This is a parameter the vendor **is required to guarantee**.
*   **Dirty Pressure Drop:** Measured in **kPa**: The expected pressure drop across the mist separator when it has accumulated a specified amount of entrained material, indicating the need for cleaning or maintenance.

**Vendor Obligations**
To ensure compliance with these performance requirements, the vendor **is required to**:
*   Provide curves for predicted collection efficiency versus particle size. These curves allow for a visual representation and detailed understanding of the separator's performance across the spectrum of entrained particle sizes, as detailed in [[mist_separator_entrained_material_data]].
*   Guarantee outlet particle load.
*   Guarantee clean pressure drop.

These guarantees are crucial for verifying the equipment's suitability for the intended application and for contractual compliance. The performance is directly influenced by the [[mist_separator_inlet_gas_data]] and [[mist_separator_entrained_material_data]].

**Collection Efficiency and Outlet Load**
*   **Required Collection Efficiency:** Specified by % above microns, % between microns, or % below microns.
*   **Overall Collection Efficiency:** Specified by % VTA (Vendor To Advise).
*   **Outlet Load:** Must be a Maximum mg/Nm3.

**Pressure Drop**
*   **Maximum Allowable Pressure Drop:** Must be kPa VTA (Vendor To Advise).
*   **Clean Pressure Drop:** Measured in kPa VTA (Vendor To Advise).
*   **Dirty Pressure Drop:** Measured in kPa.

**Operational Range**
*   **Turndown Range:** The operational flexibility of the separator is specified as 40% to 110% of design flow.

**Vendor Guarantees and Deliverables**
The vendor is required to provide specific guarantees and documentation:
*   Vendor is required to provide curves for predicted collection efficiency versus particle size.
*   Vendor is required to guarantee outlet particle load.
*   Vendor is required to guarantee clean pressure drop.
---