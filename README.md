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

The game is directly calibrated using empirical data from NASA Lunar Reconnaissance Orbiter (LRO) and international partner instruments:

| Instrument | Mission | Scientific Application in Game |
| :--- | :--- | :--- |
| **LOLA** (Lunar Orbiter Laser Altimeter) | NASA LRO | Topographic elevation profiles, slope hazard ratings, and crater depth contours. |
| **ShadowCam** | KPLO / NASA | Low-light sensitivity modeling, secondary starlight/earthshine rendering inside PSRs. |
| **Diviner Radiometer** | NASA LRO | Thermal equilibrium physics: -45°C on illuminated rims vs. -235°C (38K) in cold traps. |
| **VIPER Science Suite** | NASA CLPS | Neutron Spectrometer (NSS), Near-IR Spectrometer (NIRVSS), and 1-meter TRIDENT drill. |

> **Scientific Transparency**: The game clearly distinguishes empirical NASA datasets from simplified interactive gameplay models. In compliance with physics, solar generation inside any designated Permanently Shadowed Region is strictly **0.0 Watts**.

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
