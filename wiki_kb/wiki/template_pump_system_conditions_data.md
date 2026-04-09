---
slug: template_pump_system_conditions_data
title: Template Pump System Conditions Data
source_doc: 4-PDS-XXXX-R2 (Template Pump)
doc_type: UNKNOWN
discipline: 4
discipline_name: Equipment
source_folder: Datasheet
track: A
---

# Template Pump System Conditions Data

This page provides detailed system condition data for the template pump, extracted from document 4-PDS-XXXX-R2. This data is critical for understanding the hydraulic profile and operational requirements of the pump within the overall process. The system involves caustic flow to a Concentrator and a Cooler, with both continuous and intermittent user demands.

The following table summarizes the key parameters for various nodes and operational cases (Cases 1, 2, and 3), which represent intermittent flow scenarios. "n/a" indicates that the parameter is not applicable for that specific node or case.

| Node        | Flow (m3/h) | Equipment Loss (kPa) | Pressure (kPa(g)) | Liquid Level (m) | Operation Type |
| :---------- | :---------- | :------------------- | :---------------- | :--------------- | :------------- |
| **Common for Cases 1, 2, 3:** | | | | | |
| 3004T       | 3.3         | n/a                  | 0.0               | 0.0              | Intermittent   |
| 3010H       | 1.8         | 70.0                 | n/a               | n/a              | Intermittent   |
| 3012H       | 1.8         | n/a                  | 0.0               | 2.0              | Intermittent   |
| 3001H       | 1.5         | 70.0                 | n/a               | n/a              | Intermittent   |
| 1035T       | 0.009       | n/a                  | 0.0               | 0.0              | Intermittent   |
| line 434    | 0.007       | Specified in 4-PDS-1506 | Specified in 4-PDS-1506 | Specified in 4-PDS-1506 | Intermittent   |
| BL          | 0.5         | n/a                  | 300.0             | 0.0              | Intermittent   |
| **Case 1 Specific:** | | | | | |
| 1068U       | 0.3         | n/a                  | 300.0             | 0.0              | Intermittent   |
| 5070U       | 0.0         | n/a                  | n/a               | n/a              | Intermittent   |
| 8504T       | 0.0         | n/a                  | n/a               | n/a              | Intermittent   |
| **Case 2 Specific:** | | | | | |
| 1068U       | 0.0         | n/a                  | n/a               | n/a              | Intermittent   |
| 5070U       | 0.7         | n/a                  | 0.0               | 0.0              | Intermittent   |
| 8504T       | 0.0         | n/a                  | n/a               | n/a              | Intermittent   |
| **Case 3 Specific:** | | | | | |
| 1068U       | 0.0         | n/a                  | n/a               | n/a              | Intermittent   |
| 5070U       | 0.0         | n/a                  | n/a               | n/a              | Intermittent   |
| 8504T       | 1.0         | n/a                  | 0.0               | 0.0              | Intermittent   |

*Note: For Node line 434, specific values for Equipment loss, Pressure, and Liquid Level are referenced in document 4-PDS-1506.*

This detailed data supports the analysis of pump performance, hydraulic calculations, and selection. For a general overview of the system conditions, refer to [[template_pump_system_conditions]]. Further details on the pump's design and materials can be found in [[template_pump_process_design_conditions]], [[template_pump_equipment_specifications]], and [[template_pump_material_specifications]]. Administrative details for the datasheet are available in [[4-PDS-XXXX-R2_template_pump_datasheet_administration]].