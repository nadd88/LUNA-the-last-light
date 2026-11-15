// Verification and Automated Unit/Integration Test Suite
import { LANDING_SITES, LANDING_SITES_PROVENANCE, getSiteIceDeposits } from './src/data/landingSites.js';
import { ROVER_COMPONENTS, MISSION_CONSTRAINTS } from './src/data/componentsData.js';
import { EMERGENCY_EVENTS } from './src/data/eventsData.js';
import { NASA_REFERENCES, SCIENTIFIC_ASSUMPTIONS, DATA_PROVENANCE } from './src/data/nasaReferences.js';
import {
  calculateSolarPower,
  calculatePowerDraw,
  calculateThermalStep,
  calculateBatteryStep,
  calculateSolarRechargeStep,
  calculateCommSignal,
  calculateMissionScore,
  getThermalStatus
} from './src/utils/physics.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('--- TEST 1: NASA LANDING SITES INTEGRITY ---');
assert(LANDING_SITES.length === 5, '5 NASA candidate landing sites present');
LANDING_SITES.forEach((site) => {
  assert(site.id && site.name && site.coords, `Site ${site.name} has valid ID and coordinates`);
  assert(site.elevationProfile.length >= 4, `Site ${site.name} has LOLA elevation profile`);
  assert(site.psrDistance > 0, `Site ${site.name} has valid distance to PSR`);
  assert(site.peakIllumination > 0 && site.peakIllumination <= 100, `Site ${site.name} illumination within range`);
});

console.log('\n--- TEST 2: HARDWARE SUBSYSTEMS & MISSION CONSTRAINTS ---');
assert(ROVER_COMPONENTS.chassis.length === 3, '3 Chassis options configured');
assert(ROVER_COMPONENTS.solar.length === 3, '3 Solar array options configured');
assert(ROVER_COMPONENTS.battery.length === 3, '3 Battery storage options configured');
assert(ROVER_COMPONENTS.thermal.length === 3, '3 Thermal protection options configured');
assert(ROVER_COMPONENTS.comm.length === 3, '3 Telecom options configured');
assert(ROVER_COMPONENTS.instruments.length === 4, '4 Science instruments (VIPER suite) configured');

console.log('\n--- TEST 3: SCIENTIFIC PHYSICS MODELS & STRICT PSR ZERO-SOLAR RULE ---');
const solarMast = ROVER_COMPONENTS.solar[1];
const sunlightPower = calculateSolarPower(solarMast, 90);
const psrPower = calculateSolarPower(solarMast, 0);
assert(sunlightPower > 100, `Sunlight power generation is positive (${sunlightPower} W)`);
assert(psrPower === 0, `CRITICAL NASA REQUIREMENT: Solar power in PSR is STRICTLY 0.0 W (result: ${psrPower} W)`);

console.log('\n--- TEST 4: ELECTRICAL POWER DRAW CALCULATION ---');
const dummyConfig = {
  chassis: ROVER_COMPONENTS.chassis[1],
  solar: ROVER_COMPONENTS.solar[1],
  battery: ROVER_COMPONENTS.battery[1],
  thermal: ROVER_COMPONENTS.thermal[1],
  comm: ROVER_COMPONENTS.comm[1],
  activeInstrument: ROVER_COMPONENTS.instruments[0]
};
const idleDraw = calculatePowerDraw(dummyConfig, { isMoving: false, heaterState: 'OFF' });
const movingDraw = calculatePowerDraw(dummyConfig, { isMoving: true, heaterState: 'HIGH', isScanning: true });
assert(idleDraw > 0, `Idle power draw is positive (${idleDraw} W)`);
assert(movingDraw > idleDraw, `Active drive + heater draw (${movingDraw} W) exceeds idle draw (${idleDraw} W)`);

console.log('\n--- TEST 5: THERMAL LUMPED-CAPACITANCE EVOLUTION ---');
// In a 40K (-235°C) PSR with heater OFF, temperature should drop
const initialTemp = -35;
const ambientPSR = -235;
const tempCooling = calculateThermalStep(initialTemp, ambientPSR, 40, dummyConfig, 'OFF', 5);
assert(tempCooling < initialTemp, `Avionics temperature cools down in PSR (-35°C -> ${tempCooling}°C)`);

// With heater HIGH, cooling is resisted
const tempHeated = calculateThermalStep(initialTemp, ambientPSR, 120, dummyConfig, 'HIGH', 5);
assert(tempHeated > tempCooling, `Active heating mitigates cryogenic cooling (${tempHeated}°C vs ${tempCooling}°C)`);

