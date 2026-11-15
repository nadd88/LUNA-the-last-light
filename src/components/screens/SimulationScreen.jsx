import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Compass,
  Sun,
  Battery,
  BatteryCharging,
  ThermometerSnowflake,
  Radio,
  Zap,
  Navigation,
  RotateCcw,
  RotateCw,
  Crosshair,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Eye,
  HelpCircle,
  X,
  Target,
  Settings,
  Flame,
  Shield,
  Volume2,
  FileText
} from 'lucide-react';
import {
  calculateSolarPower,
  calculatePowerDraw,
  calculateThermalStep,
  calculateBatteryStep,
  calculateCommSignal,
  calculateSolarRechargeStep,
  getThermalStatus
} from '../../utils/physics';
import { EMERGENCY_EVENTS } from '../../data/eventsData';
import { getSiteIceDeposits } from '../../data/landingSites';
import { sound } from '../../utils/sound';
import EmergencyModal from './EmergencyModal';
import Lunar3DEnvironment from '../../visualization/Lunar3DEnvironment';
import StatMeter from '../common/StatMeter';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import Tooltip from '../common/Tooltip';
import { useGameMode } from '../../context/GameModeContext';
import { LABELS } from '../../content/labels';

// Configuration flag: show the slim bottom-center action bar
const SHOW_ACTION_BAR = true;

