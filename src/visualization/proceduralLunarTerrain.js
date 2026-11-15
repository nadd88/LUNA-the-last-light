// Procedural Lunar South Pole Terrain Generation
// Deterministic multi-octave geological elevation model matching the 2D tactical simulation coordinates
// Note: This is an educational visualization model inspired by NASA LOLA topography and Apollo lunar geology,
// not a direct reproduction of raw LOLA point clouds.

// Simulation bounds: 2D map is [0, 600] x [0, 600]
// 3D World bounds: [-150, 150] x [-150, 150]
export const MAP_SIZE_2D = 600;
export const WORLD_SIZE_3D = 300; // -150 to +150 in X and Z
export const SCALE_RATIO = WORLD_SIZE_3D / MAP_SIZE_2D; // 0.5

// Map 2D coordinates (x: 0..600, y: 0..600) to 3D world (X: -150..150, Z: -150..150)
export function map2DToWorld3D(x2d, y2d) {
  return {
    x: (x2d - MAP_SIZE_2D / 2) * SCALE_RATIO,
    z: (y2d - MAP_SIZE_2D / 2) * SCALE_RATIO
  };
}

// Map 3D world (X, Z) back to 2D coordinates (x2d, y2d)
export function world3DToMap2D(x3d, z3d) {
  return {
    x: x3d / SCALE_RATIO + MAP_SIZE_2D / 2,
    y: z3d / SCALE_RATIO + MAP_SIZE_2D / 2
  };
}

// Primary and secondary craters (correlated with 2D tactical simulation and NASA South Pole targets)
export const CRATERS_2D = [
  // Primary impact basins (2D tactical simulation alignment)
  { x: 120, y: 90,  r: 28, depth: 5.5,  rimHeight: 1.6, inSun: true,  name: 'Shackleton North Ridge Pit' },
  { x: 480, y: 110, r: 38, depth: 7.2,  rimHeight: 2.2, inSun: true,  name: 'Connecting Ridge Crater A' },
  { x: 160, y: 320, r: 46, depth: 8.8,  rimHeight: 2.6, inSun: false, name: 'De Gerlache Terrace Depression' },
  { x: 380, y: 460, r: 68, depth: 13.5, rimHeight: 3.8, inSun: false, name: 'Shoemaker Basin Cold Trap' },
  { x: 180, y: 520, r: 34, depth: 6.2,  rimHeight: 1.9, inSun: false, name: 'Faustini Escarpment Pit' },

  // Secondary ancient degraded craters (overlapping geological history)
  { x: 290, y: 180, r: 22, depth: 3.2,  rimHeight: 0.9, inSun: true,  name: 'Central Ridge Crater' },
  { x: 90,  y: 410, r: 26, depth: 4.8,  rimHeight: 1.2, inSun: false, name: 'Western Shadow Crater' },
  { x: 490, y: 340, r: 32, depth: 5.4,  rimHeight: 1.5, inSun: false, name: 'Eastern Terrace Pit' },
  { x: 260, y: 560, r: 20, depth: 3.8,  rimHeight: 1.0, inSun: false, name: 'Southern Deep Pocket' },

  // Secondary micro-impact pits (NASA Apollo/LRO micro-topography)
  { x: 205, y: 80,  r: 12, depth: 2.1,  rimHeight: 0.65, inSun: true },
  { x: 375, y: 85,  r: 14, depth: 2.4,  rimHeight: 0.75, inSun: true },
  { x: 80,  y: 195, r: 16, depth: 2.7,  rimHeight: 0.85, inSun: true },
  { x: 410, y: 220, r: 15, depth: 2.6,  rimHeight: 0.80, inSun: true },
  { x: 240, y: 285, r: 18, depth: 3.0,  rimHeight: 0.90, inSun: false },
  { x: 335, y: 360, r: 14, depth: 2.3,  rimHeight: 0.70, inSun: false },
  { x: 125, y: 480, r: 16, depth: 2.8,  rimHeight: 0.85, inSun: false },
  { x: 450, y: 490, r: 15, depth: 2.5,  rimHeight: 0.75, inSun: false }
];

