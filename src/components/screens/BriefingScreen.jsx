import React, { useEffect } from 'react';
import { 
  FileText, 
  Target, 
  Compass, 
  Zap, 
  Radio, 
  Thermometer, 
  ArrowRight, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';
import { sound } from '../../utils/sound';

export default function BriefingScreen({ onProceed, onBack }) {
  useEffect(() => {
    sound.playQuindar();
  }, []);

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
      {/* Top Header Card */}
      <div className="hud-panel p-6 rounded-xl border border-cyan-500/30 bg-space-900/80 mb-6 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-700/60 pb-3">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>DIRECTORATE OF PLANETARY EXPLORATION // ARTEMIS INITIATIVE</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide mt-1">
              MISSION BRIEFING: OPERATION COLD TRAP
            </h2>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>DOC ID: <span className="text-cyan-300">NASA-LUNA-2026-SP</span></div>
            <div>SECURITY: <span className="text-emerald-400">UNCLASSIFIED / SCIENTIFIC</span></div>
          </div>
        </div>

        {/* Narrative & Scientific Context */}
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          Welcome, Mission Commander. Under the NASA Space Apps Challenge 2026, you are assigned lead responsibility for landing and operating a robotic exploration rover near the <strong>Lunar South Pole</strong>.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          The lunar polar environment is unlike anywhere else in the solar system. Because the Moon’s rotational axis is tilted by a mere <strong>1.54°</strong>, the sun skims the horizon at extreme shallow angles. Elevated peaks enjoy 80–90% illumination, while deep impact depressions have remained in pitch-black darkness for billions of years — creating <strong>Permanently Shadowed Regions (PSRs)</strong> where temperatures plummet to 38 Kelvin (-235°C).
        </p>
      </div>

      {/* Core Objectives & Directives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="hud-panel p-5 rounded-lg border border-cyan-500/20 bg-space-900/60">
          <div className="flex items-center space-x-2 text-cyan-400 font-display text-base font-bold mb-3">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>PRIMARY SCIENCE GOALS</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Prospect for subsurface hydrogen and water ice (H₂O) using neutron & infrared spectrometry.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Deploy a cryogenic rotary drill to sample frozen volatile layers down to 100 cm depth.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Map terrain micro-relief and boulder hazards using high-sensitivity low-light sensors.</span>
            </li>
          </ul>
        </div>

        <div className="hud-panel p-5 rounded-lg border border-amber-500/20 bg-space-900/60">
          <div className="flex items-center space-x-2 text-amber-400 font-display text-base font-bold mb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>CRITICAL SURVIVAL DIRECTIVES</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span><strong>Zero Solar Generation:</strong> Inside a PSR, solar panels produce 0.0 Watts. All operations run on battery.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span><strong>Thermal Starvation:</strong> Active heaters must be powered continuously to prevent electronics freeze.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span><strong>The Return Dilemma:</strong> Decide when to push deeper for rare ice vs when to retreat to sunlit warmth.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Flight Execution Pipeline Diagram */}
      <div className="hud-panel p-4 rounded-lg border border-slate-700/60 bg-space-950/60 mb-8">
        <div className="text-xs font-mono text-cyan-400 mb-3 tracking-wider">EXPEDITION FLIGHT SEQUENCE:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
          <div className="p-2.5 rounded bg-space-900/80 border border-slate-700/50">
            <div className="text-cyan-400 font-bold mb-1">STAGE 01</div>
            <div className="text-slate-200">Site Selection</div>
            <div className="text-[10px] text-slate-400 mt-1">LOLA topographic analysis</div>
          </div>
          <div className="p-2.5 rounded bg-space-900/80 border border-slate-700/50">
            <div className="text-cyan-400 font-bold mb-1">STAGE 02</div>
            <div className="text-slate-200">Rover Build</div>
            <div className="text-[10px] text-slate-400 mt-1">Mass, Budget & Power trade-offs</div>
          </div>
          <div className="p-2.5 rounded bg-space-900/80 border border-slate-700/50">
            <div className="text-cyan-400 font-bold mb-1">STAGE 03</div>
            <div className="text-slate-200">Darkness Traverse</div>
            <div className="text-[10px] text-slate-400 mt-1">Navigate inside PSR cold trap</div>
          </div>
          <div className="p-2.5 rounded bg-space-900/80 border border-slate-700/50">
            <div className="text-cyan-400 font-bold mb-1">STAGE 04</div>
            <div className="text-slate-200">Debrief & Science</div>
            <div className="text-[10px] text-slate-400 mt-1">NASA forensic score & analysis</div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
          className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs transition-colors"
        >
          ← Return to Launch Pad
        </button>

        <button
          onClick={() => {
            sound.playBeep(980, 0.08);
            onProceed();
          }}
          className="flex items-center space-x-2 px-6 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all transform hover:-translate-y-0.5"
        >
          <span>SELECT LANDING SITE</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
