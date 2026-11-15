import React from 'react';
import { 
  Rocket, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  History, 
  Zap, 
  ThermometerSnowflake, 
  Radio, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';
import { sound } from '../../utils/sound';

export default function LandingScreen({
  onStartMission,
  onResumeMission,
  hasSavedMission,
  onOpenManual,
  onOpenHistory
}) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8 text-center max-w-5xl mx-auto">
      {/* Flight Control Telemetry Ticker */}
      <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400/90 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full mb-4 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>MISSION CONTROL T+00:00:00</span>
        <span className="text-slate-600">|</span>
        <span>DSN GOLDSTONE: LOCKED</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400">TARGET: LUNAR SOUTH POLE 90°S</span>
      </div>

      {/* Main Title Badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-space-900/90 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-4">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>NASA SPACE APPS CHALLENGE 2026 // ARTEMIS POLAR EXPEDITION</span>
      </div>

      {/* Main Title */}
      <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-slate-100 mb-3 text-glow-cyan">
        LUNA <span className="text-cyan-400">:</span> THE LAST LIGHT
      </h1>

      {/* Core Scientific Premise */}
      <p className="text-base sm:text-lg text-cyan-200/90 font-mono max-w-2xl mb-8 leading-relaxed">
        How far into eternal darkness can your robotic rover venture before cold and darkness claim it?
      </p>

      {/* 3 Core Tactical Paradox Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-8 text-left">
        <div className="hud-panel p-4 rounded-xl border border-cyan-500/25 bg-space-900/80 transition-all hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>THE SOLAR PARADOX</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">0.0 W IN PSR</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            Peaks enjoy 80–90% grazing sunlight at 1.5° elevation, but solar output drops strictly to <strong className="text-cyan-300">0.0 Watts</strong> inside Permanently Shadowed Regions.
          </p>
          <div className="text-[10px] font-mono text-cyan-400/80 flex items-center space-x-1 border-t border-slate-800 pt-2">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>VIPER Mast Power Model</span>
          </div>
        </div>

        <div className="hud-panel p-4 rounded-xl border border-amber-500/25 bg-space-900/80 transition-all hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold">
              <ThermometerSnowflake className="w-4 h-4 text-amber-400" />
              <span>CRYOGENIC COLD TRAP</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300">38 KELVIN</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            Shadowed crater floors drop to <strong className="text-amber-300">-235°C (38K)</strong>. Without active heating, lubricants freeze solid and batteries succumb to thermal shock.
          </p>
          <div className="text-[10px] font-mono text-amber-400/80 flex items-center space-x-1 border-t border-slate-800 pt-2">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Lumped-Capacitance Model</span>
          </div>
        </div>

        <div className="hud-panel p-4 rounded-xl border border-blue-500/25 bg-space-900/80 transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold">
              <Radio className="w-4 h-4 text-blue-400" />
              <span>CRATER OCCULTATION</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-300">LOS OCCLUSION</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            Deep crater rims sever direct Earth line-of-sight radio contact. Deploy autonomous science sequences or equip a Lunar Gateway orbital relay link.
          </p>
          <div className="text-[10px] font-mono text-blue-400/80 flex items-center space-x-1 border-t border-slate-800 pt-2">
            <Activity className="w-3 h-3 text-blue-400" />
            <span>Link Budget & Halo Relays</span>
          </div>
        </div>
      </div>

      {/* Flight Operations Readiness Matrix */}
      <div className="w-full max-w-4xl p-3 rounded-lg bg-space-950/70 border border-slate-800 text-[11px] font-mono text-slate-400 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div>
          <span className="text-slate-500 block text-[9px]">LOLA ALTIMETRY</span>
          <span className="text-cyan-300 font-bold">5 SITES SURVEYED</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">PAYLOAD CAPACITY</span>
          <span className="text-cyan-300 font-bold">350 KG / $160M</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">PROSPECTING SUITE</span>
          <span className="text-emerald-400 font-bold">NSS • NIRVSS • TRIDENT</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">MISSION OUTCOMES</span>
          <span className="text-yellow-400 font-bold">A+ TO F FORENSICS</span>
        </div>
      </div>

      {/* Main Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center mb-8">
        <button
          onClick={() => {
            sound.playBeep(980, 0.1);
            onStartMission();
          }}
          className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-7 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Rocket className="w-5 h-5 text-slate-950" />
          <span>INITIATE MISSION</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>

        {hasSavedMission && (
          <button
            onClick={() => {
              sound.playBeep(880, 0.08);
              onResumeMission();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-space-900/90 hover:bg-space-800 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 font-mono text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          >
            RESUME SAVED FLIGHT
          </button>
        )}
      </div>

      {/* Secondary Links */}
      <div className="flex items-center space-x-6 text-xs font-mono text-slate-400">
        <button
          onClick={() => {
            sound.playBeep(800, 0.05);
            onOpenManual();
          }}
          className="hover:text-cyan-300 transition-colors flex items-center space-x-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>NASA Empirical References & Physics</span>
        </button>
        <span>•</span>
        <button
          onClick={() => {
            sound.playBeep(800, 0.05);
            onOpenHistory();
          }}
          className="hover:text-cyan-300 transition-colors flex items-center space-x-1.5"
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Past Flight Records</span>
        </button>
      </div>
    </div>
  );
}
