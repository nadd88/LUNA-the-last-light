// NASA Data References & Scientific Attribution
// Distinguishes actual empirical NASA scientific datasets from procedural simulation and gameplay models

export const NASA_REFERENCES = [
  {
    instrument: 'LOLA (Lunar Orbiter Laser Altimeter)',
    mission: 'Lunar Reconnaissance Orbiter (LRO)',
    launchYear: '2009 - Present',
    scientificRole: 'High-precision topographic elevation and slope mapping of the lunar poles down to meter-scale vertical accuracy.',
    howUsedInGame: 'Calibrates digital elevation profiles, slope hazards, and crater depth contours across all 5 candidate landing sites.',
    nasaFact: 'LOLA has fired over 4 billion laser pulses at the Moon, revealing that the lunar south pole features elevated massifs with near-permanent light alongside impact depressions over 4 km deep.',
    url: 'https://lunar.gsfc.nasa.gov/lola/'
  },
  {
    instrument: 'Diviner Lunar Radiometer Experiment',
    mission: 'Lunar Reconnaissance Orbiter (LRO)',
    launchYear: '2009 - Present',
    scientificRole: 'Continuous global infrared radiometric mapping of surface and sub-surface lunar temperatures.',
    howUsedInGame: 'Calibrates thermal equilibrium calculations: surface temperatures drop to ~25K-38K (-248°C to -235°C) in shadowed crater floors vs ~220K (-53°C) on sunlit rims.',
    nasaFact: 'Diviner recorded an extreme nighttime temperature of 25 Kelvin (-248°C) in Hermite Crater, making it one of the coldest naturally occurring environments measured in the Solar System.',
    url: 'https://diviner.ucla.edu/'
  },
  {
    instrument: 'ShadowCam',
    mission: 'KPLO (Danuri) / NASA Instrument',
    launchYear: '2022 - Present',
    scientificRole: 'Ultra-sensitive optical imaging of Permanently Shadowed Regions (PSRs) using secondary reflected light.',
    howUsedInGame: 'Informs optical visibility, micro-boulder distribution, and terrain relief inside pitch-black crater cold traps.',
    nasaFact: 'ShadowCam is 200 times more sensitive to light than the LROC Narrow Angle Camera, capturing high-resolution images inside permanently shadowed craters using only secondary earthshine or light scattered from crater rims.',
    url: 'https://shadowcam.sese.asu.edu/'
  },
  {
    instrument: 'LEND / LP-NS (Neutron Spectrometers)',
    mission: 'Lunar Prospector (1998) / LRO (2009 - Present)',
    launchYear: '1998 / 2009 - Present',
    scientificRole: 'Orbital epithermal neutron spectrometry mapping hydrogen abundance (Water-Equivalent Hydrogen, WEH) in the top meter of lunar regolith.',
    howUsedInGame: 'Informs the site-level water ice concentration estimates and motivates the rover\'s Neutron Spectrometer System (NSS) scanning mechanic.',
    nasaFact: 'Neutron spectrometers detect hydrogen by observing the suppression of epithermal neutrons kicked out by cosmic rays, revealing high-latitude hydrogen concentrations up to 10% water equivalent.',
    url: 'https://science.nasa.gov/mission/lunar-reconnaissance-orbiter/'
  },
  {
    instrument: 'LCROSS (Lunar CRater Observation and Sensing Satellite)',
    mission: 'NASA LCROSS / Centaur Upper Stage Impact',
    launchYear: '2009 (Impact Oct 9, 2009)',
    scientificRole: 'Direct in-situ spectrometer analysis of the Cabeus crater volatile plume kicked up by the Centaur rocket impact.',
    howUsedInGame: 'Validates the chemical composition of volatile ice deposits in LUNA (water ice, carbon dioxide, ammonia, and light hydrocarbons).',
    nasaFact: 'LCROSS confirmed the presence of 5.5 ± 1.4% water ice by mass in the Cabeus plume, definitively proving that lunar cold traps harbor substantial water resources.',
    url: 'https://www.nasa.gov/mission_pages/LCROSS/main/index.html'
  },
  {
    instrument: 'LROC NAC (Narrow Angle Camera)',
    mission: 'Lunar Reconnaissance Orbiter (LRO)',
    launchYear: '2009 - Present',
    scientificRole: 'High-resolution targeted visible imaging (0.5 meters per pixel) for landing site safety and terrain geomorphology.',
    howUsedInGame: 'Provides the visual geomorphological ground-truth for boulder fields, impact craters, and rover traverse safety assessments.',
    nasaFact: 'LROC has mapped the Artemis candidate landing sites with unprecedented sub-meter resolution, identifying safe touchdown zones on elevated ridges.',
    url: 'https://www.lroc.asu.edu/'
  },
  {
    instrument: 'VIPER Science Suite (NSS, NIRVSS, TRIDENT)',
    mission: 'Volatiles Investigating Polar Exploration Rover',
    launchYear: 'NASA CLPS Initiative',
    scientificRole: 'Direct surface and sub-surface prospecting for water ice at the Lunar South Pole using neutron sensing, infrared spectrometry, and a 1-meter percussion drill.',
    howUsedInGame: 'The player configures the exact science payload planned for VIPER: Neutron Spectrometer, Near-IR Volatiles Spectrometer, and TRIDENT drill.',
    nasaFact: 'VIPER was designed specifically to answer the core questions modeled in this game: navigating into pitch-black shadow, drilling into cryogenic permafrost, and escaping back into sunlight before batteries drain.',
    url: 'https://science.nasa.gov/mission/viper/'
  },
  {
    instrument: 'NASA Moon Trek & Planetary Data System (PDS)',
    mission: 'NASA Solar System Treks / PDS Geosciences Node',
    launchYear: 'Ongoing Archival Repositories',
    scientificRole: 'Interactive GIS analysis portals and archival repositories hosting calibrated lunar topographic, thermal, and geochemical mission datasets.',
    howUsedInGame: 'Serves as the scientific data source for coordinates, LOLA altimetry profiles, and polar GIS visualization.',
    nasaFact: 'NASA Moon Trek allows scientists and the public to freely explore 2D and 3D LOLA topography, Diviner thermal grids, and LROC mosaics across the entire lunar surface.',
    url: 'https://trek.nasa.gov/moon/'
  }
];

