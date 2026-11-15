// Transparent Mathematical Models & Physics Utilities for Lunar South Pole Operations
// Calibrated against empirical NASA LRO (LOLA, Diviner, LEND) and VIPER engineering specifications

/**
 * Solar Constant at 1 AU (Lunar surface) ~ 1361 W/m²
 * At the lunar south pole, solar elevation is very low (~1.5° to 2.0° above horizon).
 * Ridges receive intermittent to near-continuous light; PSRs receive strictly 0.0 W.
 *
 * @param {Object} solarConfig - Solar array configuration from componentsData
 * @param {number} illuminationFactor - Local illumination percentage (0 to 100)
 * @returns {number} Power generated in Watts (strictly 0.0 if in PSR)
 */
export function calculateSolarPower(solarConfig, illuminationFactor) {
  if (!solarConfig) return 0;
  
  // Safe numeric conversion and clamping
  const illum = Number(illuminationFactor);
  if (isNaN(illum) || illum <= 0.001) {
    // CRITICAL NASA RULE: Direct solar generation in any PSR is strictly 0.0 Watts.
    return 0;
  }
  
  const clampedIllum = Math.min(100, Math.max(0, illum));
  const ratedGeneration = Number(solarConfig.generation) || 0;
  
  // Vertical mast arrays capture grazing light efficiently; body-mounted arrays suffer cosine losses
  const efficiency = Number(solarConfig.lowSunAngleEfficiency) || 0.85;
  const power = ratedGeneration * (clampedIllum / 100) * efficiency;
  
  return Math.round(power * 10) / 10;
}

/**
 * Calculates current electrical power draw (Watts) based on active subsystems
 *
 * @param {Object} config - Rover configuration object
 * @param {Object} options - Active operational states (isMoving, isScanning, isDrilling, heaterState)
 * @returns {number} Total power draw in Watts
 */
export function calculatePowerDraw(config = {}, options = {}) {
  const safeConfig = (config && typeof config === 'object') ? config : {};
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const {
    isMoving = false,
    isScanning = false,
    isDrilling = false,
    heaterState = 'AUTO' // 'OFF' | 'LOW' | 'HIGH' | 'AUTO'
  } = safeOptions;

  let totalDraw = 0;

  // 1. Base avionics, thermal loop sensors & flight computer
  totalDraw += (safeConfig.chassis && Number(safeConfig.chassis.basePower)) || 20;

  // 2. Communications standby or downlink
  totalDraw += (safeConfig.comm && Number(safeConfig.comm.powerDraw)) || 15;

  // 3. Locomotion draw (continuous motor torque under lunar regolith rolling resistance)
  if (isMoving) {
    totalDraw += (safeConfig.chassis && Number(safeConfig.chassis.drivePower)) || 50;
  }

  // 4. Science Instrument draw (NSS neutron spectrometer or NIRVSS infrared LED array)
  if (isScanning && safeConfig.activeInstrument) {
    totalDraw += Number(safeConfig.activeInstrument.powerDraw) || 15;
  }

  // 5. TRIDENT Drill draw (heavy mechanical percussion & rotary cutting load)
  if (isDrilling) {
    totalDraw += 65;
  }

  // 6. Active thermal resistive heater draw
  const baseHeaterDraw = (safeConfig.thermal && Number(safeConfig.thermal.powerDraw)) || 30;
  const normalizedHeaterState = String(heaterState).toUpperCase();
  
  if (normalizedHeaterState === 'HIGH') {
    totalDraw += baseHeaterDraw * 1.3;
  } else if (normalizedHeaterState === 'LOW') {
    totalDraw += baseHeaterDraw * 0.5;
  } else if (normalizedHeaterState === 'AUTO') {
    // In AUTO mode, thermostatic controller regulates power draw
    totalDraw += baseHeaterDraw * 0.8;
  }
  // 'OFF' draws 0 W

  return Math.round(totalDraw * 10) / 10;
}

