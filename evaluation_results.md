# RAG Evaluation Results

**Date:** 2026-03-27 18:15
**Pipeline:** Simple (query.py)
**Total questions:** 10

---

## Q01 — Easy | Procedure retrieval

**Question:** What are the stages of P&ID development and who approves each stage?
**Expected docs:** 1-PRC-0003
**Note:** Core procedure — should retrieve cleanly

**Answer:**

The stages of P&ID development and their respective approval authorities are as follows:

*   **Stage 1 P&ID - Approved for Design (Layout)**
    *   Approved by: Technology [1-PRC-0003]
*   **Stage 2 P&ID - Approved for Design (Pipe Study, Process Study, Stage 1 Line List & OTL)**
    *   Approved by: Project Engineer [1-PRC-0003]
*   **Stage 3 P&ID - Approved for Design (Team P&ID Review, Instrumentation & Control Design)**
    *   Approved by: Technology [1-PRC-0003]
*   **Stage 4 P&ID - Approved for Design (pre HAZOP)**
    *   Approved by: Process [1-PRC-0003]
*   **Stage 5 P&ID - Approved for Design (post HazOp)**
    *   Approved by: Project Engineer [1-PRC-0003]
*   **P&ID Approved for Design**
    *   Approved by: Project Engineer [1-PRC-0003]
*   **P&ID As Built**
    *   Approved by: Commissioning Manager [1-PRC-0003]

**Documents used:**
- `1-PRC-0003` | Procedure | Process Technology | 8 chunks [7 constraints]

**Retrieval check:**
- Hit: 1-PRC-0003
- Missed: none
- Unexpected: none

**Reviewer notes surfaced:**
- [8-PRC-0004 p.1] P&ID? Piping & Instrumentation Diagram?
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 
- [1-PRC-0003 p.2] May not require line-list toconfirm the piping&gasket material? service list does the purpose? or j

---

## Q02 — Easy | Procedure retrieval

**Question:** What is the purpose of the process flowsheet development procedure and what must it contain?
**Expected docs:** 1-PRC-0002
**Note:** Direct match to 1-PRC-0002

**Answer:**

The purpose of the Process Flowsheet Development & Approval Standard [1-PRC-0002] is to:
*   Record the "steady state" balanced flows, temperatures, and pressures of the defined system [1-PRC-0002].
*   Serve as a starting point for the process engineer to produce the PDS, PDL, and Line Lists [1-PRC-0002].
*   Define the steps required to achieve a published PFD and assign responsibilities for document preparation, checking, and approval [1-PRC-0002].

The Process Flow Diagram (PFD) developed through this procedure must contain the following elements:

**PFD Sketch** [1-PRC-0002]:
*   Equipment shape with the standard equipment number
*   Process line connectivity
*   Process stream numbers
*   Utility stream numbers

**PFD Graphics** [1-PRC-0002]:
*   Equipment shape with the standard equipment number
*   Process and utility line connectivity
*   Process stream numbers
*   Utility stream numbers

**Stream Data File** [1-PRC-0002]:
*   Steady state balanced and maximum flows
*   Steady state and maximum temperatures
*   Steady state and maximum pressures
*   Physical properties

**Stage 1 PFD** [1-PRC-0002]:
*   Stream Data
*   PFD Graphics

**Stage 2 PFD** [1-PRC-0002]:
*   Stage 1 PFD incorporating vendor information and confirmed utility requirements.

**Stage 3 PFD** [1-PRC-0002]:
*   Stage 2 PFD incorporating final vendor and hazop information.

Additionally, the PFD will show the steady state mass balance at the design capacity of the plant, including flows, pressures, and temperatures for all significant streams, including utilities. Pump kick-back lines and drain lines are not shown on the PFD. Normally, the only physical property that needs to be shown is density [1-PRC-0002].

**Documents used:**
- `1-PRC-0002` | Procedure | Process Technology | 7 chunks [4 constraints]
- `1-PRC-0003` | Procedure | Process Technology | 1 chunks [1 constraints]

**Retrieval check:**
- Hit: 1-PRC-0002
- Missed: none
- Unexpected: 1-PRC-0003

**Reviewer notes surfaced:**
- [8-PRC-0004 p.1] P&ID? Piping & Instrumentation Diagram?
- [1-PRC-0003 p.2] May not require line-list toconfirm the piping&gasket material? service list does the purpose? or j
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 

---

## Q03 — Easy | Procedure retrieval

**Question:** What are the mandatory control system design requirements?
**Expected docs:** 8-PRC-0004
**Note:** Tests discipline 8 retrieval

**Answer:**

Based on the provided context, the mandatory control system design requirements are as follows:

**1. General Control System Design Documentation**
*   Project personnel **shall** prepare documentation providing a complete record of the Control System design for the project and a description of technical requirements to be issued to vendors and subcontractors [8-PRC-0004].

**2. Control System Design Criteria**
*   **Content (as applicable):**
    *   Basic operating philosophy, including the quantity of operator stations and engineering stations [8-PRC-0004].
    *   Statutory requirements [8-PRC-0004].
    *   Reference to appropriate Aker Kvaerner Chemetics standard [8-PRC-0004].
    *   Aker Kvaerner Chemetics general requirements for control system design [8-PRC-0004].
    *   Owner requirements [8-PRC-0004].
*   **Responsibilities:**
    *   **Prepared by:** DDE (Detail Design Engineer) [8-PRC-0004].
    *   **Checked by:** Project Engineer [8-PRC-0004].
    *   **Approved by:** Instrument [8-PRC-0004].

**3. Piping and Instrumentation Drawings (P&IDs)**
*   Refer to 1-PRC-0003, P&ID Development and Approval [8-PRC-0004]. (Note: The full content of 1-PRC-0003 is not provided).

**4. Basic Control System Specification**
*   **Content (as applicable):**
    *   Process controller requirements (redundancy) [8-PRC-0004].
    *   Power supply requirements (redundancy) [8-PRC-0004].
    *   I/O card requirements and specifications [8-PRC-0004].
    *   Communication interface requirements [8-PRC-0004].
    *   System performance specifications [8-PRC-0004].
    *   Cabinet specifications [8-PRC-0004].
    *   Operator console and engineering workstation specifications [8-PRC-0004].
    *   Alarm handling specifications [8-PRC-0004].
    *   Trends and logging specifications [8-PRC-0004].
    *   Security and fault tolerance specification [8-PRC-0004].
    *   Expansion capacity specification [8-PRC-0004].
    *   Factory testing and acceptance requirements [8-PRC-0004].
    *   Initial start-up and system checkout requirements [8-PRC-0004].
    *   Electrical requirements [8-PRC-0004].
*   **Responsibilities:**
    *   **Prepared by:** DDE [8-PRC-0004].
    *   **Checked by:** Instrument [8-PRC-0004].
    *   **Approved by:** DDE [8-PRC-0004].

**5. Control System Architecture – Block Diagram**
*   **Content (as applicable):**
    *   Relative geographic locations and grouping of the control system equipment [8-PRC-0004].
    *   General interconnection of all control system components [8-PRC-0004].
    *   Process Controllers [8-PRC-0004].
    *   I/O Cabinets [8-PRC-0004].
    *   Communication interface requirements to third-party hardware [8-PRC-0004].
    *   General cabling interconnection [8-PRC-0004].
    *   Printers [8-PRC-0004].
    *   Operator Consoles [8-PRC-0004].
    *   Engineering Workstations [8-PRC-0004].
*   **Responsibilities:**
    *   **Prepared by:** DDE [8-PRC-0004].
    *   **Approved by:** DDE [8-PRC-0004].
    *   **Audited by:** Instrument [8-PRC-0004].

**6. Process Logic Narrative**
*   **Content:** A detailed written description of the operation and control of all automated equipment, generally containing:
    *   Identification and locations of the control elements or devices [8-PRC-0004].
    *   Description of the specific control scheme required for the devices [8-PRC-0004].
    *   Commentaries and rationalizations as required [8-PRC-0004].