export default function SimulationScreen({
  roverConfig,
  selectedSite,
  onCompleteMission,
  onUpdateTelemetry
}) {
  const { isEngineerMode } = useGameMode();

  // 3D Canvas / Horizon View
  const [cameraMode, setCameraMode] = useState('ORBIT'); // 'ORBIT' | 'CHASE' | 'PANORAMA'
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  // Simulation Physical State
  const [roverPos, setRoverPos] = useState({ x: 300, y: 80 }); // y=80 is sunlight, y>220 is PSR
  const [roverHeading, setRoverHeading] = useState(90); // 90° = pointing down into PSR
  const [tracks, setTracks] = useState([]);
  const [driveCommand, setDriveCommand] = useState({
    forward: false,
    reverse: false,
    left: false,
    right: false,
    brake: false,
    boost: false
  });

  // Resource State
  const maxBatteryWh = roverConfig?.battery?.capacity || 2000;
  const [batteryWh, setBatteryWh] = useState(maxBatteryWh);
  const [coreTempC, setCoreTempC] = useState(-35);
  const [heaterMode, setHeaterMode] = useState('AUTO'); // 'OFF' | 'LOW' | 'HIGH' | 'AUTO'
  const [speedMode, setSpeedMode] = useState('NORMAL'); // 'CAUTIOUS' | 'NORMAL' | 'DASH'

  // Mission Metrics
  const [depthInPSR, setDepthInPSR] = useState(0);
  const [maxDepthExplored, setMaxDepthExplored] = useState(0);
  const [sciencePoints, setSciencePoints] = useState(0);
  const [waterIceKg, setWaterIceKg] = useState(0);
  const [drillCores, setDrillCores] = useState(0);
  const [roverHealth, setRoverHealth] = useState(100);
  const [missionElapsedMinutes, setMissionElapsedMinutes] = useState(0);

  // Activity Flags
  const [isDrilling, setIsDrilling] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Emergency & Contingency State
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [triggeredEventKeys, setTriggeredEventKeys] = useState(new Set());

  // Autonomous Waypoint State
  const [waypoint, setWaypoint] = useState(null);

  // Ice Deposits
  const [iceDeposits, setIceDeposits] = useState(() => getSiteIceDeposits(selectedSite));
  const iceDepositsRef = useRef(iceDeposits);

  useEffect(() => {
    const deposits = getSiteIceDeposits(selectedSite);
    setIceDeposits(deposits);
    iceDepositsRef.current = deposits;
  }, [selectedSite]);

  // Dialog & Modal States
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // How to Play modal auto-opens on first entry
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(() => {
    return !localStorage.getItem('luna_howtoplay_seen');
  });

  const closeHowToPlay = () => {
    localStorage.setItem('luna_howtoplay_seen', 'true');
    setIsHowToPlayOpen(false);
  };

  // Toast Notification State
  const [toast, setToast] = useState({ isOpen: false, message: '', variant: 'info' });
  const showToast = useCallback((message, variant = 'info') => {
    setToast({ isOpen: true, message, variant });
  }, []);

  // Responsive Touch Detection
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(pointer: coarse)').matches;
    }
    return false;
  });

  // Quests Panel Collapsed State (default collapsed on touch devices)
  const [isQuestsCollapsed, setIsQuestsCollapsed] = useState(isTouchDevice);

  // Help hint banner fades after 10s
  const [showControlsHint, setShowControlsHint] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowControlsHint(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Contextual Coach & Mission Log
  const [logs, setLogs] = useState([
    {
      id: 1,
      text: isEngineerMode
        ? `Telemetry initialized at ${selectedSite.name}. Subsystems nominal.`
        : `Touchdown verified at ${selectedSite.name}. All systems operational.`,
      type: 'info',
      time: 'T+0m'
    }
  ]);

  const addLog = useCallback((text, type = 'info') => {
    setLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, type, time: `T+${missionElapsedMinutes}m` }
    ]);
  }, [missionElapsedMinutes]);

  // Event trigger trackers so coach messages fire at most once
  const coachTriggersRef = useRef({
    entryHint: false,
    shadowLine: false,
    batt50: false,
    batt25: false,
    batt15: false,
    tempCold: false,
    commLost: false,
    firstIce: false,
    idleHint: false
  });

  const lastUserActivity = useRef(Date.now());
  const logContainerRef = useRef(null);

  // Auto-scroll latest message in log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Initial entry tip
  useEffect(() => {
    if (!coachTriggersRef.current.entryHint) {
      coachTriggersRef.current.entryHint = true;
      const timer = setTimeout(() => {
        addLog(
          isEngineerMode
            ? 'NAV ADVISORY: Traverse south towards the 0.0 W solar flux PSR boundary line.'
            : "💡 Tip: Drive south (S or ↓) toward the glowing line. That's the edge of the Dark Zone.",
          'tip'
        );
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [addLog, isEngineerMode]);

  // Illumination & Thermal Physics
  const getIlluminationAtY = (y) => {
    if (y < 140) return selectedSite.peakIllumination;
    if (y < 230) {
      const ratio = (y - 140) / 90;
      return Math.max(0, Math.round(selectedSite.peakIllumination * (1 - ratio)));
    }
    return 0; // Strictly 0.0 inside PSR!
  };

  const currentIllumination = getIlluminationAtY(roverPos.y);
  const isInsidePSR = currentIllumination <= 0.001;

  const getAmbientTempAtY = (y) => {
    if (y < 140) return -45;
    if (y < 230) {
      const ratio = (y - 140) / 90;
      return Math.round(-45 + (-235 - (-45)) * ratio);
    }
    return -238;
  };

  const currentAmbientTemp = getAmbientTempAtY(roverPos.y);

  // Electrical Physics
  const solarGenWatts = calculateSolarPower(roverConfig.solar, currentIllumination);
  const powerDrawWatts = calculatePowerDraw(roverConfig, {
    isMoving,
    isScanning,
    isDrilling,
    heaterState: heaterMode
  });
  const netPowerWatts = Math.round((solarGenWatts - powerDrawWatts) * 10) / 10;
  const batteryPercent = Math.max(0, Math.min(100, Math.round((batteryWh / maxBatteryWh) * 100)));

  // Telecom & Thermal Status
  const commTelemetry = calculateCommSignal(roverConfig.comm, depthInPSR);
  const thermalStatus = getThermalStatus(coreTempC);

  // Estimated minutes remaining on battery
  const estimatedMinsLeft = useMemo(() => {
    if (netPowerWatts >= 0) return 'Charging';
    const drainRate = Math.max(10, Math.abs(netPowerWatts));
    return `~${Math.max(1, Math.round((batteryWh / drainRate) * 60))} min left`;
  }, [batteryWh, netPowerWatts]);

  // Proximity to unscanned/undrilled ice deposit
  const isNearIce = useMemo(() => {
    return iceDeposits.some((dep) => {
      const dist = Math.hypot(dep.x - roverPos.x, dep.y - roverPos.y);
      return dist < 65 && !dep.drilled;
    });
  }, [iceDeposits, roverPos]);

  // Quests State Derivation
  const quest1Done = roverPos.y >= 230 || depthInPSR > 0;
  const quest2Done = waterIceKg > 0 || iceDeposits.some((d) => d.scanned);
  const quest3Done = drillCores >= 4;
  const quest4Done = drillCores >= 1 && roverPos.y < 160;

  // Active quest index (0-based)
  const activeQuestIndex = useMemo(() => {
    if (!quest1Done) return 0;
    if (!quest2Done) return 1;
    if (!quest3Done) return 2;
    return 3;
  }, [quest1Done, quest2Done, quest3Done]);

  const completedQuestsCount = (quest1Done ? 1 : 0) + (quest2Done ? 1 : 0) + (quest3Done ? 1 : 0) + (quest4Done ? 1 : 0);

  // Track Quest Completion Toasts & Coach Logs
  const prevQuestsRef = useRef({ q1: false, q2: false, q3: false, q4: false });
  useEffect(() => {
    if (quest1Done && !prevQuestsRef.current.q1) {
      prevQuestsRef.current.q1 = true;
      showToast('🎯 Quest Complete: Reached the Dark Zone!', 'success');
      addLog('🎯 QUEST COMPLETE: Crossed into the Dark Zone (0.0 W solar flux).', 'success');
    }
    if (quest2Done && !prevQuestsRef.current.q2) {
      prevQuestsRef.current.q2 = true;
      showToast('💎 Quest Complete: Located Water Ice Deposit!', 'success');
      addLog('💎 QUEST COMPLETE: Ice deposit identified via ground scan.', 'success');
    }
    if (quest3Done && !prevQuestsRef.current.q3) {
      prevQuestsRef.current.q3 = true;
      showToast('⛏️ Quest Complete: Collected 4 Drill Cores!', 'success');
      addLog('⛏️ QUEST COMPLETE: Harvested 4 cryogenic ice cores.', 'success');
    }
    if (quest4Done && !prevQuestsRef.current.q4) {
      prevQuestsRef.current.q4 = true;
      showToast('🏆 Quest Complete: Returned Safely to Sunny Ridge!', 'success');
      addLog('🏆 QUEST COMPLETE: Rover safely positioned on sunlit ridge with all samples.', 'success');
    }
  }, [quest1Done, quest2Done, quest3Done, quest4Done, showToast, addLog]);

  // Contextual Coach Event Watchers
  useEffect(() => {
    // 1. Crossing shadow line
    if (isInsidePSR && !coachTriggersRef.current.shadowLine) {
      coachTriggersRef.current.shadowLine = true;
      addLog(
        isEngineerMode
          ? 'WARNING: Ingress to PSR complete. Solar flux = 0.0 W/m². Operating on internal battery.'
          : "⚠️ You're in the Dark Zone. No solar power now. Your battery is all you have.",
        'warning'
      );
    }

    // 2. Battery 50%
    if (batteryPercent <= 50 && batteryPercent > 25 && !coachTriggersRef.current.batt50) {
      coachTriggersRef.current.batt50 = true;
      addLog(
        isEngineerMode
          ? 'ENERGY ADVISORY: Battery SoC at 50%. Evaluate egress timeline.'
          : '⚠️ Battery at 50%. Keep an eye on your energy reserve.',
        'warning'
      );
    }

    // 3. Battery 25%
    if (batteryPercent <= 25 && batteryPercent > 15 && !coachTriggersRef.current.batt25) {
      coachTriggersRef.current.batt25 = true;
      addLog(
        isEngineerMode
          ? 'CRITICAL RESERVE: Battery SoC at 25%! Reduce heater power or commence rim egress.'
          : '⚠️ Battery low (25%)! Consider heading back or turning down heaters.',
        'danger'
      );
    }

    // 4. Battery 15%
    if (batteryPercent <= 15 && !coachTriggersRef.current.batt15) {
      coachTriggersRef.current.batt15 = true;
      sound.playAlarm();
      addLog(
        isEngineerMode
          ? 'POWER EMERGENCY: Battery SoC <= 15%! Immediate abort to sunlit ridge required!'
          : '🚨 CRITICAL BATTERY (15%)! Turn back to the sunny ridge immediately!',
        'danger'
      );
    }

    // 5. Temperature falling below -80°C
    if (coreTempC <= -80 && !coachTriggersRef.current.tempCold) {
      coachTriggersRef.current.tempCold = true;
      sound.playWarning();
      addLog(
        isEngineerMode
          ? 'THERMAL ALERT: Avionics core <= -80°C. Engage HIGH heater or return to sunlight.'
          : '❄️ Freezing risk: avionics below -80°C! Keep heater active.',
        'warning'
      );
    }

    // 6. Comm loss
    if (commTelemetry.marginDb <= 0 && !coachTriggersRef.current.commLost) {
      coachTriggersRef.current.commLost = true;
      addLog(
        isEngineerMode
          ? 'RF HORIZON OCCULTATION: Earth line-of-sight lost behind crater rim.'
          : '📡 Signal to Earth is blocked by crater terrain. Ascend or find higher ground.',
        'warning'
      );
    }
  }, [isInsidePSR, batteryPercent, coreTempC, commTelemetry.marginDb, addLog, isEngineerMode]);

  // Idle Coach: Trigger reminder after 15s of inactivity
  useEffect(() => {
    const idleCheck = setInterval(() => {
      const idleMs = Date.now() - lastUserActivity.current;
      if (idleMs >= 15000 && !coachTriggersRef.current.idleHint) {
        coachTriggersRef.current.idleHint = true;
        if (!quest1Done) {
          addLog("💡 Tip: Press W or ↑ to drive south toward the dark crater.", 'tip');
        } else if (!quest2Done) {
          addLog("💡 Tip: Press Space to scan the ground for underground ice deposits.", 'tip');
        } else if (!quest3Done) {
          addLog("💡 Tip: Stop near a detected ice deposit and press E to drill a core.", 'tip');
        } else if (!quest4Done) {
          addLog("💡 Tip: Drive north back to the sunny ridge before your battery depletes.", 'tip');
        }
      }
    }, 5000);
    return () => clearInterval(idleCheck);
  }, [quest1Done, quest2Done, quest3Done, quest4Done, addLog]);

  // Game Over Conditions Check
  useEffect(() => {
    if (batteryWh <= 0) {
      sound.playAlarm();
      addLog('CRITICAL POWER STARVATION: Battery completely depleted. Telemetry lost.', 'danger');
      setTimeout(() => {
        onCompleteMission({
          missionOutcome: 'LOST',
          failureReason: 'Battery depleted in deep shadow. Power blackout.',
          scienceCollected: sciencePoints,
          waterIceDetectedKg: waterIceKg,
          maxDepthInPSR: maxDepthExplored,
          batteryRemainingPercent: 0,
          roverHealth: 0,
          coreTempC
        });
      }, 1800);
    } else if (coreTempC <= -175) {
      sound.playAlarm();
      addLog('CRYOGENIC SYSTEM SHOCK: Avionics core frozen solid. Mechanism cold-welded.', 'danger');
      setTimeout(() => {
        onCompleteMission({
          missionOutcome: 'LOST',
          failureReason: 'Avionics and batteries frozen solid in 38K cold trap.',
          scienceCollected: sciencePoints,
          waterIceDetectedKg: waterIceKg,
          maxDepthInPSR: maxDepthExplored,
          batteryRemainingPercent: batteryPercent,
          roverHealth: 0,
          coreTempC
        });
      }, 1800);
    }
  }, [batteryWh, coreTempC, sciencePoints, waterIceKg, maxDepthExplored, batteryPercent, onCompleteMission, addLog]);

  // Main Simulation Clock Tick (Runs every 2.5s = 1 simulation minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionElapsedMinutes((m) => m + 1);

      // Battery update
      setBatteryWh((prevWh) => {
        return calculateBatteryStep(prevWh, netPowerWatts, maxBatteryWh, 1 / 60);
      });

      // Thermal update
      setCoreTempC((prevTemp) => {
        return calculateThermalStep(
          prevTemp,
          currentAmbientTemp,
          powerDrawWatts,
          roverConfig,
          heaterMode,
          1
        );
      });

      if (coreTempC < -100) {
        setRoverHealth((h) => Math.max(15, h - 1));
      }

      // Check emergency events
      const simState = {
        roverTemp: coreTempC,
        depthInPSR,
        roverConfig,
        hasTriggeredThermalShock: triggeredEventKeys.has('thermal-shock'),
        hasTriggeredSlip: triggeredEventKeys.has('regolith-slip'),
        hasTriggeredCommLoss: triggeredEventKeys.has('comm-occultation'),
        hasTriggeredHydrogenStrike: triggeredEventKeys.has('massive-hydrogen-strike')
      };

      for (const ev of EMERGENCY_EVENTS) {
        if (!triggeredEventKeys.has(ev.id) && ev.triggerCondition(simState)) {
          setActiveEmergency(ev);
          setTriggeredEventKeys((prev) => new Set([...prev, ev.id]));
          if (ev.sound === 'alarm') sound.playAlarm();
          else if (ev.sound === 'warning') sound.playWarning();
          else sound.playDiscovery();
          break;
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [netPowerWatts, maxBatteryWh, currentAmbientTemp, powerDrawWatts, roverConfig, heaterMode, coreTempC, depthInPSR, triggeredEventKeys]);

  // Resolve emergency choice
  const handleResolveEmergency = (choice) => {
    setActiveEmergency(null);
    if (choice.batteryDelta) {
      setBatteryWh((b) => Math.max(0, Math.min(maxBatteryWh, b + choice.batteryDelta)));
    }
    if (choice.tempDelta) {
      setCoreTempC((t) => Math.max(-240, Math.min(50, t + choice.tempDelta)));
    }
    if (choice.scienceDelta) {
      setSciencePoints((s) => s + choice.scienceDelta);
    }
    if (choice.distanceDelta) {
      setRoverPos((prev) => ({
        ...prev,
        y: Math.max(70, prev.y + choice.distanceDelta * 0.8)
      }));
    }
    addLog(`Emergency Contingency Executed: ${choice.riskOutcome}`, 'warning');
  };

  const distSinceTrack = useRef(0);
  const isMovingSoundRef = useRef(false);

  // Synchronize 3D physical rover state back to React mission telemetry
  const handleRoverUpdateFrom3D = useCallback((newPos, newHeading, moving, deltaDist) => {
    setIsMoving(moving);
    setRoverPos(newPos);
    setRoverHeading(Math.round(newHeading));
    lastUserActivity.current = Date.now();

    if (moving && !isMovingSoundRef.current) {
      sound.playDrive();
      isMovingSoundRef.current = true;
    } else if (!moving) {
      isMovingSoundRef.current = false;
    }

    if (deltaDist > 0) {
      const currentDepth = Math.max(0, Math.round((newPos.y - 230) * 1.5));
      setDepthInPSR(currentDepth);
      setMaxDepthExplored((m) => Math.max(m, currentDepth));

      const moveCost = (speedMode === 'DASH' ? 0.35 : speedMode === 'CAUTIOUS' ? 0.18 : 0.25) * deltaDist;
      setBatteryWh((b) => Math.max(0, b - moveCost));

      distSinceTrack.current += deltaDist;
      if (distSinceTrack.current >= 6.0) {
        setTracks((tr) => [...tr.slice(-60), { x: Math.round(newPos.x), y: Math.round(newPos.y) }]);
        distSinceTrack.current = 0;
      }
    }
  }, [speedMode]);

  // Action: Scan Ground
  const handleScan = useCallback(() => {
    if (isScanning || isDrilling) return;
    lastUserActivity.current = Date.now();
    sound.playScan();
    setIsScanning(true);
    addLog('Scanning regolith for subsurface water ice...', 'info');

    setTimeout(() => {
      setIsScanning(false);
      let foundIce = false;
      iceDepositsRef.current.forEach((dep) => {
        const dist = Math.hypot(dep.x - roverPos.x, dep.y - roverPos.y);
        if (dist < 65 && !dep.scanned) {
          dep.scanned = true;
          foundIce = true;
          sound.playDiscovery();
          const detectedKg = Math.round(dep.concentration * 3.5);
          setWaterIceKg((w) => w + detectedKg);
          setSciencePoints((s) => s + 45);
          addLog(`💎 ICE DETECTED: ${dep.concentration}% wt eq H₂O located! (+${detectedKg}kg, +45 Science)`, 'success');
          showToast(`💎 Ice detected! Stop the rover and press [E] to drill.`, 'success');
        }
      });
      if (foundIce) {
        setIceDeposits([...iceDepositsRef.current]);
      } else {
        if (isInsidePSR) {
          setSciencePoints((s) => s + 15);
          addLog('Trace hydrogen surveyed in crater floor (+15 Science). No concentrated ice.', 'info');
        } else {
          setSciencePoints((s) => s + 5);
          addLog('Regolith scanned on sunlit rim (+5 Science).', 'info');
        }
      }
      setBatteryWh((b) => Math.max(0, b - 15));
    }, 800);
  }, [isScanning, isDrilling, roverPos, isInsidePSR, addLog, showToast]);

  // Action: Drill Sample
  const handleDrill = useCallback(() => {
    if (isDrilling || isScanning || isMoving) return;
    lastUserActivity.current = Date.now();

    // The TRIDENT rotary percussive drill is standard flight equipment available on all rovers
    const hasDrill = true;
    if (!hasDrill) {
      sound.playWarning();
      addLog('NO DRILL: TRIDENT drill is not installed on this rover configuration!', 'danger');
      return;
    }

    if (batteryWh < 65) {
      sound.playWarning();
      addLog('LOW POWER: Drill requires at least 65 Wh battery reserve.', 'warning');
      return;
    }

    sound.playDrill();
    setIsDrilling(true);
    addLog('TRIDENT rotary percussive drill penetrating lunar ice layer...', 'warning');

    setTimeout(() => {
      setIsDrilling(false);
      let drilledDeposit = false;
      iceDepositsRef.current.forEach((dep) => {
        const dist = Math.hypot(dep.x - roverPos.x, dep.y - roverPos.y);
        if (dist < 65 && !dep.drilled) {
          dep.drilled = true;
          drilledDeposit = true;
          sound.playVictory();
          const coreIceKg = Math.round(dep.concentration * 7.5);
          setWaterIceKg((w) => w + coreIceKg);
          setDrillCores((d) => d + 1);
          setSciencePoints((s) => s + 85);
          addLog(`⛏️ DRILL SUCCESS: Extracted cryogenic ice core! +${coreIceKg}kg H₂O (+85 Science)`, 'success');
          showToast(`⛏️ Ice core extracted! (${drillCores + 1}/4 samples)`, 'success');
        }
      });
      if (drilledDeposit) {
        setIceDeposits([...iceDepositsRef.current]);
      } else {
        setDrillCores((d) => d + 1);
        setSciencePoints((s) => s + 25);
        addLog('Core extraction complete: Cryogenic silicates recovered (+25 Science).', 'info');
      }

      setBatteryWh((b) => Math.max(0, b - 60));
      setCoreTempC((t) => t - 5);
    }, 1400);
  }, [isDrilling, isScanning, isMoving, roverConfig.instruments, batteryWh, roverPos, drillCores, addLog, showToast]);

  // Action: Wait / Solar Recharge
  const handleWaitSolarRecharge = useCallback(() => {
    if (isMoving || isScanning || isDrilling) return;
    lastUserActivity.current = Date.now();

    const rechargeResult = calculateSolarRechargeStep({
      currentWh: batteryWh,
      maxCapacityWh: maxBatteryWh,
      solarConfig: roverConfig.solar,
      illumination: currentIllumination,
      roverConfig,
      heaterMode,
      dwellMinutes: 20,
      isInsidePSR,
      currentTempC: coreTempC,
      ambientTempC: currentAmbientTemp
    });

    if (!rechargeResult.success) {
      if (rechargeResult.reason === 'RECHARGE_IMPOSSIBLE_IN_PSR') {
        sound.playAlarm();
        addLog('RECHARGE REJECTED: Rover is in darkness (0.0 W solar flux). Dwell in dark will freeze avionics!', 'danger');
        showToast('Cannot recharge: 0.0 W solar flux in the Dark Zone!', 'danger');
      } else if (rechargeResult.reason === 'BATTERY_ALREADY_FULL') {
        sound.playBeep(600, 0.05);
        addLog('BATTERY FULL: Energy storage is already at 100% capacity.', 'info');
        showToast('Battery is already at 100% capacity.', 'info');
      } else if (rechargeResult.reason === 'INSUFFICIENT_SOLAR_SURPLUS') {
        sound.playWarning();
        addLog(`INSUFFICIENT SUNLIGHT: Net power is ${rechargeResult.netSurplusWatts} W. Illumination too low to charge.`, 'warning');
      }
      return;
    }

    setBatteryWh(rechargeResult.newBatteryWh);
    setMissionElapsedMinutes((m) => m + 20);
    setCoreTempC(rechargeResult.newTempC);

    sound.playVictory();
    addLog(`☀️ RECHARGE COMPLETE (+20m): Gained +${rechargeResult.gainedWh} Wh solar energy. Battery at ${Math.round((rechargeResult.newBatteryWh / maxBatteryWh) * 100)}%.`, 'success');
    showToast(`☀️ Recharged +${rechargeResult.gainedWh} Wh in sunlight!`, 'success');
  }, [isMoving, isScanning, isDrilling, batteryWh, maxBatteryWh, roverConfig, currentIllumination, heaterMode, isInsidePSR, coreTempC, currentAmbientTemp, addLog, showToast]);

  // Cycle Subsystems Shortcuts (H = Heater, V = Speed, C = Camera)
  const cycleHeaterMode = useCallback(() => {
    sound.playBeep(750, 0.04);
    const order = ['AUTO', 'LOW', 'HIGH', 'OFF'];
    const next = order[(order.indexOf(heaterMode) + 1) % order.length];
    setHeaterMode(next);
    showToast(`Heater Mode: ${next}`, 'info');
  }, [heaterMode, showToast]);

  const cycleSpeedMode = useCallback(() => {
    sound.playBeep(750, 0.04);
    const order = ['CAUTIOUS', 'NORMAL', 'DASH'];
    const next = order[(order.indexOf(speedMode) + 1) % order.length];
    setSpeedMode(next);
    showToast(`Drive Speed: ${next}`, 'info');
  }, [speedMode, showToast]);

  const cycleCameraMode = useCallback(() => {
    sound.playBeep(750, 0.04);
    const order = ['CHASE', 'ORBIT', 'PANORAMA'];
    const next = order[(order.indexOf(cameraMode) + 1) % order.length];
    setCameraMode(next);
    showToast(`Camera: ${next}`, 'info');
  }, [cameraMode, showToast]);

  // Global Keyboard Shortcuts (WASD, Arrows, Space, E, R, H, V, C, M, ?, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeEmergency) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      const code = e.code;
      const key = e.key;
      lastUserActivity.current = Date.now();

      if (code === 'KeyW' || code === 'ArrowUp') {
        e.preventDefault();
        setDriveCommand((p) => ({ ...p, forward: true }));
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        e.preventDefault();
        setDriveCommand((p) => ({ ...p, reverse: true }));
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        e.preventDefault();
        setDriveCommand((p) => ({ ...p, left: true }));
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        e.preventDefault();
        setDriveCommand((p) => ({ ...p, right: true }));
      } else if (code === 'Space') {
        e.preventDefault();
        if (isMoving) {
          setDriveCommand((p) => ({ ...p, brake: true }));
        } else {
          handleScan();
        }
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        setDriveCommand((p) => ({ ...p, boost: true }));
      } else if (key === 'e' || key === 'E') {
        e.preventDefault();
        handleDrill();
      } else if (key === 'r' || key === 'R') {
        e.preventDefault();
        handleWaitSolarRecharge();
      } else if (key === 'h' || key === 'H') {
        e.preventDefault();
        cycleHeaterMode();
      } else if (key === 'v' || key === 'V') {
        e.preventDefault();
        cycleSpeedMode();
      } else if (key === 'c' || key === 'C') {
        e.preventDefault();
        cycleCameraMode();
      } else if (key === 'm' || key === 'M') {
        e.preventDefault();
        setIsRadarOpen((prev) => !prev);
      } else if (key === '?' || (e.shiftKey && code === 'Slash')) {
        e.preventDefault();
        setIsHowToPlayOpen((prev) => !prev);
      } else if (key === 'Escape') {
        e.preventDefault();
        if (isHowToPlayOpen) closeHowToPlay();
        else if (isLogModalOpen) setIsLogModalOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') setDriveCommand((p) => ({ ...p, forward: false }));
      else if (code === 'KeyS' || code === 'ArrowDown') setDriveCommand((p) => ({ ...p, reverse: false }));
      else if (code === 'KeyA' || code === 'ArrowLeft') setDriveCommand((p) => ({ ...p, left: false }));
      else if (code === 'KeyD' || code === 'ArrowRight') setDriveCommand((p) => ({ ...p, right: false }));
      else if (code === 'Space') setDriveCommand((p) => ({ ...p, brake: false }));
      else if (code === 'ShiftLeft' || code === 'ShiftRight') setDriveCommand((p) => ({ ...p, boost: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeEmergency, isMoving, handleScan, handleDrill, handleWaitSolarRecharge, cycleHeaterMode, cycleSpeedMode, cycleCameraMode, isHowToPlayOpen, isLogModalOpen, isSettingsOpen]);

  // Conclude Mission Handlers
  const handleConfirmFinish = () => {
    setShowFinishConfirm(false);
    sound.playVictory();
    const isSafelyOnRim = roverPos.y < 160;
    const finalOutcome = isSafelyOnRim ? 'FULL_SUCCESS' : 'PARTIAL_SUCCESS';

    onCompleteMission({
      missionOutcome: finalOutcome,
      scienceCollected: sciencePoints,
      waterIceDetectedKg: waterIceKg,
      maxDepthInPSR: maxDepthExplored,
      batteryRemainingPercent: batteryPercent,
      roverHealth,
      coreTempC,
      isSafelyOnRim
    });
  };

  // Quests Checklist Data
  const questsData = [
    {
      id: 1,
      title: isEngineerMode ? LABELS.psr.engineer : 'Reach the Dark Zone',
      subtext: isEngineerMode
        ? `Shadow at Y: 230 (${depthInPSR}m inside)`
        : 'Cross the glowing shadow line',
      done: quest1Done
    },
    {
      id: 2,
      title: isEngineerMode ? 'Survey Volatiles' : 'Find Water Ice',
      subtext: isEngineerMode
        ? `${waterIceKg} kg H₂O detected`
        : 'Scan ground until ice is found',
      done: quest2Done
    },
    {
      id: 3,
      title: isEngineerMode ? 'Cryogenic Coring' : 'Drill 4 Samples',
      subtext: isEngineerMode
        ? `TRIDENT samples: ${drillCores}/4`
        : `Harvest ice cores (${drillCores}/4)`,
      done: quest3Done
    },
    {
      id: 4,
      title: isEngineerMode ? 'Ascend to Sunlit Ridge' : 'Return to Sunny Ridge',
      subtext: isEngineerMode
        ? (roverPos.y < 160 ? 'Uplink active' : 'Occulted / In transit')
        : (roverPos.y < 160 ? 'Safely on sunny rim' : 'Drive north before 0% battery'),
      done: quest4Done
    }
  ];

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* ========================================================= */}
      {/* 1. FULL-SCREEN 3D HORIZON CANVAS (Position: Absolute Inset-0) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0">
        <Lunar3DEnvironment
          roverPos={roverPos}
          roverHeading={roverHeading}
          onRoverUpdate={handleRoverUpdateFrom3D}
          driveCommand={driveCommand}
          speedMode={speedMode}
          isMoving={isMoving}
          isDrilling={isDrilling}
          isScanning={isScanning}
          selectedSite={selectedSite}
          iceDeposits={iceDepositsRef.current}
          waypoint={waypoint}
          onSetWaypoint={(wp) => setWaypoint(wp)}
          onWaypointReached={() => {
            setWaypoint(null);
            sound.playVictory();
            addLog('Waypoint reached.', 'success');
          }}
          onFallbackTo2D={() => {}}
          isFullScreen={true}
          hideInternalHUD={true}
          externalCameraMode={cameraMode}
          onCameraModeChange={(mode) => setCameraMode(mode)}
          resetCameraTrigger={resetCameraTrigger}
          minimapCollapsed={!isRadarOpen}
          hideMinimap={!isRadarOpen}
        />
      </div>

      {/* ========================================================= */}
      {/* 2. OVERLAY HUD CONTAINER (Pointer Events: None) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 overflow-hidden">
        {/* TOP ROW: Left HUD Column & Top-Right Controls */}
        <div className="flex items-start justify-between w-full min-h-0">
          {/* ========================================================= */}
          {/* A. LEFT COLUMN: QUESTS PANEL + 5 RESOURCE METERS */}
          {/* ========================================================= */}
          <div className="flex flex-col gap-2 w-72 max-w-[288px] pointer-events-auto">
            {/* Quests Panel */}
            <div className="bg-space-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="font-display font-bold text-sm text-slate-100 tracking-wide">
                    {isEngineerMode ? 'MISSION OBJECTIVES' : 'EXPEDITION QUESTS'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40">
                    {completedQuestsCount}/4
                  </span>
                  <button
                    onClick={() => setIsQuestsCollapsed((prev) => !prev)}
                    className="p-1 rounded text-slate-400 hover:text-slate-100 cursor-pointer"
                    title={isQuestsCollapsed ? 'Expand quests' : 'Collapse quests'}
                    aria-label="Toggle quests view"
                  >
                    {isQuestsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quests List */}
              {isQuestsCollapsed ? (
                // Compact: Show only current active quest
                <div className="flex items-center space-x-2 p-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-100 block truncate">
                      {questsData[activeQuestIndex].title}
                    </span>
                    <span className="text-slate-400 text-[11px] block truncate">
                      {questsData[activeQuestIndex].subtext}
                    </span>
                  </div>
                </div>
              ) : (
                // Expanded: Show all 4 quests
                <div className="space-y-1.5">
                  {questsData.map((q, idx) => {
                    const isActive = idx === activeQuestIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-1.5 rounded-lg border transition-all text-xs flex items-start space-x-2 ${
                          q.done
                            ? 'bg-emerald-950/25 border-emerald-500/40 text-slate-200'
                            : isActive
                              ? 'bg-cyan-950/40 border-cyan-400/70 text-slate-100 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                              : 'bg-space-900/40 border-slate-800/80 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {q.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border ${
                                isActive
                                  ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                                  : 'border-slate-700 bg-space-950 text-slate-400'
                              }`}
                            >
                              {q.id}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 leading-tight">
                          <div className={`font-semibold text-[13px] ${q.done ? 'line-through text-slate-400' : isActive ? 'text-cyan-200' : 'text-slate-300'}`}>
                            {q.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {q.subtext}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resource StatMeters (5 Stacked Compact Meters) */}
            <div className="bg-space-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl flex flex-col gap-2">
              {/* 1. Sunlight */}
              <StatMeter
                label={isEngineerMode ? LABELS.solarGen.engineer : LABELS.solarGen.simple}
                value={isInsidePSR ? '0 W (Dark Zone)' : `${solarGenWatts} W (${currentIllumination}%)`}
                percentage={isInsidePSR ? 0 : currentIllumination}
                status={isInsidePSR ? 'danger' : 'nominal'}
                icon={<Sun className="w-3.5 h-3.5 text-amber-400" />}
                tooltipText={LABELS.solarGen.tooltip}
              />

              {/* 2. Battery */}
              <StatMeter
                label={isEngineerMode ? LABELS.battery.engineer : LABELS.battery.simple}
                value={`${batteryPercent}% (${Math.round(batteryWh)} Wh)`}
                percentage={batteryPercent}
                status={batteryPercent < 20 ? 'danger' : batteryPercent < 45 ? 'warning' : 'nominal'}
                icon={<Battery className="w-3.5 h-3.5 text-emerald-400" />}
                subtext={estimatedMinsLeft}
                tooltipText={LABELS.battery.tooltip}
              />

              {/* 3. Temperature */}
              <StatMeter
                label={isEngineerMode ? LABELS.coreTemp.engineer : LABELS.coreTemp.simple}
                value={`${coreTempC}°C`}
                percentage={Math.max(0, Math.min(100, ((coreTempC - (-235)) / (40 - (-235))) * 100))}
                status={coreTempC < -80 ? 'danger' : coreTempC < -50 ? 'warning' : 'nominal'}
                icon={<ThermometerSnowflake className="w-3.5 h-3.5 text-blue-400" />}
                subtext={
                  isEngineerMode
                    ? (coreTempC < -80 ? 'Critical Cold' : coreTempC < -50 ? 'Cryogenic Warning' : 'Nominal Core')
                    : (coreTempC < -80 ? 'Cold (Freezing Risk)' : coreTempC < -50 ? 'Cooling' : 'Safe (-60°C to +40°C)')
                }
                tooltipText={LABELS.coreTemp.tooltip}
              />

              {/* 4. Signal to Earth */}
              <StatMeter
                label={isEngineerMode ? LABELS.comm.engineer : LABELS.comm.simple}
                value={commTelemetry.marginDb > 0 ? (isEngineerMode ? `+${commTelemetry.marginDb} dB` : 'Strong Link') : 'NO SIGNAL'}
                percentage={Math.max(0, Math.min(100, (commTelemetry.marginDb / 20) * 100))}
                status={commTelemetry.marginDb <= 0 ? 'danger' : commTelemetry.marginDb < 5 ? 'warning' : 'nominal'}
                icon={<Radio className="w-3.5 h-3.5 text-cyan-400" />}
                tooltipText={LABELS.comm.tooltip}
              />

              {/* 5. Distance into Dark */}
              <StatMeter
                label={isEngineerMode ? LABELS.psrDepth.engineer : LABELS.psrDepth.simple}
                value={`${depthInPSR} m`}
                percentage={Math.min(100, (depthInPSR / 600) * 100)}
                status={depthInPSR > 400 ? 'warning' : 'info'}
                icon={<Compass className="w-3.5 h-3.5 text-purple-400" />}
                subtext={`Max: ${maxDepthExplored} m`}
                tooltipText={LABELS.psrDepth.tooltip}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* B. TOP-RIGHT HUD: Camera, Radar, Help, Settings */}
          {/* ========================================================= */}
          <div className="relative flex flex-col items-end gap-2 pointer-events-auto">
            {/* Control Bar */}
            <div className="flex items-center space-x-1.5 bg-space-950/85 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-2xl">
              {/* Camera Mode Pills */}
              <div className="flex items-center space-x-1 pr-1.5 border-r border-slate-800">
                <button
                  onClick={() => setCameraMode('CHASE')}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-all cursor-pointer ${
                    cameraMode === 'CHASE'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                  title="Chase camera: Follow rover directly [C]"
                >
                  CHASE
                </button>
                <button
                  onClick={() => setCameraMode('ORBIT')}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-all cursor-pointer ${
                    cameraMode === 'ORBIT'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                  title="Orbit camera: 360° mouse drag [C]"
                >
                  ORBIT
                </button>
                <button
                  onClick={() => setCameraMode('PANORAMA')}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition-all cursor-pointer ${
                    cameraMode === 'PANORAMA'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                  title="Panorama camera: Wide summit view [C]"
                >
                  PANO
                </button>
                <button
                  onClick={() => setResetCameraTrigger((t) => t + 1)}
                  className="px-2 py-1 rounded font-mono text-xs text-amber-300 hover:text-amber-100 hover:bg-amber-500/20 transition-all border border-amber-500/40 flex items-center space-x-1 cursor-pointer"
                  title="Reset camera to default view"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              </div>

              {/* Radar Minimap Toggle Button */}
              <button
                onClick={() => setIsRadarOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1 transition-all cursor-pointer ${
                  isRadarOpen
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'border-slate-700 bg-space-900 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Lunar Radar Minimap [M]"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">RADAR</span>
              </button>

              {/* Help Button (?) */}
              <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="p-1.5 rounded-lg border border-slate-700 bg-space-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 transition-all cursor-pointer"
                title="How to Play [?]"
                aria-label="How to play controls"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
              </button>

              {/* Settings Button (⚙) */}
              <button
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSettingsOpen
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                    : 'border-slate-700 bg-space-900 text-slate-300 hover:text-cyan-300'
                }`}
                title="Settings & Subsystems"
                aria-label="Subsystem controls and finish mission"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Controls Hint Banner (Fades after 10s) */}
            {showControlsHint && (
              <div className="bg-space-950/80 backdrop-blur border border-cyan-500/30 px-2.5 py-1 rounded-full text-xs font-mono text-cyan-300 animate-pulse">
                Press <kbd className="px-1 py-0.5 bg-cyan-950 rounded border border-cyan-400 font-bold">?</kbd> for Controls Guide
              </div>
            )}

            {/* Settings Popover */}
            {isSettingsOpen && (
              <div className="w-64 bg-space-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl flex flex-col space-y-3 z-30">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-display font-bold text-xs text-slate-200 tracking-wider">
                    OPERATIONS & SUBSYSTEMS
                  </span>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thermal Heater Control */}
                <div>
                  <div className="text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                    <span>Thermal Heater [H]:</span>
                    <span className="text-cyan-400 font-bold">{heaterMode}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 bg-space-900 p-1 rounded-lg border border-slate-800">
                    {['AUTO', 'LOW', 'HIGH', 'OFF'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          sound.playBeep(750, 0.04);
                          setHeaterMode(mode);
                        }}
                        className={`py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                          heaterMode === mode
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drive Speed Mode */}
                <div>
                  <div className="text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                    <span>Drive Speed [V]:</span>
                    <span className="text-blue-400 font-bold">{speedMode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-space-900 p-1 rounded-lg border border-slate-800">
                    {['CAUTIOUS', 'NORMAL', 'DASH'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          sound.playBeep(750, 0.04);
                          setSpeedMode(mode);
                        }}
                        className={`py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                          speedMode === mode
                            ? 'bg-blue-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Finish Mission Button */}
                <div className="pt-2 border-t border-slate-800">
                  <Button
                    variant={roverPos.y < 160 ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setShowFinishConfirm(true);
                    }}
                    icon={<CheckCircle2 className="w-4 h-4 text-slate-950" />}
                  >
                    <span>CONCLUDE MISSION</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Action Bar (Center) + Mission Log (Right) + Touch Joystick (Left) */}
        <div className="relative flex items-end justify-between w-full min-h-0 pt-2">
          {/* Touch Joystick (Left, only rendered if coarse pointer device) */}
          {isTouchDevice ? (
            <div className="pointer-events-auto bg-space-950/85 backdrop-blur-md border border-slate-700/80 p-2 rounded-2xl shadow-2xl">
              <div className="grid grid-cols-3 gap-1 w-28 h-28">
                <div />
                <button
                  onTouchStart={() => setDriveCommand((p) => ({ ...p, forward: true }))}
                  onTouchEnd={() => setDriveCommand((p) => ({ ...p, forward: false }))}
                  className="rounded-lg bg-cyan-950 border border-cyan-400/60 text-cyan-300 flex items-center justify-center active:scale-95"
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <div />
                <button
                  onTouchStart={() => setDriveCommand((p) => ({ ...p, left: true }))}
                  onTouchEnd={() => setDriveCommand((p) => ({ ...p, left: false }))}
                  className="rounded-lg bg-space-900 border border-slate-700 text-slate-200 flex items-center justify-center active:scale-95"
                >
                  <RotateCcw className="w-5 h-5 text-cyan-400" />
                </button>
                <div />
                <button
                  onTouchStart={() => setDriveCommand((p) => ({ ...p, right: true }))}
                  onTouchEnd={() => setDriveCommand((p) => ({ ...p, right: false }))}
                  className="rounded-lg bg-space-900 border border-slate-700 text-slate-200 flex items-center justify-center active:scale-95"
                >
                  <RotateCw className="w-5 h-5 text-cyan-400" />
                </button>
                <div />
                <button
                  onTouchStart={() => setDriveCommand((p) => ({ ...p, reverse: true }))}
                  onTouchEnd={() => setDriveCommand((p) => ({ ...p, reverse: false }))}
                  className="rounded-lg bg-space-900 border border-slate-700 text-slate-200 flex items-center justify-center active:scale-95"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <div />
              </div>
            </div>
          ) : (
            <div className="w-72" />
          )}

          {/* ========================================================= */}
          {/* C. SLIM ACTION BAR (Bottom-Center, Min 44px Tap Target) */}
          {/* ========================================================= */}
          {SHOW_ACTION_BAR && (
            <div className="pointer-events-auto flex items-center gap-2 bg-space-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 shadow-2xl">
              {/* 1. Scan Ground [Space] */}
              <Tooltip text="Scan regolith for water ice deposits (consumes 15 Wh)">
                <button
                  onClick={handleScan}
                  disabled={isScanning || isDrilling}
                  className="h-11 px-4 rounded-lg font-mono text-sm font-semibold border border-cyan-500/50 bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                >
                  <Search className={`w-4 h-4 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Scan Ground</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-cyan-900/80 border border-cyan-400/50 text-[11px] text-cyan-200">
                    Space
                  </kbd>
                </button>
              </Tooltip>

              {/* 2. Drill Sample [E] */}
              <Tooltip
                text={
                  isMoving
                    ? 'Stop rover movement before drilling'
                    : batteryWh < 65
                      ? 'Requires at least 65 Wh battery'
                      : drillCores >= 4
                        ? 'All 4 ice samples collected'
                        : isNearIce
                          ? 'Extracts rich cryogenic ice core (uses 60 Wh)'
                          : 'Drill lunar regolith core sample (+25 Science, uses 60 Wh)'
                }
              >
                <button
                  onClick={handleDrill}
                  disabled={isDrilling || isScanning || isMoving || batteryWh < 65 || drillCores >= 4}
                  className="h-11 px-4 rounded-lg font-mono text-sm font-semibold border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                >
                  <Crosshair className={`w-4 h-4 text-amber-400 ${isDrilling ? 'animate-bounce' : ''}`} />
                  <span>Drill Sample</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-900/80 border border-amber-400/50 text-[11px] text-amber-200">
                    E
                  </kbd>
                </button>
              </Tooltip>

              {/* 3. Recharge in Sun [R] */}
              <Tooltip
                text={
                  isInsidePSR
                    ? 'Cannot recharge: 0.0 W solar flux in Dark Zone!'
                    : batteryPercent >= 100
                      ? 'Battery storage is already at 100%'
                      : isMoving
                        ? 'Stop rover to orient solar panels'
                        : 'Dwell 20 min in sunlight to recharge battery and warm avionics'
                }
              >
                <button
                  onClick={handleWaitSolarRecharge}
                  disabled={isInsidePSR || isMoving || isScanning || isDrilling || batteryPercent >= 100}
                  className={`h-11 px-4 rounded-lg font-mono text-sm font-semibold border flex items-center space-x-2 transition-all cursor-pointer ${
                    isInsidePSR || batteryPercent >= 100
                      ? 'border-red-900/50 bg-red-950/20 text-red-400 opacity-50 cursor-not-allowed'
                      : 'border-yellow-500/60 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.25)]'
                  }`}
                >
                  <Sun className={`w-4 h-4 ${isInsidePSR ? 'text-red-400' : 'text-yellow-400'}`} />
                  <span>Recharge</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-yellow-900/80 border border-yellow-400/50 text-[11px] text-yellow-200">
                    R
                  </kbd>
                </button>
              </Tooltip>
            </div>
          )}

          {/* ========================================================= */}
          {/* D. MISSION LOG & COACH (Bottom-Right, ~340px Wide) */}
          {/* ========================================================= */}
          <div className="pointer-events-auto w-[340px] max-h-[180px] bg-space-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1 shrink-0">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-display font-bold text-xs text-slate-200 tracking-wider">
                  MISSION LOG // COACH
                </span>
              </div>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Full log
              </button>
            </div>

            {/* Live Message Feed (Latest 3-4 Messages) */}
            <div
              ref={logContainerRef}
              role="log"
              aria-live="polite"
              className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1 max-h-28"
            >
              {logs.slice(-4).map((log) => (
                <div
                  key={log.id}
                  className={`leading-tight py-0.5 ${
                    log.type === 'danger'
                      ? 'text-red-300'
                      : log.type === 'warning'
                        ? 'text-amber-300'
                        : log.type === 'success'
                          ? 'text-emerald-300'
                          : log.type === 'tip'
                            ? 'text-cyan-200'
                            : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 text-[10px] mr-1.5">[{log.time || 'T+0'}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MODALS & DIALOGS */}
      {/* ========================================================= */}

      {/* Emergency Event Modal */}
      {activeEmergency && (
        <EmergencyModal
          event={activeEmergency}
          onResolve={handleResolveEmergency}
        />
      )}

      {/* Finish Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showFinishConfirm}
        title="Conclude Lunar Surface Operations?"
        message={
          roverPos.y < 160
            ? 'Your rover is safely stationed on the sunlit summit rim with all collected ice samples. Ready to transmit scientific telemetry and debrief with NASA?'
            : `Your rover is currently ${depthInPSR} meters deep inside the cryogenic Dark Zone. If you conclude now, the rover will remain in the dark with reduced recovery bonus. Do you wish to proceed?`
        }
        confirmText="Conclude Mission"
        cancelText="Keep Exploring"
        variant={roverPos.y < 160 ? 'primary' : 'danger'}
        onConfirm={handleConfirmFinish}
        onCancel={() => setShowFinishConfirm(false)}
      />

      {/* How to Play Modal (Auto-opens on first entry & accessible via '?') */}
      <Modal
        isOpen={isHowToPlayOpen}
        onClose={closeHowToPlay}
        title="OPERATION COLD TRAP — HOW TO PLAY"
        size="md"
      >
        <div className="space-y-4 font-sans text-sm text-slate-300">
          <p className="text-slate-200 leading-relaxed">
            Your mission is to pilot the rover from the sunny summit ridge into the freezing Dark Zone crater, locate water ice deposits, extract drill samples, and return safely to the sunny rim before your battery depletes.
          </p>

          <div className="border border-slate-800 rounded-xl bg-space-950 p-3">
            <h4 className="font-display font-bold text-sm text-cyan-300 mb-2">
              KEYBOARD & CONTROLS
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Drive Rover</span>
                <span className="text-cyan-300 font-bold">W / A / S / D or Arrows</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Scan for Ice</span>
                <span className="text-cyan-300 font-bold">Space</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Drill Sample</span>
                <span className="text-cyan-300 font-bold">E</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Solar Recharge</span>
                <span className="text-cyan-300 font-bold">R</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Heater Mode</span>
                <span className="text-cyan-300 font-bold">H</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Drive Speed</span>
                <span className="text-cyan-300 font-bold">V</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Camera View</span>
                <span className="text-cyan-300 font-bold">C</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Minimap Radar</span>
                <span className="text-cyan-300 font-bold">M</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Controls Help</span>
                <span className="text-cyan-300 font-bold">?</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-400">Close / Cancel</span>
                <span className="text-cyan-300 font-bold">Esc</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-bold text-sm text-amber-300">
              3 SURVIVAL RULES
            </h4>
            <div className="flex items-start space-x-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold shrink-0">1</span>
              <span><strong>Solar is 0.0 W in the dark.</strong> When you cross the glowing yellow line, your battery is your only power.</span>
            </div>
            <div className="flex items-start space-x-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-400 text-amber-300 flex items-center justify-center font-bold shrink-0">2</span>
              <span><strong>Watch temperature.</strong> Keep heaters on to prevent cryogenic cold-weld freezing below -80°C.</span>
            </div>
            <div className="flex items-start space-x-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 flex items-center justify-center font-bold shrink-0">3</span>
              <span><strong>Escape before 0%.</strong> Always leave enough energy to drive back up to the sunny ridge.</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center mt-2 cursor-pointer"
            onClick={closeHowToPlay}
          >
            <span>UNDERSTOOD — LET'S EXPLORE</span>
          </Button>
        </div>
      </Modal>

      {/* Full Telemetry Log Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="MISSION TELEMETRY & EVENT LOG"
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 font-mono text-xs">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg border leading-relaxed ${
                log.type === 'danger'
                  ? 'bg-red-950/40 border-red-500/40 text-red-200'
                  : log.type === 'warning'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : log.type === 'success'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : log.type === 'tip'
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                        : 'bg-space-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                <span>{log.time || 'T+0m'}</span>
                <span className="uppercase tracking-wider">{log.type}</span>
              </div>
              <div>{log.text}</div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Toast Notifications */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((t) => ({ ...t, isOpen: false }))}
      />
    </div>
  );
}
