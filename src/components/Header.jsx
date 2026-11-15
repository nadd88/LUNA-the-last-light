import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  BookOpen, 
  History, 
  RotateCcw, 
  Clock, 
  HelpCircle,
  Settings
} from 'lucide-react';
import { sound } from '../utils/sound';
import { useGameMode } from '../context/GameModeContext';

const SCREENS = [
  { id: 'landing', label: 'Launch Pad', stepNumber: 0 },
  { id: 'briefing', label: 'Briefing', stepNumber: 1 },
  { id: 'site-selection', label: 'Landing Site', stepNumber: 2 },
  { id: 'configuration', label: 'Rover Design', stepNumber: 3 },
  { id: 'mission-control', label: 'Mission Control', stepNumber: 4 },
  { id: 'simulation', label: 'Surface Ops', stepNumber: 5 },
  { id: 'debrief', label: 'Debrief', stepNumber: 6 }
];

export default function Header({
  currentScreen,
  onNavigate,
  onOpenManual,
  onOpenHistory,
  onOpenHowToPlay,
  onOpenSettings,
  onResetMission,
  missionTimeSeconds = 0,
  isMissionActive = false
}) {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const { gameMode, toggleGameMode, isEngineer } = useGameMode();

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playBeep(920, 0.08);
  };

  // Format Mission Elapsed Time (MET)
  const formatMET = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `T+${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentIndex = SCREENS.findIndex((s) => s.id === currentScreen);
  const currentStep = SCREENS[currentIndex] || SCREENS[0];

  return (
    <header className="relative z-30 bg-space-950/90 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-4 py-2 flex items-center justify-between text-xs select-none min-h-[56px]">
      {/* Left: Branding & NASA Apps tag */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={() => {
            sound.playBeep(700, 0.05);
            onNavigate('landing');
          }}
          className="flex items-center space-x-2 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1 cursor-pointer"
          aria-label="Return to LUNA Launch Pad"
        >
          <div className="w-8 h-8 rounded-full border border-cyan-400/50 bg-cyan-950/40 flex items-center justify-center relative overflow-hidden group-hover:border-cyan-300 transition-colors shadow-[0_0_12px_rgba(0,240,255,0.3)] flex-shrink-0">
            <div className="w-4 h-4 rounded-full border-r-2 border-cyan-400 transform -rotate-45" />
            <div className="absolute inset-0 bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-colors" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-sm tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                LUNA
              </span>
              <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.2 bg-cyan-950/70 border border-cyan-500/40 rounded hidden sm:inline-block">
                THE LAST LIGHT
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:flex items-center space-x-1">
              <span>NASA SPACE APPS 2026</span>
              <span className="text-cyan-500/70">•</span>
              <span className="text-cyan-400/80">ARTEMIS OPS</span>
            </div>
          </div>
        </button>

        {/* MET Clock */}
        {isMissionActive && (
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-space-900 border border-cyan-500/30 rounded-lg font-mono text-cyan-300 shadow-[inset_0_0_8px_rgba(0,240,255,0.1)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold">{formatMET(missionTimeSeconds)}</span>
            <span className="text-[9px] text-slate-400">MET</span>
          </div>
        )}
      </div>

      {/* Center: Stage Navigation Pipeline (Desktop: Full Stepper / Mobile: Step Pill) */}
      <nav aria-label="Mission Progress" className="hidden xl:flex items-center space-x-1">
        {SCREENS.map((step, idx) => {
          const isActive = step.id === currentScreen;
          const isPassed = idx < currentIndex;
          const isClickable = isPassed || isActive;

          return (
            <React.Fragment key={step.id}>
              <button
                disabled={!isClickable}
                onClick={() => {
                  sound.playBeep(800, 0.05);
                  onNavigate(step.id);
                }}
                aria-current={isActive ? 'step' : undefined}
                className={`relative px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isActive
                    ? 'border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-bold bg-cyan-950/60'
                    : isPassed
                    ? 'text-slate-300 hover:text-cyan-300 hover:bg-space-800/80 cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-cyan-400 animate-ping' : isPassed ? 'bg-cyan-500' : 'bg-slate-700'
                }`} />
                <span>{step.label}</span>
              </button>
              {idx < SCREENS.length - 1 && (
                <span className="text-slate-700 text-xs px-0.5">›</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mobile/Tablet Step Indicator */}
      <div className="xl:hidden flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-space-900 border border-slate-800 font-mono text-[11px]">
        <span className="text-cyan-400 font-bold">
          {currentIndex === 0 ? 'START' : `STEP ${currentIndex}/6:`}
        </span>
        <span className="text-slate-200 truncate max-w-[110px] sm:max-w-[160px]">
          {currentStep.label}
        </span>
      </div>

      {/* Right: Quick Utilities (Explorer/Engineer Toggle, Audio, Help, Manual, Settings, Abort) */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Global Explorer vs Engineer Mode Toggle */}
        <button
          type="button"
          onClick={toggleGameMode}
          aria-label={`Current mode: ${isEngineer ? 'Engineer' : 'Explorer'}. Click to toggle.`}
          title={isEngineer ? "Switch to Explorer Mode (simplified plain-language labels & meters)" : "Switch to Engineer Mode (raw NASA flight telemetry & acronyms)"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-medium border transition-all cursor-pointer bg-slate-900 border-slate-700 hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[36px]"
        >
          <span className="text-sm shrink-0" aria-hidden="true">{isEngineer ? '🔬' : '🎮'}</span>
          <span className={isEngineer ? 'text-amber-300 font-mono font-bold' : 'text-cyan-300 font-bold'}>
            {isEngineer ? 'Engineer' : 'Explorer'}
          </span>
        </button>

        {/* How to Play Manual */}
        <button
          onClick={() => {
            sound.playBeep(800, 0.04);
            onOpenHowToPlay();
          }}
          title="Commander's Flight Manual (How to Play)"
          aria-label="How to Play"
          className="p-2 rounded-lg border border-slate-700 hover:border-cyan-500 bg-space-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Settings Modal */}
        <button
          onClick={() => {
            sound.playBeep(800, 0.04);
            onOpenSettings();
          }}
          title="Mission Settings"
          aria-label="Mission Settings"
          className="p-2 rounded-lg border border-slate-700 hover:border-cyan-500 bg-space-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-lg border border-slate-700 hover:border-cyan-500 bg-space-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* NASA Science Manual */}
        <button
          onClick={() => {
            sound.playBeep(850, 0.05);
            onOpenManual();
          }}
          aria-label="NASA Scientific References"
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 transition-all font-mono text-[11px] cursor-pointer min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>NASA Ref</span>
        </button>

        {/* Past Flight Logs */}
        <button
          onClick={() => {
            sound.playBeep(850, 0.05);
            onOpenHistory();
          }}
          aria-label="Past Flight Logs"
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-space-900/80 hover:bg-space-800 text-slate-300 transition-all font-mono text-[11px] cursor-pointer min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <History className="w-3.5 h-3.5" />
          <span>Logs</span>
        </button>

        {/* Abort / Reset Mission Button */}
        {currentScreen !== 'landing' && (
          <button
            onClick={() => {
              if (window.confirm('Abort current mission setup and return to Launch Pad?')) {
                sound.playWarning();
                onResetMission();
              }
            }}
            title="Abort Mission and Return to Launch Pad"
            aria-label="Abort Mission"
            className="p-2 rounded-lg border border-red-500/30 hover:border-red-400 bg-red-950/20 hover:bg-red-900/30 text-red-400 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
