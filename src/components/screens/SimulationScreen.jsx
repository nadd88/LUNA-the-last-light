import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Compass, 
  Sun, 
  Battery, 
  BatteryCharging, 
  Thermometer, 
  ThermometerSnowflake, 
  Radio, 
  Zap, 
  Navigation, 
  RotateCcw, 
  RotateCw, 
  Crosshair, 
  Search, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Award, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  calculateSolarPower, 
  calculatePowerDraw, 
  calculateThermalStep, 
  calculateBatteryStep, 
  calculateCommSignal, 
  getThermalStatus 
} from '../../utils/physics';
import { EMERGENCY_EVENTS } from '../../data/eventsData';
import { sound } from '../../utils/sound';
import EmergencyModal from './EmergencyModal';

export default function SimulationScreen({
  roverConfig,
  selectedSite,
  onCompleteMission,
  onUpdateTelemetry
}) {
  const canvasRef = useRef(null);

  // Simulation State
  const [roverPos, setRoverPos] = useState({ x: 300, y: 80 }); // y=80 is sunlight, y>220 is PSR
  const [roverHeading, setRoverHeading] = useState(90); // 90° = pointing down into PSR
  const [tracks, setTracks] = useState([]); // Wheel tracks in regolith

  // Resource State
  const maxBatteryWh = roverConfig?.battery?.capacity || 2000;
  const [batteryWh, setBatteryWh] = useState(maxBatteryWh);
  const [coreTempC, setCoreTempC] = useState(-35); // Start at standard daytime avionics temp
  const [heaterMode, setHeaterMode] = useState('AUTO'); // 'OFF' | 'LOW' | 'HIGH' | 'AUTO'
  const [speedMode, setSpeedMode] = useState('NORMAL'); // 'CAUTIOUS' | 'NORMAL' | 'DASH'

  // Mission Metrics
  const [depthInPSR, setDepthInPSR] = useState(0); // meters into darkness
  const [maxDepthExplored, setMaxDepthExplored] = useState(0);
  const [sciencePoints, setSciencePoints] = useState(0);
  const [waterIceKg, setWaterIceKg] = useState(0);
  const [drillCores, setDrillCores] = useState(0);
  const [roverHealth, setRoverHealth] = useState(100);
  const [missionElapsedMinutes, setMissionElapsedMinutes] = useState(0);

  // State flags & Activity
  const [isDrilling, setIsDrilling] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, text: `Touchdown verified at ${selectedSite.name}. Subsystems nominal.`, type: 'info' },
    { id: 2, text: 'Solar panels deployed. Sunlit rim baseline established.', type: 'info' }
  ]);

  // Emergency Event State
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [triggeredEventKeys, setTriggeredEventKeys] = useState(new Set());

  // Ice deposits in the PSR
  const iceDepositsRef = useRef([
    { x: 260, y: 280, concentration: 4.8, depth: 0.2, scanned: false, drilled: false },
    { x: 380, y: 340, concentration: 7.2, depth: 0.5, scanned: false, drilled: false },
    { x: 220, y: 440, concentration: 11.4, depth: 0.8, scanned: false, drilled: false },
    { x: 420, y: 520, concentration: 14.8, depth: 1.0, scanned: false, drilled: false }
  ]);

  const addLog = useCallback((text, type = 'info') => {
    setLogs((prev) => [
      { id: Date.now() + Math.random(), text, type, time: `T+${missionElapsedMinutes}m` },
      ...prev.slice(0, 15)
    ]);
  }, [missionElapsedMinutes]);

  // Illumination calculation based on Y position on map
  // Y: 40 - 150 = Sunlit Ridge (80% - 95%)
  // Y: 150 - 240 = Transition Penumbra (75% -> 5%)
  // Y >= 240 = Permanently Shadowed Region (0.0% Solar Flux!)
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

  // Ambient temperature based on Y position
  const getAmbientTempAtY = (y) => {
    if (y < 140) return -45; // ~228 Kelvin in sun
    if (y < 230) {
      const ratio = (y - 140) / 90;
      return Math.round(-45 + (-235 - (-45)) * ratio);
    }
    return -238; // ~35 Kelvin in deep cold trap
  };

  const currentAmbientTemp = getAmbientTempAtY(roverPos.y);

  // Electrical physics
  const solarGenWatts = calculateSolarPower(roverConfig.solar, currentIllumination);
  const powerDrawWatts = calculatePowerDraw(roverConfig, {
    isMoving,
    isScanning,
    isDrilling,
    heaterState: heaterMode
  });
  const netPowerWatts = Math.round((solarGenWatts - powerDrawWatts) * 10) / 10;
  const batteryPercent = Math.round((batteryWh / maxBatteryWh) * 100);

  // Comm status
  const commTelemetry = calculateCommSignal(roverConfig.comm, depthInPSR);
  const thermalStatus = getThermalStatus(coreTempC);

  // Check game over
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
  }, [batteryWh, coreTempC]);

  // Main simulation clock tick (Runs every 2.5 seconds = 1 minute simulation time)
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionElapsedMinutes((m) => m + 1);

      // Battery update
      setBatteryWh((prevWh) => {
        const updated = calculateBatteryStep(prevWh, netPowerWatts, maxBatteryWh, 1/60);
        return updated;
      });

      // Thermal update
      setCoreTempC((prevTemp) => {
        const updated = calculateThermalStep(
          prevTemp,
          currentAmbientTemp,
          powerDrawWatts,
          roverConfig,
          heaterMode,
          1
        );
        return updated;
      });

      // Health degradation if operating in cryogenic extremes without sufficient heat
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

  // Handle resolving emergency choice
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

  // Move Rover Action
  const handleMove = (direction) => {
    sound.playDrive();
    setIsMoving(true);
    setTimeout(() => setIsMoving(false), 400);

    const speedDist = speedMode === 'DASH' ? 24 : speedMode === 'CAUTIOUS' ? 10 : 16;
    const rad = (roverHeading * Math.PI) / 180;

    let dx = 0;
    let dy = 0;

    if (direction === 'forward') {
      dx = Math.cos(rad) * speedDist;
      dy = Math.sin(rad) * speedDist;
    } else if (direction === 'reverse') {
      dx = -Math.cos(rad) * speedDist;
      dy = -Math.sin(rad) * speedDist;
    }

    setRoverPos((prev) => {
      const nextX = Math.max(40, Math.min(560, prev.x + dx));
      const nextY = Math.max(60, Math.min(560, prev.y + dy));

      // Record tracks
      setTracks((tr) => [...tr.slice(-50), { x: nextX, y: nextY }]);

      // Calculate depth into PSR (starts at y=230)
      const currentDepth = Math.max(0, Math.round((nextY - 230) * 1.5));
      setDepthInPSR(currentDepth);
      setMaxDepthExplored((m) => Math.max(m, currentDepth));

      return { x: nextX, y: nextY };
    });

    // Small battery drain for locomotion
    const moveCost = speedMode === 'DASH' ? 12 : 7;
    setBatteryWh((b) => Math.max(0, b - moveCost));
  };

  // Turn Rover
  const handleTurn = (deltaDeg) => {
    sound.playBeep(700, 0.04);
    setRoverHeading((h) => (h + deltaDeg + 360) % 360);
  };

  // Scan Regolith Action
  const handleScan = () => {
    sound.playScan();
    setIsScanning(true);
    addLog('NSS/NIRVSS active scan initiated...', 'info');

    setTimeout(() => {
      setIsScanning(false);
      // Check proximity to ice deposits
      let foundIce = false;
      iceDepositsRef.current.forEach((dep) => {
        const dist = Math.hypot(dep.x - roverPos.x, dep.y - roverPos.y);
        if (dist < 55 && !dep.scanned) {
          dep.scanned = true;
          foundIce = true;
          sound.playDiscovery();
          const detectedKg = Math.round(dep.concentration * 3.5);
          setWaterIceKg((w) => w + detectedKg);
          setSciencePoints((s) => s + 45);
          addLog(`ICE ANOMALY CONFIRMED: ${dep.concentration}% wt eq H₂O detected at ${dep.depth}m depth! (+${detectedKg}kg, +45 Science)`, 'success');
        }
      });

      if (!foundIce) {
        if (isInsidePSR) {
          setSciencePoints((s) => s + 15);
          addLog(`Diffuse epithermal neutron reading logged inside cold trap. Trace hydrogen detected (+15 Science).`, 'info');
        } else {
          setSciencePoints((s) => s + 5);
          addLog('Regolith scan complete. Desiccated surface material on sunlit rim (+5 Science).', 'info');
        }
      }
      setBatteryWh((b) => Math.max(0, b - 15));
    }, 800);
  };

  // Drill Core Action
  const handleDrill = () => {
    const hasDrill = roverConfig.instruments?.some((i) => i.id.includes('drill'));
    if (!hasDrill) {
      sound.playWarning();
      addLog('COMMAND REJECTED: TRIDENT drill is not installed on this chassis!', 'danger');
      return;
    }

    if (batteryWh < 65) {
      sound.playWarning();
      addLog('INSUFFICIENT POWER: Drill sequence requires at least 65 Wh reserve.', 'warning');
      return;
    }

    sound.playDrill();
    setIsDrilling(true);
    addLog('TRIDENT rotary percussive drill deploying into cryogenic permafrost...', 'warning');

    setTimeout(() => {
      setIsDrilling(false);
      let drilledDeposit = false;
      iceDepositsRef.current.forEach((dep) => {
        const dist = Math.hypot(dep.x - roverPos.x, dep.y - roverPos.y);
        if (dist < 55 && !dep.drilled) {
          dep.drilled = true;
          drilledDeposit = true;
          sound.playVictory();
          const coreIceKg = Math.round(dep.concentration * 7.5);
          setWaterIceKg((w) => w + coreIceKg);
          setDrillCores((d) => d + 1);
          setSciencePoints((s) => s + 85);
          addLog(`DRILL SUCCESS: Extracted 100cm pristine cryogenic ice core! Yield: ${coreIceKg}kg H₂O (+85 Science)`, 'success');
        }
      });

      if (!drilledDeposit) {
        setDrillCores((d) => d + 1);
        setSciencePoints((s) => s + 25);
        addLog('Core extraction complete. Deep cryogenic silicates recovered (+25 Science).', 'info');
      }

      setBatteryWh((b) => Math.max(0, b - 60));
      setCoreTempC((t) => t - 5); // Thermal loss during mechanical drilling
    }, 1400);
  };

  // Render Topographic Lunar Surface Map Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 600);
    const height = (canvas.height = 600);

    ctx.clearRect(0, 0, width, height);

    // 1. Base Lunar Regolith Gradient
    // Y=0 to 140: Bright Sunlit Ridge
    // Y=140 to 240: Penumbra Slope
    // Y=240 to 600: Pitch Black Permanently Shadowed Region
    const terrainGrad = ctx.createLinearGradient(0, 0, 0, height);
    terrainGrad.addColorStop(0, '#334155'); // Sunlit crest
    terrainGrad.addColorStop(0.22, '#1e293b'); // Rim slope
    terrainGrad.addColorStop(0.38, '#0f172a'); // Penumbra threshold
    terrainGrad.addColorStop(0.44, '#030712'); // Shadow line
    terrainGrad.addColorStop(1, '#000206'); // Deep PSR floor
    ctx.fillStyle = terrainGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Grazing Polar Sunlight Beams (Sun elevation ~1.8°)
    const sunBeam = ctx.createLinearGradient(0, 0, width, 180);
    sunBeam.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
    sunBeam.addColorStop(0.5, 'rgba(186, 230, 253, 0.15)');
    sunBeam.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunBeam;
    ctx.fillRect(0, 0, width, 180);

    // 3. Shadow Boundary Contour Line (Sharp razor-edge shadow)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 230);
    // Slight wavy crater rim shadow
    for (let x = 0; x <= width; x += 30) {
      const offset = Math.sin(x * 0.02) * 12 + Math.cos(x * 0.05) * 6;
      ctx.lineTo(x, 230 + offset);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Shadow boundary label
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.fillText('SHADOW BOUNDARY // 0.0W SOLAR BEYOND THIS LINE', 20, 222);

    // 5. Ambient Starlight & Secondary Earthshine inside PSR
    const earthshine = ctx.createRadialGradient(width * 0.7, 400, 20, width * 0.7, 400, 300);
    earthshine.addColorStop(0, 'rgba(30, 58, 138, 0.08)');
    earthshine.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = earthshine;
    ctx.fillRect(0, 230, width, height - 230);

    // 6. Impact Craters on Terrain
    const craters = [
      { x: 120, y: 90, r: 24, inSun: true },
      { x: 480, y: 110, r: 35, inSun: true },
      { x: 160, y: 320, r: 42, inSun: false },
      { x: 380, y: 460, r: 60, inSun: false },
      { x: 180, y: 520, r: 30, inSun: false }
    ];

    craters.forEach((crater) => {
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
      ctx.strokeStyle = crater.inSun ? 'rgba(148, 163, 184, 0.4)' : 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shadow inside crater rim
      const craterGrad = ctx.createRadialGradient(
        crater.x - crater.r * 0.3,
        crater.y - crater.r * 0.3,
        2,
        crater.x,
        crater.y,
        crater.r
      );
      craterGrad.addColorStop(0, crater.inSun ? 'rgba(51, 65, 85, 0.4)' : 'rgba(2, 6, 23, 0.8)');
      craterGrad.addColorStop(1, crater.inSun ? 'rgba(15, 23, 42, 0.8)' : 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = craterGrad;
      ctx.fill();
    });

    // 7. Render Subsurface Ice Deposit Sparkles (revealed if scanned)
    iceDepositsRef.current.forEach((dep) => {
      if (dep.scanned || Math.hypot(dep.x - roverPos.x, dep.y - roverPos.y) < 70) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(dep.x, dep.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#67e8f9';
        ctx.font = '9px monospace';
        ctx.fillText(`ICE ${dep.concentration}%`, dep.x - 20, dep.y - 18);
        ctx.restore();
      }
    });

    // 8. Render Rover Wheel Tracks
    if (tracks.length > 1) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tracks[0].x, tracks[0].y);
      for (let i = 1; i < tracks.length; i++) {
        ctx.lineTo(tracks[i].x, tracks[i].y);
      }
      ctx.stroke();
    }

    // 9. Rover Headlight Beam cutting through darkness
    const rad = (roverHeading * Math.PI) / 180;
    const beamLength = 110;
    const beamSpread = 0.55; // Angle spread

    ctx.save();
    ctx.translate(roverPos.x, roverPos.y);

    const lightCone = ctx.createRadialGradient(0, 0, 8, Math.cos(rad) * 60, Math.sin(rad) * 60, beamLength);
    lightCone.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    lightCone.addColorStop(0.3, 'rgba(0, 240, 255, 0.4)');
    lightCone.addColorStop(0.8, 'rgba(0, 240, 255, 0.1)');
    lightCone.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, beamLength, rad - beamSpread, rad + beamSpread);
    ctx.closePath();
    ctx.fillStyle = lightCone;
    ctx.fill();

    // 10. Render Rover Body & Chassis
    ctx.rotate(rad);

    // Rover Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-12, -8, 24, 16);

    // Wheels
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-14, -14, 8, 5);
    ctx.fillRect(6, -14, 8, 5);
    ctx.fillRect(-14, 9, 8, 5);
    ctx.fillRect(6, 9, 8, 5);

    // Body
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-10, -9, 20, 18);
    ctx.strokeRect(-10, -9, 20, 18);

    // Solar mast or sensor head
    ctx.fillStyle = isInsidePSR ? '#ef4444' : '#00f0ff';
    ctx.beginPath();
    ctx.arc(4, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Heading Arrow pointer
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(15, 0);
    ctx.lineTo(12, -3);
    ctx.moveTo(15, 0);
    ctx.lineTo(12, 3);
    ctx.stroke();

    ctx.restore();
  }, [roverPos, roverHeading, tracks, isInsidePSR]);

  // Complete Mission handler (return to base or conclude)
  const handleDeclareCompletion = () => {
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

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
      {/* Top Telemetry Alert Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3">
        {/* Solar Gen */}
        <div className={`p-2 rounded border font-mono text-xs flex items-center justify-between ${
          isInsidePSR ? 'bg-red-950/40 border-red-500/50 text-red-300' : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
        }`}>
          <div className="flex items-center space-x-1.5">
            <Sun className={`w-3.5 h-3.5 ${isInsidePSR ? 'text-red-400' : 'text-cyan-400'}`} />
            <span>Solar:</span>
          </div>
          <span className="font-bold">{solarGenWatts} W</span>
        </div>

        {/* Battery SOC */}
        <div className={`p-2 rounded border font-mono text-xs flex items-center justify-between ${
          batteryPercent < 25 ? 'bg-red-950/50 border-red-500 text-red-300 animate-pulse' : 'bg-space-900 border-slate-700 text-slate-200'
        }`}>
          <div className="flex items-center space-x-1.5">
            <Battery className="w-3.5 h-3.5 text-cyan-400" />
            <span>Battery:</span>
          </div>
          <span className="font-bold">{batteryPercent}% ({Math.round(batteryWh)}Wh)</span>
        </div>

        {/* Core Temp */}
        <div className={`p-2 rounded border font-mono text-xs flex items-center justify-between ${
          thermalStatus.color === 'red' ? 'bg-red-950/50 border-red-500 text-red-300 animate-pulse' : 'bg-space-900 border-slate-700 text-slate-200'
        }`}>
          <div className="flex items-center space-x-1.5">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-amber-400" />
            <span>Core:</span>
          </div>
          <span className="font-bold">{coreTempC}°C</span>
        </div>

        {/* Net Power */}
        <div className="p-2 rounded border border-slate-700 bg-space-900 font-mono text-xs flex items-center justify-between text-slate-200">
          <div className="flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Net:</span>
          </div>
          <span className={`font-bold ${netPowerWatts >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netPowerWatts > 0 ? `+${netPowerWatts}` : netPowerWatts} W
          </span>
        </div>

        {/* Comm Signal */}
        <div className="p-2 rounded border border-slate-700 bg-space-900 font-mono text-xs flex items-center justify-between text-slate-200">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Comm:</span>
          </div>
          <span className={`font-bold text-[11px] ${commTelemetry.status.includes('OCCULTED') ? 'text-red-400' : 'text-cyan-300'}`}>
            {commTelemetry.marginDb > 0 ? `+${commTelemetry.marginDb} dB` : 'NO SIGNAL'}
          </span>
        </div>

        {/* PSR Depth */}
        <div className="p-2 rounded border border-cyan-500/30 bg-space-900 font-mono text-xs flex items-center justify-between text-slate-200">
          <div className="flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>PSR Depth:</span>
          </div>
          <span className="font-bold text-cyan-300">{depthInPSR} m</span>
        </div>
      </div>

      {/* Main Simulation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Canvas Map (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="hud-panel p-2 rounded-lg border border-cyan-500/30 bg-space-950 relative overflow-hidden">
            <div className="absolute top-3 left-3 z-10 bg-space-950/80 backdrop-blur border border-slate-700/80 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isInsidePSR ? 'bg-red-500 animate-ping' : 'bg-cyan-400'}`} />
              <span>ZONE: {isInsidePSR ? 'PERMANENTLY SHADOWED REGION (0.0 W)' : 'SUNLIT SUMMIT CREST'}</span>
            </div>

            <canvas
              ref={canvasRef}
              className="w-full h-auto aspect-square rounded border border-slate-800 bg-black cursor-crosshair"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 py-1">
              <span>Top: Sunlit Rim Crest (+88% Illum)</span>
              <span>Bottom: Cryogenic Cold Trap (-238°C)</span>
            </div>
          </div>
        </div>

        {/* Right: Flight Controls & Telemetry Terminal (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tactical Control Pad */}
          <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/90">
            <div className="text-xs font-mono text-cyan-400 font-bold mb-3 flex items-center justify-between">
              <span>ROVER DRIVE & ACTUATORS</span>
              <span className="text-slate-400 text-[10px]">HEADING: {roverHeading}°</span>
            </div>

            {/* Directional Pad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
              <div />
              <button
                onClick={() => handleMove('forward')}
                disabled={isMoving}
                className="p-3 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 flex flex-col items-center justify-center font-mono text-xs active:scale-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              >
                <ChevronUp className="w-5 h-5" />
                <span className="text-[9px]">ADVANCE</span>
              </button>
              <div />

              <button
                onClick={() => handleTurn(-30)}
                className="p-3 rounded-lg bg-space-900 hover:bg-space-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center font-mono text-xs active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400 mb-0.5" />
                <span className="text-[9px]">-30°</span>
              </button>

              <button
                onClick={() => handleMove('reverse')}
                disabled={isMoving}
                className="p-3 rounded-lg bg-space-900 hover:bg-space-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center font-mono text-xs active:scale-95 transition-all"
              >
                <ChevronDown className="w-5 h-5" />
                <span className="text-[9px]">RETREAT</span>
              </button>

              <button
                onClick={() => handleTurn(30)}
                className="p-3 rounded-lg bg-space-900 hover:bg-space-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center font-mono text-xs active:scale-95 transition-all"
              >
                <RotateCw className="w-4 h-4 text-cyan-400 mb-0.5" />
                <span className="text-[9px]">+30°</span>
              </button>
            </div>

            {/* Science Actions */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleScan}
                disabled={isScanning || isDrilling}
                className="p-2.5 rounded border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-mono text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'SCANNING...' : 'SCAN REGOLITH'}</span>
              </button>

              <button
                onClick={handleDrill}
                disabled={isDrilling || isScanning}
                className="p-2.5 rounded border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 font-mono text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isDrilling ? 'animate-bounce' : ''}`} />
                <span>{isDrilling ? 'DRILLING...' : 'TRIDENT DRILL'}</span>
              </button>
            </div>

            {/* Subsystem Toggles: Heater & Speed Mode */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 block mb-1">Thermal Heater:</span>
                <div className="flex rounded border border-slate-700 overflow-hidden">
                  {['AUTO', 'LOW', 'HIGH', 'OFF'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        sound.playBeep(750, 0.04);
                        setHeaterMode(mode);
                      }}
                      className={`flex-1 py-1 text-[10px] transition-colors ${
                        heaterMode === mode ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-space-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Drive Speed:</span>
                <div className="flex rounded border border-slate-700 overflow-hidden">
                  {['CAUTIOUS', 'NORMAL', 'DASH'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        sound.playBeep(750, 0.04);
                        setSpeedMode(mode);
                      }}
                      className={`flex-1 py-1 text-[10px] transition-colors ${
                        speedMode === mode ? 'bg-blue-500 text-slate-950 font-bold' : 'bg-space-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Science Harvest Cargo Manifest */}
          <div className="hud-panel p-3.5 rounded-lg border border-slate-700 bg-space-900/70">
            <div className="text-xs font-mono text-emerald-400 font-bold mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>SCIENCE HARVEST MANIFEST</span>
              </span>
              <span className="text-cyan-300 font-bold">{sciencePoints} PTS</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded bg-space-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Water Ice</span>
                <span className="text-cyan-300 font-bold">{waterIceKg} kg</span>
              </div>
              <div className="p-2 rounded bg-space-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Drill Cores</span>
                <span className="text-emerald-300 font-bold">{drillCores} / 4</span>
              </div>
              <div className="p-2 rounded bg-space-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Max Depth</span>
                <span className="text-blue-300 font-bold">{maxDepthExplored} m</span>
              </div>
            </div>
          </div>

          {/* Live Telemetry Action Log */}
          <div className="hud-panel p-3 rounded-lg border border-slate-700 bg-space-950/80">
            <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
              <span>TELEMETRY COMM LINK LOG</span>
              <span className="text-cyan-400">DOWNLINK ACTIVE</span>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto font-mono text-[11px] pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`leading-tight ${
                    log.type === 'danger'
                      ? 'text-red-400'
                      : log.type === 'warning'
                      ? 'text-amber-300'
                      : log.type === 'success'
                      ? 'text-emerald-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 text-[9px] mr-1.5">[{log.time || 'T+0'}]</span>
                  {log.text}
                </div>
              ))}
            </div>
          </div>

          {/* Mission Conclusion CTA */}
          <button
            onClick={handleDeclareCompletion}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>TRANSMIT SCIENCE & CONCLUDE MISSION</span>
          </button>
        </div>
      </div>

      {/* Emergency Event Modal */}
      {activeEmergency && (
        <EmergencyModal
          event={activeEmergency}
          onResolve={handleResolveEmergency}
        />
      )}
    </div>
  );
}