*   **Responsibilities:**
    *   **Prepared by:** Process [8-PRC-0004].
    *   **Checked by:** Technology [8-PRC-0004].
    *   **Approved by:** Process [8-PRC-0004].

**7. Process Control - DCS Configuration Parameters**
*   **Content (as minimum):**
    *   PID reference [8-PRC-0004].
    *   Loop number [8-PRC-0004].
    *   Loop description [8-PRC-0004].
    *   Type of control or monitoring element [8-PRC-0004].
    *   Scale of measurement [8-PRC-0004].
    *   Units of measurement for instruments [8-PRC-0004].
    *   Control action [8-PRC-0004].
    *   Fail position of valves and instruments [8-PRC-0004].
    *   Output [8-PRC-0004].
    *   Comments [8-PRC-0004].
*   **Responsibilities:**
    *   **Prepared by:** Process [8-PRC-0004].
    *   **Checked by:** Technology [8-PRC-0004].
    *   **Approved by:** Process [8-PRC-0004].

**8. Alarms, Interlocks and Setpoints**
*   **Content (as applicable):** Process specific information needed for the DCS programmer to configure the control system, including:
    *   Instrument number [8-PRC-0004].
    *   Description of the control element [8-PRC-0004].
    *   Units of measure [8-PRC-0004].
    *   Set point for normal operation [8-PRC-0004].
    *   Process Instrument Alarm Set Points (LoLo, Lo, HiHi, Hi) [8-PRC-0004].

**9. Control Equipment - Cabinet Layouts and Internal Interconnection Wiring**
*   Control Equipment drawings **shall** show the specific special layout for Control Equipment within their designated cabinets [8-PRC-0004].
*   All equipment **shall** be identified, tagged, and dimensioned [8-PRC-0004].
*   The drawings **shall** identify where field devices will interface and indicate the service and type (Analog, Discrete, Digital) [8-PRC-0004].
*   Detailed internal Interconnections **shall** be shown in schematic and/or wiring format [8-PRC-0004].
*   All interface communication connections **shall** be shown [8-PRC-0004].
*   Responsibility for supply of all communications cabling **shall** be clearly defined [8-PRC-0004].

**10. Control System Graphics**
*   Control system graphics **shall** be laid out to provide a logical, efficient, and complete interface between the plant operations personnel and the Control system [8-PRC-0004].
*   Displayed graphics for monitoring and control details **shall** be kept to a minimum but **shall** be sufficient to allow the operations personnel to completely control the process as intended [8-PRC-0004].

**11. DCS Operating System Configuration**
*   The documentation of this configuration **will** become part of the Control System Manual when the system is installed [8-PRC-0004].

**12. Process Control Configuration (Application Software)**
*   The process control configuration (Application Software) **will** reflect the specific requirements for efficiently controlling and monitoring the process and **will** be implemented in strict accordance with the logic narrative and logic drawings for the project [8-PRC-0004].
*   Specific interlocks, alarms, and trips **will** be implemented within the configuration as per the Instrument Set Points, Alarms and Interlocks section in the operating manual [8-PRC-0004].

**13. Hypo Unit Package Specific Requirement**
*   For a Hypo Unit Package, the Vendor **shall** provide logic and control narratives to allow DCS programming [4-PDS-XXXX-R1].

**Documents used:**
- `8-PRC-0004` | Procedure | Instrumentation & Control | 4 chunks [1 constraints]
- `4-DST-XXXX-R0 [Template Cooling Tower].xls` | Datasheet |  | 1 chunks
- `4-DST-XXXX-R0 [Template Eductor].xls` | Datasheet |  | 1 chunks
- `4-DST-XXXX-R0 [Template Press Filter].xls` | Datasheet |  | 1 chunks
- `4-PDS-XXXX-R1 (Template Hypo Unit Package).xls` | Datasheet |  | 1 chunks

**Retrieval check:**
- Hit: 8-PRC-0004
- Missed: none
- Unexpected: 4-DST-XXXX-R0 [Template Eductor].xls, 4-DST-XXXX-R0 [Template Press Filter].xls, 4-PDS-XXXX-R1 (Template Hypo Unit Package).xls, 4-DST-XXXX-R0 [Template Cooling Tower].xls

**Reviewer notes surfaced:**
- [8-PRC-0004 p.1] P&ID? Piping & Instrumentation Diagram?
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 
- [8-PRC-0002 p.4] Cable block diagrams? Not clear what this refers to?

---

## Q04 — Medium | List retrieval

**Question:** What fluid codes exist and what do they represent?
**Expected docs:** 1-LST-0002
**Note:** Tests LST retrieval from list folder

**Answer:**

Based on the provided context, the following fluid codes and their representations exist:

*   **CDO**: Carbon Dioxide (Gas/Liquid) [1-LST-0002]
*   **COA**: Coagulant [1-LST-0002]
*   **DRN**: Drain, Neutral [1-LST-0002]
*   **EV**: Effluent,Vent [1-LST-0002]
*   **FL**: Flocculent [1-LST-0002]
*   **SL**: Sulphur, Liquid [1-LST-0002]
*   **WDS**: Water, Soft [1-LST-0002]
*   **WF**: Water, Fire [1-LST-0002]

**Documents used:**
- `1-LST-0002` | List |  | 8 chunks

**Retrieval check:**
- Hit: 1-LST-0002
- Missed: none
- Unexpected: none

**Reviewer notes surfaced:**
- [8-PRC-0004 p.1] P&ID? Piping & Instrumentation Diagram?
- [8-PRC-0002 p.4] Cable block diagrams? Not clear what this refers to?
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 

---

## Q05 — Medium | List retrieval

**Question:** What are the approved piping service classifications and their material requirements?
**Expected docs:** 5-LST-0003
**Note:** Piping service list — numerical data from XLS

**Answer:**

The approved piping service classifications and their material requirements are as follows:

*   **SC**
    *   PVC material (for low pressure where Cl2 can be present) [5-LST-0003-1]
    *   PTFE-lined steel material (for high pressure or small diameter lines) [5-LST-0003-1]
*   **CYS**
    *   Carbon steel material (for Milk of Lime) [5-LST-0003]
*   **CA/SC CD**
    *   FRP 75# Press. material [5-LST-0003-1]
*   **ET**
    *   CPVC material (for Thickened Effluent) [5-LST-0003]
*   **FL**
    *   PVC material (for Flocculent) [5-LST-0003]
*   **EN**
    *   316L SS material (for Neutralized Effluent) [5-LST-0003]
*   **CD**
    *   CPVC (high temp) material [5-LST-0003-1]

**Documents used:**
- `5-LST-0003-1` | List |  | 4 chunks
- `5-LST-0003` | List |  | 4 chunks

**Retrieval check:**
- Hit: 5-LST-0003
- Missed: none
- Unexpected: 5-LST-0003-1

**Reviewer notes surfaced:**
- [1-PRC-0003 p.2] May not require line-list toconfirm the piping&gasket material? service list does the purpose? or j
- [8-PRC-0004 p.1] P&ID? Piping & Instrumentation Diagram?
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 

---

## Q06 — Medium | Procedure retrieval

**Question:** What are the instrument and control design criteria that must be followed?
**Expected docs:** 8-PRC-0002
**Note:** Tests discipline 8 second procedure

**Answer:**

The instrument and control design criteria that must be followed are outlined in document [8-PRC-0002].

**1. Statutory Requirements**
*   The design, construction, and operation of the Chlor-Alkali Plant shall comply with the Statutory Requirements of the Shire of Fitzroy, State of Queensland, Australia [8-PRC-0002].
*   Specifically, the Development Approval, Environmental Protection Act, Queensland Electricity Act, and Queensland Workplace Health and Safety Act shall apply [8-PRC-0002].

**2. Codes and Standards**
*   All equipment and installations must comply with the latest revision of the applicable Australian Standards [8-PRC-0002].
*   Where no Australian Standard exists, work must conform to the most current IEC Standard [8-PRC-0002].
*   Where conflict exists between statutory regulations, standards, reference documents, and drawing/datasheet requirements, the most stringent requirement shall apply [8-PRC-0002].
*   Instruments must be specified for CENELEC approval [8-PRC-0002].