/**
 * Thermal Equilibrium Calculation using lumped-capacitance model:
 * Ambient temperatures (calibrated from NASA Diviner observations):
 * - Direct Sunlight / Rim Crest: -40°C to -60°C (213K to 233K)
 * - Penumbra / Intermediate Slope: -120°C to -170°C (103K to 153K)
 * - Deep PSR Floor: -235°C to -248°C (25K to 38K)
 *
 * @param {number} currentTempC - Current internal avionics temperature (°C)
 * @param {number} ambientTempC - External ambient lunar surface temperature (°C)
 * @param {number} totalPowerDrawWatts - Total active electrical dissipation (Watts)
 * @param {Object} config - Rover hardware configuration
 * @param {string} heaterState - Heater operating mode
 * @param {number} dtMinutes - Elapsed time step in simulation minutes
 * @returns {number} Updated avionics temperature (°C)
 */
export function calculateThermalStep(currentTempC = -35, ambientTempC = -235, totalPowerDrawWatts = 40, config = {}, heaterState = 'AUTO', dtMinutes = 1) {
  const curTemp = isNaN(Number(currentTempC)) ? -35 : Number(currentTempC);
  const ambTemp = isNaN(Number(ambientTempC)) ? -235 : Number(ambientTempC);
  const powerWatts = Math.max(0, isNaN(Number(totalPowerDrawWatts)) ? 40 : Number(totalPowerDrawWatts));
  const dt = Math.max(0, isNaN(Number(dtMinutes)) ? 1 : Number(dtMinutes));

  if (dt === 0) return Math.round(curTemp * 10) / 10;

  const safeConfig = (config && typeof config === 'object') ? config : {};
  const thermalConfig = safeConfig.thermal || {};
  const batteryConfig = safeConfig.battery || {};

  // Internal dissipation from electronics: electronics convert ~65% of draw to waste heat
  let heatInputWatts = powerWatts * 0.65;

  // Additional active heat injection from thermal subsystem heaters
  const ratedHeatOutput = Number(thermalConfig.heatOutput) || 0;
  const normalizedHeaterState = String(heaterState).toUpperCase();

  if (normalizedHeaterState === 'HIGH') {
    heatInputWatts += ratedHeatOutput * 1.4;
  } else if (normalizedHeaterState === 'LOW') {
    heatInputWatts += ratedHeatOutput * 0.5;
  } else if (normalizedHeaterState === 'AUTO') {
    if (curTemp < -30) {
      heatInputWatts += ratedHeatOutput * 1.0;
    } else {
      heatInputWatts += ratedHeatOutput * 0.2;
    }
  }

  // Bonus passive heat from Radioisotope Heater Unit (RHU) if equipped (constant decay warmth)
  if (batteryConfig.id?.includes('rhu') || thermalConfig.id?.includes('rhu')) {
    heatInputWatts += 18; // ~18 Watts thermal equivalent from Pu-238 pellet
  }

  // Radiative & conductive loss factor (reduced by Multi-Layer Insulation MLI blankets)
  const insulationRating = Number(thermalConfig.thermalResistance) || 0.75;
  const lossCoeff = (1 - Math.min(0.98, Math.max(0.1, insulationRating)) * 0.82) * 0.85;

  // Temperature gradient: heat flows from warmer object to cooler environment
  // In sunlight where ambient (-40°C) > rover (-80°C), gradient is negative, providing passive warming
  const tempDeltaToAmbient = curTemp - ambTemp;
  const heatExchangeWatts = lossCoeff * tempDeltaToAmbient;

  // Net thermal flux into rover thermal mass
  const netThermalWatts = heatInputWatts - heatExchangeWatts;

  // Thermal capacity of rover chassis (~850 J/kg·K equivalent lumped capacitance)
  const lumpedCapacity = 140; // W·min/°C
  const tempChange = (netThermalWatts / lumpedCapacity) * dt;

  const newTemp = curTemp + tempChange;

  // Hard physical boundaries: absolute zero (-273.15°C) cannot be breached; Diviner record is 25K (-248.15°C)
  return Math.round(Math.max(-250, Math.min(65, newTemp)) * 10) / 10;
}

