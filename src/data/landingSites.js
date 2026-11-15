// Real NASA Lunar South Pole Exploration Landing Sites
// Data referenced from LOLA (Lunar Orbiter Laser Altimeter), LROC, and Diviner instruments

export const LANDING_SITES = [
  {
    id: 'shackleton-ridge',
    name: 'Shackleton Crater Connecting Ridge',
    coords: '89.9°S, 0.0°E',
    elevation: '+1,240 m',
    peakIllumination: 88, // % of lunar cycle
    slopeHazard: 'Moderate (12°-18°)',
    psrDistance: 450, // meters to permanently shadowed floor
    estimatedIceConcentration: 'High (4.5% - 7.8% wt eq)',
    difficulty: 'Challenging',
    badge: 'Primary Artemis Candidate',
    description: 'Situated on the razor-sharp rim of Shackleton Crater (21 km diameter, 4.2 km deep). Peak illumination allows long dwell times in sunlight before descending down treacherous slopes into one of the oldest cold traps on the Moon.',
    scienceTarget: 'Sub-surface cryogenic water ice within the 40 Kelvin interior micro-environment.',
    elevationProfile: [
      { distance: 0, elevation: 1240, illumination: 92, temp: -50 },
      { distance: 150, elevation: 1120, illumination: 78, temp: -85 },
      { distance: 300, elevation: 840, illumination: 35, temp: -160 },
      { distance: 450, elevation: 320, illumination: 0, temp: -235 },
      { distance: 600, elevation: -200, illumination: 0, temp: -248 }
    ],
    tacticalTip: 'High initial solar power on the rim, but steep slopes consume 30% more mobility power during descent.',
    iceDepositProfile: {
      description: 'Deep cryogenic deposits in Shackleton crater floor',
      pockets: [
        { x: 260, y: 280, concentration: 5.2, depth: 0.25 },
        { x: 380, y: 340, concentration: 7.1, depth: 0.5 },
        { x: 220, y: 430, concentration: 8.4, depth: 0.75 },
        { x: 430, y: 490, concentration: 11.2, depth: 1.0 },
        { x: 310, y: 530, concentration: 13.5, depth: 1.2 }
      ]
    }
  },
  {
    id: 'malapert-mountain',
    name: 'Malapert Mountain (Massif)',
    coords: '84.9°S, 12.9°E',
    elevation: '+5,000 m',
    peakIllumination: 93,
    slopeHazard: 'Gentle to Moderate (6°-11°)',
    psrDistance: 920,
    estimatedIceConcentration: 'Moderate (2.2% - 4.1% wt eq)',
    difficulty: 'Moderate',
    badge: 'Premier Comm Hub',
    description: 'A massive 5,000-meter peak offering near-continuous direct line-of-sight communication with Earth (DTE). The summit serves as an ultra-stable basecamp before venturing down to shadowed valleys.',
    scienceTarget: 'Volatile transport gradient from highland peak to shadowed peripheral craters.',
    elevationProfile: [
      { distance: 0, elevation: 5000, illumination: 95, temp: -35 },
      { distance: 300, elevation: 4700, illumination: 85, temp: -60 },
      { distance: 600, elevation: 3900, illumination: 45, temp: -140 },
      { distance: 920, elevation: 2800, illumination: 0, temp: -220 },
      { distance: 1200, elevation: 2200, illumination: 0, temp: -238 }
    ],
    tacticalTip: 'Earth communication is virtually uninterrupted (+12 dB margin), but travel distance to the nearest cold trap is long.',
    iceDepositProfile: {
      description: 'Dispersed low-to-moderate deposits in peripheral shadowed valleys',
      pockets: [
        { x: 230, y: 360, concentration: 2.4, depth: 0.35 },
        { x: 370, y: 410, concentration: 3.1, depth: 0.6 },
        { x: 470, y: 480, concentration: 3.8, depth: 0.85 },
        { x: 190, y: 520, concentration: 4.1, depth: 1.1 }
      ]
    }
  },
  {
    id: 'connecting-ridge',
    name: 'De Gerlache - Shackleton Ridge',
    coords: '88.5°S, 68.7°W',
    elevation: '+1,850 m',
    peakIllumination: 82,
    slopeHazard: 'Low (4°-8°)',
    psrDistance: 320,
    estimatedIceConcentration: 'Very High (5.8% - 9.2% wt eq)',
    difficulty: 'Balanced',
    badge: 'Optimal Rover Traverse',
    description: 'A relatively flat topological bridge connecting the rims of De Gerlache and Shackleton craters. Offers gradual access ramps into permanently shadowed sub-craters with shallow slope angles.',
    scienceTarget: 'High-purity superficial regolith ice and trapped carbon dioxide/ammonia volatiles.',
    elevationProfile: [
      { distance: 0, elevation: 1850, illumination: 86, temp: -55 },
      { distance: 100, elevation: 1800, illumination: 75, temp: -80 },
      { distance: 200, elevation: 1680, illumination: 40, temp: -150 },
      { distance: 320, elevation: 1450, illumination: 0, temp: -230 },
      { distance: 500, elevation: 1200, illumination: 0, temp: -245 }
    ],
    tacticalTip: 'Shortest distance to dense ice deposits. Gentle slopes minimize battery drain during entry and escape.',
    iceDepositProfile: {
      description: 'Abundant high-purity volatile deposits on shallow access ramps',
      pockets: [
        { x: 240, y: 255, concentration: 6.2, depth: 0.15 },
        { x: 360, y: 280, concentration: 7.8, depth: 0.3 },
        { x: 180, y: 360, concentration: 8.9, depth: 0.5 },
        { x: 420, y: 410, concentration: 9.4, depth: 0.65 },
        { x: 300, y: 480, concentration: 10.8, depth: 0.85 },
        { x: 220, y: 530, concentration: 12.1, depth: 1.0 }
      ]
    }
  },
  {
    id: 'haworth-crater',
    name: 'Haworth Deep Depression',
    coords: '87.4°S, 5.2°W',
    elevation: '-2,100 m',
    peakIllumination: 68,
    slopeHazard: 'High (16°-24°)',
    psrDistance: 180,
    estimatedIceConcentration: 'Extreme (> 10% wt eq predicted)',
    difficulty: 'Extreme',
    badge: 'Deep Cold Trap',
    description: 'A primordial depression shielded by gigantic crater walls. Solar illumination is transient and scarce even on the rim, but neutron spectrometry models indicate highest volatile retention in the south pole sector.',
    scienceTarget: 'Intact pre-solar isotopic records and ancient impactor volatile signatures.',
    elevationProfile: [
      { distance: 0, elevation: -1200, illumination: 70, temp: -90 },
      { distance: 80, elevation: -1450, illumination: 40, temp: -170 },
      { distance: 180, elevation: -2100, illumination: 0, temp: -242 },
      { distance: 300, elevation: -2600, illumination: 0, temp: -250 },
      { distance: 450, elevation: -2900, illumination: 0, temp: -252 }
    ],
    tacticalTip: 'Extremely short battery recovery windows. Only robust thermal designs with high-capacity cells can survive here.',
    iceDepositProfile: {
      description: 'Primordial extreme volatile cold trap with deep high-grade ice pockets',
      pockets: [
        { x: 280, y: 250, concentration: 11.2, depth: 0.2 },
        { x: 170, y: 300, concentration: 13.8, depth: 0.35 },
        { x: 400, y: 360, concentration: 15.6, depth: 0.55 },
        { x: 240, y: 430, concentration: 18.2, depth: 0.8 },
        { x: 360, y: 490, concentration: 20.5, depth: 1.0 },
        { x: 470, y: 535, concentration: 22.8, depth: 1.2 }
      ]
    }
  },
  {
    id: 'faustini-rim',
    name: 'Faustini Crater Plateau',
    coords: '87.3°S, 77.0°E',
    elevation: '+890 m',
    peakIllumination: 84,
    slopeHazard: 'Low to Moderate (8°-12°)',
    psrDistance: 510,
    estimatedIceConcentration: 'High (4.0% - 6.5% wt eq)',
    difficulty: 'Standard',
    badge: 'Science Sweet Spot',
    description: 'A wide plateau offering clear staging ground, smooth regolith plains, and well-mapped boulder distribution from ShadowCam high-resolution optical surveys.',
    scienceTarget: 'Stratified regolith ice deposits and space-weathering boundary layers.',
    elevationProfile: [
      { distance: 0, elevation: 890, illumination: 88, temp: -48 },
      { distance: 180, elevation: 760, illumination: 65, temp: -105 },
      { distance: 350, elevation: 520, illumination: 25, temp: -180 },
      { distance: 510, elevation: 180, illumination: 0, temp: -234 },
      { distance: 700, elevation: -80, illumination: 0, temp: -246 }
    ],
    tacticalTip: 'Balanced profile for generalist rovers. Safe staging with moderate traverse distance to the shadow line.',
    iceDepositProfile: {
      description: 'Stratified regolith ice layers across plateau cold trap floor',
      pockets: [
        { x: 250, y: 290, concentration: 4.5, depth: 0.3 },
        { x: 390, y: 340, concentration: 5.4, depth: 0.45 },
        { x: 180, y: 410, concentration: 6.1, depth: 0.65 },
        { x: 330, y: 470, concentration: 6.8, depth: 0.85 },
        { x: 450, y: 520, concentration: 7.9, depth: 1.0 }
      ]
    }
  }
];

/**
 * Returns procedural, landing-site-specific ice deposits for the simulation
 * Clones template pockets so in-game actions (scan, drill) don't mutate static configurations
 */
export function getSiteIceDeposits(site) {
  if (!site) return [];
  const foundSite = LANDING_SITES.find((s) => s.id === site.id) || site;
  if (foundSite.iceDepositProfile?.pockets) {
    return foundSite.iceDepositProfile.pockets.map((dep, idx) => ({
      id: `${foundSite.id}-dep-${idx}`,
      x: dep.x,
      y: dep.y,
      concentration: dep.concentration,
      depth: dep.depth,
      scanned: false,
      drilled: false
    }));
  }
  // Generic fallback
  return [
    { id: 'dep-1', x: 260, y: 280, concentration: 4.8, depth: 0.2, scanned: false, drilled: false },
    { id: 'dep-2', x: 380, y: 340, concentration: 7.2, depth: 0.5, scanned: false, drilled: false },
    { id: 'dep-3', x: 220, y: 440, concentration: 11.4, depth: 0.8, scanned: false, drilled: false },
    { id: 'dep-4', x: 420, y: 520, concentration: 14.8, depth: 1.0, scanned: false, drilled: false }
  ];
}