// Prominent landmark boulders (selected realistic megablocks along crater scarps and massifs)
// Reduced & curated for open, natural lunar regolith topography without cluttering driving corridors.
export const LUNAR_BOULDERS = [
  // Sunlit Summit & Ridge Outcrops (Apollo 16 style anorthosite breccia blocks)
  { x: -68, z: -118, scale: 2.6, rot: 0.4 },
  { x: 86,  z: -96,  scale: 3.4, rot: 0.8 },
  { x: 52,  z: -114, scale: 2.8, rot: 0.5 },
  { x: -32, z: -95,  scale: 2.1, rot: 2.7 },

  // Transition Slope & Escarpment Megablocks (Mass wasting rubble along crater scarp)
  { x: -46, z: -34,  scale: 2.9, rot: 1.5 },
  { x: 66,  z: -14,  scale: 3.6, rot: 1.1 },
  { x: -16, z: -22,  scale: 2.4, rot: 3.0 },
  { x: -56, z: 12,   scale: 3.2, rot: 0.2 },
  { x: 82,  z: 26,   scale: 2.5, rot: 2.1 },

  // Deep Crater Cold Trap Basins (Permanently shadowed cryogenic megablocks)
  { x: -26, z: 46,   scale: 3.9, rot: 1.8 },
  { x: 46,  z: 76,   scale: 4.3, rot: 0.7 },
  { x: -74, z: 96,   scale: 3.1, rot: 2.2 },
  { x: -36, z: 126,  scale: 3.5, rot: 1.2 },
  { x: 62,  z: 122,  scale: 3.0, rot: 2.8 }
];

// -------------------------------------------------------------
// DETERMINISTIC MULTI-OCTAVE FRACTAL NOISE ENGINE (Pure JS)
// -------------------------------------------------------------
// High-performance 2D hash and gradient value noise with quintic Hermite interpolation.
// Eliminates repetitive sinusoidal periodicity and creates realistic regolith geomorphology.

function hash2D(ix, iz) {
  let n = (ix * 374761393 + iz * 668265263) ^ 0x5bf03635;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296.0;
}

// 2D Value noise with quintic Hermite interpolation: 6t^5 - 15t^4 + 10t^3
function valueNoise2D(x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const x1 = x0 + 1;
  const z1 = z0 + 1;

  const fx = x - x0;
  const fz = z - z0;

  // Quintic smoothing curve (zero 1st & 2nd derivatives at boundaries)
  const sx = fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0);
  const sz = fz * fz * fz * (fz * (fz * 6.0 - 15.0) + 10.0);

  const n00 = hash2D(x0, z0);
  const n10 = hash2D(x1, z0);
  const n01 = hash2D(x0, z1);
  const n11 = hash2D(x1, z1);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);

  return (nx0 + sz * (nx1 - nx0)) * 2.0 - 1.0; // Normalized -1.0 to +1.0
}

/**
 * Multi-octave Fractional Brownian Motion (fBm) with domain rotation
 * Produces organic lunar undulating ridges, terraced scarps, and regolith micro-relief.
 */
function fractalBrownianMotion(x, z, octaves = 5) {
  let total = 0.0;
  let frequency = 1.0;
  let amplitude = 1.0;
  let maxAmplitude = 0.0;

  // Rotation matrix per octave to break axis alignment
  const cosA = 0.8660254; // cos(30 deg)
  const sinA = 0.5;       // sin(30 deg)

  let px = x;
  let pz = z;

  for (let i = 0; i < octaves; i++) {
    total += valueNoise2D(px * frequency, pz * frequency) * amplitude;
    maxAmplitude += amplitude;

    amplitude *= 0.52; // Persistence
    frequency *= 2.05; // Lacunarity

    // Rotate sample coordinates
    const rx = px * cosA - pz * sinA;
    const rz = px * sinA + pz * cosA;
    px = rx;
    pz = rz;
  }

  return total / maxAmplitude;
}

/**
 * Deterministic geological regolith elevation noise.
 * Combines regional geological swells, intermediate ridges, and micro-relief regolith bumps.
 */
function geologicalRegolithNoise(x, z) {
  // Broad geological hills and ridges
  const broadTopography = fractalBrownianMotion(x * 0.015, z * 0.015, 3) * 3.4;

  // Intermediate crater degradation scarps & swales
  const intermediateRelief = fractalBrownianMotion(x * 0.045 + 17.3, z * 0.045 + 43.1, 4) * 1.6;

  // Fine regolith micro-undulation (visible in grazing polar light)
  const microUndulation = fractalBrownianMotion(x * 0.14 + 109.1, z * 0.14 + 87.5, 3) * 0.45;

  return broadTopography + intermediateRelief + microUndulation;
}

/**
 * Smooth Hermite polynomial interpolation (smoothstep): 3t^2 - 2t^3
 */
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Calculates terrain elevation Y in 3D world space at given world (x, z).
 * Preserves exact coordinate bounds and 2D tactical simulation mapping.
 * @param {number} x3d - X coordinate in 3D space (-150 to +150)
 * @param {number} z3d - Z coordinate in 3D space (-150 to +150)
 * @returns {number} Elevation height in meters/units
 */
