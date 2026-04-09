---
slug: 0-rep-2001_monthly_progress_report_format
title: Monthly Progress Report Format
source_doc: 0-REP-2001-1
doc_type: REP
discipline: 0
discipline_name: Administration
source_folder: Unknown
track: A
---

# Monthly Progress Report Format

The Monthly Progress Report, identified as document 0-REP-2001-1, provides a standardized format for reporting project status. This document is crucial for tracking project performance, identifying potential issues, and communicating progress to stakeholders.

Each report **must** indicate the "Progress to: [Date]", the "Chemetics Project Number: [00X0000]", and the "Client Reference: [Ref]".

### Report Sections

The report is structured into several key sections:

1.  **Executive Summary**
    This section provides a high-level overview of the project, covering key activities, areas of concern, overall progress, schedule status, and costs.

2.  **Health, Safety and Environmental (HSE)**
    This section details key HSE activities and any incidents that occurred during the reporting period. It refers to the [[safety_report]] for comprehensive safety information. For general HSE management, refer to [[hse_management_and_employee_responsibilities]].

3.  **Highlights This Month**
    This section outlines significant accomplishments and activities across various project disciplines:
    *   **Project** activities or accomplishments.
    *   **Engineering** activities or accomplishments, which may include:
        *   Process
        *   Civil and Structural
        *   Equipment
        *   Piping and Layout
        *   Instrumentation and Control
        *   Electrical
        *   *Mandatory: Engineering highlight subsections shall be deleted if not applicable.*
    *   **Procurement** activities or accomplishments. *Mandatory: This section shall be deleted if not applicable.*
    *   **Expediting and Logistics** activities or accomplishments. *Mandatory: This section shall be deleted if not applicable.*
    *   **Quality Assurance** activities or accomplishments. *Mandatory: This section shall be deleted if not applicable.*
    *   **Construction, Subcontracts** activities or accomplishments. *Mandatory: This section shall be deleted if not applicable.*
    *   **Commissioning, Start-up** activities or accomplishments. *Mandatory: This section shall be deleted if not applicable.*

4.  **Next Month Look Ahead**
    This section lists the key activities planned for the upcoming month.

5.  **Areas of Concern**
    This section highlights major areas of concern that could impact the project's cost or schedule, particularly focusing on items where the client has control or can influence the outcome.

6.  **Progress**
    This section provides detailed progress updates:
    *   **Engineering Progress:** Refers to the [[engineering_progress_curve]] and discusses progress achieved last month and any impacts, as reported by [[project_controls_function]].
    *   **Procurement Progress:** Refers to the [[procurement_progress_curve]] and discusses progress achieved last month and any impacts, as reported by [[procurement_and_logistics_strategy]].
    *   **Construction Progress:** Refers to the [[construction_progress_curve]] and discusses progress achieved last month and any impacts, as reported by the [[construction_site_management_roles_0_prc_600|Construction Manager]].
    *   **Commissioning Progress:** Discusses progress achieved last month and any impacts, as reported by the [[commissioning_manager_assignment|Commissioning Manager]].

7.  **Project Schedule**
    This section details the project schedule status:
    *   **Milestones:** Lists key contract dates and [[pem_milestone_gate_review_process|PEM milestones]]. It updates revised schedules as they change and records achieved dates. Data available in [[0-REP-2001-1_table_2]].
    *   **Schedule:** References the [[project_schedule_level_1_master_schedule|Level 1/Master Schedule]] and the [[30_day_look_ahead_schedule]].
    *   **Schedule Variance and Critical Path:** Discusses major changes in the schedule and critical path, as reported by [[project_controls_function]].

8.  **Costs and Payments**
    This section covers financial aspects of the project:
    *   **Costs:**
        *   For fixed price contracts, this section lists the contract price, cost of agreed change orders, and cost for pending and expected change orders, as reported by [[project_controls_function]]. Data available in [[0-REP-2001-1_table_3]]. All values **must** be in CAD.
        *   For reimbursable projects, this section shows more detailed costs depending on the contract pricing format, as reported by [[project_controls_function]]. Data available in [[0-REP-2001-1_table_4]]. Engineering expended is based on actuals, budget, and estimates based on an average $[xxx]/hr. All values **must** be in CAD.
        *   An explanation of changes in costs from the last report is provided by [[project_controls_function]].
    *   **Man-hours:** *Mandatory: This section shall be modified as required for fixed price contracts.* Data available in [[0-REP-2001-1_table_5]] and [[0-REP-2001-1_table_6]]. An explanation of changes in man-hours from the last report is provided by [[project_controls_function]].
    *   **Payment:** Provides a summary of payments received, outstanding invoices, etc., as reported by Accounting.

9.  **Change Control**
    This section refers to the [[change_notice_log]] and [[change_order_log]]. It summarizes project change notices and change orders that are pending or issued for approval, as reported by [[project_controls_function]].

### Attachments

The report includes several attachments providing detailed supporting documentation. *Mandatory: Items in the Attachments list shall be deleted if not applicable.*

*   **Attachment A: Safety**
    Includes the [[safety_report]].
*   **Attachment B: Procurement/Expediting**
    Includes the [[procurement_plan]], [[rfq_register]], [[po_register]], and [[expediting_status_report]].
*   **Attachment C: Progress**
    Includes the [[engineering_progress_curve]], [[procurement_progress_curve]], and [[construction_progress_curve]].
*   **Attachment D: Schedule**
    Includes the [[project_schedule_level_1_master_schedule|Level 1/Master Schedule]] and the [[30_day_look_ahead_schedule]].
*   **Attachment E: Costs [reimbursable projects]**
    Includes the [[project_cost_report]] (if based on client costs) and the [[project_labour_report]].
*   **Attachment F: Change Control**
    Includes the [[change_notice_log]] and [[change_order_log]].

Data for general report information is available in SQL: 0-REP-2001-1_table_1.