---
slug: instrument_checkout_general_guidelines
title: General Instrument Checkout Guidelines
source_doc: 8-PRC-0005
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# General Instrument Checkout Guidelines

These general guidelines apply to the checkout of various instrumentation types, ensuring consistency in verification, documentation, and resolution of issues. Specific details for each instrument type are provided in their respective checkout procedures.

**General Verification Steps**
For all instruments, the following general verification steps **must** be performed:
*   **Nameplate Data and Tagging:** The instrument's Model No. nameplate data and Nameplate tag **must** match the information on the [[8-dst-xxxx_instrument_specification_sheets]] and the Instrument Tag Number, respectively.
*   **Wiring and Cable Tags:** All control signal wiring connections **must** be in accordance with the [[instrument_loop_diagrams]] and manufacturers' instructions. All cable tags **must** be in accordance with [[instrument_loop_diagrams]] and [[8-lst-0004_instrument_cable_schedule]], and **must** be securely fastened.
*   **Power Supply:** If applicable, the power supply voltage **must** be correct, and hot and neutral connections **must** be to the correct terminals. The power supply **must** be fed from the correct circuit breaker/fused terminal in accordance with the [[instrument_loop_diagrams]].
*   **DCS Termination Cabinet Connections:** Control signal wiring connections at the DCS termination cabinet **must** be in accordance with the [[instrument_loop_diagrams]].
*   **Fail Action:** The fail action of the instrument **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]]. This **must** be confirmed through model numbers and/or manufacturers' software settings.
*   **Range:** The range of the instrument **must** be in accordance with the [[8-dst-xxxx_instrument_specification_sheets]].

**Calibration and Documentation**
*   **Calibration Certification:** If an instrument has been provided with Calibration Certification, all documentation **must** be properly filed and turned over to the site supervisor after acceptance of the installation.
*   **Calibration Verification (if no certification):** If the manufacturer has not provided Calibration Certification, calibration verification **must** be performed. Documentation verifying the calibration tests **must** be properly filed and turned over to the site supervisor after acceptance of the installation.

**Analog Signal Simulation for Calibration Checks**
For instruments with analog control signals (4-20 mA), the signal is simulated for calibration checks. The analog signal **must** be received correctly at the control system. The following milliamp values equate to specific engineering units:
*   4mA = 0% engineering units
*   8mA = 25% engineering units
*   12mA = 50% engineering units
*   16mA = 75% engineering units
*   20mA = 100% engineering units

**DCS Check**
The DCS check for the instrument **must** be completed as per [[STANDARD-8-PRC-0004]].

**Sign-off and References**
*   **Initials KC:** Signature of the Aker Kvaerner Chemetics Instrumentation Checkout Representative, indicating that the instrument checkout is complete and ready for water batching and commissioning.
*   **Initials Client:** Signature of the Client Representative, indicating acceptance that the Instrumentation Checkout is complete.
*   **P&I Ref:** Refers to the [[piping_and_instrumentation_drawings]] where the instrument may be located. This is a general reference.
*   **Comments:** General comments recorded during commissioning.

[[8-prc-0005_instrument_checkout_procedure_overview]]
[[instrument_checkout_required_documents_and_tools]]

**Deficiency Management**
*   Modifications and changes identified during check-out will be treated as design deficiencies.
*   A design deficiency is not a punch list item.
*   Design deficiencies will be documented.
*   Design deficiencies will be forwarded to the Project Manager for resolution.
*   Instrument checkout documents will form part of the instrument completion package.

**Checkout Process Flow**
*   During construction, the site subcontractor checks for completeness of instrumentation installation.
*   The site subcontractor approaches the Aker Kvaerner Chemetics site supervisor for review.
*   The Aker Kvaerner Chemetics site supervisor visually reviews installed instruments against the general arrangement and installation instructions.
*   When the Aker Kvaerner Chemetics site supervisor is satisfied, he notifies the Project Manager.
*   Equipment is ready for a final review by an Aker Kvaerner Chemetics specialist.
*   The Aker Kvaerner Chemetics specialist conducts a visual inspection of the equipment against the engineering documents.
*   The visual inspection confirms the installation is in accordance with the documents.
*   Each instrument item is inspected in accordance with attached guidelines.
*   Findings are recorded on the Field/Control System Instrumentation Checkout List (STANDARD-8-LST-0101).
*   All deficiencies are recorded.
*   All deficiencies are given to the Aker Kvaerner Chemetics site supervisor.
*   The site supervisor works with a deficiency crew supplied by the site subcontractor.
*   The deficiency crew corrects all deficiencies identified by the Aker Kvaerner Chemetics specialist.
*   The deficiency crew corrects any outstanding punch list items from the initial subcontractor review.

**Prerequisites**
*   DCS Hardware must be fully installed and checked as per Procedure 8-PRC-0014.
*   Field wiring, including remote I/O sub systems, must be completed.
*   DCS Control Functions must be ready to be checked out as per 8-PRC-0004.

**General References**
*   P&ID reference drawing (P&I Ref) is a general reference.
---