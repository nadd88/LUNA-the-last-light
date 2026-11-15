// Transparent Mathematical Models & Physics Utilities for Lunar South Pole Operations

/**
 * Solar Constant at 1 AU (Lunar surface) ~ 1361 W/m²
 * At the lunar south pole, solar elevation is very low (~1.5° to 2.0° above horizon).
 * Ridges receive intermittent to near-continuous light; PSRs receive strictly 0.0 W.
 */
export function calculateSolarPower(solarConfig, illuminationFactor) {
  if (!solarConfig) return 0;
  // If illumination is 0 (PSR interior), solar generation is strictly 0.0 W.
  if (illuminationFactor <= 0.001) {
    return 0;
  }
  
  // Power scales with rated capacity, local illumination, and low-angle capture efficiency
  const efficiency = solarConfig.lowSunAngleEfficiency || 0.85;
  const power = solarConfig.generation * (illuminationFactor / 100) * efficiency;
  return Math.round(power * 10) / 10;
}

/**
 * Calculates current electrical power draw (Watts)
 */
export function calculatePowerDraw(config, options = {}) {
  const {
    isMoving = false,
    isScanning = false,
    isDrilling = false,
    heaterState = 'AUTO' // 'OFF' | 'LOW' | 'HIGH' | 'AUTO'
  } = options;

  let totalDraw = 0;

  // 1. Base avionics & flight computer
  totalDraw += config.chassis?.basePower || 20;

  // 2. Communications standby or downlink
  totalDraw += config.comm?.powerDraw || 15;

  // 3. Locomotion draw
  if (isMoving) {
    totalDraw += config.chassis?.drivePower || 50;
  }

  // 4. Science Instrument draw
  if (isScanning && config.activeInstrument) {
    totalDraw += config.activeInstrument.powerDraw || 15;
  }

  // 5. Drill draw (heavy mechanical load)
  if (isDrilling) {
    totalDraw += 65; // Heavy percussive rotary draw
  }

  // 6. Active thermal heater draw
  const baseHeaterDraw = config.thermal?.powerDraw || 30;
  if (heaterState === 'HIGH') {
    totalDraw += baseHeaterDraw * 1.3;
  } else if (heaterState === 'LOW') {
    totalDraw += baseHeaterDraw * 0.5;
  } else if (heaterState === 'AUTO') {
    // In AUTO, heater draws power proportional to cold deficit
    totalDraw += baseHeaterDraw * 0.8;
  }
  // 'OFF' draws 0W

  return Math.round(totalDraw * 10) / 10;
}

/**
 * Thermal Equilibrium Calculation using lumped-capacitance model:
 * Ambient temperatures:
 * - Direct Sunlight: -40°C to -60°C (213K to 233K)
 * - Penumbra / Edge: -120°C to -170°C (103K to 153K)
 * - Deep PSR Floor: -235°C to -248°C (25K to 38K)
 */
export function calculateThermalStep(currentTempC, ambientTempC, totalPowerDrawWatts, config, heaterState = 'AUTO', dtMinutes = 1) {
  const thermalConfig = config.thermal || {};
  const batteryConfig = config.battery || {};

  // Internal dissipation from electrical activity (electronics convert ~70% to waste heat)
  let heatInputWatts = totalPowerDrawWatts * 0.65;

  // Additional active heat injection from heater
  const ratedHeatOutput = thermalConfig.heatOutput || 0;
  if (heaterState === 'HIGH') {
    heatInputWatts += ratedHeatOutput * 1.4;
  } else if (heaterState === 'LOW') {
    heatInputWatts += ratedHeatOutput * 0.5;
  } else if (heaterState === 'AUTO') {
    if (currentTempC < -30) {
      heatInputWatts += ratedHeatOutput * 1.0;
    } else {
      heatInputWatts += ratedHeatOutput * 0.2;
    }
  }

  // Bonus passive heat from Radioisotope Heater Unit (RHU) if equipped
  if (batteryConfig.id?.includes('rhu') || thermalConfig.id?.includes('rhu')) {
    heatInputWatts += 18; // Constant decay warmth
  }

  // Radiative & conductive loss factor (reduced by high thermal resistance / MLI insulation)
  const insulationRating = thermalConfig.thermalResistance || 0.75;
  const lossCoeff = (1 - insulationRating * 0.82) * 0.85;

  // Temperature gradient towards ambient
  const tempDeltaToAmbient = currentTempC - ambientTempC;
  const heatLossWatts = lossCoeff * Math.max(0, tempDeltaToAmbient);

  // Net thermal flux
  const netThermalWatts = heatInputWatts - heatLossWatts;

  // Thermal mass of rover (~850 J/kg·K equivalent, lumped thermal capacity)
  const lumpedCapacity = 140; // W·min/°C
  const tempChange = (netThermalWatts / lumpedCapacity) * dtMinutes;

  const newTemp = currentTempC + tempChange;
  // Hard physical boundaries
  return Math.round(Math.max(-250, Math.min(65, newTemp)) * 10) / 10;
}

