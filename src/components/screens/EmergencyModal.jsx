import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ArrowRight, Zap, Thermometer, Droplet, Clock } from 'lucide-react';
import { sound } from '../../utils/sound';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function EmergencyModal({ event, onResolve }) {
  const modalRef = useRef(null);

  useEffect(() => {
    sound.playWarning();
    // Focus first button for keyboard accessibility
    const firstButton = modalRef.current?.querySelector('button');
    if (firstButton) firstButton.focus();
  }, [event]);

  if (!event) return null;

  const isRed = event.severity === 'red';
  const isCyan = event.severity === 'cyan';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div
        ref={modalRef}
        className={`relative max-w-xl w-full rounded-2xl border p-6 shadow-2xl transition-all z-10 ${
          isRed 
            ? 'bg-space-950 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
            : isCyan
            ? 'bg-space-950 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]'
            : 'bg-space-950 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
        }`}
      >
        {/* Header Badge */}
        <div className="flex items-center space-x-3 mb-3">
          <div className={`p-2.5 rounded-xl ${
            isRed ? 'bg-red-950 text-red-400' : isCyan ? 'bg-cyan-950 text-cyan-400' : 'bg-amber-950 text-amber-400'
          }`}>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <Badge variant={isRed ? 'danger' : isCyan ? 'info' : 'warning'}>
              {isRed ? 'CRITICAL CONTINGENCY' : isCyan ? 'SCIENTIFIC DETECTION' : 'TACTICAL HAZARD'}
            </Badge>
            <h3 id="emergency-modal-title" className="font-display text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Narrative Description in Plain English */}
        <p className="text-sm text-slate-200 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Context Note */}
        {event.context && (
          <div className="p-3 rounded-lg bg-space-900 border border-slate-700/60 text-xs font-mono text-slate-400 mb-5">
            <span className="text-cyan-400 font-bold">NASA TECHNICAL NOTE:</span> {event.context}
          </div>
        )}

        {/* Action Choices */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
            AUTHORIZE CONTINGENCY RESPONSE:
          </div>

          {event.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playBeep(900, 0.08);
                onResolve(choice);
              }}
              className="w-full text-left p-4 rounded-xl border border-slate-700 hover:border-cyan-400 bg-space-900/90 hover:bg-cyan-950/40 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold text-sm sm:text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {choice.text}
                </span>
                <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  CHOOSE →
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mb-2 leading-relaxed">
                {choice.explanation}
              </p>
              
              {/* Consequences Badges */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {choice.batteryDelta !== 0 && (
                  <span className={`px-2 py-0.5 rounded border ${
                    choice.batteryDelta < 0 
                      ? 'bg-red-950/60 text-red-300 border-red-500/30' 
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  }`}>
                    🔋 Battery: {choice.batteryDelta > 0 ? `+${choice.batteryDelta}` : choice.batteryDelta} Wh
                  </span>
                )}
                {choice.tempDelta !== 0 && (
                  <span className={`px-2 py-0.5 rounded border ${
                    choice.tempDelta > 0 
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/30' 
                      : 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                  }`}>
                    🌡️ Temp: {choice.tempDelta > 0 ? `+${choice.tempDelta}` : choice.tempDelta} °C
                  </span>
                )}
                {choice.scienceDelta !== 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    🔬 Science: +{choice.scienceDelta} pts
                  </span>
                )}
                {choice.distanceDelta !== 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    📍 Position: {choice.distanceDelta > 0 ? `+${choice.distanceDelta}m deeper` : `${choice.distanceDelta}m backwards`}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
