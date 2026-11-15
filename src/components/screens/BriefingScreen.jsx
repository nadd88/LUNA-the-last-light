import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Target, 
  Compass, 
  Zap, 
  Radio, 
  Thermometer, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Orbit,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { sound } from '../../utils/sound';

export default function BriefingScreen({ onProceed, onBack }) {
  const [activeTab, setActiveTab] = useState('directives'); // 'directives' | 'environment' | 'comms' | 'sequence'

  useEffect(() => {
    sound.playQuindar();
  }, []);

  const handleTabChange = (tab) => {
    sound.playBeep(750, 0.04);
    setActiveTab(tab);
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
      {/* Top Header Card */}
      <div className="hud-panel p-6 rounded-xl border border-cyan-500/30 bg-space-900/80 mb-6 shadow-[0_0_30px_rgba(0,240,255,0.12)]">
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
            <div>DOC ID: <span className="text-cyan-300 font-bold">NASA-LUNA-2026-SP</span></div>
            <div>SECURITY: <span className="text-emerald-400 font-bold">UNCLASSIFIED // SCIENTIFIC DISPATCH</span></div>
          </div>
        </div>

        {/* Narrative & Scientific Context */}
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          Welcome, Mission Commander. Under the NASA Space Apps Challenge 2026, you are assigned lead operational authority for landing and piloting an autonomous lunar exploration rover near the <strong>Lunar South Pole</strong>.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          The lunar polar environment is unlike anywhere else in the solar system. Because the Moon’s rotational axis is tilted by a mere <strong>1.54°</strong>, the sun skims the horizon at extreme shallow angles. Elevated peaks enjoy 80–90% illumination, while deep impact depressions have remained in pitch-black darkness for billions of years — creating <strong>Permanently Shadowed Regions (PSRs)</strong> where temperatures plummet to 38 Kelvin (-235°C).
        </p>
      </div>

      {/* Interactive Dossier Tabs */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange('directives')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border font-mono text-xs transition-all whitespace-nowrap ${
            activeTab === 'directives'
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-bold'
              : 'bg-space-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          <Target className="w-4 h-4 text-cyan-400" />
          <span>FLIGHT DIRECTIVES & ROE</span>
        </button>

        <button
          onClick={() => handleTabChange('environment')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border font-mono text-xs transition-all whitespace-nowrap ${
            activeTab === 'environment'
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-bold'
              : 'bg-space-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>LUNAR POLAR ENVIRONMENT</span>
        </button>

        <button
          onClick={() => handleTabChange('comms')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border font-mono text-xs transition-all whitespace-nowrap ${
            activeTab === 'comms'
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-bold'
              : 'bg-space-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>DSN & ORBITAL LINK</span>
        </button>

        <button
          onClick={() => handleTabChange('sequence')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border font-mono text-xs transition-all whitespace-nowrap ${
            activeTab === 'sequence'
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-bold'
              : 'bg-space-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          <Orbit className="w-4 h-4 text-cyan-400" />
          <span>EXPEDITION PIPELINE</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'directives' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="hud-panel p-5 rounded-lg border border-cyan-500/20 bg-space-900/60">
            <div className="flex items-center space-x-2 text-cyan-400 font-display text-base font-bold mb-3">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>PRIMARY SCIENCE GOALS</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Prospect Subsurface Ice:</strong> Quantify hydrogen and volatile concentration via neutron spectrometer and near-IR array.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Deploy Cryogenic Drill:</strong> Sample stratified ice layers up to 100cm depth inside permanently shadowed craters.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Map Geomorphology:</strong> Survey boulder fields, slope limits, and regolith bearing strength using stereo hazard cameras.</span>
              </li>
            </ul>
          </div>

          <div className="hud-panel p-5 rounded-lg border border-amber-500/20 bg-space-900/60">
            <div className="flex items-center space-x-2 text-amber-400 font-display text-base font-bold mb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>CRITICAL SURVIVAL DIRECTIVES</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Zero Solar Generation:</strong> Inside a PSR, solar flux drops to 0.0 W/m². The rover runs exclusively on battery reserve.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Cryo Thermal Starvation:</strong> At 40 Kelvin, internal avionics freeze rapidly. Active resistive heating must be budgeted.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>The Return Dilemma:</strong> Push deeper into crater depths for higher ice yields, or retreat to sunlit rims before battery depletion.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'environment' && (
        <div className="hud-panel p-5 rounded-lg border border-cyan-500/20 bg-space-900/70 mb-6 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-display text-base font-bold">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>NASA SCIENTIFIC RECONNAISSANCE INTEL</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-space-950/80 border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1">AXIAL TILT: 1.54°</div>
              <p className="text-slate-300">
                The Sun never rises more than 1.5° to 2° above the polar horizon. Shadows stretch for tens of kilometers across craters and crater walls.
              </p>
            </div>
            <div className="p-3 rounded bg-space-950/80 border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1">COLD TRAPS: 38K (-235°C)</div>
              <p className="text-slate-300">
                PSRs act as thermal cold traps, preserving ancient volatile water ice deposited by comets and asteroids over billions of years without evaporating.
              </p>
            </div>
            <div className="p-3 rounded bg-space-950/80 border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1">ELECTROSTATIC DUST</div>
              <p className="text-slate-300">
                Solar wind UV causes lunar dust grains to levitate electrostatically at the terminator, creating abrasive coating risks on solar cells and optical lenses.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-3">
            Reference Data: NASA Lunar Reconnaissance Orbiter (LRO) LOLA Altimeter & ShadowCam optical imaging sensors.
          </div>
        </div>
      )}

      {activeTab === 'comms' && (
        <div className="hud-panel p-5 rounded-lg border border-cyan-500/20 bg-space-900/70 mb-6 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-display text-base font-bold">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>DEEP SPACE NETWORK (DSN) & LINK BUDGET</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded bg-space-950/80 border border-slate-800">
              <div className="text-cyan-300 font-bold mb-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>DIRECT-TO-EARTH (DTE) LINK</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Direct X-band radio link to NASA Goldstone, Madrid, and Canberra 70-meter ground dishes. Requires unobstructed line-of-sight to Earth above the lunar horizon. Earth hangs low in the polar sky (1° to 6° elevation).
              </p>
            </div>
            <div className="p-3.5 rounded bg-space-950/80 border border-slate-800">
              <div className="text-amber-300 font-bold mb-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>CRATER WALL OCCLUSION RISK</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                As your rover descends into the crater interior, steep rim walls may block direct line-of-sight to Earth, causing temporary loss of signal (LOS) unless a high-gain steerable antenna or lunar orbital relay is in contact.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sequence' && (
        <div className="hud-panel p-4 rounded-lg border border-slate-700/60 bg-space-950/70 mb-6">
          <div className="text-xs font-mono text-cyan-400 mb-3 tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>EXPEDITION FLIGHT SEQUENCE OVERVIEW:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded bg-space-900/80 border border-cyan-500/30">
              <div className="text-cyan-400 font-bold mb-1">STAGE 01</div>
              <div className="text-slate-200">Site Selection</div>
              <div className="text-[10px] text-slate-400 mt-1">LOLA topographic analysis</div>
            </div>
            <div className="p-3 rounded bg-space-900/80 border border-cyan-500/30">
              <div className="text-cyan-400 font-bold mb-1">STAGE 02</div>
              <div className="text-slate-200">Rover Build</div>
              <div className="text-[10px] text-slate-400 mt-1">Mass, Budget & Power trade-offs</div>
            </div>
            <div className="p-3 rounded bg-space-900/80 border border-cyan-500/30">
              <div className="text-cyan-400 font-bold mb-1">STAGE 03</div>
              <div className="text-slate-200">Darkness Traverse</div>
              <div className="text-[10px] text-slate-400 mt-1">Navigate inside PSR cold trap</div>
            </div>
            <div className="p-3 rounded bg-space-900/80 border border-cyan-500/30">
              <div className="text-cyan-400 font-bold mb-1">STAGE 04</div>
              <div className="text-slate-200">Debrief & Science</div>
              <div className="text-[10px] text-slate-400 mt-1">NASA forensic score & analysis</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
          className="btn-secondary flex items-center space-x-2"
        >
          <span>← Return to Launch Pad</span>
        </button>

        <button
          onClick={() => {
            sound.playBeep(980, 0.08);
            onProceed();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <span>SELECT CANDIDATE LANDING SITE</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
