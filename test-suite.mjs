// Verification and Automated Unit/Integration Test Suite
import { LANDING_SITES } from './src/data/landingSites.js';
import { ROVER_COMPONENTS, MISSION_CONSTRAINTS } from './src/data/componentsData.js';
import { EMERGENCY_EVENTS } from './src/data/eventsData.js';
import { NASA_REFERENCES, SCIENTIFIC_ASSUMPTIONS } from './src/data/nasaReferences.js';
import {
  calculateSolarPower,
  calculatePowerDraw,
  calculateThermalStep,
  calculateBatteryStep,
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

console.log(`\n================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
