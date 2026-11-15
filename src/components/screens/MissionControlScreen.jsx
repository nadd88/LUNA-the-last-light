import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Battery, 
  Sun, 
  Thermometer, 
  Radio, 
  Zap, 
  Play, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight,
  Database,
  Satellite
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { sound } from '../../utils/sound';

export default function MissionControlScreen({
  roverConfig,
  selectedSite,
  onLaunchSurfaceOps,
  onBack
}) {
  // Generate baseline telemetry trend data
  const [telemetryHistory, setTelemetryHistory] = useState([
    { minute: 0, powerGen: roverConfig.peakSolarGen, powerDraw: roverConfig.totalBasePowerDraw, batterySoC: 100, coreTemp: -35 },
    { minute: 5, powerGen: roverConfig.peakSolarGen, powerDraw: roverConfig.totalBasePowerDraw, batterySoC: 100, coreTemp: -34 },
    { minute: 10, powerGen: roverConfig.peakSolarGen, powerDraw: roverConfig.totalBasePowerDraw, batterySoC: 99, coreTemp: -35 },
    { minute: 15, powerGen: roverConfig.peakSolarGen, powerDraw: roverConfig.totalBasePowerDraw, batterySoC: 100, coreTemp: -36 }
  ]);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 tracking-wider flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>STAGE 03 // MISSION CONTROL TELEMETRY CONSOLE</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide mt-1">
            FLIGHT SYSTEM HEALTH & PRE-DESCENT STATUS
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>DSN CARRIER LOCKED // GOLDSTONE 70M</span>
        </div>
      </div>

      {/* Top Real-Time Vital Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 bg-space-900/80">
          <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Sun className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daylight Power Gen</span>
          </div>
          <div className="text-xl font-mono font-bold text-cyan-300">
            {roverConfig.peakSolarGen} W
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Sun Angle: 1.8° Horizon Grazing
          </div>
        </div>

        <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 bg-space-900/80">
          <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>Storage Capacity</span>
          </div>
          <div className="text-xl font-mono font-bold text-emerald-300">
            {roverConfig.battery.capacity} Wh
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Solid-State Reserve: 100%
          </div>
        </div>

        <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 bg-space-900/80">
          <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Avionics Temp</span>
          </div>
          <div className="text-xl font-mono font-bold text-amber-300">
            -35.0 °C
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Thermal Margin: +140°C above limit
          </div>
        </div>

        <div className="hud-panel p-3.5 rounded-lg border border-cyan-500/30 bg-space-900/80">
          <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Downlink Rate</span>
          </div>
          <div className="text-xl font-mono font-bold text-blue-300">
            {roverConfig.comm.bandwidth} kbps
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Latency: 2.6s (Round-trip)
          </div>
        </div>
      </div>

      {/* Center Layout: Recharts Telemetry Graph & Subsystem Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Telemetry Graphs (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/80">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-3">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded bg-cyan-400" />
                <span className="font-bold">POWER HARVEST VS CONSUMPTION TELEMETRY (WATTS)</span>
              </span>
              <span className="text-[10px] text-cyan-400">T-0 Baseline Check</span>
            </div>

            <div className="h-44 w-full bg-space-950/80 rounded border border-slate-800 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory}>
                  <XAxis dataKey="minute" stroke="#64748b" fontSize={10} tickFormatter={(m) => `T+${m}m`} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 260]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070b18', borderColor: '#00f0ff', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Line type="monotone" dataKey="powerGen" name="Solar Gen (W)" stroke="#00f0ff" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="powerDraw" name="Avionics Draw (W)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span>● Cyan: Solar Array Input ({roverConfig.peakSolarGen}W)</span>
              <span>● Amber: Base Power Load ({roverConfig.totalBasePowerDraw}W)</span>
            </div>
          </div>

          <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/80">
            <div className="text-xs font-mono text-slate-300 font-bold mb-2">
              MISSION FLIGHT PLAN TRAVERSE BRIEF:
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                1. <strong>Rim Staging:</strong> The rover is currently positioned on the sunlit crest of {selectedSite.name}. All power systems are fully charged.
              </p>
              <p>
                2. <strong>Descent into PSR:</strong> Once descending past the shadow line ({selectedSite.psrDistance} meters away), solar power will immediately drop to <strong>0.0 Watts</strong>.
              </p>
              <p>
                3. <strong>Prospecting Execution:</strong> Activate the Neutron Spectrometer (NSS) and TRIDENT Drill when approaching suspected volatile traps to sample water ice.
              </p>
            </div>
          </div>
        </div>

        {/* Right Subsystem Status Matrix (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/80">
            <div className="text-xs font-mono text-cyan-400 font-bold mb-3 flex items-center justify-between">
              <span>PAYLOAD HARDWARE MANIFEST</span>
              <span className="text-emerald-400 text-[10px]">ALL GREEN</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-space-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-bold">{roverConfig.chassis.name}</div>
                  <div className="text-[10px] text-slate-400">Mobility • {roverConfig.chassis.slopeCapability}° Slope Limit</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">ONLINE</span>
              </div>

              <div className="p-2.5 rounded bg-space-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-bold">{roverConfig.solar.name}</div>
                  <div className="text-[10px] text-slate-400">Generation • {roverConfig.solar.generation}W Peak</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">DEPLOYED</span>
              </div>

              <div className="p-2.5 rounded bg-space-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-bold">{roverConfig.battery.name}</div>
                  <div className="text-[10px] text-slate-400">Energy • {roverConfig.battery.capacity} Wh Storage</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">ARMED</span>
              </div>

              <div className="p-2.5 rounded bg-space-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-bold">{roverConfig.thermal.name}</div>
                  <div className="text-[10px] text-slate-400">Thermal • {roverConfig.thermal.heatOutput}W Output</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">READY</span>
              </div>

              <div className="p-2.5 rounded bg-space-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-bold">{roverConfig.comm.name}</div>
                  <div className="text-[10px] text-slate-400">Telecom • {roverConfig.comm.dteRange}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">LOCKED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
          className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs transition-colors"
        >
          ← Adjust Configuration
        </button>

        <button
          onClick={() => {
            sound.playBeep(980, 0.1);
            onLaunchSurfaceOps();
          }}
          className="flex items-center space-x-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all transform hover:-translate-y-0.5"
        >
          <Play className="w-4 h-4 text-slate-950 fill-current" />
          <span>START SURFACE EXPLORATION</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
