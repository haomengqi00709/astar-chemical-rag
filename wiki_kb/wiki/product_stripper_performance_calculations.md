---
slug: product_stripper_performance_calculations
title: Product Stripper Performance Calculations
source_doc: 1-Cal-7865-R1 (Template Strong Acid Stripper)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Product Stripper Performance Calculations

This page details the various performance calculations for the Product Stripper, including pressure drop, water absorption efficiency, loading, flooding, wetting rates, hold-up, and mass transfer coefficients.

**Pressure Drop Calculations**
*   **Total pressure drop:** 2.1152624539617273 in wc
*   **Total Pressure Drop Note 3:** 112.06625279858612
*   **A safety factor of 10% must be added when only a tower is supplied and there are guarantees on the pressure drop.**
*   **Max DP must be specified when a safety factor of 10% is added.**

| Zone/Location | Pressure Drop (in wc) | Pressure Drop (kPa) | Pressure Drop (in wc/ft) | Pressure Drop (atm) |
| :------------ | :-------------------- | :------------------ | :----------------------- | :------------------ |
| Bottom        | 1.0539874057567131    | N/A                 | 0.13398049108242513      | 0.0025884444563142755 |
| Zone 1        | 0.40959523062812764   | 0.2625              | 0.1482415745384425       | 0.0010059081334951629 |
| Zone 2        | 0.27401283042821756   | 0.102               | 0.15976931579833029      | 0.0006729368757226119 |
| Zone 3        | 0.2028820572434437    | 0.0682              | 0.16255724552044143      | 0.0004982497262198263 |
| Zone 4        | 0.17478492990522537   | 0.0505              | 0.17478492990522537      | 0.00042924714317211685 |
| Zone 5        | N/A                   | 0.0435              | N/A                      | N/A                 |
| Total         | 2.1152624539617273    | N/A                 | N/A                      | N/A                 |

**Water Absorption Efficiency**
*   **Water removed percentage:** 98.76777045094387 %
*   **% of H2O absorbed Zone 1:** 50.0 %
*   **% of H2O absorbed Zone 2:** 90.0 %
*   **% of H2O absorbed Zone 3:** 99.0 %
*   **% of H2O absorbed Zone 4:** 98.76777045094387 %

**Loading and Flooding**
| Zone/Location | Fraction of Loading | Fraction of Flooding |
| :------------ | :------------------ | :------------------- |
| Bottom        | 0.30337811828510003 | 0.35147464923273786  |
| Top           | 0.3271843910175795  | 0.37905508715451286  |
| Zone 1        | 0.31212349556816066 | 0.36160648876799095  |
| Zone 2        | 0.31873992569985016 | 0.36927186514007027  |
| Zone 3        | 0.3202907211727743  | 0.37106851843187266  |
| Zone 4        | 0.320 %             | 0.371 %              |
| Zone 5        | 0.327 %             | 0.379 %              |

**Wetting Rate**
| Zone/Location | Wetting Rate (ml/m s) | Wetting Rate (m3/h·m) |
| :------------ | :-------------------- | :-------------------- |
| Bottom        | 51.086316545950496    | N/A                   |
| Top           | 51.14568159871468     | N/A                   |
| Zone 1        | 51.1159986423432      | 0.18                  |
| Zone 2        | 51.13974492828427     | N/A                   |
| Zone 3        | 51.145087929765346    | N/A                   |

**Hold-Up**
*   **Total Volumetric Hold-up:** 4.124961649322446 m3

| Zone/Location | Hold-Up (%) | Volumetric Hold-up (m3) |
| :------------ | :---------- | :---------------------- |
| Bottom        | 7.420305278406805   | N/A                     |
| Top           | 7.30657345623455    | 0.2798593952508438      |
| Zone 1        | 7.362846242648409   | 2.2358453750269436      |
| Zone 2        | 7.317734366461778   | 0.7792139870921694      |
| Zone 3        | 7.307687455487466   | 0.48070683860333496     |
| Zone 4        | 7.307687455487466   | 0.3493360533491549      |
| Zone 5        | 7.30657345623455    | N/A                     |

**UOL and UOG Values**
| Zone/Location | UOL                   | UOG                   |
| :------------ | :-------------------- | :-------------------- |
| Bottom        | 4.892554729015195     | 89.56520795518438     |
| Top           | 4.631412882987992     | 92.9062831579771      |
| Zone 1        | 4.7607411819805545    | 89.41802289405828     |
| Zone 2        | 4.659125154061677     | 89.18641254344884     |
| Zone 3        | 4.63666861973641      | 89.1802505113345      |

**Mass Transfer Coefficients (KLS, KGS) and Reynolds Number (Re)**
*   **Efficiency factor:** 1.0
*   **WC factor:** 2e-14
*   **KGs corr:** 1.0 (for all zones)

| Zone/Condition | Re                  | Small KLS             | Small KGS             | Large KLS             | Large KGS             |
| :------------- | :------------------ | :-------------------- | :-------------------- | :-------------------- | :-------------------- |
| Bottom         | 1688.794097552156   | 0.004175076422747554  | 5.569455923611731     | 0.004110883610623448  | 0.08563173497615177   |
| 50.0           | 1618.3853955273496  | 0.004291635066460169  | 5.734231944757364     | 0.004227158785795666  | 0.08614943781100391   |
| 90.0           | 1567.26712877556    | 0.004386209746299187  | 5.854012832794474     | 0.004321360165272496  | 0.08655087227689034   |
| 99.0           | 1556.338978579687   | 0.004407650840251794  | 5.883459961017631     | 0.004342743258373314  | 0.08664051963033785   |
| Top            | 1555.137078359326   | 0.00441003684275901   | 6.135930052193492     | 0.004347721878040217  | 0.08670228353017832   |

**Calculated vs. Actual Pressure Out**
*   **Calculated P out (atm) (Bottom):** 0.8754263896673378
*   **Calculated P out (atm) (Zone 1):** 0.8728379452110235
*   **Calculated P out (atm) (Zone 2):** 0.8718320370775283
*   **Calculated P out (atm) (Zone 3):** 0.8711591002018058
*   **Calculated P out (atm) (Zone 4):** 0.870660850475586
*   **Actual P out (atm):** 0.8364429206320553
*   **Percentage difference:** 4.090886419084521 % diff

**Related Topics:**
*   [[product_stripper_calculation_parameters_and_results]]
*   [[product_stripper_design_guidelines]]
*   [[product_stripper_ntu_calculation_data]]