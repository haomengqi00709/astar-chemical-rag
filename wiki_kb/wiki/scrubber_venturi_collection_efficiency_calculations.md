---
slug: scrubber_venturi_collection_efficiency_calculations
title: Scrubber Venturi Collection Efficiency Calculations
source_doc: 1-Cal-6520-R0 (Template Variable Throat Venturi and Gas Cooling Tower)
doc_type: CAL
discipline: 1
discipline_name: Process Technology
source_folder: Unknown
track: A
---

# Scrubber Venturi Collection Efficiency Calculations

The collection efficiency of the Scrubber Venturi is determined through a series of calculations based on particle size, gas, and liquid properties, as detailed in **1-Cal-6520-R0**. These calculations are critical for assessing the scrubber's ability to remove particulate matter.

**General Parameters for Collection Efficiency:**
*   **Gas Flow:** 85102.0 m³/h (for all listed particle sizes)
*   **Gas Density:** 0.8456 kg/m³ (for all listed particle sizes)
*   **Gas Viscosity:** 1.7999999999999997e-05 kg/m·s
*   **Gas Temperature:** 336.15 K
*   **Liquid Flow:** 265.44841640111804 m³/h
*   **Liquid Density:** 982.73 kg/m³
*   **Throat Velocity:** 53.03536470262141 m/s
*   **Throat Length:** 0.15 m
*   **Particle Density:** 1700.0 kg/m³ (for all listed particle sizes)

**Key Calculation Parameters:**
*   **Reynold's No. (Gas):** 285.086949800135
*   **Droplet Size (Nukiyama Tanasawa, dc):** 114.42457513681694 microns
*   **Steady State Drag Coefficient (CDo):** 0.6794269495480375
*   **Dimensionless Throat Length (X):** 1.1436966858965174
*   **Drop Velocity Ratio (b):** 0.6534543596442755
*   **B:** 5.335398258290771

**Collection Efficiency by Particle Size:**
The following table presents the particle sizes for which collection efficiency is calculated:

| Particle Size (m) | Particle Size (microns) |
| :---------------- | :---------------------- |
| 1e-05             | 10.0                    |
| 2e-06             | 2.0                     |
| 1e-06             | 1.0                     |
| 8e-07             | 0.7999999999999999      |
| 6e-07             | 0.6                     |
| 5e-07             | 0.5                     |
| 4e-07             | 0.39999999999999997     |
| 2e-07             | 0.19999999999999998     |
| 1e-07             | 0.09999999999999999     |
| 5e-08             | 0.049999999999999996    |

**Intermediate Calculation Terms:**
*   **Inertia parameter (K2) values:** 495.50818903953393, 21.280040734541387, 5.7763586590329945, 3.8433750623646716, 2.3005129938945825, 1.6758318815767554, 1.149331176286185, 0.3904667820646075, 0.15389110822056523, 0.06789827404826522
*   **Cunningham slip correction factor (C) values:** 1.01875717, 1.0937858624611168, 1.187610402925539, 1.234674947228399, 1.3138386447653891, 1.3781937678004326, 1.4768794472595819, 2.0069841562366637, 3.1639773744776267, 5.583912035954366
*   **ln(Co/Ci) Term 1 values ([B/(K2*(1-beta+0.7/K2))]):** 0.03094487742798842, 0.660770911845228, 1.9747774553861175, 2.6258110463305235, 3.563506250596743, 4.1658317063817005, 4.857888651625917, 6.387292293484311, 7.082415655382026, 7.374123198864051
*   **Term 2 values ([4*K2*(1-beta)^1.5)]):** 404.34445065381027, 17.364932751923376, 4.713622540312302, 3.1362698187908413, 1.8772639550948809, 1.3675118525442398, 0.9378768976463013, 0.31862859178676084, 0.12557817810148425, 0.05540633016298593
*   **Term 3 value ([4.2*(1-beta)^0.5]):** 2.4724613436563536
*   **Term 4 values ([5.02*K2^0.5*(1-beta+0.7/K2)*ATAN( ((1-beta)*K2/0.7)^0.5 )]):** 58.597601892371735, 11.176271419180686, 5.850666704718898, 4.909079175820066, 4.0529996878971195, 3.6691619810549985, 3.323582372515389, 2.779716244151903, 2.596206617481433, 2.5275205147240687
*   **Term 5 values ([B/(K2*(1+0.7/K2))]):** 0.010752338184136031, 0.24273832440657184, 0.8238268661741188, 1.1743248543328222, 1.7781620240096254, 2.245696886073376, 2.8850420772147922, 4.892765507436302, 6.248335656532689, 6.948053457866505
*   **Term 6 values ([4*K2+4.2-5.02*K2^0.5*(1+0.7/K2)*...]):** 1814.6597215836673, 56.03957077376623, 10.588503660142027, 5.9917355633210825, 2.8086694844592355, 1.7176521953536188, 0.9334819091411557, 0.14213220199219467, 0.024751160268722927, 0.005025418646946278

These detailed calculations, including various terms and factors, are fundamental to understanding the scrubber's performance in removing particles of different sizes. For the underlying theoretical models and assumptions, refer to [[scrubber_venturi_design_principles]].