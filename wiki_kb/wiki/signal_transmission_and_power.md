---
slug: signal_transmission_and_power
title: Signal Transmission and Power
source_doc: 8-PRC-0002
doc_type: PRC
discipline: 8
discipline_name: Instrumentation & Control
source_folder: Procedure
track: A
---

# Signal Transmission and Power

The design of signal transmission and power supply for instrumentation is critical for reliable plant operation.

**Fieldbus and Analog Signals:**
*   Where instruments are used with plant control system equipment providing a field bus, instruments **will** be of a type providing the necessary functionality to connect to that field bus.
*   Where field bus functionality is not available, the signal connection and type **will** be 4 to 20 mA, preferably loop-powered.

**Power Supply:**
*   Power supply to instruments **will** be as specified in the data sheets.
*   If an instrument communicates via a field bus that can also supply operating power, this **will** be the preferred power supply connection.
*   Each instrument **will** be immune to damage caused by reverse polarity connection.
*   Each instrument **will** be immune to damage caused by output short/open circuit.

**Signal Transmission Types:**
*   **Continuous Indication and Control Loops:**
    *   4-20 mA d.c. with digital HART communications (preferably loop-powered).
    *   IEC 61158 compliant digital fieldbus (e.g., Foundation Fieldbus Hl or Profibus PA).
    *   Pneumatic loops (full range 20-100 kPag).
*   **Discrete Indication and Control Loops:**
    *   Digital 24 V d.c.
    *   Digital fieldbus (e.g., Foundation Fieldbus Hl or Profibus PA).

**24 Vdc Sourcing:**
Sourcing of 24 Vdc **shall** generally be provided by the DCS (Distributed Control System). Wherever practical, continuous signal instruments **will** be 24 V d.c. loop powered.

**Galvanic Isolation:**
All signals **will** be galvanically isolated from the instrument case and from the instrument earth to prevent interference and ensure signal integrity.

**High DC Magnetic Field Considerations:**
Special consideration **will** be given to the selection of equipment located within 50 meters of the d.c. Bus in the Cell House due to extraordinarily high d.c. magnetic fields. Instruments with magnets, such as positioning equipment reed switches, inductive pick-ups, and magnetic flowmeters, may not function correctly in these conditions. This necessitates careful selection of instrument types and technologies to ensure reliable signal transmission in such environments. For more on the site conditions, refer to [[environmental_and_site_conditions|Environmental and Site Conditions]].