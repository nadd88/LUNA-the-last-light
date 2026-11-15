// NASA Data References & Scientific Attribution
// Distinguishes actual NASA scientific data from simplified gameplay models

export const NASA_REFERENCES = [
  {
    instrument: 'LOLA (Lunar Orbiter Laser Altimeter)',
    mission: 'Lunar Reconnaissance Orbiter (LRO)',
    launchYear: '2009 - Present',
    scientificRole: 'High-precision topographic elevation mapping of the lunar poles down to meter-scale vertical accuracy.',
    howUsedInGame: 'Powers the slope hazards, elevation profiles, and crater depths for all 5 landing sites in LUNA.',
    nasaFact: 'LOLA has fired over 4 billion laser pulses at the Moon, revealing that the lunar south pole has peaks of eternal light and craters over 4 km deep.',
    url: 'https://lunar.gsfc.nasa.gov/lola.html'
  },
  {
    instrument: 'ShadowCam',
    mission: 'KPLO (Danuri) / NASA Instrument',
    launchYear: '2022 - Present',
    scientificRole: 'Ultra-sensitive optical imaging of Permanently Shadowed Regions (PSRs) using secondary light.',
    howUsedInGame: 'Informs the low-light visibility, boulder density, and terrain hazards inside pitch-black cold traps.',
    nasaFact: 'ShadowCam is 200 times more sensitive to light than the LROC Narrow Angle Camera, capturing detailed views inside craters using only earthshine or light scattered from crater rims.',
    url: 'https://shadowcam.sese.asu.edu/'
  },
  {
    instrument: 'Diviner Lunar Radiometer Experiment',
    mission: 'Lunar Reconnaissance Orbiter (LRO)',
    launchYear: '2009 - Present',
    scientificRole: 'Continuous global infrared thermal mapping of surface and sub-surface lunar temperatures.',
    howUsedInGame: 'Calibrates the thermal equilibrium physics model: temperatures drop to ~38K (-235°C) in shadowed floors vs ~220K (-53°C) in sunlight.',
    nasaFact: 'Diviner measured a nighttime temperature of 25 Kelvin (-248°C) in Hermite Crater, making it the coldest recorded temperature anywhere in the Solar System — colder even than the surface of Pluto.',
    url: 'https://diviner.ucla.edu/'
  },
  {
    instrument: 'VIPER Science Payload (NSS, NIRVSS, TRIDENT)',
    mission: 'Volatiles Investigating Polar Exploration Rover',
    launchYear: 'NASA CLPS Initiative',
    scientificRole: 'Prospecting for water ice and volatile resources at the Lunar South Pole using neutron spectrometry and a 1-meter drill.',
    howUsedInGame: 'The player configures the exact science suite carried by VIPER: Neutron Spectrometer, Near-IR Spectrometer, and TRIDENT drill.',
    nasaFact: 'VIPER was designed specifically to tackle the exact core challenge modeled in this game: navigating into pitch-black shadow, drilling into cryogenic permafrost, and escaping back into sunlight before batteries drain.',
    url: 'https://www.nasa.gov/viper'
  }
];

export const SCIENTIFIC_ASSUMPTIONS = {
  accuracyDisclaimer: 'LUNA: THE LAST LIGHT is an educational mission design game built for the NASA Space Apps Challenge 2026. While based on empirical LOLA, Diviner, and ShadowCam datasets, several physical aspects are streamlined for accessible interactive gameplay.',
  documentedAssumptions: [
    {
      domain: 'Solar Illumination in PSRs',
      reality: 'Permanently Shadowed Regions (PSRs) have geometric shielding from direct solar rays for billions of years due to the Moon\'s tiny axial tilt of only 1.54°.',
      gameModel: 'Direct solar power is strictly 0.0 Watts inside any designated PSR zone. No exceptions. Solar generation drops to absolute zero.',
      isEmpirical: true
    },
    {
      domain: 'Thermal Equilibrium',
      reality: 'Radiative cooling in vacuum follows the Stefan-Boltzmann law P_rad = ε * σ * A * (T^4 - T_ambient^4), coupled with internal conductive heat pipes and regolith contact.',
      gameModel: 'Modeled using a lumped-capacitance thermal equation balancing internal heat dissipation from avionics, electrical heaters, and radiative cooling to ambient crater walls (40K in PSR, 220K in sun).',
      isEmpirical: true
    },
    {
      domain: 'Water Ice Concentration',
      reality: 'Orbital neutron spectrometers detect hydrogen equivalent to 1% - 10% water by weight within the top meter of polar regolith, but exact patchiness is unknown until surface prospecting.',
      gameModel: 'Estimated ice concentrations scale with penetration depth into the cold trap and terrain depression depth, with procedural sample yield variations.',
      isEmpirical: false
    },
    {
      domain: 'Direct-to-Earth (DTE) Communications',
      reality: 'Earth appears just above or below the lunar south pole horizon as the Moon librates over a 27.3-day cycle. Crater rims create line-of-sight blockage.',
      gameModel: 'Standard antennas lose signal when descending beyond crater rim thresholds unless an orbital relay link (e.g. Lunar Pathfinder or Gateway) is selected.',
      isEmpirical: true
    }
  ]
};
