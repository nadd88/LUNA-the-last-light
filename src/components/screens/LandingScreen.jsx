import React from 'react';
import { 
  Rocket, 
  RotateCcw, 
  ArrowRight,
  Sun,
  BatteryCharging,
  ThermometerSnowflake
} from 'lucide-react';
import { sound } from '../../utils/sound';
import Button from '../common/Button';

export default function LandingScreen({
  onStartMission,
  onResumeMission,
  hasSavedMission,
  onOpenHowToPlay,
  onOpenSettings
}) {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-4 py-2 max-w-5xl mx-auto overflow-hidden text-center select-none">
      {/* Calm Status Pill */}
      <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-space-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2 shadow-[0_0_12px_rgba(0,240,255,0.15)] shrink-0">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>NASA SPACE APPS CHALLENGE 2026 // ARTEMIS POLAR EXPEDITION</span>
      </div>

      {/* Main Title */}
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider text-slate-100 mb-1 text-glow-cyan shrink-0">
        LUNA <span className="text-cyan-400">:</span> THE LAST LIGHT
      </h1>

      {/* Core Pitch */}
      <p className="text-base sm:text-lg text-cyan-200 font-medium max-w-xl mb-1 shrink-0">
        Design a rover. Drive it into the dark. Don't let it die.
      </p>
      <p className="text-sm text-slate-300 max-w-lg mb-4 shrink-0 font-sans">
        Explore permanently shadowed lunar craters at -230°C to find water ice before battery depletion.
      </p>

      {/* 3 Core Mechanic Cards in ONE Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl mb-5 text-left shrink-0">
        {/* Card 1: Sunlight = Power */}
        <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/25 bg-space-900/80 transition-all hover:border-cyan-400/50">
          <div className="flex items-center space-x-2 text-cyan-400 font-display font-bold text-sm mb-1">
            <Sun className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>1. Sunlight = Power</span>
          </div>
          <p className="text-sm text-slate-300 font-sans leading-snug">
            Solar panels work only on sunlit rims. Inside shadows, generation drops to 0.0W.
          </p>
        </div>

        {/* Card 2: Battery = Life */}
        <div className="hud-panel p-3.5 rounded-xl border border-emerald-500/25 bg-space-900/80 transition-all hover:border-emerald-400/50">
          <div className="flex items-center space-x-2 text-emerald-400 font-display font-bold text-sm mb-1">
            <BatteryCharging className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>2. Battery = Life</span>
          </div>
          <p className="text-sm text-slate-300 font-sans leading-snug">
            Every movement, scan, and drill consumes stored energy. Return before empty.
          </p>
        </div>

        {/* Card 3: Cold = Damage */}
        <div className="hud-panel p-3.5 rounded-xl border border-amber-500/25 bg-space-900/80 transition-all hover:border-amber-400/50">
          <div className="flex items-center space-x-2 text-amber-400 font-display font-bold text-sm mb-1">
            <ThermometerSnowflake className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>3. Cold = Damage</span>
          </div>
          <p className="text-sm text-slate-300 font-sans leading-snug">
            Dark craters plunge to -230°C. Without active heaters, rover hardware freezes.
          </p>
        </div>
      </div>

      {/* Primary Action & Small Links Under START */}
      <div className="flex flex-col items-center justify-center gap-2 w-full max-w-md shrink-0">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto px-10 py-3.5 text-base font-display font-bold shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)]"
          onClick={() => {
            sound.playBeep(980, 0.1);
            onStartMission();
          }}
          icon={<Rocket className="w-5 h-5 text-slate-950" />}
          iconRight={<ArrowRight className="w-4 h-4 text-slate-950" />}
        >
          START MISSION
        </Button>

        {/* Small text links directly under START */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400 mt-2">
          {hasSavedMission && (
            <button
              onClick={() => {
                sound.playBeep(880, 0.08);
                onResumeMission();
              }}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume Saved Flight</span>
            </button>
          )}
          {hasSavedMission && <span className="text-slate-600">•</span>}
          <button
            onClick={() => {
              sound.playBeep(850, 0.05);
              onOpenHowToPlay();
            }}
            className="hover:text-cyan-300 transition-colors cursor-pointer underline-offset-4 hover:underline"
          >
            How to Play (2 min guide)
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => {
              sound.playBeep(850, 0.05);
              onOpenSettings();
            }}
            className="hover:text-slate-200 transition-colors cursor-pointer underline-offset-4 hover:underline"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
