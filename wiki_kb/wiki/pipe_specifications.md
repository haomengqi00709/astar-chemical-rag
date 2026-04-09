---
slug: pipe_specifications
title: Pipe Specifications
source_doc: 4-PRC-0007
doc_type: PRC
discipline: 4
discipline_name: Equipment
source_folder: Procedure
track: A
---

# Pipe Specifications

Pipe Specifications are detailed documents that define the technical requirements for piping materials, dimensions, and manufacturing standards used within a project. These specifications are fundamental for accurate hydraulic calculations and overall piping system design.

**Role in Pump Calculations:**
At the [[pump_sizing_stages|RFQ stage]], the Hydraulic Engineer **will** obtain information from [[pipe_specifications|Pipe Specifications]] for pipe dimensions. This information is critical for:
*   **Pipe Diameter:** The internal diameter of the pipe directly influences fluid velocity and, consequently, friction losses within the system.
*   **Wall Thickness:** While less directly involved in hydraulic calculations, wall thickness affects the pipe's external dimensions and weight, which can be relevant for layout and support design.
*   **Material Roughness:** Pipe specifications often include details about the material, which helps in determining the pipe's internal roughness. This roughness factor is essential for calculating friction factors (e.g., using the Colebrook-White equation) and, subsequently, friction losses.

When using software like Pipe-Flo, if standard pipe specifications are not available, custom table files (`*.ptbl`, `*.ftbl`) **must** be created and saved in the project directory under `4-Equipment/Cal/Hydraulic/Tables` as per [[pump_calculation_documentation_and_storage]].