console.log('\n--- TEST 6: BATTERY DEPTH OF DISCHARGE & CLAMPING ---');
const batCapacity = dummyConfig.battery.capacity;
const discharged = calculateBatteryStep(batCapacity, -150, batCapacity, 2); // 2 hours of -150W
assert(discharged < batCapacity, `Battery drains under negative net power (${discharged} Wh)`);
const drainedToZero = calculateBatteryStep(10, -500, batCapacity, 1);
assert(drainedToZero === 0, `Battery safely clamps to 0 Wh without negative numbers (${drainedToZero} Wh)`);

console.log('\n--- TEST 7: COMMUNICATIONS LINK BUDGET ---');
const omniComm = ROVER_COMPONENTS.comm[0];
const relayComm = ROVER_COMPONENTS.comm[2];
const omniDeep = calculateCommSignal(omniComm, 300);
const relayDeep = calculateCommSignal(relayComm, 300);
assert(omniDeep.status === 'OCCULTED', `Omnidirectional antenna loses signal in deep crater (${omniDeep.status})`);
assert(relayDeep.status === 'RELAY_LOCKED', `Orbital relay transceiver maintains link in deep crater (${relayDeep.status})`);

console.log('\n--- TEST 8: SCIENCE SCORING & NASA DEBRIEF RATING ---');
const fullSuccessScore = calculateMissionScore({
  scienceCollected: 180,
  waterIceDetectedKg: 45,
  maxDepthInPSR: 350,
  batteryRemainingPercent: 65,
  roverHealth: 90,
  budgetSpentM: 120,
  maxBudgetM: 160,
  missionOutcome: 'SUCCESS'
});
assert(fullSuccessScore.score > 700, `High science expedition achieves distinction score (${fullSuccessScore.score})`);
assert(fullSuccessScore.grade.includes('A'), `High score achieves Grade A (${fullSuccessScore.grade})`);
const failedScore = calculateMissionScore({
  scienceCollected: 20,
  waterIceDetectedKg: 0,
  maxDepthInPSR: 50,
  batteryRemainingPercent: 0,
  roverHealth: 0,
  budgetSpentM: 150,
  maxBudgetM: 160,
  missionOutcome: 'LOST'
});
assert(failedScore.grade.includes('F'), `Depleted rover mission receives Grade F (${failedScore.grade})`);

console.log('\n--- TEST 9: EMERGENCY EVENTS & NASA CITATIONS ---');
assert(EMERGENCY_EVENTS.length >= 4, `${EMERGENCY_EVENTS.length} Emergency contingency events defined`);
assert(NASA_REFERENCES.length >= 4, `${NASA_REFERENCES.length} NASA mission datasets cited`);
assert(SCIENTIFIC_ASSUMPTIONS.documentedAssumptions.length >= 4, 'Scientific assumptions fully documented');

console.log('\n--- TEST 10: STRICT PSR ZERO-SOLAR & ILLUMINATION BOUNDARIES ---');
ROVER_COMPONENTS.solar.forEach((solarOpt) => {
  const p0 = calculateSolarPower(solarOpt, 0);
  const pNeg = calculateSolarPower(solarOpt, -10);
  const pTiny = calculateSolarPower(solarOpt, 0.0001);
  assert(p0 === 0, `${solarOpt.name}: 0% illumination produces strictly 0.0 W`);
  assert(pNeg === 0, `${solarOpt.name}: Negative illumination produces strictly 0.0 W`);
  assert(pTiny === 0, `${solarOpt.name}: Trace sub-threshold illumination (<0.001) produces strictly 0.0 W`);
});
assert(calculateSolarPower(null, 100) === 0, 'Null solar component safely returns 0 W');
assert(calculateSolarPower(solarMast, NaN) === 0, 'NaN illumination percent safely returns 0 W');

console.log('\n--- TEST 11: SOLAR RECHARGE BEHAVIOR & DWELL HARVESTING ---');
// PSR recharge rejection
const psrRecharge = calculateSolarRechargeStep({
  currentBatteryWh: 1000,
  maxBatteryWh: 2000,
  roverConfig: dummyConfig,
  currentTemp: -40,
  ambientTemp: -235,
  isInsidePSR: true,
  illuminationPercent: 0,
  dwellHours: 1
});
assert(!psrRecharge.possible, 'Recharge strictly rejected inside Permanently Shadowed Region (PSR)');
assert(psrRecharge.reason === 'RECHARGE_IMPOSSIBLE_IN_PSR', 'Correct PSR rejection reason code returned');
assert(psrRecharge.netHarvestWh === 0, 'Zero energy harvested in PSR recharge attempt');