/**
 * Calculates battery state-of-charge after an elapsed time step
 *
 * @param {number} currentWh - Current stored energy in Watt-hours
 * @param {number} netWatts - Net electrical balance (Solar generation minus total draw)
 * @param {number} maxCapacityWh - Nameplate storage capacity in Watt-hours
 * @param {number} dtHours - Time step duration in hours
 * @returns {number} Clamped battery energy in Watt-hours
 */
export function calculateBatteryStep(currentWh = 0, netWatts = 0, maxCapacityWh = 1200, dtHours = 1/60) {
  const curWh = isNaN(Number(currentWh)) ? 0 : Number(currentWh);
  const netW = isNaN(Number(netWatts)) ? 0 : Number(netWatts);
  const maxCap = Math.max(1, isNaN(Number(maxCapacityWh)) ? 1200 : Number(maxCapacityWh));
  const dt = Math.max(0, isNaN(Number(dtHours)) ? 1/60 : Number(dtHours));

  const deltaWh = netW * dt;
  const updatedWh = curWh + deltaWh;
  
  // Safe physical clamping: battery cannot hold negative energy or exceed capacity
  const clampedWh = Math.max(0, Math.min(maxCap, updatedWh));
  return Math.round(clampedWh * 10) / 10;
}

/**
 * Pure physics function evaluating solar recharge during stationary dwell periods on sunlit rims
 *
 * @param {Object} params
 * @param {number} params.currentWh - Current battery charge in Wh
 * @param {number} params.maxCapacityWh - Max battery capacity in Wh
 * @param {Object} params.solarConfig - Solar array configuration
 * @param {number} params.illumination - Local illumination percentage (0-100)
 * @param {Object} params.roverConfig - Full rover hardware configuration
 * @param {string} params.heaterMode - Active heater state ('OFF', 'LOW', 'HIGH', 'AUTO')
 * @param {number} params.dwellMinutes - Stationary dwell time in simulation minutes
 * @param {boolean} params.isInsidePSR - Explicit flag whether vehicle is inside PSR
 * @param {number} params.currentTempC - Current avionics temperature
 * @param {number} params.ambientTempC - Local ambient temperature
 * @returns {Object} Recharge results (success, gainedWh, newBatteryWh, newTempC, netSurplusWatts, reason)
 */