**3. Site Conditions**
*   All electrical equipment must be designed to operate continuously at full load for 24 hours per day, 365 days per year [8-PRC-0002].
*   Equipment may be required to be protected against an environment subject to abrasive and corrosive dusts and liquids and vapours [8-PRC-0002].
*   All equipment, both indoors and outdoors, must be "tropic proofed" [8-PRC-0002].
*   Motors and similar equipment must incorporate special protection against fungal attack [8-PRC-0002].
*   Printed circuit boards must be protected with an impervious coating against corrosion and fungal attack [8-PRC-0002].

**4. General Requirements**
*   The Plant must be designed following Aker Kvaerner Chemetics standard design procedures [8-PRC-0002].
*   All process data must be specified in the engineering units listed in Section 6.1 of [8-PRC-0002].
*   All instruments on the P&ID’s must be allocated a tag number [8-PRC-0002].
*   An approved instrument specification sheet must be provided for each instrument and actuated valve prior to its purchase [8-PRC-0002].
*   The Instrument database for creation of Instrument Index, DCS I/O List, and Instrument Specification sheets must use Microsoft Access software [8-PRC-0002].
*   For instrument loop, tag numbering, and setup, refer to 8-PRC-0001: Plant Instrument Numbering [8-PRC-0002].
*   For drawing numbers, refer to 0-PRC-0002: Document Numbering [8-PRC-0002].
*   Documents required for future operations, maintenance, and project expansion must be revised to “as-built” status, including Instrument Loop Diagrams, Instrument Specification Sheets, Instrument Index, and Instrument I/O List [8-PRC-0002].
*   All necessary documentation from suppliers, including full maintenance documents, must be provided in correct, clear, and concise English [8-PRC-0002].
*   One copy of all documentation must be provided in an approved electronic format [8-PRC-0002].

**5. Instrumentation Design Requirements**
*   **General**:
    *   All instruments shall be supplied factory calibrated, set-up, and configured with all parameters so they are ready for operation [8-PRC-0002].
    *   The tag number and service description shall be included in the configured parameters [8-PRC-0002].
    *   The electrical housing of all instruments shall be a minimum of Epoxy coated Aluminium or a suitably UV stabilised and chemically resistant non-metallic material [8-PRC-0002].
*   **Instrument Nameplates**:
    *   Instruments shall be identified with permanently attached stainless steel nameplates [8-PRC-0002].
    *   All explosion-protected (Ex) items of equipment shall be fitted with permanently attached stainless steel labels [8-PRC-0002].
    *   Wherever possible, nameplates shall be attached by stainless steel screws or rivets [8-PRC-0002].
*   **Field Bus**:
    *   Where instruments are used with a plant control system providing a field bus, instruments must provide the necessary functionality to connect to the field bus [8-PRC-0002].
    *   Where field bus functionality is not available, the signal connection and type will be 4 to 20 mA [8-PRC-0002].
*   **Power Supplies**:
    *   Power supply to instruments will be as specified in the data sheets [8-PRC-0002].
    *   If a field bus can supply operating power, this will be the preferred power supply connection [8-PRC-0002].
*   **Reverse Polarity**: Each instrument must be immune to damage caused by reverse polarity connection and output short/open circuit [8-PRC-0002].
*   **RFI Immunity**: Instruments must be RFI immune, complying with SAMA PMC 33.1C (IEC 801-3) or equivalent standard in the frequency range from 20 to 1000 MHz and field intensity up to 10 mV/m [8-PRC-0002].
*   **Definition of Standards Signals**:
    *   Continuous Indication and control loops must use 4-20 mA d.c. with digital HART communications (preferably loop-powered), IEC 61158 compliant digital fieldbus, or Pneumatic loops (full range 20-100 kPag) [8-PRC-0002].
    *   Discrete indication and control loops must use Digital 24 V d.c. or Digital fieldbus [8-PRC-0002].
    *   All signals must be galvanically isolated from the instrument case and instrument earth [8-PRC-0002].
*   **Process Analysers**:
    *   pH, ORP, and Conductivity Probes will be self-cleaning where practically achievable [8-PRC-0002].
    *   Non-extractive sampling methods of analysis will be employed wherever possible [8-PRC-0002].
    *   Design will allow simple, automated calibration procedures where applicable [8-PRC-0002].
    *   Process analysers will be supplied complete with any necessary sampling and sample conditioning systems [8-PRC-0002].
    *   Field mounted analysers will be of corrosion resistant material, weatherproof construction, and suitable for outdoor installation [8-PRC-0002].
    *   The output signal will be isolated 4-20 mA (linear) or digital fieldbus for single component analysis [8-PRC-0002].
    *   All analyser transmitters will incorporate an integral mounted indicator [8-PRC-0002].
    *   The sampling and sample conditioning system will be designed, supplied, and commissioned by the analyser Vendor to suit the specific analyser application [8-PRC-0002].
*   **Flow Metering**:
    *   For liquid applications with suspended solids, the ideal velocity through the flow tube will be in the range of 1.5 to 3 meters per second [8-PRC-0002].
    *   Foxboro AC type magnetic flow tubes will be provided for service in the proximity of the cells due to high magnetic fields [8-PRC-0002].
    *   Piping connected to Coriolis meters must be mounted securely; the flow meter will not be used for supporting adjacent piping [8-PRC-0002].
    *   Vibration must not be transferred through the piping system to Coriolis meters [8-PRC-0002].
    *   Vortex meters will not be used where the piping may be subjected to vibration [8-PRC-0002].
    *   Thermal Dispersion (TD) mass flow measurement instruments will be flange-mounted, with the flange marked to indicate correct orientation [8-PRC-0002].
    *   When flow is controlled by a variable speed pump, the flowmeter is to be installed after and as close as practical to the pump [8-PRC-0002].
    *   When flow is controlled by a control valve, the flowmeter is to be installed upstream to and as close as practical to the valve [8-PRC-0002].
    *   Seals and condensate pots will be used where necessary for dp Transmitter Installation [8-PRC-0002].
    *   The standard primary element for flow will be square edge concentric orifice plate in accordance with AS 2360, except that a quadrant edge orifice, in accordance with BS 1042, will be used when the Reynolds number is below 20 000 [8-PRC-0002].
    *   Flange taps will be used [8-PRC-0002].
    *   Material of orifice plates as minimum will be type 316 stainless steel, unless special materials are required [8-PRC-0002].
    *   Orifice plates must have the instrument tag number, material type, flow direction identification, and bore size clearly stamped on the upstream side of the plate handle [8-PRC-0002].
    *   Straight-run lengths of pipe upstream and downstream of orifice plate installations must conform to AS 2360.1 and meet specified accuracy [8-PRC-0002].
    *   Orifice plates must be installed to always measure a full pipe flow [8-PRC-0002].
    *   Orifice meter differential range must be selected so that the d/D ratio exceeds 0.2 and is less than 0.7 [8-PRC-0002].
    *   Square root extraction for flow applications will be configured in the transmitter [8-PRC-0002].
    *   All differential pressure transmitters for flow measurement applications will be fitted with 3-Valve manifolds to enable isolation and equalisation, unless safety concerns exist [8-PRC-0002].
    *   Isolation valves will be provided to enable isolation of the process [8-PRC-0002].
    *   Except where diaphragm seals are used, the process connection of all transmitters will be 1/2" NPT female threads [8-PRC-0002].
    *   All pressure transmitters will be installed using 2" pipe mounting kits such that mounting brackets support the transmitters [8-PRC-0002].
    *   Impulse tubing will not be used to support transmitters [8-PRC-0002].
    *   For differential pressure flowmeter, normal flowrate will be between 70% and 80% of instrument span, provided that anticipated minimum and maximum flowrates will be between 30% and 95% of capacity [8-PRC-0002].
    *   Magnetic flowmeter tubes, liners, and electrodes will be of materials to suit the application [8-PRC-0002].
    *   Vortex flowmeters will not be used on scaling services or in applications where vibration is present [8-PRC-0002].
