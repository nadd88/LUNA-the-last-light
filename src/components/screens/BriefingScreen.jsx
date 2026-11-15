import React, { useState, useEffect } from 'react';
import { 
  Target, 
  AlertTriangle, 
  Home, 
  ArrowRight,
  BookOpen,
  Sun,
  Snowflake,
  Zap,
  CheckCircle2,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { useGameMode } from '../../context/GameModeContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import StageHeader from '../common/StageHeader';
import Modal from '../common/Modal';

export default function BriefingScreen({ onProceed, onBack }) {
  const { isEngineerMode } = useGameMode();
  const [isScienceOpen, setIsScienceOpen] = useState(false);

  useEffect(() => {
    sound.playQuindar();
  }, []);

  return (
    <div className="h-full w-full flex flex-col justify-between max-w-6xl mx-auto px-4 py-2.5 select-none">
      {/* 1. Standard StageHeader (Consistent with SiteSelection, Config, and MissionControl) */}
      <StageHeader
        stepNumber={1}
        totalSteps={6}
        title="Mission Briefing: Operation Cold Trap"
        goal={
          isEngineerMode
            ? "Execute surface volatile prospecting inside a lunar south-pole Permanently Shadowed Region (PSR)."
            : "Find water ice inside the dark crater, then bring your rover safely home before your battery depletes."
        }
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-3 my-auto w-full max-w-5xl mx-auto">
        
        {/* Mission Traverse & Horizon Profile Diagram */}
        <div className="hud-panel p-3 rounded-xl border border-slate-800 bg-space-950/70 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2.5">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-display font-bold text-xs tracking-wider uppercase text-slate-200">
                LUNAR SOUTH POLE TRAVERSE PROFILE
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1 text-amber-300">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Rim: 100% Solar</span>
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center space-x-1 text-blue-300">
                <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                <span>Crater: 0.0W Solar (-240°C)</span>
              </span>
            </div>
          </div>

          {/* Visual 3-Stage Horizon Schematic */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            {/* Zone 1: Sunlit Summit Ridge (4 Cols) */}
            <div className="md:col-span-4 p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-900/50 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-amber-200">1. SUNLIT RIDGE</div>
                  <div className="font-sans text-[11px] text-slate-300">Base camp · Solar recharge · Comms</div>
                </div>
              </div>
              <Badge variant="warning" size="sm">Safe Zone</Badge>
            </div>

            {/* Transition: Shadow Line (4 Cols) */}
            <div className="md:col-span-4 p-2 rounded-lg bg-space-900/80 border border-slate-700/60 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-slate-800/20 to-blue-500/10 pointer-events-none" />
              <div className="relative z-10 flex items-center space-x-2">
                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-indigo-500" />
                <div>
                  <div className="font-mono font-bold text-xs text-slate-100">SHADOW BOUNDARY</div>
                  <div className="font-sans text-[11px] text-amber-300/90 font-medium">Solar power drops to 0.0 W</div>
                </div>
              </div>
              <span className="relative z-10 text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-space-950 border border-slate-800">
                One-Way Solar Cut
              </span>
            </div>

            {/* Zone 2: Cryogenic Dark Zone (4 Cols) */}
            <div className="md:col-span-4 p-2 rounded-lg bg-indigo-950/30 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-900/50 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <Snowflake className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-cyan-200">2. CRATER COLD TRAP</div>
                  <div className="font-sans text-[11px] text-slate-300">Target Ice deposits · TRIDENT Drill</div>
                </div>
              </div>
              <Badge variant="info" size="sm">Ice Zone</Badge>
            </div>
          </div>
        </div>

        {/* 3 Core Directives Grid (Consistent with Rover Design & Site Selection cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full items-stretch">
          
          {/* Card 1: Mission Objective (Cyan Theme) */}
          <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/40 bg-space-900/80 flex flex-col justify-between transition-all hover:border-cyan-400/70 shadow-[0_0_15px_rgba(0,240,255,0.08)]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    01 // OBJECTIVE
                  </span>
                </div>
                <Badge variant="info" size="sm">Primary</Badge>
              </div>

              <h2 className="font-display font-bold text-base text-slate-100 mb-1.5">
                Drill for Subsurface Ice
              </h2>

              <p className="font-sans text-sm text-slate-300 leading-relaxed mb-3">
                {isEngineerMode
                  ? "Locate subsurface volatile pockets inside the PSR. Deploy the 1-meter TRIDENT drill to retrieve 4 cryogenic core samples."
                  : "Drive into the dark crater, scan to detect underground ice pockets, and use your drill to extract 4 ice core samples."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-300">
              <span className="flex items-center space-x-1">
                <span>💎 Target:</span>
                <strong className="text-cyan-200">4 Core Samples</strong>
              </span>
              <span className="text-slate-400">+85 Science ea.</span>
            </div>
          </div>

          {/* Card 2: Environmental Hazard (Amber Theme) */}
          <div className="hud-panel p-3.5 rounded-xl border border-amber-500/40 bg-space-900/80 flex flex-col justify-between transition-all hover:border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-amber-950 border border-amber-500/40 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                    02 // HAZARD
                  </span>
                </div>
                <Badge variant="warning" size="sm">Critical</Badge>
              </div>

              <h2 className="font-display font-bold text-base text-slate-100 mb-1.5">
                Absolute Darkness & 0.0W Solar
              </h2>

              <p className="font-sans text-sm text-slate-300 leading-relaxed mb-3">
                {isEngineerMode
                  ? "Solar irradiance is strictly 0.0 W. Ambient temperature drops to 30K (-243°C); battery drains continuously to support heaters and avionics."
                  : "No sunlight reaches the crater floor. Your solar panels generate 0.0 Watts, making your battery your only source of power."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-amber-300">
              <span className="flex items-center space-x-1">
                <span>⚡ Power:</span>
                <strong className="text-amber-200">0.0W Solar in Dark</strong>
              </span>
              <span className="text-slate-400">Battery only</span>
            </div>
          </div>

          {/* Card 3: Extraction Directive (Emerald Theme) */}
          <div className="hud-panel p-3.5 rounded-xl border border-emerald-500/40 bg-space-900/80 flex flex-col justify-between transition-all hover:border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
                    <Home className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    03 // DIRECTIVE
                  </span>
                </div>
                <Badge variant="success" size="sm">Rule</Badge>
              </div>

              <h2 className="font-display font-bold text-base text-slate-100 mb-1.5">
                Return Safely to Sunlight
              </h2>

              <p className="font-sans text-sm text-slate-300 leading-relaxed mb-3">
                {isEngineerMode
                  ? "Preserve sufficient State-of-Charge (SoC) to climb back out of the crater basin to the sunlit rim before complete electrical failure."
                  : "Watch your battery closely. Drive back to the sunlit summit ridge before power reaches 0% to secure your science data."}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-300">
              <span className="flex items-center space-x-1">
                <span>🏠 Extraction:</span>
                <strong className="text-emerald-200">Sunlit Rim Ascent</strong>
              </span>
              <span className="text-slate-400">Before 0% Batt</span>
            </div>
          </div>
        </div>

        {/* Informational Sub-Strip: Calibration + Science Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2 rounded-xl bg-space-950/60 border border-slate-800 text-xs">
          <div className="flex items-center space-x-2 text-slate-400 font-sans">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              NASA Empirical Science: <strong>LOLA Topography</strong> · <strong>Diviner Radiometer</strong> · <strong>VIPER Architecture</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playBeep(850, 0.05);
              setIsScienceOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer bg-cyan-950/40 hover:bg-cyan-900/50 px-2.5 py-1 rounded-lg border border-cyan-500/30 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scientific Directives & Reference →</span>
          </button>
        </div>

      </div>

      {/* 3. Footer Action Bar (Fixed height, holds 1 primary button + back link) */}
      <footer className="shrink-0 h-12 flex items-center justify-between border-t border-slate-800/80 pt-2 px-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
        >
          ← BACK TO LAUNCH PAD
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            sound.playBeep(980, 0.08);
            onProceed();
          }}
          iconRight={<ArrowRight className="w-4 h-4 text-slate-950" />}
        >
          CHOOSE LANDING SITE →
        </Button>
      </footer>

      {/* Detailed Science Modal */}
      <Modal
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
        title="Lunar South Pole Scientific Directives"
        size="lg"
      >
        <div className="space-y-4 text-sm font-sans text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-3 rounded-lg bg-space-950 border border-cyan-500/30 font-mono text-xs text-cyan-300">
            NASA EMPIRICAL CALIBRATION: LRO LOLA • Diviner Radiometer • LEND • VIPER Architecture
          </div>

          <div>
            <h4 className="font-bold text-slate-100 mb-1">1. Permanently Shadowed Regions (PSRs)</h4>
            <p>
              Due to the Moon’s tiny 1.54° axial tilt, deep crater floors at the south pole never receive direct sunlight. They form cryogenic cold traps at 25K to 40K (-248°C to -233°C) preserving ancient volatiles for over two billion years.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-100 mb-1">2. Zero Solar Power Rule</h4>
            <p>
              The moment your rover crosses into shadow, photovoltaic generation drops strictly to 0.0 Watts. All locomotion, active resistive heaters, sensors, and avionics must draw entirely from stored battery capacity.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-100 mb-1">3. Deep Space Network (DSN) Line of Sight</h4>
            <p>
              Direct Earth communication requires line of sight. Descending deep into crater basins can cause radio occultation behind towering crater walls unless using high-gain directional systems or lunar relays.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
