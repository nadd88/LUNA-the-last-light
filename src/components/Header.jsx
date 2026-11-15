import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  History, 
  RotateCcw, 
  Radio, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { sound } from '../utils/sound';

export const SCREENS = [
  { id: 'landing', label: 'Launch Pad' },
  { id: 'briefing', label: 'Briefing' },
  { id: 'site-selection', label: 'Landing Site' },
  { id: 'configuration', label: 'Rover Design' },
  { id: 'mission-control', label: 'Mission Control' },
  { id: 'simulation', label: 'Surface Ops' },
  { id: 'debrief', label: 'Debrief' }
];

export default function Header({
  currentScreen,
  onNavigate,
  onOpenManual,
  onOpenHistory,
  onResetMission,
  missionTimeSeconds = 0,
  isMissionActive = false
}) {
  const [isMuted, setIsMuted] = useState(sound.isMuted);

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

  return (
    <header className="relative z-30 bg-space-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between text-xs tracking-wider">
      {/* Left: Branding & NASA Apps tag */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            sound.playBeep(700, 0.05);
            onNavigate('landing');
          }}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full border border-cyan-400/50 bg-cyan-950/40 flex items-center justify-center relative overflow-hidden group-hover:border-cyan-300 transition-colors shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <div className="w-4 h-4 rounded-full border-r-2 border-cyan-400 transform -rotate-45" />
            <div className="absolute inset-0 bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-colors" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-sm tracking-widest text-slate-100 group-hover:text-cyan-300 transition-colors">
                LUNA
              </span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-normal px-1.5 py-0.2 bg-cyan-950/70 border border-cyan-500/40 rounded">
                THE LAST LIGHT
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight flex items-center space-x-1">
              <span>NASA SPACE APPS 2026</span>
              <span className="text-cyan-500/70">•</span>
              <span className="text-cyan-400/80">ARTEMIS POLAR OPS</span>
            </div>
          </div>
        </button>

        {/* MET Clock */}
        {isMissionActive && (
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-space-900/90 border border-cyan-500/30 rounded font-telemetry text-cyan-300 shadow-[inset_0_0_8px_rgba(0,240,255,0.1)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold">{formatMET(missionTimeSeconds)}</span>
            <span className="text-[9px] text-slate-400">MET</span>
          </div>
        )}
      </div>

      {/* Center: Stage Navigation Pipeline */}
      <div className="hidden lg:flex items-center space-x-1">
        {SCREENS.map((step, idx) => {
          const isActive = step.id === currentScreen;
          const isPassed = idx < currentIndex;
          return (
            <React.Fragment key={step.id}>
              <button
                disabled={!isPassed && !isActive}
                onClick={() => {
                  sound.playBeep(800, 0.05);
                  onNavigate(step.id);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.25)] font-bold'
                    : isPassed
                    ? 'text-slate-300 hover:text-cyan-300 hover:bg-space-800/60 cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-ping' : isPassed ? 'bg-cyan-600' : 'bg-slate-700'}`} />
                <span>{step.label}</span>
              </button>
              {idx < SCREENS.length - 1 && (
                <span className="text-slate-700 text-[10px]">/</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Quick Utilities (Audio, Science Manual, History, Reset) */}
      <div className="flex items-center space-x-2">
        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-1.5 rounded border border-slate-700/60 hover:border-cyan-500/50 bg-space-900/60 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-300 transition-colors"
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
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded border border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 transition-all font-mono text-[11px]"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">NASA Data Ref</span>
        </button>

        {/* Past Flight Logs */}
        <button
          onClick={() => {
            sound.playBeep(850, 0.05);
            onOpenHistory();
          }}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded border border-slate-700/60 hover:border-slate-500 bg-space-900/60 hover:bg-space-800 text-slate-300 transition-all font-mono text-[11px]"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logs</span>
        </button>

        {/* Restart / Reset */}
        {currentScreen !== 'landing' && (
          <button
            onClick={() => {
              if (window.confirm('Abort current mission setup and return to Launch Pad?')) {
                sound.playWarning();
                onResetMission();
              }
            }}
            title="Abort Mission"
            className="p-1.5 rounded border border-red-500/30 hover:border-red-400 bg-red-950/20 hover:bg-red-900/30 text-red-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