*   **Level Measurements**:
    *   Where differential pressure transmitters are used on atmospheric tanks, the transmitter will be provided with a 3” integrally mounted flange diaphragm on the high-pressure port [8-PRC-0002].
    *   Where differential pressure transmitters are used on sealed tanks, the transmitter will be provided with a 3” integrally mounted flange diaphragm on the high pressure port and a remote mounted 3” flange diaphragm connected to the low pressure port [8-PRC-0002].
    *   Differential pressure transmitters without diaphragm seals will be fitted with 3-valve manifolds [8-PRC-0002].
    *   Only ultrasonic level instruments with built-in temperature measurement and compensation will be used [8-PRC-0002].
    *   Radar sensors will be fitted with a horn or antenna manufactured from material chemically compatible with the process environment [8-PRC-0002].
    *   Process wetted materials for magnetic level gauges will be 316 stainless steel minimum unless process fluid properties require alternative materials [8-PRC-0002].
    *   Connections to the vessel for magnetic level gauges will be flanged [8-PRC-0002].
    *   Drain and vent valves will be fitted to all level gauges [8-PRC-0002].
*   **Level Switches**:
    *   Where switches are used for shutdown service, they will be mounted via independent process connections on the vessel [8-PRC-0002].
    *   Electrical switches must have a contact rating of 240 V a.c/24 V d.c., 2A minimum with SPDT contacts [8-PRC-0002].
*   **Pressure**:
    *   Unless otherwise specified, the process wetted parts will be 316 stainless steel [8-PRC-0002].
    *   Pressure gauges will have stainless steel type 316 cases with clear 3 mm thick shatter resistant window glass [8-PRC-0002].
    *   All gauges (except for Process Air or Instrument Air service not subject to pulsation) will have liquid (glycerine) fill [8-PRC-0002].
    *   Pressure gauges will incorporate blowout protection devices on the rear [8-PRC-0002].
    *   Case diameters will be 100 mm for process indications and 50 mm for gauges monitoring instrumentation [8-PRC-0002].
    *   Gauges will be provided with ½” npt process connections [8-PRC-0002].
    *   Scaling will be in kilopascals (kPa) [8-PRC-0002].
    *   Dial scales will be marked in black on a white background [8-PRC-0002].
    *   Diaphragm seals provided with pressure gauges will be 40 mm flange mount type [8-PRC-0002].
    *   Connections for process pressure switches will be ½” NPT [8-PRC-0002].
    *   Pressure switches will incorporate over-pressure protection [8-PRC-0002].
    *   Electrical switches must have a contact rating of 240 V a.c/24 V d.c., 2 A minimum with SPDT contacts [8-PRC-0002].
    *   Pressure transmitters will be of materials suitable for the process applications [8-PRC-0002].
    *   Except where remote diaphragm seals are used, the process connection of all transmitters will be 1/2" NPT female threads [8-PRC-0002].
    *   Siphons or "pigtail" condenser seals will be provided for connections to close mounted gauges or transmitters in steam and other high temperature (> 60C) condensing vapour applications [8-PRC-0002].
    *   Pigtails provided for steam application will be Carbon Steel [8-PRC-0002].
    *   All capillary tubing will be stainless steel armoured [8-PRC-0002].
    *   Equal length capillary tubing will be used on differential pressure applications [8-PRC-0002].
*   **Temperature**:
    *   Pt100 Resistance Temperature Detectors will be used for applications where the temperature is less than 300 degrees Celsius [8-PRC-0002].
    *   Type N thermocouples will be used for applications where the temperature is above 300 degrees Celsius and less than 1200 degrees Celsius [8-PRC-0002].
    *   Type B thermocouples will be used for applications above 1200 degrees Celsius [8-PRC-0002].
    *   Except where special requirements apply, temperature sensors will be un-grounded, mineral insulated, with 6 mm diameter stainless-steel sheaths [8-PRC-0002].
    *   Thermocouple transmitters will be configurable for upscale or downscale output on thermocouple failure [8-PRC-0002].
    *   All temperature sensors will be installed with a matching thermowell having pressure ratings compatible with the line or vessel rating, and using materials compatible with the process fluids [8-PRC-0002].
    *   Temperature sensors for service in thermowells will be spring-loaded [8-PRC-0002].
    *   Local temperature gauges (indicators) will have stainless steel type 316 cases with clear 3 mm thick shatter resistant window glass [8-PRC-0002].
    *   Case diameters will be 100 mm [8-PRC-0002].
    *   Dials will be free to rotate around the thermowell axis [8-PRC-0002].
    *   Dial tilt angle will be adjustable through at least 90 degrees [8-PRC-0002].
    *   All sensing elements will be installed in thermowells having pressure ratings compatible with the line or vessel rating, and using materials compatible with the process fluids [8-PRC-0002].
    *   The stem length will be a minimum of 50 mm above the compression or gland nut when the stem is fully seated in the thermowell [8-PRC-0002].
    *   Scaling will be in degrees Celsius [8-PRC-0002].
    *   Dial scales will be marked in black on a white background [8-PRC-0002].
    *   The stem connection thread will be 1/2" NPT [8-PRC-0002].
    *   Thermowell material will be 316 stainless steel unless process conditions dictate otherwise [8-PRC-0002].
    *   The bore diameter of the thermowell will match the element [8-PRC-0002].
    *   The thermowell material and tag number will be stamped onto the thermowell so that this information is clearly visible when installed [8-PRC-0002].
    *   Thermowells will be machined from bar stock in a single piece, except for flange [8-PRC-0002].
    *   Thermowells will have a stepped stem with a maximum Root OD of 0.75” unless otherwise specified [8-PRC-0002].
    *   Thermowells will be pressure tested [8-PRC-0002].
    *   Flange mounted thermowells will have the pressure sealing weld dye penetration tested [8-PRC-0002].
    *   Process Connections will be 1" NPT for air and water services (screwed into flange) and DN40 flange for all other services [8-PRC-0002].
*   **Position Switches**:
    *   Inductive Proximity Switches will be used in preference to limit switches [8-PRC-0002].
    *   Unless otherwise specified, devices will be suitable for operation on 24 V d.c. power supply [8-PRC-0002].
    *   All devices will have corrosion resistant, weatherproof IP65 rated cases and be suitable for outdoor mounting [8-PRC-0002].
