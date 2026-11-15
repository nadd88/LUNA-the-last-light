// Emergency Decision Events triggered by distance, thermal conditions, or random chance in PSRs

export const EMERGENCY_EVENTS = [
  {
    id: 'thermal-shock',
    title: 'CRYOGENIC THERMAL SHOCK ALERT',
    severity: 'red',
    triggerCondition: (state) => state.roverTemp < -110 && !state.hasTriggeredThermalShock,
    triggerKey: 'hasTriggeredThermalShock',
    sound: 'alarm',
    description: 'The rover has penetrated a deep micro-depression inside the PSR where ambient background drops to 38 Kelvin (-235°C). Core avionics temperatures are dropping faster than expected (-3.2°C/min). Battery electrolyte freezing threshold is imminent!',
    context: 'At 40 Kelvin, metals contract at different rates causing thermal stress, and lubricants freeze solid. Without heat, the rover will enter an irrecoverable deep-freeze state within minutes.',
    choices: [
      {
        text: 'Overdrive Active Heaters (+45W draw)',
        explanation: 'Boost thermal heaters to 150% power output. Consumes massive battery reserves but stabilizes avionics at safe -20°C.',
        batteryDelta: -180, // Wh
        tempDelta: +35,    // °C
        scienceDelta: 0,
        riskOutcome: 'Thermal equilibrium restored. Core temperature safely above danger threshold, but battery capacity reduced by 180 Wh.'
      },
      {
        text: 'Shed Avionics Load & Spin Down Science Instruments',
        explanation: 'Power down non-essential sensors (NIRVSS/drill) and redirect internal computer bus heat to the battery bay. Saves electricity.',
        batteryDelta: -40,
        tempDelta: +12,
        scienceDelta: -15,
        riskOutcome: 'Avionics survived, but scientific instrument recalibration lost 15 points of volatile analysis.'
      },
      {
        text: 'Perform Emergency High-Speed Dash toward Sunlit Rim',
        explanation: 'Order wheels to maximum drive speed (0.2 m/s) backwards along recent tracks toward the illumination line.',
        batteryDelta: -90,
        tempDelta: -8,
        distanceDelta: -60, // retreats 60m
        riskOutcome: 'Rover pulled back 60 meters towards warmth, but terrain roughness stressed the wheel hub motors.'
      }
    ]
  },
  {
    id: 'regolith-slip',
    title: 'HAZARD DETECTED: UNCONSOLIDATED REGOLITH SLIP',
    severity: 'amber',
    triggerCondition: (state) => state.depthInPSR > 120 && Math.random() < 0.35 && !state.hasTriggeredSlip,
    triggerKey: 'hasTriggeredSlip',
    sound: 'warning',
    description: 'Telemetry indicates high wheel slip (>62%) on the crater interior slope. Fine electrostatic lunar dust with zero air resistance has collected in a 40cm deep drift. Forward progress has stalled!',
    context: 'Lunar regolith in cold traps has not been space-weathered by the solar wind and retains microscopic jagged edges with low cohesive shear strength. Apollo astronauts and lunar rovers frequently encountered treacherous dust fluff.',
    choices: [
      {
        text: 'Activate Differential Peristaltic Crab-Walk',
        explanation: 'Independently steer each wheel inward and cycle motor torque to dig for consolidated bedrock layer beneath dust.',
        batteryDelta: -85,
        tempDelta: 0,
        scienceDelta: +10,
        riskOutcome: 'Traction re-established! The churning action incidentally exposed subsurface volatile frost (+10 Science).'
      },
      {
        text: 'Reverse 15m and Pathfind around Hazard Ridge',
        explanation: 'Follow earlier compacted wheel ruts backwards, then trace an alternate contour route mapped by LOLA lidar.',
        batteryDelta: -45,
        distanceDelta: -15,
        tempDelta: -4,
        riskOutcome: 'Safely bypassed the soft dust bowl with minimal energy expenditure.'
      },
      {
        text: 'Engage Max Motor Torque Burst',
        explanation: 'Force all wheel hubs into 100% torque output to power through the drift.',
        batteryDelta: -140,
        tempDelta: -2,
        riskRoll: 0.4, // 40% chance of motor strain
        riskOutcome: 'Power burst forced the rover forward, but wheel actuator temperature spiked and battery was drained.'
      }
    ]
  },
  {
    id: 'comm-occultation',
    title: 'CRATER RIM EARTH OCCULTATION (COMM LOSS)',
    severity: 'amber',
    triggerCondition: (state) => state.depthInPSR > 220 && !state.hasTriggeredCommLoss && !state.roverConfig.comm.id.includes('relay'),
    triggerKey: 'hasTriggeredCommLoss',
    sound: 'warning',
    description: 'Direct-to-Earth (DTE) radio carrier signal has vanished behind the massive 1,400-meter crater rim. Without an orbital relay satellite link, ground control cannot send real-time commands!',
    context: 'Because the Moon is tidally locked to Earth, the Earth sits low on the horizon at the lunar poles. Deep crater walls block the direct line of sight. NASA missions without relay satellites must rely on on-board autonomous scripts.',
    choices: [
      {
        text: 'Initiate On-Board Autonomous Science Sequence',
        explanation: 'Hand control over to rover autonomy software to execute pre-programmed survey waypoint and log data locally.',
        batteryDelta: -70,
        scienceDelta: +30,
        riskOutcome: 'Autonomous navigation succeeded. Rover logged high-resolution neutron data in internal buffer.'
      },
      {
        text: 'Climb 40m Up Local Mound to Regain Line-of-Sight',
        explanation: 'Drive to a high local interior knoll to peer over the crater rim edge and re-acquire DSN tracking signal.',
        batteryDelta: -110,
        distanceDelta: -20,
        scienceDelta: 0,
        riskOutcome: 'Line-of-sight restored. Telemetry link re-locked with Goldstone DSN antenna (+14 dB margin).'
      }
    ]
  },
  {
    id: 'massive-hydrogen-strike',
    title: 'SCIENCE BREAKTHROUGH: ENORMOUS HYDROGEN SIGNATURE',
    severity: 'cyan',
    triggerCondition: (state) => state.depthInPSR > 280 && !state.hasTriggeredHydrogenStrike,
    triggerKey: 'hasTriggeredHydrogenStrike',
    sound: 'discovery',
    description: 'Neutron Spectrometer count rates have plummeted by 78%, indicating a colossal concentration of hydrogen — equivalent to a 12% water-ice regolith matrix just 30 cm below the surface!',
    context: 'This is the holy grail of lunar prospecting. A confirmed massive water-ice deposit would secure fuel, drinking water, and breathable oxygen for future permanent human bases under NASA Artemis.',
    choices: [
      {
        text: 'Deploy Full-Depth TRIDENT Drill Core Extraction (200W/h draw)',
        explanation: 'Hammer the 1-meter drill bit through cryogenic permafrost to extract pristine ice cores before volatile sublimation.',
        batteryDelta: -190,
        scienceDelta: +95,
        tempDelta: -10,
        riskOutcome: 'HISTORIC DISCOVERY! Pristine cryogenic core sample verified: 14.2% water ice wt eq. NASA Science Directorate confirmed.'
      },
      {
        text: 'Perform Non-Destructive Multi-Band NIRVSS Scan (Fast & Safe)',
        explanation: 'Analyze surface volatiles with infrared spectrometry without risking a drill jam or heavy battery drain.',
        batteryDelta: -50,
        scienceDelta: +40,
        tempDelta: -2,
        riskOutcome: 'Spectra confirmed water-ice frost absorption peaks at 1.5µm and 2.0µm without draining critical reserves.'
      }
    ]
  }
];
