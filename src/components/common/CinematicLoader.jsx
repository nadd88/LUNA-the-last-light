import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Compass, Orbit, Sparkles } from 'lucide-react';

/**
 * Reusable Cinematic Transition / Loading Component
 * Used during stage shifts (especially entering surface ops) to provide
 * an immersive aerospace transition while preventing interaction during setup.
 */
export default function CinematicLoader({
  active = false,
  message = 'INITIALIZING LUNAR TELEMETRY...',
  submessage = 'DSN GOLDSTONE // 34M BEAMFORMING LINK',
  duration = 900,
  onComplete
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 120);
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [active, duration, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="cinematic-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space-950/90 backdrop-blur-md pointer-events-auto select-none"
        >
          {/* Outer Radar Reticle */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            {/* Spinning dashed ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_8s_linear_infinite]" />
            
            {/* Counter-spinning thin tick ring */}
            <div className="absolute inset-2 rounded-full border border-cyan-400/20 border-t-cyan-400 animate-[spin_3s_linear_infinite_reverse]" />
            
            {/* Pulsing center radar beacon */}
            <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              <Orbit className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>

            {/* Corner alignment crosshairs */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-cyan-400" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-cyan-400" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-cyan-400" />
          </div>

          {/* Primary Status Title */}
          <div className="text-center max-w-sm px-4">
            <div className="text-[10px] font-mono tracking-widest text-cyan-400/80 mb-1 flex items-center justify-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{submessage}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-wider text-slate-100 text-glow-cyan mb-3">
              {message}
            </h3>

            {/* Telemetry Progress Bar */}
            <div className="w-64 h-1.5 bg-space-900 rounded-full overflow-hidden border border-slate-700/80 mx-auto relative mb-2">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Percentage & Coordinates */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 w-64 mx-auto">
              <span>BUFFERING {progress}%</span>
              <span className="text-cyan-400">90.0°S LAT</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