export const SCIENTIFIC_ASSUMPTIONS = {
  accuracyDisclaimer: 'LUNA: THE LAST LIGHT is an educational spaceflight simulation game designed for the NASA Space Apps Challenge 2026. The simulation models physical processes based on published NASA datasets (LOLA, Diviner, LEND, ShadowCam, LCROSS) while transparently documenting procedural gameplay abstractions.',
  
  dataProvenanceCategories: {
    empiricalNasaObservations: [
      'Topographic elevation profiles and crater dimensions derived from LOLA laser altimetry.',
      'Surface temperature extremes (25K-38K in cold traps, ~220K on sunlit rims) measured by Diviner radiometry.',
      'Absolute 0.0 W direct solar irradiance inside geometric Permanently Shadowed Regions (PSRs) resulting from 1.54° axial tilt.',
      'Detection of bulk water-equivalent hydrogen via epithermal neutron deficits (Lunar Prospector, LEND).',
      'Presence of volatile water ice, CO2, and ammonia confirmed by the LCROSS Cabeus impact plume.'
    ],
    scientificInterpretations: [
      'Thermal lumped-capacitance rover model approximating Stefan-Boltzmann radiative cooling and internal avionics waste heat dissipation.',
      'Low solar elevation capture efficiency (~0.85-0.96) modeling vertical mast intercept angles against grazing horizontal sunlight.',
      'Line-of-sight RF link degradation and crater rim occultation accounting for lunar orbital libration (±6.7°).'
    ],
    proceduralSimulationModels: [
      'Discrete sub-surface ice pocket coordinates and concentrations (e.g. 4.5% to 22.8% wt eq): Orbital neutron data has coarse spatial resolution (~10-45 km footprint); exact micro-scale patchiness and burial depth under the dry desiccation layer are procedurally generated for interactive prospecting.',
      'Surface regolith slip events and boulder hazard locations simulated based on slope angle distributions rather than point-by-point rock catalogs.'
    ],
    gameplayAbstractions: [
      'Accelerated time scaling: 1 simulation tick represents ~1 minute of physical time.',
      'Simplified binary science scoring points and letter grades (A+ to F) to evaluate mission efficiency and vehicle survival.'
    ]
  },

  documentedAssumptions: [
    {
      domain: 'Solar Illumination in PSRs',
      reality: 'Because the Moon has an axial tilt of only 1.543° relative to the ecliptic, the Sun stays within 1.5° of the horizon at the south pole. Crater interiors have been geometrically shielded from direct sunlight for billions of years.',
      gameModel: 'Direct solar power is strictly 0.0 Watts inside any designated PSR zone. No exceptions. Solar generation drops to absolute zero.',
      isEmpirical: true,
      scientificCitation: 'Mazarico et al. (2011), Icarus, "Illumination conditions of the lunar polar regions using LOLA topography."'
    },
    {
      domain: 'Thermal Equilibrium',
      reality: 'Radiative cooling into deep space follows the Stefan-Boltzmann law P_rad = ε * σ * A * (T^4 - T_ambient^4), coupled with internal conductive heat pipes, electronics waste heat, and regolith contact.',
      gameModel: 'Modeled using a lumped-capacitance equation balancing electronics waste heat (65% conversion), active resistive heating, and thermal exchange with local ambient (Diviner calibrated: 40K in PSR, 220K in sunlight).',
      isEmpirical: true,
      scientificCitation: 'Paige et al. (2010), Science, "Diviner Lunar Radiometer Observations of Cold Traps in the Moon\'s South Polar Region."'
    },
    {
      domain: 'Water Ice Distribution & Uncertainty',
      reality: 'Orbital neutron spectrometers (LP-NS, LEND) detect bulk hydrogen at 10-45 km spatial resolution. Whether this hydrogen is crystalline water ice, surface frost, or mineral-bound hydroxyl is heterogeneous and buried under an estimated 10-50 cm dry regolith desiccation layer.',
      gameModel: 'Estimated site average concentrations reflect orbital data, while discrete micro-pockets are procedurally placed at depths between 0.15m and 1.2m, requiring NSS detection and TRIDENT drilling.',
      isEmpirical: false,
      scientificCitation: 'Siegler et al. (2016), Nature, "Lunar true polar wander inferred from the distribution of hydrogen deposits."'
    },
    {
      domain: 'Direct-to-Earth (DTE) Communications',
      reality: 'Earth appears just above or below the lunar south pole horizon as the Moon librates over a 27.3-day draconic cycle. Deep crater rims create line-of-sight blockage.',
      gameModel: 'Omnidirectional and direct dishes lose carrier signal when descending beyond crater rim thresholds unless an orbital relay satellite (Gateway/Pathfinder) is equipped.',
      isEmpirical: true,
      scientificCitation: 'De Rosa et al. (2012), IEEE Aerospace, "Lunar South Pole Communications and Navigation Architecture."'
    }
  ]
};

export const DATA_PROVENANCE = SCIENTIFIC_ASSUMPTIONS.dataProvenanceCategories;
