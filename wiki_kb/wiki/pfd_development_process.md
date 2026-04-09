---
slug: pfd_development_process
title: Process Flow Diagram (PFD) Development Process
source_doc: 1-PRC-0002
doc_type: PRC
discipline: 1
discipline_name: Process Technology
source_folder: Procedure
track: A
---

# Process Flow Diagram (PFD) Development Process

The development of a [[pfd_overview|Process Flow Diagram (PFD)]] follows a structured, multi-stage process, requiring input from various project documents and involving distinct preparation, checking, and approval steps. This procedure ensures the accuracy and completeness of the final published PFD.

**Required Input Documents:**
The following project documents **must** be produced and used as reference or input for the preparation of the PFDs:
*   **Process Design Criteria:** Refer to 1-PRC-0001: Process Design Criteria.
*   **Site Conditions:** Refer to 4-PRC-0003: Equipment Design and Specification. Data for site conditions is also available in SQL: 1-DST-0001.
*   **Battery Limit Conditions:** Refer to 1-PRC-0005: Battery Limit Conditions. Data for battery limit conditions is also available in SQL: 1-LST-0001.
*   **Process Calculations:** Refer to [[process_calculations|PRC-0001: Process Design Criteria]].

**PFD Sketch Preparation:**
Process prepares a PFD sketch, which can originate from one or more of the following sources:
*   A standard template
*   A Proposal Flow Diagram (often an attachment to the contract)
*   A previous PFD used in another project
*   A hand sketch

The PFD sketch will contain, as applicable:
*   Equipment shape with the standard equipment number
*   Process line connectivity
*   Process stream numbers
*   Utility stream numbers

For more details, see [[pfd_sketch_and_graphics]].

**PFD Development Stages:**
The PFD development progresses through three distinct stages, each with specific content, production, checking, and approval responsibilities:

1.  **Stage 1 PFD (Issued for Internal Design):**
    *   **Content:** This stage incorporates [[stream_data_file|Stream Data]] and [[pfd_sketch_and_graphics|PFD Graphics]].
    *   **Production:** Produced by Design, by merging the Stream Data File with the PFD Graphics.
    *   **Checking:** Checked by Process.
    *   **Approval:** Approved by the Process Approver.
    *   **Reference:** For Stage 1 PFD, refer to 1-PFD-0001: [Template Process Flow Diagram].

2.  **Stage 2 PFD (Issued for Hazop):**
    *   **Content:** Incorporates the Stage 1 PFD, along with vendor information and confirmed utility requirements.
    *   **Production:** Produced by Design.
    *   **Checking:** Checked by Process.
    *   **Approval:** Approved by the Process Approver.

3.  **Stage 3 PFD (Approved for Operating Manual):**
    *   **Content:** Incorporates the Stage 2 PFD, along with final vendor and HAZOP (Hazard and Operability Study) information.
    *   **Production:** Produced by Design.
    *   **Checking:** Checked by Process.
    *   **Approval:** Approved by the Process Approver.

The overall PFD checking, approval, and publishing process **must** be in accordance with [[document_approval_and_revision_process|0-PRC-7004: Checking and Approval of Design]].