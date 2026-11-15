import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Eye, 
  Sparkles, 
  ShieldAlert, 
  RotateCcw, 
  Check, 
  Keyboard
} from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motionVariants';
import { sound } from '../../utils/sound';
import { loadSettings, saveSettings, clearMissionHistory } from '../../utils/storage';

export default function SettingsModal({ isOpen, onClose, onSettingsChanged }) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [clearedLogs, setClearedLogs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
      setClearedLogs(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const nextMuted = !settings.isMuted;
    sound.setMuted(nextMuted);
    updateSetting('isMuted', nextMuted);
    if (!nextMuted) sound.playBeep(880, 0.08);
  };

  const updateSetting = (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm('Delete all archived mission flight logs? This cannot be undone.')) {
      clearMissionHistory();
      setClearedLogs(true);
      sound.playWarning();
      setTimeout(() => setClearedLogs(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0"
        />

        <motion.div
          variants={modalContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative max-w-xl w-full rounded-xl border border-cyan-500/40 bg-space-950 p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60 flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-100">
                  MISSION CONTROL SETTINGS
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  AUDIO, GRAPHICS & ACCESSIBILITY PREFERENCES
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playBeep(700, 0.04);
                onClose();
              }}
              className="p-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Body */}
          <div className="space-y-5 text-xs font-mono text-slate-300">
            {/* Audio Settings */}
            <div className="p-3.5 rounded-lg bg-space-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                  {settings.isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  <span>SYNTHESIZED AUDIO & TELEMETRY BEEPS</span>
                </div>
                <button
                  onClick={handleToggleMute}
                  className={`px-3 py-1 rounded border text-[11px] font-bold transition-all ${
                    settings.isMuted
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      : 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  }`}
                >
                  {settings.isMuted ? 'AUDIO MUTED' : 'AUDIO ENABLED'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Synthesizes Apollo Quindar chirps, motor drive hums, telemetry alert pings, and drill soundscapes using pure offline Web Audio oscillators.
              </p>
            </div>

            {/* Accessibility & Motion */}
            <div className="p-3.5 rounded-lg bg-space-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>REDUCED MOTION PREFERENCE</span>
                </div>
                <button
                  onClick={() => {
                    sound.playBeep(800, 0.04);
                    updateSetting('reducedMotion', !settings.reducedMotion);
                  }}
                  className={`px-3 py-1 rounded border text-[11px] font-bold transition-all ${
                    settings.reducedMotion
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'bg-space-950 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {settings.reducedMotion ? 'REDUCED MOTION: ON' : 'FULL CINEMATICS'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Replaces high-dynamic page slides, scale zooms, and pulsing HUD loops with gentle instant opacity dissolves for vestibular comfort.
              </p>
            </div>

            {/* Starfield & Background Effects */}
            <div className="p-3.5 rounded-lg bg-space-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>STARFIELD & COSMIC DUST QUALITY</span>
                </div>
                <div className="flex rounded border border-slate-700 overflow-hidden text-[10px]">
                  {['low', 'med', 'high'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        sound.playBeep(750, 0.04);
                        updateSetting('starfieldDensity', lvl);
                      }}
                      className={`px-2.5 py-1 uppercase font-bold transition-colors ${
                        settings.starfieldDensity === lvl
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-space-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adjusts procedural 2D canvas stars, drifting cosmic dust, and Earth atmospheric scattering rendering frequency.
              </p>
            </div>

            {/* Mission Data Management */}
            <div className="p-3.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-bold block mb-0.5">LOCAL MISSION ARCHIVE</span>
                <span className="text-[11px] text-slate-500">Clear cached flight debrief records and local storage saves</span>
              </div>
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 text-red-400 text-[11px] flex items-center space-x-1.5 transition-colors"
              >
                {clearedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{clearedLogs ? 'CLEARED' : 'RESET RECORDS'}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 mt-4 border-t border-slate-700/60 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] font-mono text-slate-500">
              LUNA SIMULATION CLIENT // BUILD v1.0.0
            </span>
            <button
              onClick={() => {
                sound.playBeep(850, 0.05);
                onClose();
              }}
              className="btn-primary px-5 py-2 text-xs"
            >
              APPLY & CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
