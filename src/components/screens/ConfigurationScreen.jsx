import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  BatteryCharging, 
  Cpu, 
  Sun, 
  Radio, 
  ThermometerSnowflake, 
  Microscope, 
  Check, 
  AlertOctagon, 
  ArrowRight, 
  ShieldAlert, 
  Info,
  DollarSign,
  Weight,
  Zap,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { ROVER_COMPONENTS, MISSION_CONSTRAINTS } from '../../data/componentsData';
import { sound } from '../../utils/sound';

export default function ConfigurationScreen({
  initialConfig,
  selectedSite,
  onProceed,
  onBack
}) {
  const [chassis, setChassis] = useState(initialConfig?.chassis || ROVER_COMPONENTS.chassis[1]);
  const [solar, setSolar] = useState(initialConfig?.solar || ROVER_COMPONENTS.solar[1]);
  const [battery, setBattery] = useState(initialConfig?.battery || ROVER_COMPONENTS.battery[1]);
  const [thermal, setThermal] = useState(initialConfig?.thermal || ROVER_COMPONENTS.thermal[1]);
  const [comm, setComm] = useState(initialConfig?.comm || ROVER_COMPONENTS.comm[1]);
  // Instruments are multi-select
  const [selectedInstruments, setSelectedInstruments] = useState(
    initialConfig?.instruments || [ROVER_COMPONENTS.instruments[0], ROVER_COMPONENTS.instruments[1]]
  );

  const [activeTab, setActiveTab] = useState('chassis'); // 'chassis' | 'solar' | 'battery' | 'thermal' | 'comm' | 'instruments'

  // Calculate totals
  const totalCost = useMemo(() => {
    let cost = (chassis?.cost || 0) + (solar?.cost || 0) + (battery?.cost || 0) + (thermal?.cost || 0) + (comm?.cost || 0);
    selectedInstruments.forEach((inst) => (cost += inst.cost));
    return cost;
  }, [chassis, solar, battery, thermal, comm, selectedInstruments]);

  const totalMass = useMemo(() => {
    let mass = (chassis?.mass || 0) + (solar?.mass || 0) + (battery?.mass || 0) + (thermal?.mass || 0) + (comm?.mass || 0);
    selectedInstruments.forEach((inst) => (mass += inst.mass));
    return mass;
  }, [chassis, solar, battery, thermal, comm, selectedInstruments]);

  // Base power consumption in daylight
  const totalBasePowerDraw = useMemo(() => {
    return (chassis?.basePower || 0) + (comm?.powerDraw || 0) + ((thermal?.powerDraw || 0) * 0.5);
  }, [chassis, comm, thermal]);

  // Solar generation in peak sunlight at this site
  const peakSolarGen = useMemo(() => {
    const siteIllumination = selectedSite?.peakIllumination || 85;
    return Math.round((solar?.generation || 100) * (siteIllumination / 100) * (solar?.lowSunAngleEfficiency || 0.85));
  }, [solar, selectedSite]);

  const netPowerMargin = peakSolarGen - totalBasePowerDraw;

  // Validation
  const isBudgetExceeded = totalCost > MISSION_CONSTRAINTS.maxBudget;
  const isMassExceeded = totalMass > MISSION_CONSTRAINTS.maxMass;
  const isPowerDeficit = netPowerMargin < MISSION_CONSTRAINTS.minPowerMargin;
  const hasNoInstruments = selectedInstruments.length === 0;

  const isValidLaunch = !isBudgetExceeded && !isMassExceeded && !isPowerDeficit && !hasNoInstruments;

  const toggleInstrument = (inst) => {
    sound.playBeep(820, 0.05);
    if (selectedInstruments.some((i) => i.id === inst.id)) {
      setSelectedInstruments(selectedInstruments.filter((i) => i.id !== inst.id));
    } else {
      setSelectedInstruments([...selectedInstruments, inst]);
    }
  };

  const handleLaunch = () => {
    if (!isValidLaunch) {
      sound.playWarning();
      return;
    }
    sound.playBeep(980, 0.1);
    const roverConfig = {
      chassis,
      solar,
      battery,
      thermal,
      comm,
      instruments: selectedInstruments,
      activeInstrument: selectedInstruments[0] || null,
      totalCost,
      totalMass,
      peakSolarGen,
      totalBasePowerDraw
    };
    onProceed(roverConfig);
  };

  const TABS = [
    { id: 'chassis', label: 'Chassis & Drive', icon: Cpu, count: chassis ? 'Selected' : 'Required' },
    { id: 'solar', label: 'Solar Array', icon: Sun, count: solar ? 'Selected' : 'Required' },
    { id: 'battery', label: 'Battery Core', icon: BatteryCharging, count: battery ? 'Selected' : 'Required' },
    { id: 'thermal', label: 'Thermal Control', icon: ThermometerSnowflake, count: thermal ? 'Selected' : 'Required' },
    { id: 'comm', label: 'Communications', icon: Radio, count: comm ? 'Selected' : 'Required' },
    { id: 'instruments', label: 'Science Suite', icon: Microscope, count: `${selectedInstruments.length} Active` }
  ];

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 tracking-wider flex items-center space-x-1.5">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>STAGE 02 // SPACECRAFT & ROVER ENGINEERING SUITE</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide mt-1">
            CUSTOMIZE MISSION PAYLOAD ARCHITECTURE
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 mt-2 sm:mt-0 flex items-center space-x-2">
          <span>DESTINATION:</span>
          <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-space-900 border border-cyan-500/30">
            {selectedSite?.name || 'Shackleton Ridge'}
          </span>
        </div>
      </div>

      {/* Constraints & Telemetry Gauges Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Budget Gauge */}
        <div className={`hud-panel p-3.5 rounded-lg border transition-all ${
          isBudgetExceeded ? 'border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-cyan-500/30 bg-space-900/80'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="flex items-center space-x-1 text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mission Budget Ceiling</span>
            </span>
            <span className={`font-bold ${isBudgetExceeded ? 'text-red-400' : 'text-cyan-300'}`}>
              ${totalCost}M / ${MISSION_CONSTRAINTS.maxBudget}M
            </span>
          </div>
          <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                isBudgetExceeded ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)]'
              }`}
              style={{ width: `${Math.min(100, (totalCost / MISSION_CONSTRAINTS.maxBudget) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Remaining: ${Math.max(0, MISSION_CONSTRAINTS.maxBudget - totalCost)}M</span>
            <span className={isBudgetExceeded ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isBudgetExceeded ? 'OVER BUDGET' : 'WITHIN CEILING'}
            </span>
          </div>
        </div>

        {/* Mass Gauge */}
        <div className={`hud-panel p-3.5 rounded-lg border transition-all ${
          isMassExceeded ? 'border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-cyan-500/30 bg-space-900/80'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="flex items-center space-x-1 text-slate-300">
              <Weight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Payload Launch Mass</span>
            </span>
            <span className={`font-bold ${isMassExceeded ? 'text-red-400' : 'text-cyan-300'}`}>
              {totalMass} kg / {MISSION_CONSTRAINTS.maxMass} kg
            </span>
          </div>
          <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                isMassExceeded ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
              }`}
              style={{ width: `${Math.min(100, (totalMass / MISSION_CONSTRAINTS.maxMass) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Payload Margin: {Math.max(0, MISSION_CONSTRAINTS.maxMass - totalMass)} kg</span>
            <span className={isMassExceeded ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isMassExceeded ? 'OVER MASS LIMIT' : 'NOMINAL PAYLOAD'}
            </span>
          </div>
        </div>

        {/* Power Margin Gauge */}
        <div className={`hud-panel p-3.5 rounded-lg border transition-all ${
          isPowerDeficit ? 'border-amber-500 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-cyan-500/30 bg-space-900/80'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="flex items-center space-x-1 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sunlight Net Power Margin</span>
            </span>
            <span className={`font-bold ${isPowerDeficit ? 'text-amber-400' : 'text-emerald-300'}`}>
              +{netPowerMargin} W Net
            </span>
          </div>
          <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                isPowerDeficit ? 'bg-amber-500' : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, (netPowerMargin / 150) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Peak Gen: {peakSolarGen}W</span>
            <span>Day Draw: {totalBasePowerDraw}W</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Subsystem Navigation Tabs (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span>SUBSYSTEM DIRECTORY:</span>
            <span className="text-cyan-400 text-[10px] font-bold">STAGE 02</span>
          </div>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playBeep(750, 0.04);
                  setActiveTab(tab.id);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border font-mono text-xs transition-all ${
                  isTabActive
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-bold'
                    : 'bg-space-900/60 border-slate-700/60 hover:border-slate-500 text-slate-300 hover:bg-space-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isTabActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  isTabActive ? 'bg-cyan-950 border-cyan-400/50 text-cyan-300' : 'bg-space-950 border-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}

          {/* Interactive Rover Blueprint Schematic */}
          <div className="hud-panel p-4 rounded-lg border border-cyan-500/20 bg-space-950/90 mt-4 text-center">
            <div className="text-[10px] font-mono text-cyan-400 tracking-wider mb-2 flex items-center justify-between">
              <span>PAYLOAD BLUEPRINT SCHEMATIC</span>
              <span className="text-[9px] text-slate-400">SCALE 1:20</span>
            </div>
            <div className="relative h-36 w-full flex items-center justify-center border border-slate-800 rounded bg-space-900/40 overflow-hidden">
              {/* Rover Schematic SVG */}
              <svg viewBox="0 0 200 120" className="w-full h-full p-2">
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="200" height="120" fill="url(#grid)" />

                {/* Wheels */}
                <rect x="25" y="85" width="25" height="15" rx="3" fill="#38bdf8" opacity="0.85" />
                <rect x="85" y="85" width="30" height="15" rx="3" fill="#38bdf8" opacity="0.85" />
                <rect x="150" y="85" width="25" height="15" rx="3" fill="#38bdf8" opacity="0.85" />
                
                {/* Suspension Rockers */}
                <line x1="37" y1="85" x2="100" y2="65" stroke="#00f0ff" strokeWidth="2.5" />
                <line x1="100" y1="65" x2="162" y2="85" stroke="#00f0ff" strokeWidth="2.5" />
                
                {/* Chassis Body */}
                <rect x="50" y="45" width="100" height="30" rx="4" fill="#0c1224" stroke="#00f0ff" strokeWidth="1.8" />
                <text x="100" y="64" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  LUNA ROVER CORE
                </text>
                
                {/* Solar Mast */}
                <line x1="75" y1="45" x2="75" y2="15" stroke="#f59e0b" strokeWidth="2.5" />
                <rect x="60" y="8" width="30" height="12" rx="2" fill="#d97706" opacity="0.9" />
                
                {/* High-Gain Antenna Dish */}
                <ellipse cx="135" cy="25" rx="14" ry="7" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <line x1="135" y1="32" x2="135" y2="45" stroke="#38bdf8" strokeWidth="2" />
                
                {/* Drill Instrument */}
                {selectedInstruments.some(i => i.id.includes('drill')) && (
                  <g>
                    <rect x="145" y="50" width="8" height="42" fill="#ef4444" rx="1" />
                    <line x1="149" y1="92" x2="149" y2="105" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                  </g>
                )}

                {/* Dimension Callout */}
                <line x1="25" y1="110" x2="175" y2="110" stroke="#64748b" strokeWidth="1" />
                <text x="100" y="117" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  LENGTH: 1.85m // WHEELBASE: 1.4m
                </text>
              </svg>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>Active Mass: <strong className="text-cyan-300">{totalMass} kg</strong></span>
              <span>Draw: <strong className="text-amber-300">{totalBasePowerDraw}W</strong></span>
            </div>
          </div>
        </div>

        {/* Right Active Category Component Options (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="hud-panel p-5 rounded-lg border border-cyan-500/30 bg-space-900/80 min-h-[460px]">
            {/* Chassis Tab */}
            {activeTab === 'chassis' && (
              <div className="space-y-4">
                <div className="border-b border-slate-700/60 pb-2">
                  <h3 className="font-display font-bold text-lg text-slate-100">Select Mobility Chassis</h3>
                  <p className="text-xs text-slate-400 font-mono">Governs maximum slope climbing, mass footprint, and rolling power consumption.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {ROVER_COMPONENTS.chassis.map((item) => {
                    const isSelected = chassis?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playBeep(850, 0.05);
                          setChassis(item);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-space-950/60 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-slate-950" />}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-100">{item.name}</span>
                          </div>
                          <div className="text-xs font-mono text-cyan-300 font-bold">
                            ${item.cost}M • {item.mass} kg
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{item.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-space-900/80 p-2 rounded">
                          <div>Drive Power: <span className="text-cyan-300 font-bold">{item.drivePower}W</span></div>
                          <div>Max Slope: <span className="text-amber-300 font-bold">{item.slopeCapability}°</span></div>
                          <div>Cold Limit: <span className="text-slate-200">{item.coldTolerance}°C</span></div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 italic">
                          <strong className="text-cyan-400">Engineering Trade-off:</strong> {item.engineeringRationale}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Solar Tab */}
            {activeTab === 'solar' && (
              <div className="space-y-4">
                <div className="border-b border-slate-700/60 pb-2">
                  <h3 className="font-display font-bold text-lg text-slate-100">Select Solar Generation Architecture</h3>
                  <p className="text-xs text-slate-400 font-mono">Harvests grazing 1.5° polar sunlight on rims. Zero output inside PSRs.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {ROVER_COMPONENTS.solar.map((item) => {
                    const isSelected = solar?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playBeep(850, 0.05);
                          setSolar(item);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-space-950/60 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-slate-950" />}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-100">{item.name}</span>
                          </div>
                          <div className="text-xs font-mono text-cyan-300 font-bold">
                            ${item.cost}M • {item.mass} kg
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{item.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-space-900/80 p-2 rounded">
                          <div>Sunlight Output: <span className="text-cyan-300 font-bold">{item.generation}W</span></div>
                          <div>PSR Dark Output: <span className="text-red-400 font-bold">{item.psrGeneration}W</span></div>
                          <div>Low-Sun Capture: <span className="text-emerald-300 font-bold">{Math.round(item.lowSunAngleEfficiency * 100)}%</span></div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 italic">
                          <strong className="text-cyan-400">Engineering Trade-off:</strong> {item.engineeringRationale}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Battery Tab */}
            {activeTab === 'battery' && (
              <div className="space-y-4">
                <div className="border-b border-slate-700/60 pb-2">
                  <h3 className="font-display font-bold text-lg text-slate-100">Select Battery Storage Core</h3>
                  <p className="text-xs text-slate-400 font-mono">Determines how long your rover can sustain drive, heat, and science in deep darkness.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {ROVER_COMPONENTS.battery.map((item) => {
                    const isSelected = battery?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playBeep(850, 0.05);
                          setBattery(item);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-space-950/60 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-slate-950" />}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-100">{item.name}</span>
                          </div>
                          <div className="text-xs font-mono text-cyan-300 font-bold">
                            ${item.cost}M • {item.mass} kg
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{item.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-space-900/80 p-2 rounded">
                          <div>Storage: <span className="text-cyan-300 font-bold">{item.capacity} Wh</span></div>
                          <div>Usable Depth: <span className="text-emerald-300 font-bold">{Math.round(item.maxDischarge * 100)}%</span></div>
                          <div>Freeze Risk Below: <span className="text-amber-400 font-bold">{item.criticalTemp}°C</span></div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 italic">
                          <strong className="text-cyan-400">Engineering Trade-off:</strong> {item.engineeringRationale}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thermal Tab */}
            {activeTab === 'thermal' && (
              <div className="space-y-4">
                <div className="border-b border-slate-700/60 pb-2">
                  <h3 className="font-display font-bold text-lg text-slate-100">Select Thermal Protection System</h3>
                  <p className="text-xs text-slate-400 font-mono">Maintains internal operating temperatures between -40°C and +40°C in 40 Kelvin cold.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {ROVER_COMPONENTS.thermal.map((item) => {
                    const isSelected = thermal?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playBeep(850, 0.05);
                          setThermal(item);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-space-950/60 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-slate-950" />}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-100">{item.name}</span>
                          </div>
                          <div className="text-xs font-mono text-cyan-300 font-bold">
                            ${item.cost}M • {item.mass} kg
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{item.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-space-900/80 p-2 rounded">
                          <div>Active Heat Out: <span className="text-amber-300 font-bold">{item.heatOutput}W</span></div>
                          <div>Electrical Draw: <span className="text-cyan-300 font-bold">{item.powerDraw}W</span></div>
                          <div>MLI Insulation: <span className="text-slate-200 font-bold">{Math.round(item.thermalResistance * 100)}%</span></div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 italic">
                          <strong className="text-cyan-400">Engineering Trade-off:</strong> {item.engineeringRationale}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Communications Tab */}
            {activeTab === 'comm' && (
              <div className="space-y-4">
                <div className="border-b border-slate-700/60 pb-2">
                  <h3 className="font-display font-bold text-lg text-slate-100">Select Deep Space Telecommunications</h3>
                  <p className="text-xs text-slate-400 font-mono">Ensures real-time command transmission and scientific data downlink to Earth.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {ROVER_COMPONENTS.comm.map((item) => {
                    const isSelected = comm?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playBeep(850, 0.05);
                          setComm(item);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-space-950/60 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-slate-950" />}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-100">{item.name}</span>
                          </div>
                          <div className="text-xs font-mono text-cyan-300 font-bold">
                            ${item.cost}M • {item.mass} kg
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{item.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-space-900/80 p-2 rounded">
                          <div>Bandwidth: <span className="text-cyan-300 font-bold">{item.bandwidth} kbps</span></div>
                          <div>Power Draw: <span className="text-slate-200">{item.powerDraw}W</span></div>
                          <div>Earth Link Mode: <span className="text-blue-300">{item.dteRange}</span></div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-400 italic">
                          <strong className="text-cyan-400">Engineering Trade-off:</strong> {item.engineeringRationale}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Science Suite (Multi-Select) */}
            {activeTab === 'instruments' && (
              <div className="space-y-4">
                <div className="border-b border-slate-700/60 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-100">Select Scientific Instruments (Multi-Select)</h3>
                    <p className="text-xs text-slate-400 font-mono">Install sensors and drills to detect hydrogen and extract water ice.</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold">
                    {selectedInstruments.length} Installed
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {ROVER_COMPONENTS.instruments.map((item) => {
                    const isSelected = selectedInstruments.some((i) => i.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleInstrument(item)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-space-950/60 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-slate-950" />}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-100">{item.name}</span>
                          </div>
                          <div className="text-xs font-mono text-cyan-300 font-bold">
                            ${item.cost}M • {item.mass} kg
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-2 leading-relaxed">{item.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-space-900/80 p-2 rounded">
                          <div>Science Yield: <span className="text-emerald-400 font-bold">+{item.scienceYield} pts</span></div>
                          <div>Power Draw: <span className="text-slate-200">{item.powerDraw}W</span></div>
                          <div>Sensor Heritage: <span className="text-cyan-300">NASA VIPER</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Banners if Constraints Violated */}
      {(isBudgetExceeded || isMassExceeded || isPowerDeficit || hasNoInstruments) && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/60 text-red-200 font-mono text-xs flex items-center space-x-2 mb-4">
          <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>
            {isBudgetExceeded && `Mission budget exceeded by $${totalCost - MISSION_CONSTRAINTS.maxBudget}M! `}
            {isMassExceeded && `Launch mass exceeded by ${totalMass - MISSION_CONSTRAINTS.maxMass} kg! `}
            {isPowerDeficit && `Insufficient power margin (${netPowerMargin}W). Must generate at least +${MISSION_CONSTRAINTS.minPowerMargin}W net in sunlight! `}
            {hasNoInstruments && `At least one scientific instrument must be installed! `}
            Modify your subsystem configuration to proceed.
          </span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
          className="btn-secondary"
        >
          ← Change Landing Site
        </button>

        <button
          onClick={handleLaunch}
          disabled={!isValidLaunch}
          className={`flex items-center space-x-2 px-8 py-3.5 rounded-lg font-display font-bold text-sm tracking-wider transition-all ${
            isValidLaunch
              ? 'btn-primary'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          <span>DEPLOY TO LUNAR SURFACE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