export function calculateSolarRechargeStep(args = {}) {
  const safeArgs = (args && typeof args === 'object') ? args : {};
  const currentWh = safeArgs.currentWh ?? safeArgs.currentBatteryWh ?? 0;
  const maxCapacityWh = safeArgs.maxCapacityWh ?? safeArgs.maxBatteryWh ?? 1200;
  const roverConfig = safeArgs.roverConfig ?? {};
  const solarConfig = safeArgs.solarConfig ?? roverConfig.solar ?? {};
  const illumination = safeArgs.illumination ?? safeArgs.illuminationPercent ?? 85;
  const heaterMode = safeArgs.heaterMode ?? safeArgs.heaterState ?? 'AUTO';
  const dwellMinutes = safeArgs.dwellMinutes ?? (safeArgs.dwellHours != null ? safeArgs.dwellHours * 60 : 20);
  const isInsidePSR = Boolean(safeArgs.isInsidePSR);
  const currentTempC = safeArgs.currentTempC ?? safeArgs.currentTemp ?? -45;
  const ambientTempC = safeArgs.ambientTempC ?? safeArgs.ambientTemp ?? -45;

  // NASA Flight Rule: Solar recharge inside PSR is physically impossible
  if (isInsidePSR || Number(illumination) <= 0.001) {
    return {
      success: false,
      possible: false,
      gainedWh: 0,
      netHarvestWh: 0,
      newBatteryWh: Math.max(0, Number(currentWh)),
      newTempC: currentTempC,
      netSurplusWatts: 0,
      reason: 'RECHARGE_IMPOSSIBLE_IN_PSR'
    };
  }

  const curWh = Math.max(0, Number(currentWh));
  const maxCap = Math.max(1, Number(maxCapacityWh));
  const dwell = Math.max(0, Number(dwellMinutes));

  // If battery is already at full capacity
  if (curWh >= maxCap - 0.1) {
    return {
      success: true,
      possible: true,
      gainedWh: 0,
      netHarvestWh: 0,
      newBatteryWh: maxCap,
      newTempC: currentTempC,
      netSurplusWatts: 0,
      reason: 'BATTERY_ALREADY_FULL'
    };
  }

  // Calculate generation and stationary idle draw
  const solarGenWatts = calculateSolarPower(solarConfig, illumination);
  const idleDrawWatts = calculatePowerDraw(roverConfig, {
    isMoving: false,
    isScanning: false,
    isDrilling: false,
    heaterState: heaterMode
  });

  const netSurplusWatts = Math.round((solarGenWatts - idleDrawWatts) * 10) / 10;

  if (netSurplusWatts <= 0) {
    return {
      success: false,
      possible: false,
      gainedWh: 0,
      netHarvestWh: 0,
      newBatteryWh: curWh,
      newTempC: currentTempC,
      netSurplusWatts,
      reason: 'NET_POWER_DEFICIT'
    };
  }

  const gainedWh = Math.round(netSurplusWatts * (dwell / 60) * 10) / 10;
  const newBatteryWh = Math.min(maxCap, Math.round((curWh + gainedWh) * 10) / 10);

  // Passive thermal normalization towards sunlit ambient baseline
  const tempWarmed = currentTempC + (ambientTempC - currentTempC) * 0.35;
  const newTempC = Math.round(tempWarmed * 10) / 10;

  return {
    success: true,
    possible: true,
    gainedWh,
    netHarvestWh: gainedWh,
    newBatteryWh,
    newTempC,
    netSurplusWatts,
    reason: 'RECHARGE_SUCCESS'
  };
}

/**
 * Calculates Signal Margin (dB) based on antenna, distance, and line-of-sight
 *
 * @param {Object} commConfig - Telecom configuration
 * @param {number} depthInPSR - Depth traversed into crater cold trap (meters)
 * @param {boolean} hasRelayInOrbit - Whether an orbital relay link is active
 * @returns {Object} Link budget status, margin in dB, and carrier info
 */
export function calculateCommSignal(commConfig, depthInPSR = 0, hasRelayInOrbit = false) {
  if (!commConfig) {
    return { marginDb: -100, status: 'DISCONNECTED', carrier: 'No Telecom Hardware', latencySec: 2.6, signalPercent: 0 };
  }

  const depth = Math.max(0, isNaN(Number(depthInPSR)) ? 0 : Number(depthInPSR));
  // Round trip speed of light latency between Earth and Moon: ~2.56 seconds
  const latencySec = 2.6;

  // Orbital relay transceiver (e.g. Lunar Gateway, Lunar Pathfinder in halo orbit)
  if (commConfig.id === 'comm-orbital-relay-link' || hasRelayInOrbit) {
    return {
      marginDb: 18.5,
      status: 'RELAY_LOCKED',
      carrier: 'Lunar Gateway / Pathfinder Halo Relay',
      latencySec: 2.8,
      signalPercent: 92
    };
  }

  // Low-gain omnidirectional antenna: broad beam but easily occulted by crater rims
  if (commConfig.id === 'comm-omni-low') {
    if (depth > 60) {
      return { marginDb: -8.0, status: 'OCCULTED', carrier: 'Signal Blocked by Crater Rim', latencySec: 0, signalPercent: 0 };
    }
    return { marginDb: 4.2, status: 'MARGINAL_DTE', carrier: 'Direct Earth S-Band', latencySec, signalPercent: 55 };
  }

  // Steerable High-Gain X-Band Dish: narrower beam, tolerates intermediate slope depths before occlusion
  if (depth > 220) {
    return { marginDb: -3.5, status: 'OCCULTED', carrier: 'Crater Rim Occlusion', latencySec: 0, signalPercent: 0 };
  }
  
  const dteMargin = Math.round((14.8 - depth * 0.05) * 10) / 10;
  const signalPercent = Math.min(100, Math.max(10, Math.round(50 + dteMargin * 3.0)));
  return { marginDb: dteMargin, status: 'DIRECT_DTE', carrier: 'Goldstone DSN 70m Dish', latencySec, signalPercent };
}