*   **Valves**:
    *   Valve seat leakage will be equal or better than ANSI B16.104, Class IV unless otherwise specified [8-PRC-0002].
    *   Control valves will be sized to meet the duty, providing a turndown ratio of approximately 10:1, and in accordance with the manufacturers recommendations [8-PRC-0002].
    *   Valve selection and sizing must ensure cavitation and flashing is minimised or eliminated [8-PRC-0002].
    *   It is preferred that no valve will be more than one line size smaller than the size of the line [8-PRC-0002].
    *   Valve bodies will have an arrow to indicate direction of process fluid flow [8-PRC-0002].
    *   All shutdown Valves will have tight close-off and meet the requirements of ANSI B16.5, and will have pre-determined shutdown times [8-PRC-0002].
    *   All shutdown valves will have proper access and locations will be shown on location drawings [8-PRC-0002].
    *   Shutdown valves WILL NOT BE LOCKED [8-PRC-0002].
    *   Generally the valve body material will be carbon steel (cast iron will not be used) with 316 SS valve trim unless process or environmental conditions require a more suitable material [8-PRC-0002].
    *   Packing for operating temperature up to 230 Deg. C will be Teflon composition (non-asbestos base) [8-PRC-0002].
    *   Packing for operating temperatures above 230 Deg.C will be as per the valve manufacturer's recommendation [8-PRC-0002].
    *   The materials of manufacture for the actuator, electro-pneumatic positioner, and all accessories will be selected to withstand process and/or ambient conditions [8-PRC-0002].
    *   An appropriate means of cavitation control must be used to eliminate cavitation and/or flashing, where necessary [8-PRC-0002].
    *   Noise abatement techniques must be used, where required, to minimise noise levels generated by control valves within the limits permitted by applicable codes [8-PRC-0002].
    *   The maximum acceptable noise level for control valves under normal operation will be in accordance with National Standard for Occupational Noise (NOHSC:1007-1993) and will not exceed 82 dB(A) at 1 metre in all directions under all conditions from zero to full flow [8-PRC-0002].
    *   Where fail safe is required and mechanical (spring) motive force is not available then accumulator backup ancillary devices will be used [8-PRC-0002].
    *   All shutdown valves will be supplied with open and closed proximity switches [8-PRC-0002].
    *   Valve position will be indicated on a graduated reversible scale with the words OPEN and SHUT or CLOSED at the valve travel limits [8-PRC-0002].
    *   Air operated actuators in combination with electro-pneumatic positioner units will be used in all applications unless specified otherwise (does not apply to self-regulating valves) [8-PRC-0002].
    *   An actuator shaft extension arrangement will be used, if necessary, to ensure that the temperature limit of the actuator and accessories is not exceeded [8-PRC-0002].
    *   Valve actuators will be fitted with a 316 stainless steel or epoxy coated aluminium filter-regulator and a stainless steel air supply gauge [8-PRC-0002].
    *   All tubing and fittings will be 316 stainless steel and will be pre-assembled as far as is practicable [8-PRC-0002].
    *   Mounting brackets and bolting accessories will be provided in 316 SS [8-PRC-0002].
    *   316 SS vent bug screens will be provided [8-PRC-0002].
    *   Actuators will be sized for operation at the minimum instrument air supply of 500 kPag [8-PRC-0002].
    *   Actuators and all related accessories will be rated for a maximum working pressure and differential pressure (where applicable) of at least 1000 kPag [8-PRC-0002].
    *   Actuator torque will be between 1.8 and 2.5 times the maximum breakout torque at minimum specified air pressure [8-PRC-0002].
    *   The maximum allowable valve travel time (in both directions) will be: < DN100 (0.3 Seconds), > 100 NB (Equal to the normal body size in inches) [8-PRC-0002].
    *   Positioners will be provided on all modulating valves [8-PRC-0002].
    *   Electro-pneumatic positioners will be used [8-PRC-0002].
    *   Direct or reverse action will be attainable on all positioners by simple field adjustments [8-PRC-0002].
    *   Valve positioner cases will be IP65 rated and constructed of stainless steel, fibreglass or other corrosion-resistant material [8-PRC-0002].
    *   Generally, hand wheels will not be fitted to control valves [8-PRC-0002].
    *   Hand wheels will not be fitted to actuated on/off valves unless nominated on the data sheet [8-PRC-0002].
    *   Solenoid valves will be (non I.S.) 24 V d.c., and rated at less than 10 watt [8-PRC-0002].
*   **Instrument Air Supply**:
    *   All instrumentation and control valves requiring an air supply will be supplied by an instrument-quality air reticulation system that is separate from the general plant air reticulation system [8-PRC-0002].
    *   The quality of the instrument air will conform to ANSI/ISA S7.3 [8-PRC-0002].
    *   All pneumatic instrumentation and control valves will be designed for service with a plant air supply pressure of 500-750 kPa [8-PRC-0002].
    *   Each of these devices will be fitted with a supply air filter, sediment bowl, pressure regulator, and an air isolation ball valve [8-PRC-0002].
    *   Filter sediment bowls will be fitted with automatic draining devices [8-PRC-0002].
    *   Prior to the air receivers, the instrument air will be cooled to minus 35 °C dew point [8-PRC-0002].
    *   Local air distribution manifolds with a minimum of 20% spare outlet capacity and a drain point with valve, will be used [8-PRC-0002].
    *   The instrument air distribution piping will be such that the air take-off points are located on the top of headers and manifolds [8-PRC-0002].
    *   Drain valves will be located at the lowest points [8-PRC-0002].
    *   Each instrument air user will be connected via a dedicated isolating ball valve and a dedicated in-line filter/water trap with automatic drain [8-PRC-0002].
*   **Instrument Piping and Tubing**:
    *   All valve piping will be made in 316 SS [8-PRC-0002].
    *   In extreme acid/corrosive environments or on vibrating equipment, instrument air tubing will be (black) flame retarding polyethylene or PTFE unless environmental conditions require different materials [8-PRC-0002].
    *   The instrument air distribution piping will be such that the air take-off points are located on the top of headers and manifolds [8-PRC-0002].
    *   Drain valves will be located at the lowest points [8-PRC-0002].
    *   Each instrument air user will be connected via a dedicated isolating ball valve and a dedicated in-line filter/water trap [8-PRC-0002].
    *   Impulse tubing will be 1/2" hard drawn seamless 316 stainless steel [8-PRC-0002].
    *   Stainless steel fittings will be of imperial sizes; metric sizes are not acceptable [8-PRC-0002].
    *   Stainless steel valves and compression fittings will be used unless the process fluid or ambient conditions dictate otherwise [8-PRC-0002].
    *   All process connections will be provided with an isolation cock [8-PRC-0002].
    *   The maximum length of any impulse tubing will be 15 metres [8-PRC-0002].
    *   All impulse lines will be installed with a minimum gradient of one in twelve to ensure self-draining [8-PRC-0002].
    *   All stainless steel compression fittings will be selected from the manufacturer and range approved by the Company for the project [8-PRC-0002].
    *   Nylon tubing will not be used [8-PRC-0002].
    *   Local air distribution manifolds, with a minimum of 25% spare outlet capacity and a drain point with valve, will be used [8-PRC-0002].
