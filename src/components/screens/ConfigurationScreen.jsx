import React, { useState, useMemo } from 'react';
import { 
  Check, 
  ArrowRight, 
  DollarSign,
  Weight,
  Clock,
  Sparkles,
  Star,
  Info,
  CheckCircle2,
  Cpu,
  BatteryCharging,
  ThermometerSnowflake,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ROVER_COMPONENTS, MISSION_CONSTRAINTS } from '../../data/componentsData';
import { calculatePowerDraw, calculateDarkSurvivalMinutes } from '../../utils/physics';
import { sound } from '../../utils/sound';
import { useGameMode } from '../../context/GameModeContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import StageHeader from '../common/StageHeader';
import Tooltip from '../common/Tooltip';

export default function ConfigurationScreen({
  initialConfig,
  selectedSite,
  onProceed,
  onBack
}) {
  const { isEngineerMode } = useGameMode();

  // 3 Player-Selectable Subsystems
  const [chassis, setChassis] = useState(initialConfig?.chassis || ROVER_COMPONENTS.chassis[1]);
  const [battery, setBattery] = useState(initialConfig?.battery || ROVER_COMPONENTS.battery[1]);
  const [thermal, setThermal] = useState(initialConfig?.thermal || ROVER_COMPONENTS.thermal[1]);

  // Fixed Non-Selectable Subsystems (keep current defaults for exact physics simulation)
  const fixedSolar = ROVER_COMPONENTS.solar[1]; // Deployable Sun-Tracking Mast ($24M, 42kg)
  const fixedComm = ROVER_COMPONENTS.comm[1]; // Gimbaled High-Gain X-Band Dish ($19M, 22kg)
  const fixedInstruments = [
    ROVER_COMPONENTS.instruments[0], // NSS ($16M, 14kg)
    ROVER_COMPONENTS.instruments[1], // NIRVSS ($18M, 16kg)
    ROVER_COMPONENTS.instruments[2]  // TRIDENT 1-Meter Cryogenic Percussive Rotary Drill ($29M, 35kg - standard on all rovers)
  ];

  const fixedCost = fixedSolar.cost + fixedComm.cost + fixedInstruments.reduce((s, i) => s + i.cost, 0); // $106M
  const fixedMass = fixedSolar.mass + fixedComm.mass + fixedInstruments.reduce((s, i) => s + i.mass, 0); // 129 kg

  // Totals
  const totalCost = (chassis?.cost || 0) + (battery?.cost || 0) + (thermal?.cost || 0) + fixedCost;
  const totalMass = (chassis?.mass || 0) + (battery?.mass || 0) + (thermal?.mass || 0) + fixedMass;

  // Base power consumption and peak generation
  const totalBasePowerDraw = (chassis?.basePower || 0) + fixedComm.powerDraw + ((thermal?.powerDraw || 0) * 0.5);
  const siteIllumination = selectedSite?.peakIllumination || 88;
  const peakSolarGen = Math.round(fixedSolar.generation * (siteIllumination / 100) * fixedSolar.lowSunAngleEfficiency);

  // Survival time in dark computed strictly from physics.js
  const survivalConfig = useMemo(() => ({
    chassis,
    solar: fixedSolar,
    battery,
    thermal,
    comm: fixedComm,
    instruments: fixedInstruments,
    activeInstrument: fixedInstruments[0]
  }), [chassis, battery, thermal]);

  const estimatedSurvivalMinutes = useMemo(() => {
    return calculateDarkSurvivalMinutes(survivalConfig);
  }, [survivalConfig]);

  // Validation
  const isBudgetExceeded = totalCost > MISSION_CONSTRAINTS.maxBudget;
  const isMassExceeded = totalMass > MISSION_CONSTRAINTS.maxMass;
  const isValidLaunch = !isBudgetExceeded && !isMassExceeded;

  const handleLaunch = () => {
    if (!isValidLaunch) {
      sound.playWarning();
      return;
    }
    sound.playBeep(980, 0.1);
    const roverConfig = {
      chassis,
      solar: fixedSolar,
      battery,
      thermal,
      comm: fixedComm,
      instruments: fixedInstruments,
      activeInstrument: fixedInstruments[0],
      totalCost,
      totalMass,
      peakSolarGen,
      totalBasePowerDraw,
      estimatedSurvivalMinutes
    };
    onProceed(roverConfig);
  };

  // Concise option metadata (max 12 words per description, 2 relevant star ratings)
  const CHASSIS_DATA = [
    {
      id: 'scout-light',
      stars: [{ label: 'Speed', count: 3 }, { label: 'Slope', count: 2 }],
      summary: 'Agile and light, but less traction on steep crater walls.'
    },
    {
      id: 'all-terrain-rocker',
      stars: [{ label: 'Speed', count: 2 }, { label: 'Slope', count: 3 }],
      summary: 'NASA heritage 6-wheel suspension for high obstacle and slope stability.'
    },
    {
      id: 'tracked-cryo',
      stars: [{ label: 'Speed', count: 1 }, { label: 'Slope', count: 4 }],
      summary: 'Articulated tracks for steep descents, but heavy power consumption.'
    }
  ];

  const BATTERY_DATA = [
    {
      id: 'bat-li-ion-standard',
      stars: [{ label: 'Storage', count: 2 }, { label: 'Cold Resist', count: 1 }],
      summary: 'Cost-effective, but vulnerable to freezing without continuous heating.'
    },
    {
      id: 'bat-solid-state-cold',
      stars: [{ label: 'Storage', count: 3 }, { label: 'Cold Resist', count: 3 }],
      summary: 'High resilience down to -80°C with zero thermal runaway risk.'
    },
    {
      id: 'bat-extended-rhu',
      stars: [{ label: 'Storage', count: 4 }, { label: 'Cold Resist', count: 4 }],
      summary: 'Massive reserve with nuclear heat pellet providing permanent passive warmth.'
    }
  ];

  const THERMAL_DATA = [
    {
      id: 'thermal-passive-mli',
      stars: [{ label: 'Efficiency', count: 4 }, { label: 'Heat Output', count: 1 }],
      summary: 'Zero electric power draw, but cannot prevent heat loss indefinitely.'
    },
    {
      id: 'thermal-active-heaters',
      stars: [{ label: 'Efficiency', count: 3 }, { label: 'Heat Output', count: 3 }],
      summary: 'Thermostatic resistive heaters keep core warm at cost of 35W.'
    },
    {
      id: 'thermal-cryo-phase',
      stars: [{ label: 'Efficiency', count: 4 }, { label: 'Heat Output', count: 4 }],
      summary: 'Latent wax storage cuts heater power consumption by half.'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between max-w-6xl mx-auto px-4 py-2 select-none">
      {/* 1. StageHeader */}
      <StageHeader
        stepNumber={3}
        totalSteps={6}
        title="Rover Design Lab"
        goal="Choose 3 core systems. Trade weight and cost against survival time in the dark."
      />

      {/* Top Strip (One row, compact): Budget, Weight, Dark Survival, Included Subsystems */}
      <div className="shrink-0 mb-2 p-2 rounded-xl bg-space-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          {/* Budget */}
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>Budget:</span>
            <span className={`font-bold ${isBudgetExceeded ? 'text-red-400' : totalCost > 150 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ${totalCost}M / ${MISSION_CONSTRAINTS.maxBudget}M
            </span>
          </div>

          {/* Mass */}
          <div className="flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-slate-400" />
            <span>Weight:</span>
            <span className={`font-bold ${isMassExceeded ? 'text-red-400' : totalMass > 260 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {totalMass} kg / {MISSION_CONSTRAINTS.maxMass} kg
            </span>
          </div>

          {/* Dark Survival */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Darkness Survival:</span>
            <span className={`font-bold ${estimatedSurvivalMinutes < 18 ? 'text-red-400' : estimatedSurvivalMinutes < 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ~{estimatedSurvivalMinutes} min
            </span>
          </div>
        </div>

        {/* Fixed Subsystems Notice with Tooltip */}
        <Tooltip text="Standard flight package: 175W Deployable Solar Mast, Gimbaled X-Band Dish (+31.8dB), 1-Meter TRIDENT Cryogenic Drill, NSS neutron spectrometer, and NIRVSS infrared spectrometer.">
          <div className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-sans font-medium text-slate-200">
              ✔ Included: Solar · Radio · TRIDENT Drill & Science
            </span>
            <Info className="w-3 h-3 text-cyan-400 ml-0.5" />
          </div>
        </Tooltip>
      </div>

      {/* 2. 3-Column Subsystem Grid (No tabs, no sidebar, no blueprint) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden my-auto items-stretch">
        {/* COLUMN 1: Chassis & Drive (Mobility) */}
        <div className="flex flex-col justify-between gap-2 min-h-0 hud-panel p-3 rounded-xl border border-slate-800 bg-space-950/70">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5 mb-1">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <h3 className="font-display font-bold text-sm text-slate-100">1. Chassis & Drive</h3>
              <p className="text-[11px] text-slate-400">Mobility and slope capability</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-2 min-h-0 overflow-y-auto pr-0.5">
            {ROVER_COMPONENTS.chassis.map((c) => {
              const isSelected = chassis.id === c.id;
              const meta = CHASSIS_DATA.find(m => m.id === c.id) || CHASSIS_DATA[0];

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    sound.playBeep(850, 0.04);
                    setChassis(c);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-1 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.2)] ring-1 ring-cyan-400/50'
                      : 'bg-space-900/60 border-slate-700/60 hover:border-slate-500 hover:bg-space-800/70'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-slate-100 truncate pr-1">{c.name.split(' ')[0]}</span>
                      <span className="text-cyan-300 shrink-0">${c.cost}M · {c.mass}kg</span>
                    </div>

                    <p className="text-sm text-slate-300 font-sans leading-snug mb-1.5">
                      {meta.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      {meta.stars.map((s, idx) => (
                        <span key={idx}>
                          {s.label}: {'⭐'.repeat(s.count)}
                        </span>
                      ))}
                    </div>

                    {isSelected && (
                      <Badge variant="success">Selected</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Battery Core (Survival in dark) */}
        <div className="flex flex-col justify-between gap-2 min-h-0 hud-panel p-3 rounded-xl border border-slate-800 bg-space-950/70">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5 mb-1">
            <BatteryCharging className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-display font-bold text-sm text-slate-100">2. Battery Core</h3>
              <p className="text-[11px] text-slate-400">Survival time in the dark zone</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-2 min-h-0 overflow-y-auto pr-0.5">
            {ROVER_COMPONENTS.battery.map((b) => {
              const isSelected = battery.id === b.id;
              const meta = BATTERY_DATA.find(m => m.id === b.id) || BATTERY_DATA[0];

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    sound.playBeep(850, 0.04);
                    setBattery(b);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-1 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/50'
                      : 'bg-space-900/60 border-slate-700/60 hover:border-slate-500 hover:bg-space-800/70'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-slate-100 truncate pr-1">{b.name.split(' (')[0]}</span>
                      <span className="text-emerald-300 shrink-0">${b.cost}M · {b.mass}kg</span>
                    </div>

                    <p className="text-sm text-slate-300 font-sans leading-snug mb-1.5">
                      {meta.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      {meta.stars.map((s, idx) => (
                        <span key={idx}>
                          {s.label}: {'⭐'.repeat(s.count)}
                        </span>
                      ))}
                    </div>

                    {isSelected && (
                      <Badge variant="success">Selected</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: Thermal Control (Staying warm) */}
        <div className="flex flex-col justify-between gap-2 min-h-0 hud-panel p-3 rounded-xl border border-slate-800 bg-space-950/70">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5 mb-1">
            <ThermometerSnowflake className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-display font-bold text-sm text-slate-100">3. Thermal Control</h3>
              <p className="text-[11px] text-slate-400">Staying warm in -230°C craters</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-2 min-h-0 overflow-y-auto pr-0.5">
            {ROVER_COMPONENTS.thermal.map((t) => {
              const isSelected = thermal.id === t.id;
              const meta = THERMAL_DATA.find(m => m.id === t.id) || THERMAL_DATA[0];

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    sound.playBeep(850, 0.04);
                    setThermal(t);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-1 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                      : 'bg-space-900/60 border-slate-700/60 hover:border-slate-500 hover:bg-space-800/70'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-slate-100 truncate pr-1">{t.name.split(' (')[0]}</span>
                      <span className="text-amber-300 shrink-0">${t.cost}M · {t.mass}kg</span>
                    </div>

                    <p className="text-sm text-slate-300 font-sans leading-snug mb-1.5">
                      {meta.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      {meta.stars.map((s, idx) => (
                        <span key={idx}>
                          {s.label}: {'⭐'.repeat(s.count)}
                        </span>
                      ))}
                    </div>

                    {isSelected && (
                      <Badge variant="success">Selected</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Footer Action Bar (Fixed height) */}
      <footer className="shrink-0 h-14 flex items-center justify-between border-t border-slate-800 pt-2 px-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
        >
          ← Back to Site Selection
        </Button>

        <Button
          variant={isValidLaunch ? "primary" : "secondary"}
          size="md"
          disabled={!isValidLaunch}
          onClick={handleLaunch}
          iconRight={<ArrowRight className="w-4 h-4 text-slate-950" />}
        >
          {isBudgetExceeded
            ? `OVER BUDGET ($${totalCost - MISSION_CONSTRAINTS.maxBudget}M)`
            : isMassExceeded
            ? `OVER WEIGHT (${totalMass - MISSION_CONSTRAINTS.maxMass}kg)`
            : "CONFIRM ROVER →"}
        </Button>
      </footer>
    </div>
  );
}