export function getTerrainHeight(x3d, z3d) {
  const pos2d = world3DToMap2D(x3d, z3d);
  const y2d = pos2d.y;
  const x2d = pos2d.x;

  // 1. Regional topographic slope profile:
  // Continuous smooth transition from Sunlit Crest (+14m) down to Deep PSR Cold Trap (-25m)
  let baseHeight = 0;

  if (y2d <= 140) {
    // Sunlit elevated ridge: gentle slope from 14m down to 9m
    const t = smoothstep(0, 140, y2d);
    baseHeight = 14.0 - t * 5.0; // 14m -> 9m
  } else if (y2d <= 240) {
    // Transition rim slope: continuous descent from 9m down to -7m
    const t = smoothstep(140, 240, y2d);
    baseHeight = 9.0 - t * 16.0; // 9m -> -7m
  } else {
    // Permanently Shadowed Region (PSR) crater basin: descent from -7m to -25m
    const t = smoothstep(240, 560, y2d);
    baseHeight = -7.0 - t * 18.0; // -7m -> -25m
  }

  // Broad geological ridge curvature (highland massif spine)
  const ridgeCurvature = Math.cos((x2d - 300) * 0.005) * 4.2;
  baseHeight += ridgeCurvature;

  // 2. Realistic multi-octave geological regolith noise
  const regolithRelief = geologicalRegolithNoise(x3d, z3d);
  baseHeight += regolithRelief;

  // 3. Multi-scale impact craters with realistic bowl profiles, raised rims, and ejecta blankets
  // Modeled on lunar simple crater morphology (Melosh / Pike lunar impact models):
  // Inner bowl: power-law parabolic cavity with smooth bottom floor
  // Crater rim crest: elevated lip at radius r
  // Ejecta blanket: smooth continuous exponential decay out to 2.2r with zero slope discontinuity
  for (let i = 0; i < CRATERS_2D.length; i++) {
    const c = CRATERS_2D[i];
    const dx = x2d - c.x;
    const dy = y2d - c.y;
    const dist2d = Math.sqrt(dx * dx + dy * dy);
    const maxInfluence = c.r * 2.25;

    if (dist2d < maxInfluence) {
      const u = dist2d / c.r; // Normalized distance (1.0 = rim crest)

      if (u < 1.0) {
        // INSIDE CRATER BOWL:
        // Transition from deep bowl floor up to raised rim crest
        // Parabolic bowl with exponent 1.35 gives steep inner walls and flattened breccia-filled floor
        const bowlFactor = Math.pow(1.0 - u * u, 1.35);
        const rimContribution = Math.pow(u, 2.5) * c.rimHeight;
        baseHeight -= (bowlFactor * c.depth - rimContribution);
      } else {
        // RAISED CRATER RIM & CONTINUOUS EJECTA BLANKET:
        // Smooth cubic falloff from rim crest (u=1.0) out to undisturbed regolith (u=2.25)
        const t = (u - 1.0) / 1.25;
        if (t <= 1.0) {
          // Hermite smooth falloff with zero derivatives at both ends: (1 - t)^2 * (1 + 2t)
          const ejectaFalloff = (1.0 - t) * (1.0 - t) * (1.0 + 2.0 * t);
          baseHeight += c.rimHeight * ejectaFalloff;
        }
      }
    }
  }

  return baseHeight;
}

/**
 * Calculates surface normal vector at given world (x, z) for rover slope alignment and physics.
 * Employs symmetrical central differences for accurate normal calculation across the terrain.
 */
export function getTerrainNormal(x3d, z3d) {
  const eps = 0.45;
  const hL = getTerrainHeight(x3d - eps, z3d);
  const hR = getTerrainHeight(x3d + eps, z3d);
  const hD = getTerrainHeight(x3d, z3d - eps);
  const hU = getTerrainHeight(x3d, z3d + eps);

  const dx = (hR - hL) / (2 * eps);
  const dz = (hU - hD) / (2 * eps);
  const len = Math.sqrt(dx * dx + 1.0 + dz * dz);

  return {
    x: -dx / len,
    y: 1.0 / len,
    z: -dz / len
  };
}

/**
 * Calculates ground contact heights for all 6 rover wheels given rover center position & heading.
 * Ensures the chassis height and wheel contact points match the surface topography without floating or sinking.
 */
export function getWheelContactHeights(centerX, centerZ, headingRad, wheelOffsets) {
  const cosH = Math.cos(headingRad);
  const sinH = Math.sin(headingRad);

  let totalHeight = 0;
  const wheelGroundYs = [];

  for (let i = 0; i < wheelOffsets.length; i++) {
    const w = wheelOffsets[i];
    // Rotate relative wheel offset by rover heading
    // In Three.js, heading rotation is around Y, with forward = -Z
    const wx = centerX + (w.x * cosH + w.z * sinH);
    const wz = centerZ + (-w.x * sinH + w.z * cosH);
    const groundY = getTerrainHeight(wx, wz);
    wheelGroundYs.push(groundY);
    totalHeight += groundY;
  }

  const avgGroundHeight = totalHeight / wheelOffsets.length;

  return {
    avgGroundHeight,
    wheelGroundYs
  };
}