*   **Instrument Installation Requirements**:
    *   The installation will be arranged to facilitate ease of operation, inspection, and maintenance and will incorporate all safety measures [8-PRC-0002].
    *   Installation drawings will be provided for all instrument types [8-PRC-0002].
    *   All instruments connected via process impulse tubing will be provided with both primary and secondary isolation [8-PRC-0002].
    *   All instrumentation will be installed in such a manner that it is serviceable or replaceable without the aid of a ladder or scaffolding [8-PRC-0002].
    *   Local indicator instrumentation will be plainly visible and accessible from grade or platform [8-PRC-0002].
    *   All instruments connected via process impulse tubing will be provided with an isolation device as close as possible to the process and also with an isolation device as close as possible to the instrument [8-PRC-0002].
    *   Instrument mounting brackets will be 316 SS or epoxy coated mild steel [8-PRC-0002].
    *   Two-inch (2") pipe brackets will be included in the supply of all instruments with exception of line/flange mounted instruments [8-PRC-0002].
    *   All associated mounting bolts and fasteners will be stainless steel [8-PRC-0002].

**Documents used:**
- `8-PRC-0002` | Procedure | Instrumentation & Control | 1 chunks [1 constraints]
- `4-DST-XXXX-R0 [Template Cooling Tower].xls` | Datasheet |  | 1 chunks
- `4-DST-XXXX-R0 [Template Eductor].xls` | Datasheet |  | 1 chunks
- `4-DST-XXXX-R0 [Template Press Filter].xls` | Datasheet |  | 1 chunks
- `4-PDS-XXXX-R1 (Template HCl Synthesis Unit Package).xls` | Datasheet |  | 1 chunks
- `Appendix I (0-PRC-4003-R1) Project Variance Change Notice Form.xls` | Procedure |  | 1 chunks
- `5-LST-0005` | List |  | 1 chunks
- `1-PRC-0003` | Procedure | Process Technology | 1 chunks [1 constraints]

**Retrieval check:**
- Hit: 8-PRC-0002
- Missed: none
- Unexpected: 1-PRC-0003, 5-LST-0005, 4-DST-XXXX-R0 [Template Eductor].xls, Appendix I (0-PRC-4003-R1) Project Variance Change Notice Form.xls, 4-DST-XXXX-R0 [Template Press Filter].xls, 4-PDS-XXXX-R1 (Template HCl Synthesis Unit Package).xls, 4-DST-XXXX-R0 [Template Cooling Tower].xls

**Reviewer notes surfaced:**
- [8-PRC-0004 p.1] P&ID? Piping & Instrumentation Diagram?
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 
- [8-PRC-0002 p.4] Cable block diagrams? Not clear what this refers to?

---

## Q07 — Hard | Compliance check

**Question:** A new heat exchanger is being added to the plant. What documentation, approvals, and P&ID updates are required before it can be installed?
**Expected docs:** 1-PRC-0003, 1-PRC-0002
**Note:** Multi-step compliance — tests cross-document retrieval

**Answer:**

To install a new heat exchanger, the following documentation, approvals, and P&ID updates are required:

**1. P&ID Updates and Content**
The P&IDs must be updated through several stages, incorporating specific information and undergoing multi-discipline reviews:

*   **Stage 3 P&IDs (Process Study)**
    *   A formal process review will take place, covering items including, but not limited to: check valves, vessel trim, strainers, pressure relief, RO’s, sample points, drains, vent, slopes, notes, dimensions, elevations, hand valve function, instrumentation, alarm and interlock requirements, project notes, and all other process criteria [1-PRC-0003].
    *   Design will assign equipment nozzle tags directly on the P&ID following standard tagging conventions outlined in procedure 5-PRC-XXXX [1-PRC-0003].
    *   Nozzle tags assigned on the P&ID will be transposed to OTL’s by Design and Mechanical [1-PRC-0003].
    *   All in-line items and equipment trim must be added to the P&ID [1-PRC-0003].
    *   Process will define hand valve special functionality requirements (e.g., throttling, tight shut off). Valve descriptors will be added as shorthand notes on a separate drawing layer [1-PRC-0003].
    *   Pressure relief equipment must carry an instrument tag, and Mechanical shall consult with Process to assign a number [1-PRC-0003].
    *   Electrical will assign I/O requirements for electrical equipment and any other instrumentation, display, alarm, or interlock requirements [1-PRC-0003].
*   **Stage 4 P&IDs (Team P&ID Review)**
    *   "Final line size" must be added to allow confirmation from hydraulic calculations [1-PRC-0003].
*   **Stage 5 P&IDs (Approval after HazOp)**
    *   "Client numbers, etc." must be added as required to assure HazOp is conducted with Aker Kvaerner Chemetics standard tags and numbers for reference [1-PRC-0003].
*   **General P&ID Content (Checked by various disciplines)**
    *   **Process will check:** Equipment shape with the equipment number, process line connectivity with identifier, hand valve location showing open and closed position, utility line connectivity, pipe insulation and tracing, control philosophy, control loops and interlocks, control valve location and fail position, interlocks, field instruments numbering and location, motor control, and relief device [1-PRC-0003].
    *   **Mechanical will check:** Line number, fluid code, pipe size, pipe material, and gasket material, utility line connectivity, pipe size, fluid code, and pipe material, hand valve location, type, material, and number, mechanical restriction orifices location and number, expansion joints location and number, pressure relief location and number, piping speciality item location and number, equipment nozzle tag, equipment shape, pipe insulation and tracing, drains and vents [1-PRC-0003].
    *   **Instrumentation will check:** Instrument number, nozzle location, control valve location and number, interlocks and control loops, field instrument location, and relief device requirements [1-PRC-0003].
    *   **Electrical will check:** Numbering of equipment and instruments, motor control details, pipe electrical tracing, and interlocks and control loops [1-PRC-0003].
    *   **The Project Engineer will check:** Numbering of equipment, piping, valves and instruments, piping, valve, and speciality item information, insulation information, process line material and size, and utility line material and size [1-PRC-0003].

**2. Reviews and Approvals**

*   **Stage 3 P&ID Review:** The Technology manager and the lead process engineer will review the P&IDs in preparation for the HazOp [1-PRC-0003].
*   **Stage 4 P&ID Team P&ID Review:**
    *   This will be a multi-discipline meeting chaired by the Project Engineer [1-PRC-0003].
    *   The Project Engineer is responsible to assure that all issues identified during the Team review are resolved and incorporated into the P&IDs [1-PRC-0003].
    *   The Project Engineer approves the P&IDs to acknowledge that all items resulting from the Team review have been incorporated as required [1-PRC-0003].
*   **Stage 5 P&ID Approval:**
    *   Responses to HazOp questions will be prepared and implemented primarily by the process and mechanical [1-PRC-0003].
    *   The Project Engineer is responsible to confirm that HazOp responses were done, and approves by acknowledging that all action items have been completed [1-PRC-0003].

**3. Post-Installation Documentation**

*   **Management of Change (MOC):** During construction and commissioning, all changes initiated on site must strictly follow Aker Kvaerner Chemetics’ Management of Change (MOC) procedures [1-PRC-0003].
*   **Stick File:** A stick file must be kept on site as an official record. The care and custody of the stick file is the responsibility of the construction manager up to mechanical completion and the commissioning manager from mechanical completion to hand-over to the Owner [1-PRC-0003].
*   **As-Built P&IDs:** Once commissioning is complete, the P&IDs will be updated and issued to the Owner "As Built" (no qualifier) [1-PRC-0003]. Only changes initiated by Aker Kvaerner Chemetics need to be included in as-built PIDs [1-PRC-0003].
*   **As-Built Approval:** The commissioning manager approves the as-built P&IDs to acknowledge that they accurately represent the status of the Plant [1-PRC-0003].

**4. Heat Exchanger Specific Design Requirements**
While not directly P&ID updates, the design of the heat exchanger must comply with these requirements which would be reflected in the documentation:

*   All piping connections will be made to the fixed head of the heat exchanger [4-DST-XXXX-R1].
*   The heat exchanger frame must be sized to allow for the future installation of a minimum of 20% additional plate capacity [4-DST-XXXX-R1].

**Documents used:**
- `1-PRC-0003` | Procedure | Process Technology | 4 chunks [3 constraints]
- `4-DST-XXXX-R1 [Template Plate Heat Exchanger].xls` | Datasheet |  | 2 chunks
- `4-PDS-XXXX-R1 (Template Belt Filter Package).xls` | Datasheet |  | 1 chunks
- `4-PDS-XXXX-R1 (Template VOC-SCR Package).xls` | Datasheet |  | 1 chunks

**Retrieval check:**
- Hit: 1-PRC-0003
- Missed: 1-PRC-0002
- Unexpected: 4-DST-XXXX-R1 [Template Plate Heat Exchanger].xls, 4-PDS-XXXX-R1 (Template Belt Filter Package).xls, 4-PDS-XXXX-R1 (Template VOC-SCR Package).xls

**Reviewer notes surfaced:**
- [8-PRC-0004 p.1] P&ID? Piping & Instrumentation Diagram?
- [1-PRC-0003 p.2] May not require line-list toconfirm the piping&gasket material? service list does the purpose? or j
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 

---

## Q08 — Hard | Compliance check

**Question:** During construction, the client requests a change to a valve specification. What process must be followed and who must approve it?
**Expected docs:** 1-PRC-0003
**Note:** MOC procedure — tests change management retrieval

**Answer:**

To change a valve specification during construction, the following process must be followed:

1.  **Process:** A "Project Variance Change Notice Form" must be used to document the change [0-PRC-4003-R1].
    *   The form requires details such as "Job No. / Client," "Project Title," "Title," "Rev. / Date," "Location," and "PVN NO.: Date" [0-PRC-4003-R1].
    *   The specific "Change" must be detailed on the form [0-PRC-4003-R1].

2.  **Approval:** The change must be approved by the following individuals:
    *   Project Engineer [0-PRC-4003-R1]
    *   Project Manager [0-PRC-4003-R1]
    *   Project Director [0-PRC-4003-R1]

**Documents used:**
- `Appendix I (0-PRC-4003-R1) Project Variance Change Notice Form.xls` | Procedure |  | 4 chunks
- `5-SPC-CS11-R1 Carbon Steel Pipe.xls` | Specification |  | 2 chunks
- `5-SPC-CS4-R1 Carbon Steel Pipe.xls` | Specification |  | 2 chunks

**Retrieval check:**
- Hit: none
- Missed: 1-PRC-0003
- Unexpected: 5-SPC-CS11-R1 Carbon Steel Pipe.xls, Appendix I (0-PRC-4003-R1) Project Variance Change Notice Form.xls, 5-SPC-CS4-R1 Carbon Steel Pipe.xls

**Reviewer notes surfaced:**
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 
- [1-PRC-0003 p.2] May not require line-list toconfirm the piping&gasket material? service list does the purpose? or j
- [1-PRC-0003 p.3] Should this be Approved for Construction?

---

## Q09 — Hard | Compliance check — list vs procedure

**Question:** A designer wants to use a butterfly valve in a toxic fluid service. What restrictions or requirements apply?
**Expected docs:** 1-PRC-0003, 5-LST-0003, 1-LST-0002
**Note:** Requires both procedure rules and fluid/service list data

**Answer:**

When using a butterfly valve (V2864) in a toxic fluid service, the following restrictions and requirements apply, depending on the specific fluid and service conditions:

**General Restrictions for Chlorine, Gas Dry (CGD) Service:**
*   There must be no possibility of liquid Cl2 [1-LST-0002].
*   No titanium is allowed [1-LST-0002].

**General Recommendations for Drain, Chemical (DRC) Service:**
*   It is advised to watch material selection for different chemicals [1-LST-0002].

**Specific Requirements for Butterfly Valve (V2864) in Toxic Fluid Services:**

1.  **For Wet H2 containing Cl2 (dilution air to degasifiers):**
    *   **Valve Type:** On-Off / Isolation (b'fly) [5-LST-0003-1]
    *   **Material:** FRP wrapped CPVC [5-LST-0003-1]
    *   **Size Range:** Minimum 100, Maximum 300 [5-LST-0003-1]
    *   **Service Pressure:** 0 - 90 kPag [5-LST-0003-1]
    *   **Service Temperature:** Ambient - 90 oC [5-LST-0003-1]
    *   **Corrosion Allowance:** 0 mm [5-LST-0003-1]
    *   **Pipe Specification:** CF1 (ASME B31.3 Fluid Class N) [5-LST-0003-1]
    *   **Gasket Specification:** C [5-LST-0003-1]
    *   **Pressure Test Method:** Hydro or Pneum [5-LST-0003-1]
    *   **Flange Guard:** Not required [5-LST-0003-1]
    *   **Pipe Spec Service Limits:** 1034 kPag at 38 oC or 234 kPag at 98 oC (service limits vary with temperature) [5-LST-0003-1]
    *   **Additional Context:** The TT3 spool may be used for connection to the degasifier [5-LST-0003-1].

2.  **For Hydrogen Contaminated fluid (HYC), specifically Hydrogen containing Cl2 or HCl:**
    *   **Valve Type:** On-Off / Isolation (b'fly) [5-LST-0003-1]
    *   **Classification:** SC [5-LST-0003-1]
    *   **Material:** FRP wrapped CPVC [5-LST-0003-1]
    *   **Size Range:** Minimum 100, Maximum 300 [5-LST-0003-1]
    *   **Service Pressure:** 0 to 100 kPag [5-LST-0003-1]
    *   **Service Temperature:** Ambient to 90 oC [5-LST-0003-1]
    *   **Corrosion Allowance:** 0 mm [5-LST-0003-1]
    *   **Pipe Specification:** CF1 [5-LST-0003-1]
    *   **Gasket Specification:** C [5-LST-0003-1]
    *   **Pressure Test Method:** Hydro [5-LST-0003-1]
    *   **Flange Guard:** Not required [5-LST-0003-1]
    *   **Pipe Spec Service Limits:** 1034 kPag at 38 oC and 234 kPag at 98 oC (service limits vary with temperature) [5-LST-0003-1]
    *   **ASME B31.3 Fluid Class:** N [5-LST-0003-1]

3.  **For Cell Room High Pressure (PP-FRP dual laminate material):**
    *   **Valve Type:** On-Off / Isolation (b'fly) [5-LST-0003-1]
    *   **Designation:** CA [5-LST-0003-1]
    *   **Material:** PP-FRP dual laminate [5-LST-0003-1]
    *   **Size Range:** Minimum 100, Maximum 400 [5-LST-0003-1]
    *   **Service Pressure:** 200 to 400 kPag [5-LST-0003-1]
    *   **Service Temperature:** 80 to 90 oC [5-LST-0003-1]
    *   **Corrosion Allowance:** 0 mm [5-LST-0003-1]
    *   **Pipe Specification:** PF1 [5-LST-0003-1]
    *   **Gasket Specification:** C [5-LST-0003-1]
    *   **Pressure Test Method:** Hydro [5-LST-0003-1]
    *   **Flange Guard:** Required [5-LST-0003-1]
    *   **Pipe Spec Service Limit:** 607 kPag at 95 oC [5-LST-0003-1]
    *   **ASME B31.3 Fluid Class:** N [5-LST-0003-1]
    *   **Additional Requirement:** Teflon in valves must be virgin Teflon [5-LST-0003-1].

4.  **For Cell Room Low Pressure and Drain Lines (Polypropylene material):**
    *   **Valve Type:** On-Off / Isolation (b'fly) [5-LST-0003-1]
    *   **Designation:** CA [5-LST-0003-1]
    *   **Material:** Polypropylene [5-LST-0003-1]
    *   **Size Range:** Minimum 100, Maximum 400 [5-LST-0003-1]
    *   **Service Pressure:** 0 to 150 kPag [5-LST-0003-1]
    *   **Service Temperature:** 80 to 90 oC [5-LST-0003-1]
    *   **Corrosion Allowance:** 0 mm [5-LST-0003-1]
    *   **Pipe Specification:** PP6 [5-LST-0003-1]
    *   **Gasket Specification:** C [5-LST-0003-1]
    *   **Pressure Test Method:** Hydro [5-LST-0003-1]
    *   **Flange Guard:** Required [5-LST-0003-1]
    *   **Pipe Spec Service Limits:** 1070 kPag at 30 oC and 140 kPag at 95 oC (service limits vary with temperature) [5-LST-0003-1]
    *   **ASME B31.3 Fluid Class:** N [5-LST-0003-1]
    *   **Additional Requirement:** Teflon in valves must be virgin Teflon [5-LST-0003-1].

**Documents used:**
- `5-LST-0003-1` | List |  | 5 chunks
- `1-LST-0002` | List |  | 2 chunks
- `5-LST-0003` | List |  | 1 chunks

**Retrieval check:**
- Hit: 5-LST-0003, 1-LST-0002
- Missed: 1-PRC-0003
- Unexpected: 5-LST-0003-1

**Reviewer notes surfaced:**
- [1-PRC-0003 p.2] May not require line-list toconfirm the piping&gasket material? service list does the purpose? or j
- [1-PRC-0003 p.3] Should this be Approved for Construction?
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 

---

## Q10 — Hard | Gap test

**Question:** What are the civil and structural design requirements for equipment foundations?
**Expected docs:** None (gap test)
**Note:** Disciplines 2 & 3 are missing from dataset — expect "insufficient information"

**Answer:**

Based on the provided context, the civil and structural design requirements for equipment foundations include:

*   **Foundation Design Loading** [4-DST-XXXX-R0 [Template Stack].xls]
*   **Maximum bearing pressure / piling requirements** [0-LST-6001]

The provided context does not contain further details on specific civil and structural design requirements for equipment foundations beyond these items.

**Documents used:**
- `4-DST-XXXX-R0 [Template Stack].xls` | Datasheet |  | 1 chunks
- `Appendix I (0-PRC-4003-R1) Project Variance Change Notice Form.xls` | Procedure |  | 1 chunks
- `4-DST-XXXX-R0 [Template Cooling Tower].xls` | Datasheet |  | 1 chunks
- `4-DST-XXXX-R0 [Template Eductor].xls` | Datasheet |  | 1 chunks
- `4-DST-XXXX-R0 [Template Press Filter].xls` | Datasheet |  | 1 chunks
- `0-LST-6001` | List |  | 1 chunks
- `4-DST-XXXX-R0 [Template Ejector].xls` | Datasheet |  | 1 chunks
- `4-DST-XXXX-R0 [Template Liquid Ring Compressor].xls` | Datasheet |  | 1 chunks

**Reviewer notes surfaced:**
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD. and 
- [1-PRC-0003 p.3] Should this be Approved for Construction?
- [8-PRC-0002 p.2] This is standard respoonsibility split? or just example, many project this split is not clear

---

---

# Skill Evaluation Results

**Date:** 2026-03-28
**Pipeline:** Agentic (agent.py --json)
**Total questions:** 6 (3 natural language auto-skill + 3 slash commands)

---

## Summary Table

| Q | Mode | Question / Command (short) | Skill Called | Result |
|---|---|---|---|---|
| Q11 | Natural language | Brine pipe 0.125mm/yr 20yr — comply? | `check_corrosion_allowance` | COMPLIANT (zero margin) |
| Q12 | Natural language | Fluid code AA in scope? | `check_fluid_scope` | IN SCOPE |
| Q13 | Natural language | AVC vent 200kPa design, 280kPa hydro — OK? | `check_pressure_test` | NON-COMPLIANT (−20 kPa) |
| Q14 | `/corrosion_allowance` | Brine pipe 0.15mm/yr 25yr | `check_corrosion_allowance` | NON-COMPLIANT (−1.25mm) |
| Q15 | `/fluid_scope` | Fluid code WC | `check_fluid_scope` | NOT FOUND (correct) |
| Q16 | `/pressure_test` | AVC vent 200kPa design, 280kPa hydro | `check_pressure_test` | NON-COMPLIANT (−20 kPa) |

**Score: 6/6** — All skills called correctly; all verdicts match expected engineering outcomes.

---

## Q11 — Natural Language | Corrosion Allowance (auto-called)

**Question:** My brine feed pipe has corrosion rate 0.125mm/yr and design life 20 years. Does it comply?
**Skill auto-called:** `check_corrosion_allowance`
**Expected verdict:** COMPLIANT (0.125 × 20 = 2.5mm = required 2.5mm)

**Answer:**

The brine feed pipe, with a corrosion rate of 0.125 mm/yr and a design life of 20 years, is **COMPLIANT** with the required corrosion allowance.

The required corrosion allowance for "Brine, Feed" (Service Code BR) is 2.5 mm [5-LST-0003-1].
Calculated: 0.125 mm/yr × 20 years = 2.5 mm.

- **Calculated Corrosion Allowance:** 2.5 mm
- **Required Corrosion Allowance:** 2.5 mm
- **Margin:** 0.0 mm
- **Verdict:** COMPLIANT *(Note: Zero margin — recommend engineering review.)*

**Documents used:**
- `5-LST-0003-1` | List | R0 | 8 chunks
- `1-LST-0002` | List | R3 | 1 chunk

**Reviewer notes surfaced:**
- [1-PRC-0003 p.3] Line-size final? This requires all hydro cal. final and pump selections final. Should be IFD.
- [1-PRC-0003 p.3] Should this be Approved for Construction?
- [1-PRC-0003 p.2] May not require line-list to confirm the piping&gasket material?

**Result: HIT** — Correct skill called, correct verdict, correct source (5-LST-0003-1).

---

## Q12 — Natural Language | Fluid Scope (auto-called)

**Question:** Is fluid code AA within our approved project scope?
**Skill auto-called:** `check_fluid_scope`
**Expected verdict:** IN SCOPE — classification A from 1-LST-0002

**Answer:**

Fluid code AA ("Air, Atmospheric", including dilution air) is within the approved project scope with scope classification 'A' [1-LST-0002].

**COMPLIANT**: Fluid code AA is **IN SCOPE**.

**Documents used:**
- `1-LST-0002` | List | R3 | 20 chunks
- `5-LST-0003-2` | List | R0 | 1 chunk
- `5-LST-0003-1` | List | R0 | 1 chunk

**Result: HIT** — Correct skill called, correct verdict, correct source (1-LST-0002).

---

## Q13 — Natural Language | Pressure Test (auto-called)

**Question:** My AVC vent pipe design pressure is 200 kPa, hydro test pressure 280 kPa. Does this meet requirements?
**Skill auto-called:** `check_pressure_test`
**Expected verdict:** NON-COMPLIANT — need 300 kPa min (1.5×), margin −20 kPa

**Answer:**

For hydrostatic tests, ASME B31.3 requires a minimum test pressure of 1.5 times the design pressure [5-LST-0003-1].

- **Design Pressure:** 200 kPa
- **Minimum Required Hydrostatic Test Pressure:** 200 × 1.5 = 300 kPa
- **Actual Hydrostatic Test Pressure:** 280 kPa
- **Margin:** −20 kPa
- **Verdict: NON-COMPLIANT**

**Documents used:**
- `5-LST-0003-1` | List | R0 | 7 chunks
- `1-LST-0002` | List | R3 | 4 chunks
- `5-LST-0003-2` | List | R0 | 1 chunk
- `5-LST-0003` | List | R0 | 2 chunks

**Result: HIT** — Correct skill called, correct verdict, correct source (5-LST-0003-1).

---

## Q14 — Slash Command | `/corrosion_allowance`

**Command:** `/corrosion_allowance brine feed pipe, rate 0.15mm/yr, design life 25 years`
**Forced skill:** `check_corrosion_allowance`
**Expected verdict:** NON-COMPLIANT (0.15 × 25 = 3.75mm > 2.5mm required, margin −1.25mm)

**Answer:**

Calculated corrosion allowance: 3.75 mm. Required for Brine, Feed (BR): 2.5 mm [5-LST-0003-1].

**NON-COMPLIANT** — calculated (3.75 mm) exceeds required (2.5 mm) by 1.25 mm.

**Documents used:**
- `5-LST-0003-1` | List | R0 | 4 chunks
- `1-LST-0002` | List | R3 | 1 chunk

**Result: HIT** — Skill correctly forced, correct verdict, correct source.

---

## Q15 — Slash Command | `/fluid_scope`

**Command:** `/fluid_scope fluid code WC`
**Forced skill:** `check_fluid_scope`
**Expected verdict:** NOT FOUND — WC does not exist in 1-LST-0002 (correct behaviour)

**Answer:**

Cannot check scope classification for fluid code 'WC' — code is not present in [1-LST-0002]. Context lists WM, WF, WCB, WP, WDS, WCR, WCS but not WC.

**Documents used:**
- `1-LST-0002` | List | R3 | 8 chunks

**Result: HIT** — Skill correctly forced, correctly reported code not found (no hallucinated match).

---

## Q16 — Slash Command | `/pressure_test`

**Command:** `/pressure_test AVC vent pipe, design pressure 200 kPa, hydro test 280 kPa`
**Forced skill:** `check_pressure_test`
**Expected verdict:** NON-COMPLIANT — need 300 kPa min, margin −20 kPa

**Answer:**

Minimum required hydrostatic test pressure: 200 × 1.5 = 300 kPa [5-LST-0003-1].

- **Design Pressure:** 200 kPa
- **Actual Test Pressure:** 280 kPa
- **Required Test Pressure:** 300 kPa
- **Margin:** −20 kPa
- **Verdict: NON-COMPLIANT**

**Documents used:**
- `5-LST-0003-1` | List | R0 | 7 chunks
- `5-LST-0003` | List | R0 | 1 chunk

**Result: HIT** — Skill correctly forced, correct verdict, correct source.

---

## Overall Score (All 16 Questions)

| Category | Questions | Score |
|---|---|---|
| Simple RAG (Q01–Q10) | 10 | 8/10 (6 HITs, 2 PARTIALs, 1 MISS, 1 correct GAP) |
| Skill auto-called (Q11–Q13) | 3 | 3/3 |
| Slash commands (Q14–Q16) | 3 | 3/3 |
| **Total** | **16** | **14/16** |

**Notes:**
- Q08 (client change to valve spec) is the only outright miss — retrieval ranking varies by phrasing.
- Q07 and Q09 are partial hits — core documents retrieved but missed one supporting procedure.
- All 6 skill questions: correct skill called (or forced), correct verdict, correct source document.

---
