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
  ArrowRight 
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
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-50px)] px-4 py-8 text-center max-w-5xl mx-auto">
      {/* Top Banner Tag */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>NASA SPACE APPS CHALLENGE 2026 // LUNAR POLAR DIVISION</span>
      </div>

      {/* Main Title */}
      <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-slate-100 mb-3 text-glow-cyan">
        LUNA <span className="text-cyan-400">:</span> THE LAST LIGHT
      </h1>

      {/* Subtitle / Core Gameplay Concept */}
      <p className="text-base sm:text-xl text-cyan-200/90 font-mono max-w-2xl mb-8 leading-relaxed">
        How far into eternal darkness can your rover venture before cold and darkness claim it?
      </p>

      {/* Tactical Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-10 text-left">
        <div className="hud-panel p-4 rounded-lg bg-space-900/70 border border-cyan-500/20">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>SOLAR PARADOX</span>
          </div>
          <div className="text-xs text-slate-300 leading-normal">
            Low-angle sun grazes south pole peaks at 1.5°, but drops to strictly <strong className="text-cyan-300">0.0 Watts</strong> inside Permanently Shadowed Regions.
          </div>
        </div>

        <div className="hud-panel p-4 rounded-lg bg-space-900/70 border border-cyan-500/20">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs mb-1.5">
            <ThermometerSnowflake className="w-4 h-4 text-amber-400" />
            <span>CRYOGENIC COLD</span>
          </div>
          <div className="text-xs text-slate-300 leading-normal">
            Cold traps plunge to <strong className="text-amber-300">38 Kelvin (-235°C)</strong>. Without battery-powered heaters, lubricants freeze solid and avionics fail.
          </div>
        </div>

        <div className="hud-panel p-4 rounded-lg bg-space-900/70 border border-cyan-500/20">
          <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs mb-1.5">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>CRATER OCCULTATION</span>
          </div>
          <div className="text-xs text-slate-300 leading-normal">
            Deep crater walls sever direct-to-Earth radio paths. Plan autonomous routes or invest in an orbital relay link to stay connected.
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center mb-8">
        <button
          onClick={() => {
            sound.playBeep(980, 0.1);
            onStartMission();
          }}
          className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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
            className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-space-900/90 hover:bg-space-800 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 font-mono text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          >
            RESUME FLIGHT
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

      {/* Scientific Footer Attribution */}
      <div className="mt-12 text-[11px] text-slate-500 font-mono">
        Derived from LOLA laser altimetry, ShadowCam imaging, and Diviner radiometer datasets from NASA LRO.
      </div>
    </div>
  );
}
