# LUNA: THE LAST LIGHT 🌔
### NASA Space Apps Challenge 2026 — Lunar South Pole Exploration Simulator

> *"How far into eternal darkness can your rover venture before cold and darkness claim it?"*

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA%20Space%20Apps-2026-00f0ff?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Artemis Program](https://img.shields.io/badge/Artemis-Polar%20Exploration-blue?style=for-the-badge)](https://www.nasa.gov/specials/artemis/)
[![Vite + React](https://img.shields.io/badge/Vite-React%2018-61dafb?style=for-the-badge&logo=react)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🛰️ Product Concept & Overview

**LUNA: THE LAST LIGHT** is an interactive, browser-based lunar exploration mission simulator built for the **NASA Space Apps Challenge 2026**.

Operating near the **Lunar South Pole (89°S to 90°S)** presents one of the most perilous engineering environments in the Solar System. Because the Moon’s rotational axis is tilted by only **1.54°**, the Sun never rises high in the sky; it grazes mountain crests and crater rims at a mere 1.5° to 2.0° above the horizon. Elevated peaks enjoy up to 90% illumination, while deep impact depressions remain in eternal darkness—forming **Permanently Shadowed Regions (PSRs)** where temperatures plummet to **38 Kelvin (-235°C)**.

These cryogenic "cold traps" are the primary targets of the NASA Artemis campaign: they harbor billions of metric tons of ancient water ice and volatile resources crucial for long-term human presence, drinking water, breathable oxygen, and rocket propellant.

The core gameplay loop puts the player in the role of Mission Commander:
1. **Target Selection**: Analyze real LOLA topographic data and choose an Artemis candidate landing site.
2. **Payload Engineering**: Build a custom rover balancing **Budget ($160M)**, **Mass (350 kg)**, and **Solar Generation Margin**.
3. **Telemetry & Descent**: Monitor baseline avionics and launch down the crater wall.
4. **Surface Operations & The Return Dilemma**: Venture into pitch-black shadow where direct solar power drops strictly to **0.0 Watts**. Manage battery reserves, active resistive heaters, wheel slip, and Earth communication occultation while drilling for cryogenic ice samples.
5. **Debrief & Forensics**: Receive a comprehensive forensic rating and educational comparison with NASA's VIPER and Artemis III missions.

---

## 🧪 Scientific References & NASA Datasets

The simulation is directly calibrated against peer-reviewed planetary science and empirical data from NASA's Lunar Reconnaissance Orbiter (LRO), Lunar Prospector, LCROSS, and international partner instruments:

| Instrument / Mission | Data Source | Primary Citation | Scientific Application in Game |
| :--- | :--- | :--- | :--- |
| **LOLA** (Lunar Orbiter Laser Altimeter) | NASA LRO / PDS Geosciences | Mazarico et al. (2011), *Icarus* | Topographic digital elevation models (DEMs), slope hazard profiles, and solar horizon visibility. |
| **Diviner Lunar Radiometer** | NASA LRO / PDS | Paige et al. (2010), *Science* | Surface & subsurface thermal equilibrium: -45°C on illuminated rims down to 25–40 K (-248°C to -233°C) in cold traps. |
| **LP-NS & LEND** (Neutron Spectrometers) | Lunar Prospector / LRO LEND | Feldman et al. (2001); Mitrofanov et al. (2010) | Regional bulk hydrogen / Water-Equivalent Hydrogen (WEH) suppression maps. |
| **LCROSS** | NASA Ames / Centaur Impact | Colaprete et al. (2010), *Science* | Ground-truth volatile composition: 5.5 ± 1.4 wt% water ice plus CO2, NH3, and CH4 in Cabeus crater plume. |
| **ShadowCam** | KPLO (Danuri) / NASA | Robinson et al. (2023), *JGR Planets* | Ultra-high sensitivity secondary earthshine/starlight visibility inside permanently shadowed craters. |
| **LROC NAC** (Narrow Angle Camera) | NASA LRO | Robinson et al. (2010), *Space Sci Rev* | High-resolution morphology, rim access ramps, and meter-scale boulder field distribution. |
| **VIPER Science Suite** | NASA CLPS / Ames | Andrews et al. (2021) | Rover payload architecture: NSS (Neutron Spectrometer), NIRVSS (Infrared Spectrometer), and TRIDENT (1-meter drill). |
| **NASA Moon Trek & PDS** | NASA JPL / Solar System Treks | https://trek.nasa.gov/moon/ | Polar basemaps, georeferenced landing site coordinates, and multi-mission layer integration. |

---

## 🔬 Scientific Data Provenance & Methodology

To ensure scientific transparency, *LUNA: THE LAST LIGHT* explicitly categorizes all simulation parameters into four methodological tiers:

### 1. Empirical NASA Observations (Direct Measurements)
- **Zero Direct Solar Flux in PSRs**: Because the Moon's axial tilt is only 1.543°, south-pole crater interiors never receive direct sunlight. Solar generation is strictly **0.0 Watts** in PSR zones.
- **Topography and Slopes**: Landing site coordinates, elevation ranges (-2,100 m to +5,000 m), and slope hazard distributions derive directly from LOLA GDR topographic models.
- **Surface Temperatures**: Cryogenic baseline of 25–40 K (-248°C to -235°C) inside deep cold traps (Haworth, Shackleton) matches Diviner thermal channel measurements.

### 2. Scientific Interpretations & Geophysical Models
- **Lumped-Capacitance Thermal Model**: Rover electronics waste heat dissipation (65% conversion efficiency) balances active resistive heating against radiative losses modeled via lumped capacitance ($C_{th} \approx 140\text{ W}\cdot\text{min}/^\circ\text{C}$).
- **Direct-to-Earth (DTE) Occultation**: RF carrier degradation models the geometric crater rim horizon blockage and lunar libration ($\pm 6.7^\circ$). Descending deeper than 60 m (omni) or 220 m (high-gain dish) blocks direct Earth line-of-sight, requiring an orbital relay satellite (Gateway / Pathfinder).
- **Grazing Angle Solar Mast Intercept**: Vertical solar arrays model near-horizontal solar incidence ($\approx 1.5^\circ\text{--}2.0^\circ$ elevation), giving deployable masts higher capture efficiency over flat body arrays.

### 3. Procedural Simulation Models (Instrument Resolution Adjustments)
- **Discrete Ice Pocket Micro-Distribution**: While orbital neutron spectrometers (LP-NS, LEND) detect bulk hydrogen at regional scales (**10 to 45 km spatial footprints**), rovers prospect at the meter scale. Sub-surface ice pockets in the simulation are procedurally generated, calibrated against Diviner depth-dependent thermal stability limits (<110 K at depth) and LCROSS ground-truth concentrations (2.2% to 22.8% wt eq).
- **Regolith Desiccation Layer**: Water ice is modeled as buried under an insulating 10–50 cm dry regolith layer, requiring surface neutron scanning before committing power to TRIDENT mechanical drilling.
- **Surface Regolith Slip**: Terramechanics slip events are stochastically triggered by local LOLA slope angle thresholds rather than explicit millimeter-grain granular simulations.

### 4. Gameplay Abstractions & Accommodations
- **Accelerated Time Scale**: 1 simulation tick corresponds to approximately 1 minute of physical rover mission time.
- **Mission Scoring Matrix**: Standardized aerospace evaluation matrix (A+ through F) grading collected science, ice recovered, thermal margin preservation, battery management, and budget efficiency.

---

## 🧪 Automated QA & Scientific Verification Suite

The repository includes a comprehensive, dependency-free test suite verifying all physics equations, thermal boundaries, telecom link budgets, and defensive edge case handling:

```bash
# Run the automated science & physics unit test suite
node test-suite.mjs
```
**Test Coverage: 100/100 Tests Passing**, including:
- NASA candidate landing site integrity & LOLA profiles
- Hardware subsystem mass, power, and budget constraints
- Strict PSR zero-solar generation flight rules ($P_{\text{solar}} = 0.0\text{ W}$)
- Electrical draw, thermal lumped capacitance, and battery clamping
- Communications RF occultation and orbital relay locks
- Pure functional solar recharge and stationary dwell harvesting
- Site diversity and procedural ice pocket immutability
- Defensive sanitization against `null`, `undefined`, and `NaN` inputs

---

## 🎮 Gameplay Features & Screens

1. **Cinematic Launch Pad**: Dynamic starfield, orbital perspective of Earth low on the lunar horizon, synthesized mission control SFX, and quick resume.
2. **Mission Briefing**: Directives and background on Artemis polar volatile trapping.
3. **Landing Site Selection**: 5 real NASA candidate locations:
   - *Shackleton Crater Connecting Ridge* (89.9°S)
   - *Malapert Mountain Massif* (84.9°S)
   - *De Gerlache - Shackleton Connecting Ridge* (88.5°S)
   - *Haworth Deep Depression* (87.4°S)
   - *Faustini Crater Plateau* (87.3°S)
   - *Interactive LOLA elevation profiles powered by Recharts.*
4. **Rover Engineering Suite**:
   - Chassis: Lightweight Carbon, Rocker-Bogie, or Continuous Tracks.
   - Power: Body-Mounted PV, Vertical Sun-Tracking Mast, or UltraFlex Wings.
   - Batteries: Heritage Li-Ion, Cryogenic Solid-State, or Solid-State + RHU.
   - Thermal: Passive MLI, Active Resistive Heaters, or Phase-Change Wax.
   - Telecom: Omnidirectional S-Band, Gimbaled X-Band, or Lunar Gateway Relay Link.
   - Science: NSS Neutron Spectrometer, NIRVSS Infrared Volatiles Sensor, TRIDENT Cryo Drill, and ShadowCam.
   - Real-time schematic blueprint assembly and engineering trade-off commentary.
5. **Mission Control Dashboard**: Multi-channel telemetry console with real-time power generation vs. consumption curves, avionics status, and DSN carrier lock.
6. **Surface Operations Simulation**:
   - 2D/2.5D topographic canvas with realistic razor-sharp polar shadows.
   - Interactive rover locomotion, steering, regolith scanning, and TRIDENT drill core sampling.
   - Lumped-capacitance thermal calculations and battery drain tracking.
   - Dynamic headlights cutting through dust in 40K pitch darkness.
7. **Emergency Contingency Scenarios**:
   - Cryogenic Thermal Shock
   - Fine Unconsolidated Regolith Wheel Slip
   - Crater Rim Earth Occultation
   - High-Yield Subsurface Hydrogen Discovery
8. **Forensic Debriefing**:
   - Mission outcome classification (Full Success, Partial Success, Mission Lost).
   - Letter grade (A+ through F) with point breakdown.
   - Total kilograms of water ice extracted.
   - Educational comparison with NASA VIPER and Artemis mission plans.
   - Export Flight Log (JSON) and clipboard summary share.

---

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 with custom HUD overlays and CRT scanlines
- **Data Visualization**: Recharts (LOLA altimetry profiles and power curves)
- **Icons**: Lucide React
- **Audio**: Custom client-side Web Audio API synthesizer (no external audio assets required)
- **Effects**: canvas-confetti
- **Storage**: Browser `localStorage` for progress auto-saving and flight log archiving

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Local Execution
```bash
# Clone the repository
git clone https://github.com/nadd88/LUNA-the-last-light.git
cd LUNA-the-last-light

# Install dependencies
npm install

# Start the local development server
npm run dev

# Open in browser: http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📜 License
Developed for the **NASA Space Apps Challenge 2026**. Educational and open-source under the MIT License.