/**
 * Converts internal temperatures to color status badges for HUD
 */
export function getThermalStatus(tempC) {
  const t = Number(tempC);
  if (t < -180) {
    return { label: 'CRITICAL', code: 'CRITICAL_COLD', color: 'red', text: 'Freeze Hazard! Battery Risk!' };
  }
  if (t < -60) {
    return { label: 'CRYOGENIC', code: 'WARNING_COLD', color: 'amber', text: 'Approaching Minimum Limit' };
  }
  if (t <= 40) {
    return { label: 'OPTIMAL', code: 'NOMINAL', color: 'emerald', text: 'Nominal Operations' };
  }
  return { label: 'OVERHEAT', code: 'WARNING_HOT', color: 'red', text: 'High Temperature Warning' };
}

/**
 * Science Score Evaluator following NASA mission success criteria
 */
export function calculateMissionScore(scoreParams = {}) {
  const safeParams = (scoreParams && typeof scoreParams === 'object') ? scoreParams : {};
  const {
    scienceCollected = 0,
    waterIceDetectedKg = 0,
    maxDepthInPSR = 0,
    batteryRemainingPercent = 0,
    roverHealth = 100,
    budgetSpentM = 0,
    maxBudgetM = 160,
    missionOutcome = 'SUCCESS'
  } = safeParams;

  let score = 0;

  // Science points from spectral scans and regolith analysis
  score += Math.max(0, scienceCollected) * 3.5;

  // Ice discovered and drilled
  score += Math.max(0, waterIceDetectedKg) * 12;

  // Exploration boldness (meters into deep permanently shadowed crater)
  score += Math.max(0, maxDepthInPSR) * 0.8;

  // Rover health & battery margin preservation
  score += Math.max(0, roverHealth) * 1.5;
  score += (Math.max(0, Math.min(100, batteryRemainingPercent)) / 100) * 120;

  // Budget efficiency bonus (remaining unspent capital)
  const budgetSavings = Math.max(0, maxBudgetM - budgetSpentM);
  score += budgetSavings * 2.0;

  if (missionOutcome === 'LOST') {
    score = Math.round(score * 0.4); // Severe penalty for loss of mission vehicle
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
      scienceScore: Math.round(Math.max(0, scienceCollected) * 3.5),
      iceScore: Math.round(Math.max(0, waterIceDetectedKg) * 12),
      depthScore: Math.round(Math.max(0, maxDepthInPSR) * 0.8),
      healthScore: Math.round(Math.max(0, roverHealth) * 1.5),
      efficiencyBonus: Math.round(budgetSavings * 2.0)
    }
  };
}

/**
 * Calculates estimated rover survival minutes in deep darkness
 * Computed strictly from physics.js calculatePowerDraw and battery constants
 *
 * @param {Object} config - Rover configuration
 * @returns {number} Estimated survival time in minutes
 */
export function calculateDarkSurvivalMinutes(config) {
  if (!config) return 0;
  const usableWh = ((config.battery && config.battery.capacity) || 2000) * ((config.battery && config.battery.maxDischarge) || 0.85);
  const drawMoving = calculatePowerDraw(config, { isMoving: true, heaterState: 'AUTO' });
  const drawIdle = calculatePowerDraw(config, { isMoving: false, heaterState: 'AUTO' });
  const avgDraw = (drawMoving + drawIdle) / 2;
  if (avgDraw <= 0) return 60;
  return Math.round((usableWh / avgDraw) * 60);
}
