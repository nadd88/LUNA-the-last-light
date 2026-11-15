// LUNA User-Facing Terminology & Dictionary
// Single source of truth for Explorer (public/student-friendly) vs Engineer (NASA technical) terms.

export const LABELS = {
  // General Roles & Themes
  role: {
    simple: 'Mission Engineer',
    engineer: 'Flight Engineer (Payload)',
    tooltip: 'Your role managing rover engineering, survival, and volatile prospecting operations.'
  },

  // Environmental Zones
  psr: {
    simple: 'Dark Zone',
    simpleWithClarifier: 'Dark Zone (permanent shadow)',
    engineer: 'Permanently Shadowed Region (PSR)',
    short: 'Dark Zone',
    tooltip: 'Craters where low polar sunlight never hits the floor, creating cold traps at -235°C (38K).'
  },
  sunlitRidge: {
    simple: 'Sunlit Ridge',
    engineer: 'Peak Illumination Ridge',
    tooltip: 'Elevated crater rim bathed in grazing sunlight where solar panels generate continuous power.'
  },

  // Mission Timing
  met: {
    simple: 'Mission Time',
    engineer: 'Mission Elapsed Time (MET)',
    tooltip: 'Elapsed time since touchdown on the lunar surface.'
  },

  // Vehicle Temperature & Thermal
  coreTemp: {
    simple: 'Rover Temperature',
    engineer: 'Avionics Core Temperature',
    tooltip: 'Internal electronics temperature. Extreme cold below minimum threshold will freeze and destroy the rover.'
  },
  thermalStatus: {
    simple: {
      optimal: 'OK (Warm)',
      chill: 'OK (Cooling)',
      cryogenic: 'Cold (Turn on Heaters)',
      critical: 'CRITICAL (Freezing Risk!)',
      overheat: 'Too Hot'
    },
    engineer: {
      optimal: 'Nominal (+10°C to -20°C)',
      chill: 'Cryogenic Warning (-20°C to -60°C)',
      cryogenic: 'Cryogenic Stress (-60°C to -110°C)',
      critical: 'Critical Cold Violation (<-110°C)',
      overheat: 'Thermal Dissipation Exceeded'
    },
    tooltip: 'Avionics thermal status. Freezing temperatures irreversibly damage batteries and electronics.'
  },

  // Electrical Power & Net Energy
  netPower: {
    simple: 'Power Balance',
    charging: 'Charging (+)',
    draining: 'Draining (-)',
    balanced: 'Balanced (0)',
    engineer: 'Net Power Balance (P_net)',
    tooltip: 'Difference between solar power generated and electrical power consumed by motors, heaters, and sensors.'
  },
  solarGen: {
    simple: 'Sunlight Energy',
    engineer: 'Photovoltaic Array Output (W)',
    tooltip: 'Electricity harvested from polar sunlight. Drops strictly to 0.0 Watts in the Dark Zone.'
  },
  powerDraw: {
    simple: 'Power Used',
    engineer: 'Total Electrical Load (W)',
    tooltip: 'Combined electrical power consumed by driving motors, thermal heaters, avionics, and sensors.'
  },

  // Battery Storage
  battery: {
    simple: 'Battery Level',
    engineer: 'Battery State of Charge (Wh)',
    tooltip: 'Remaining stored energy. When battery reaches 0%, the rover loses all life support and mission fails.'
  },

  // Communications & Tracking
  comm: {
    simple: 'Signal to Earth',
    engineer: 'Direct-to-Earth Link Margin (dB)',
    tooltip: 'Radio link back to NASA Earth stations. Descending deep behind crater rims blocks the signal.'
  },
  commStatus: {
    strong: { simple: 'Strong Connection', engineer: 'Direct Earth S-Band / X-Band (+12 dB)' },
    marginal: { simple: 'Weak Connection', engineer: 'Marginal Carrier Lock (+3 dB)' },
    occulted: { simple: 'Blocked Signal', engineer: 'RF Horizon Occulted (LOS)' },
    relay: { simple: 'Relay Connected', engineer: 'Lunar Gateway Halo Relay Locked' },
    tooltip: 'Telecom signal status connecting the rover to NASA Mission Control on Earth.'
  },

  // Exploration Depths
  psrDepth: {
    simple: 'Distance into the Dark',
    engineer: 'Depth into PSR Cavity (m)',
    tooltip: 'Traverse distance down into the permanently shadowed crater floor.'
  },

  // Scientific Instruments
  nss: {
    simple: 'Ice Detector',
    engineer: 'Neutron Spectrometer System (NSS)',
    tooltip: 'Detects underground hydrogen up to 1 meter beneath dry regolith dust without digging.'
  },
  nirvss: {
    simple: 'Heat & Minerals Camera',
    engineer: 'Near-Infrared Volatiles Spectrometer (NIRVSS)',
    tooltip: 'Analyzes surface composition, volatiles, and ground temperatures.'
  },
  trident: {
    simple: 'Ice Drill',
    engineer: 'TRIDENT 1-Meter Percussion Drill',
    tooltip: 'Drills deep into frozen lunar ground to extract and verify water ice samples.'
  },
  shadowcam: {
    simple: 'Night-Vision Camera',
    engineer: 'ShadowCam Ultra-Sensitive Optical Imager',
    tooltip: 'Ultra-sensitive camera seeing in pitch dark craters using faint reflected Earthlight.'
  },

  // Rover Hardware & Subsystems
  mli: {
    simple: 'Insulation Blanket',
    engineer: 'Multi-Layer Insulation (MLI)',
    tooltip: 'Thermal radiation barrier reflecting internal heat and slowing freeze rate in deep shadows.'
  },
  rhu: {
    simple: 'Nuclear Heat Pellet',
    engineer: 'Radioisotope Heater Unit (RHU)',
    tooltip: 'Safe decaying isotope pellet producing perpetual passive warmth even in eternal darkness.'
  },
  coldLimit: {
    simple: 'Cold Survival Limit',
    engineer: 'Cryogenic Survival Threshold (°C)',
    tooltip: 'The absolute lowest ambient temperature this rover hardware configuration can endure.'
  },

  // Driving & Speed Modes
  speedMode: {
    cautious: { simple: 'Careful (Saves Battery)', engineer: 'Cautious (4.5 m/s)' },
    nominal: { simple: 'Normal', engineer: 'Nominal (9.0 m/s)' },
    dash: { simple: 'Fast (High Drain)', engineer: 'Dash / Boost (16.0 m/s)' },
    tooltip: 'Drive speed profile. Faster speeds cover ground quickly but consume battery energy faster.'
  },

  // Heater Operating Modes
  heaterMode: {
    off: { simple: 'Off (Saves Power)', engineer: 'OFF (0 W)' },
    low: { simple: 'Low Heat', engineer: 'LOW (15 W)' },
    high: { simple: 'High Heat (Anti-Freeze)', engineer: 'HIGH (39 W)' },
    auto: { simple: 'Auto (Recommended)', engineer: 'AUTO (Thermostatic)' },
    tooltip: 'Electric resistive heaters protecting electronics from freezing.'
  },

  // Key Actions
  actions: {
    scan: {
      label: 'Scan Ground',
      simpleDesc: 'Look for buried water ice nearby',
      engineerDesc: 'Engage NSS & NIRVSS spectral interrogation'
    },
    drill: {
      label: 'Drill Sample',
      simpleDesc: 'Extract ice sample from ground (requires ice detected)',
      engineerDesc: 'Deploy TRIDENT 1m rotary-percussion drill string'
    },
    wait: {
      label: 'Wait for Sun / Recharge',
      simpleDesc: 'Rest in sunlight to recharge battery and warm up',
      engineerDesc: 'Stationary dwell charging sequence'
    }
  }
};