// Sunlit recharge success
const sunRecharge = calculateSolarRechargeStep({
  currentBatteryWh: 1000,
  maxBatteryWh: 2000,
  roverConfig: dummyConfig,
  currentTemp: -40,
  ambientTemp: -40,
  isInsidePSR: false,
  illuminationPercent: 90,
  dwellHours: 2
});
assert(sunRecharge.possible, 'Recharge succeeded in sunlit environment');
assert(sunRecharge.netHarvestWh > 0, `Positive net energy harvested: ${sunRecharge.netHarvestWh} Wh`);
assert(sunRecharge.newBatteryWh > 1000, `Battery level increased: ${sunRecharge.newBatteryWh} Wh`);

// Already full battery recharge
const fullBatRecharge = calculateSolarRechargeStep({
  currentBatteryWh: 2000,
  maxBatteryWh: 2000,
  roverConfig: dummyConfig,
  currentTemp: -40,
  ambientTemp: -40,
  isInsidePSR: false,
  illuminationPercent: 90,
  dwellHours: 1
});
assert(fullBatRecharge.newBatteryWh === 2000, 'Recharge with full battery preserves 2000 Wh cap without overflow');

// Net power deficit (e.g. weak sun with high thermal heater draw)
const powerDeficitConfig = {
  ...dummyConfig,
  solar: ROVER_COMPONENTS.solar[0] // 120W peak
};
const deficitRecharge = calculateSolarRechargeStep({
  currentBatteryWh: 1000,
  maxBatteryWh: 2000,
  roverConfig: powerDeficitConfig,
  currentTemp: -180,
  ambientTemp: -235,
  isInsidePSR: false,
  illuminationPercent: 10, // ~12W solar vs 50W idle
  dwellHours: 1
});
assert(!deficitRecharge.possible, 'Recharge rejected when idle consumption exceeds solar generation');
assert(deficitRecharge.reason === 'NET_POWER_DEFICIT', 'Correct NET_POWER_DEFICIT reason returned');

console.log('\n--- TEST 12: BATTERY DEPTH OF DISCHARGE & CAPACITY CLAMPING ---');
// Overcharge clamp
const overcharged = calculateBatteryStep(1990, +500, 2000, 1);
assert(overcharged === 2000, `Overcharging safely clamped at max capacity 2000 Wh (got ${overcharged} Wh)`);
// Total discharge clamp
const overDrained = calculateBatteryStep(20, -500, 2000, 1);
assert(overDrained === 0, `Over-discharging safely clamped at 0 Wh (got ${overDrained} Wh)`);
// Initial out-of-bounds input
assert(calculateBatteryStep(-50, 0, 2000, 1) === 0, 'Negative initial battery Wh clamped to 0');
assert(calculateBatteryStep(2500, 0, 2000, 1) === 2000, 'Initial battery exceeding max capacity clamped to max');
// Zero or invalid dt
assert(calculateBatteryStep(1500, 200, 2000, 0) === 1500, 'Zero delta time preserves battery level');
assert(calculateBatteryStep(1500, 200, 2000, -1) === 1500, 'Negative delta time safely treated as 0');

console.log('\n--- TEST 13: THERMAL PHYSICS EXTREMES & EQUILIBRIUM ---');
// Extreme cryogenic equilibrium limit
const deepCryoTemp = calculateThermalStep(-240, -250, 0, dummyConfig, 'OFF', 60);
assert(deepCryoTemp >= -250 && deepCryoTemp < -240, `Thermal cooling bounded within physical limits (-250°C): got ${deepCryoTemp}°C`);
// Passive warming when ambient is warmer
const warmAmbient = 10;
const warmedTemp = calculateThermalStep(-50, warmAmbient, 0, dummyConfig, 'OFF', 30);
assert(warmedTemp > -50, `Rover warms passively towards warmer ambient environment (${warmedTemp}°C)`);
// Clamping bounds
const runawayCool = calculateThermalStep(-260, -280, 0, dummyConfig, 'OFF', 10);
assert(runawayCool >= -250, `Sub-absolute zero / runaway cooling clamped to -250°C (got ${runawayCool}°C)`);
// getThermalStatus classification
assert(getThermalStatus(-190).code === 'CRITICAL_COLD', 'Temp -190°C classified as CRITICAL_COLD');
assert(getThermalStatus(-80).code === 'WARNING_COLD', 'Temp -80°C classified as WARNING_COLD');
assert(getThermalStatus(-20).code === 'NOMINAL', 'Temp -20°C classified as NOMINAL');
assert(getThermalStatus(45).code === 'WARNING_HOT', 'Temp +45°C classified as WARNING_HOT');

