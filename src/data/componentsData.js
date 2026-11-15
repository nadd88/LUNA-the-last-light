// Spacecraft & Rover Subsystems Engineering Database
// Balances realistic aerospace trade-offs (Mass, Budget, Power, Thermal Resistance)

export const MISSION_CONSTRAINTS = {
  maxBudget: 210, // $210 Million USD (NASA Discovery-class envelope with baseline drill instrument suite)
  maxMass: 350,   // 350 kg maximum payload capacity
  minPowerMargin: 10, // Must have at least +10W net generation in sunlight
};

export const ROVER_COMPONENTS = {
  chassis: [
    {
      id: 'scout-light',
      name: 'Aero-Scout 4-Wheel Carbon Chassis',
      category: 'Chassis & Mobility',
      cost: 18, // $M
      mass: 55, // kg
      basePower: 18, // W idle draw
      drivePower: 35, // W when rolling
      maxSpeed: 0.22, // m/s
      slopeCapability: 14, // max slope in degrees
      coldTolerance: -190, // °C before mechanical freeze
      description: 'Ultralight carbon-composite tubular frame with direct hub motors. Agile and energy efficient on gentle terrain, but reduced traction on steep crater wall regolith.',
      engineeringRationale: 'Saves 35kg of mass that can be reallocated to batteries or scientific instruments at the cost of reduced slope climbing torque.'
    },
    {
      id: 'all-terrain-rocker',
      name: 'Vanguard Rocker-Bogie 6-Wheel',
      category: 'Chassis & Mobility',
      cost: 26,
      mass: 90,
      basePower: 24,
      drivePower: 55,
      maxSpeed: 0.16,
      slopeCapability: 22,
      coldTolerance: -220,
      description: 'Heritage NASA rocker-bogie differential suspension with grooved titanium-mesh wheels. Superior obstacle clearance over boulders and stability on slopes up to 22°.',
      engineeringRationale: 'The gold standard for lunar surface mobility (derived from Curiosity and VIPER concepts). High traction, highly resistant to regolith slippage.'
    },
    {
      id: 'tracked-cryo',
      name: 'Cryo-Crawler Heavy Continuous Tracks',
      category: 'Chassis & Mobility',
      cost: 35,
      mass: 130,
      basePower: 32,
      drivePower: 80,
      maxSpeed: 0.12,
      slopeCapability: 28,
      coldTolerance: -250,
      description: 'Heavy continuous elastomer-titanium articulated tracks with sealed magnetic bearings. Unstoppable in soft loose dust and steep crater inclines, but heavy power consumption.',
      engineeringRationale: 'Allows deep penetration down steep crater descents (>20°) where wheeled vehicles would slip and become stranded, but heavily drains battery reserves.'
    }
  ],

  solar: [
    {
      id: 'solar-fixed',
      name: 'Fixed Body-Mounted Triple-Junction PV',
      category: 'Power Generation',
      cost: 12,
      mass: 20,
      generation: 95, // Watts in direct sunlight
      psrGeneration: 0, // In PSR, 0W!
      lowSunAngleEfficiency: 0.65,
      description: 'Rugged body-conformal GaInP/GaAs multi-junction cells. Immune to mast deployment failure, but lower capture of the near-horizontal polar sun (1.5° elevation).',
      engineeringRationale: 'No deployment risk or actuator motors, but horizontal incidence angles severely cut generation efficiency.'
    },
    {
      id: 'solar-mast-tracking',
      name: 'Deployable Vertical Sun-Tracking Mast',
      category: 'Power Generation',
      cost: 24,
      mass: 42,
      generation: 175,
      psrGeneration: 0,
      lowSunAngleEfficiency: 0.96,
      description: 'A 1.8-meter tall mast mounted vertical solar array with active 360° azimuth sun-tracking. Maximizes power harvest from the razor-low polar sun skimming the horizon.',
      engineeringRationale: 'Essential for high-latitude operations where the sun never rises more than 2° above the horizon. Doubling generation allows faster battery recharging on the rim.'
    },
    {
      id: 'solar-ultra-fold',
      name: 'Dual-Wing UltraFlex Deployable Wings',
      category: 'Power Generation',
      cost: 32,
      mass: 58,
      generation: 240,
      psrGeneration: 0,
      lowSunAngleEfficiency: 0.90,
      description: 'Large accordion-deployed solar blankets providing massive 240W peak electrical output. Allows running multiple high-draw scientific instruments simultaneously.',
      engineeringRationale: 'Enormous power surplus in sunlight allows powering active drill systems and high-throughput transmitters simultaneously.'
    }
  ],

  battery: [
    {
      id: 'bat-li-ion-standard',
      name: 'Aerospace Li-Ion Spacepack (1.2 kWh)',
      category: 'Energy Storage',
      cost: 14,
      mass: 28,
      capacity: 1200, // Watt-hours
      maxDischarge: 0.85,
      criticalTemp: -40, // Below this, battery freezes & dies
      freezeDamageRate: 0.08, // damage per tick if below criticalTemp
      description: 'Heritage flight-proven lithium-ion cells with automated cell balancing. Good energy density, but vulnerable to extreme cryogenic shock if internal heaters fail.',
      engineeringRationale: 'Cost effective and lightweight, but requires constant heating power in PSR darkness to prevent electrolyte freeze.'
    },
    {
      id: 'bat-solid-state-cold',
      name: 'Cryogenic Solid-State Battery (2.0 kWh)',
      category: 'Energy Storage',
      cost: 29,
      mass: 44,
      capacity: 2000,
      maxDischarge: 0.92,
      criticalTemp: -85,
      freezeDamageRate: 0.03,
      description: 'Next-generation solid-state electrolyte cells designed for deep space missions. Retains 60% charge capacity even down to -80°C with zero thermal runaway risk.',
      engineeringRationale: 'Extends deep dark PSR exploration range by over 65%. High resilience during thermal emergencies.'
    },
    {
      id: 'bat-extended-rhu',
      name: 'Hybrid Solid-State + RHU Auxiliary (2.8 kWh)',
      category: 'Energy Storage',
      cost: 42,
      mass: 65,
      capacity: 2800,
      maxDischarge: 0.95,
      criticalTemp: -120,
      freezeDamageRate: 0.01,
      description: 'Massive energy reserve coupled with a 1-Watt Radioisotope Heater Unit (RHU) providing permanent passive warmth to the core battery enclosure.',
      engineeringRationale: 'Ultimate endurance configuration. RHU keeps the battery core warm indefinitely, radically reducing active electrical heater demands in the cold trap.'
    }
  ],

  thermal: [
    {
      id: 'thermal-passive-mli',
      name: 'Passive Multi-Layer Insulation (MLI) & Heat Pipes',
      category: 'Thermal Control',
      cost: 10,
      mass: 18,
      heatOutput: 0, // Passive only
      powerDraw: 0,
      thermalResistance: 0.65, // Thermal preservation rating (0 to 1)
      description: '25-layer goldized Kapton MLI blanket with aluminum honeycomb heat-spreading core. Consumes 0 Watts of electricity, but cannot stop eventual heat death in 40K shadows.',
      engineeringRationale: 'Zero electrical overhead saves precious battery Watt-hours, but gives the rover a hard time limit of ~15-20 minutes in deep darkness before freezing.'
    },
    {
      id: 'thermal-active-heaters',
      name: 'Dual-Zone Active Resistive Heaters + MLI',
      category: 'Thermal Control',
      cost: 18,
      mass: 26,
      heatOutput: 45, // Thermal Watts produced
      powerDraw: 35, // Electrical Watts consumed when active
      thermalResistance: 0.85,
      description: 'Programmable resistive patch heaters with thermostatic closed-loop PID control. Actively injects heat into the avionics and battery bay at the cost of 35W electrical draw.',
      engineeringRationale: 'Standard active thermal architecture. Protects rover indefinitely in sub-zero shadows as long as battery charge remains above 10%.'
    },
    {
      id: 'thermal-cryo-phase',
      name: 'Advanced Phase-Change Wax + RHU Thermal System',
      category: 'Thermal Control',
      cost: 28,
      mass: 38,
      heatOutput: 65,
      powerDraw: 18, // High efficiency thermal conversion
      thermalResistance: 0.95,
      description: 'Paraffin phase-change heat sinks that store latent heat during illuminated periods and release it inside cold traps, supplemented by precision micro-heaters.',
      engineeringRationale: 'Superior thermal efficiency cuts heater electrical consumption by 50% while sustaining survivable temperatures in extreme -240°C conditions.'
    }
  ],

  comm: [
    {
      id: 'comm-omni-low',
      name: 'UHF / S-Band Low-Gain Omnidirectional',
      category: 'Communications',
      cost: 8,
      mass: 10,
      powerDraw: 12,
      bandwidth: 4, // kbps
      dteRange: 'Limited',
      needsRelayInCrater: true,
      description: 'Broad-beam antenna requiring no mechanical pointing. Extremely reliable, but transmission data rate is low and direct Earth signal is lost as soon as the crater rim hides the Earth.',
      engineeringRationale: 'Lowest mass and cost, but science transmission is restricted to basic telemetry unless an orbital relay is in view.'
    },
    {
      id: 'comm-steerable-xband',
      name: 'Gimbaled High-Gain X-Band Dish (0.5m)',
      category: 'Communications',
      cost: 19,
      mass: 22,
      powerDraw: 26,
      bandwidth: 128, // kbps
      dteRange: 'Full Direct-to-Earth',
      needsRelayInCrater: false,
      description: 'Active motor-steered parabolic dish capable of direct gigabit downlink to NASA Deep Space Network (DSN) 70m antennas on Earth. Requires line of sight.',
      engineeringRationale: 'High bandwidth enables rapid offloading of scientific spectra and drill imagery back to Earth mission control.'
    },
    {
      id: 'comm-orbital-relay-link',
      name: 'Dual DSN Direct + Lunar Gateway Relay Transceiver',
      category: 'Communications',
      cost: 27,
      mass: 29,
      powerDraw: 30,
      bandwidth: 256,
      dteRange: 'Global Lunar Relay',
      needsRelayInCrater: false,
      description: 'State-of-the-art dual-mode transponder that seamlessly links with NASA Gateway or Lunar Pathfinder relay satellites in halo orbits when the Earth is blocked by crater topography.',
      engineeringRationale: 'Maintains mission control connection even when descending into deep depressions where direct Earth line-of-sight is permanently severed.'
    }
  ],

  instruments: [
    {
      id: 'inst-nss',
      name: 'NSS — Neutron Spectrometer System',
      category: 'Scientific Instrument',
      cost: 16,
      mass: 14,
      powerDraw: 15,
      scanTime: 1, // seconds/turns
      scienceYield: 35,
      detectsHydrogen: true,
      description: 'Measures the energy distribution of neutrons kicked off the lunar regolith by cosmic rays. Lower epithermal neutron counts signal hydrogen atoms bound in subsurface water molecules down to 1 meter depth.',
      engineeringRationale: 'The primary prospecting sensor (heritage: NASA VIPER / Lunar Prospector). Maps hydrogen abundance as the rover drives.'
    },
    {
      id: 'inst-nirvss',
      name: 'NIRVSS — Near-Infrared Volatiles Spectrometer',
      category: 'Scientific Instrument',
      cost: 18,
      mass: 16,
      powerDraw: 22,
      scanTime: 1,
      scienceYield: 45,
      detectsVolatiles: true,
      description: 'Illuminates the regolith with tuned infrared LEDs and analyzes reflected light to detect water ice absorption bands at 1.5, 2.0, and 3.0 microns, distinguishing surface frost from bound minerals.',
      engineeringRationale: 'Provides definitive optical verification of crystalline water ice, carbon dioxide, and methane frosts on the lunar surface.'
    },
    {
      id: 'inst-trident-drill',
      name: 'TRIDENT — 1-Meter Cryogenic Percussive Rotary Drill',
      category: 'Scientific Instrument',
      cost: 29,
      mass: 35,
      powerDraw: 65, // High power draw
      scanTime: 2,
      scienceYield: 75,
      extractsCores: true,
      description: 'Heavy percussive hammer drill capable of penetrating cryogenic regolith hard as granite down to 100 cm, bringing deep subterranean ice samples to the surface for mass spectrometry.',
      engineeringRationale: 'Unlocks the highest scientific scores by retrieving pristine primordial volatiles buried beneath the desiccation layer.'
    },
    {
      id: 'inst-shadowcam',
      name: 'ShadowCam High-Sensitivity Lunar Micro-Imager',
      category: 'Scientific Instrument',
      cost: 11,
      mass: 8,
      powerDraw: 10,
      scanTime: 1,
      scienceYield: 25,
      detectsTerrain: true,
      description: 'Ultra-sensitive low-light camera (200x more sensitive than LROC NAC) that images inside pitch-black PSRs using faint secondary earthshine and starlight reflected off crater walls.',
      engineeringRationale: 'Reveals hazards, boulders, and terrain relief in pitch-black shadow traps where human eyes and regular cameras see absolute darkness.'
    }
  ]
};
