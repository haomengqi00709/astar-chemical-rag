---
slug: dcs_logic_interlock_checkout
title: DCS Logic Interlock Checkout
source_doc: 8-PRC-0006
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# DCS Logic Interlock Checkout

The Distributed Control System (DCS) logic interlock checkout is a critical phase of the [[8-PRC-0006_dcs_control_function_checkout|DCS Control Function Field Checkout]], focusing on verifying the correct implementation and functionality of programmed safety and operational logic.

**Verification Against Logic Diagrams**
*   The programmed logic **is checked** against the [[logic_diagrams|logic diagrams]]. Each logic function **must** perform exactly as shown on these diagrams, ensuring that safety interlocks and control sequences operate as designed.

**Checkout Without Actual I/Os**
*   If actual I/Os (Inputs/Outputs) are not available during the logic checkout, the complete logic can still be verified. This is achieved by selecting the Input Block to Manual Mode and entering an appropriate value while observing the output readings/actions. This method allows for a comprehensive check of the logic flow even before field devices are fully commissioned.
*   If no logic checkout was performed during the Factory Acceptance Test (FAT), it **must** be conducted in the field once all other DCS checkout activities have been completed.

**I/O Manipulation for Logic Checkout**
*   I/O manipulation and checking for logic can be performed either from the field (at the local instrument or motor control device) or directly from the I/O Rack. The choice of location depends on accessibility, safety considerations, and the specific nature of the I/O point.

**Completion Marking**
*   Each checked logic block **will be yellowed-in** on the logic diagram to visually indicate its completion.
*   Logic interlock checkout **is complete** once all logic blocks on all logic diagrams have been yellowed-in, signifying that every programmed logic function has been verified.

This rigorous checkout process ensures that the DCS logic operates reliably, providing essential safety and control functions for the plant.

[[8-PRC-0006_dcs_control_function_checkout|DCS Control Function Field Checkout Overview (8-PRC-0006)]]
[[logic_diagrams|Logic Diagrams]]