console.log('\n--- TEST 14: TELECOM LINK AVAILABILITY & RF OCCULTATION ---');
// Omni antenna (60m crater threshold)
const omniShallow = calculateCommSignal(omniComm, 30);
const omniDeepCrater = calculateCommSignal(omniComm, 80);
assert(omniShallow.status === 'MARGINAL_DTE', 'Omni antenna maintains DTE in shallow depression (30m)');
assert(omniDeepCrater.status === 'OCCULTED', 'Omni antenna occulted beyond 60m crater threshold (80m)');
assert(omniDeepCrater.signalPercent === 0, 'Occulted omni antenna signal is 0%');

// High-gain parabolic antenna (220m crater threshold)
const hgaComm = ROVER_COMPONENTS.comm[1];
const hgaMid = calculateCommSignal(hgaComm, 150);
const hgaDeepCrater = calculateCommSignal(hgaComm, 250);
assert(hgaMid.status === 'DIRECT_DTE', 'HGA maintains DTE at 150m depth');
assert(hgaDeepCrater.status === 'OCCULTED', 'HGA occulted beyond 220m crater depth (250m)');

// Gateway / Pathfinder Relay (orbital relay lock)
const relaySurface = calculateCommSignal(relayComm, 0);
const relayAbyss = calculateCommSignal(relayComm, 1500);
assert(relaySurface.status === 'RELAY_LOCKED', 'Orbital relay locked at surface');
assert(relayAbyss.status === 'RELAY_LOCKED', 'Orbital relay locked in 1500m cryogenic abyss');
assert(relayAbyss.signalPercent >= 70, `Relay signal remains strong (${relayAbyss.signalPercent}%) in abyss`);
assert(relayAbyss.latencySec >= 2.0, `Realistic speed-of-light comm latency verified: ${relayAbyss.latencySec}s`);

console.log('\n--- TEST 15: LANDING SITES DIVERSITY & PROCEDURAL ICE PROFILES ---');
assert(LANDING_SITES_PROVENANCE.topographyDataset.includes('LOLA'), 'Topography provenance explicitly cites LOLA GDR');
assert(LANDING_SITES_PROVENANCE.volatilesDataset.includes('LP-NS'), 'Volatiles provenance cites LP-NS');

// Verify distinct geophysical traits across sites
const haworth = LANDING_SITES.find((s) => s.id === 'haworth-crater');
const malapert = LANDING_SITES.find((s) => s.id === 'malapert-mountain');
const shackleton = LANDING_SITES.find((s) => s.id === 'shackleton-ridge');
assert(haworth.elevation.includes('-2,100'), 'Haworth Crater has lowest elevation (-2,100m depression)');
assert(malapert.elevation.includes('+5,000'), 'Malapert Mountain has highest elevation (+5,000m peak)');
assert(haworth.psrDistance < shackleton.psrDistance, 'Haworth has shorter traverse to cold trap floor than Shackleton');
assert(malapert.psrDistance > 800, 'Malapert has long travel distance to cold trap (>800m)');

// Verify getSiteIceDeposits immutability & defensive cloning
const haworthDeposits1 = getSiteIceDeposits(haworth);
const haworthDeposits2 = getSiteIceDeposits(haworth);
assert(haworthDeposits1.length >= 4, `Haworth has ${haworthDeposits1.length} procedural ice pockets`);
haworthDeposits1[0].scanned = true;
assert(haworthDeposits2[0].scanned === false, 'getSiteIceDeposits returns cloned instances (mutation safe)');

// Fallback handling
const fallbackNull = getSiteIceDeposits(null);
const fallbackString = getSiteIceDeposits('non-existent-site');
assert(fallbackNull.length === 0, 'getSiteIceDeposits(null) returns empty array');
assert(fallbackString.length === 4, 'getSiteIceDeposits with unknown site ID returns fallback deposit array');

console.log('\n--- TEST 16: DEFENSIVE SANITIZATION & EDGE CASE INPUTS ---');
assert(calculatePowerDraw(null) > 0, 'calculatePowerDraw(null) returns safe fallback consumption');
assert(calculatePowerDraw({}, null) > 0, 'calculatePowerDraw with empty config and null telemetry runs safely');
assert(Number.isFinite(calculateThermalStep(NaN, -235, 50, dummyConfig, 'OFF', 5)), 'calculateThermalStep handles NaN initial temp gracefully');
const safeComm = calculateCommSignal(null, -50);
assert(safeComm.status && Number.isFinite(safeComm.signalPercent), 'calculateCommSignal handles null comm hardware and negative depth safely');
const safeScore = calculateMissionScore(null);
assert(Number.isFinite(safeScore.score) && typeof safeScore.grade === 'string', 'calculateMissionScore(null) returns safe score object');

console.log(`\n================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