/**
 * Calculates battery state-of-charge after a time step
 */
export function calculateBatteryStep(currentWh, netWatts, maxCapacityWh, dtHours = 1/60) {
  const deltaWh = netWatts * dtHours;
  const updatedWh = currentWh + deltaWh;
  const clampedWh = Math.max(0, Math.min(maxCapacityWh, updatedWh));
  return Math.round(clampedWh * 10) / 10;
}

/**
 * Calculates Signal Margin (dB) based on antenna, distance, and line-of-sight
 */
export function calculateCommSignal(commConfig, depthInPSR, hasRelayInOrbit = false) {
  if (!commConfig) return { marginDb: 0, status: 'DISCONNECTED', latencySec: 2.6 };

  // Speed of light round trip to Earth: ~2.56 seconds
  const latencySec = 2.6;

  if (commConfig.id === 'comm-orbital-relay-link' || hasRelayInOrbit) {
    // Relayed via orbital satellite in halo orbit
    return {
      marginDb: 18.5,
      status: 'RELAY_LOCKED',
      carrier: 'Lunar Gateway / Pathfinder Halo',
      latencySec: 2.8
    };
  }

  // Direct to Earth depends on depth in crater
  if (commConfig.id === 'comm-omni-low') {
    if (depthInPSR > 60) {
      return { marginDb: -8.0, status: 'OCCULTED', carrier: 'Signal Blocked by Crater Rim', latencySec: 0 };
    }
    return { marginDb: 4.2, status: 'MARGINAL_DTE', carrier: 'Direct Earth S-Band', latencySec };
  }

  // Gimbaled X-Band
  if (depthInPSR > 220) {
    return { marginDb: -3.5, status: 'OCCULTED', carrier: 'Rim Occlusion', latencySec: 0 };
  }
  return { marginDb: 14.8 - (depthInPSR * 0.05), status: 'DIRECT_DTE', carrier: 'Goldstone DSN 70m Dish', latencySec };
}

/**
 * Converts temperatures to color status
 */
export function getThermalStatus(tempC) {
  if (tempC >= -20) return { label: 'OPTIMAL', color: 'emerald', text: 'Nominal Operations' };
  if (tempC >= -60) return { label: 'CHILL', color: 'cyan', text: 'Acceptable Electronics' };
  if (tempC >= -110) return { label: 'CRYOGENIC', color: 'amber', text: 'Approaching Minimum Limit' };
  return { label: 'CRITICAL', color: 'red', text: 'Freeze Hazard! Battery Risk!' };
}

/**
 * Science Score Evaluator
 */
export function calculateMissionScore({
  scienceCollected = 0,
  waterIceDetectedKg = 0,
  maxDepthInPSR = 0,
  batteryRemainingPercent = 0,
  roverHealth = 100,
  budgetSpentM = 0,
  maxBudgetM = 160,
  missionOutcome = 'SUCCESS'
}) {
  let score = 0;

  // Science points
  score += scienceCollected * 3.5;

  // Ice discovered
  score += waterIceDetectedKg * 12;

  // Exploration boldness (meters into darkness)
  score += maxDepthInPSR * 0.8;

  // Rover health & battery margin preservation
  score += roverHealth * 1.5;
  score += (batteryRemainingPercent / 100) * 120;

  // Budget efficiency bonus (remaining budget)
  const budgetSavings = Math.max(0, maxBudgetM - budgetSpentM);
  score += budgetSavings * 2.0;

  if (missionOutcome === 'LOST') {
    score = Math.round(score * 0.4); // Penalty for lost vehicle
  }

  const roundedScore = Math.max(0, Math.round(score));

  let grade = 'F';
  if (roundedScore >= 900) grade = 'A+ (Distinction)';
  else if (roundedScore >= 750) grade = 'A (Exemplary)';
  else if (roundedScore >= 600) grade = 'B (Mission Accomplished)';
  else if (roundedScore >= 450) grade = 'C (Partial Success)';
  else if (roundedScore >= 300) grade = 'D (Marginal Return)';

  return {
    score: roundedScore,
    grade,
    breakdown: {
      scienceScore: Math.round(scienceCollected * 3.5),
      iceScore: Math.round(waterIceDetectedKg * 12),
      depthScore: Math.round(maxDepthInPSR * 0.8),
      healthScore: Math.round(roverHealth * 1.5),
      efficiencyBonus: Math.round(budgetSavings * 2.0)
    }
  };
}
