import React from 'react';
import { AlertTriangle, ShieldAlert, Zap, Thermometer, Radio, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function EmergencyModal({ event, onResolve }) {
  if (!event) return null;

  const isRed = event.severity === 'red';
  const isCyan = event.severity === 'cyan';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`relative max-w-xl w-full rounded-xl border p-6 shadow-2xl transition-all ${
        isRed 
          ? 'bg-space-950/95 border-red-500 glow-red' 
          : isCyan
          ? 'bg-space-950/95 border-cyan-400 glow-cyan'
          : 'bg-space-950/95 border-amber-500 glow-amber'
      }`}>
        {/* Header Badge */}
        <div className="flex items-center space-x-2.5 mb-3">
          <div className={`p-2 rounded-lg ${
            isRed ? 'bg-red-950 text-red-400 animate-pulse' : isCyan ? 'bg-cyan-950 text-cyan-400' : 'bg-amber-950 text-amber-400 animate-pulse'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-[10px] font-mono tracking-widest font-bold uppercase ${
              isRed ? 'text-red-400' : isCyan ? 'text-cyan-400' : 'text-amber-400'
            }`}>
              {isRed ? 'PRIORITY 1 CRITICAL CONTINGENCY' : isCyan ? 'ANOMALOUS SCIENTIFIC DETECTION' : 'TACTICAL HAZARD EVENT'}
            </div>
            <h3 className="font-display text-xl font-bold text-slate-100">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
          {event.description}
        </p>

        {/* Scientific Context */}
        <div className="p-3 rounded-lg bg-space-900 border border-slate-700/60 text-xs font-mono text-slate-400 mb-5">
          <span className="text-cyan-400 font-bold">NASA TECHNICAL NOTE:</span> {event.context}
        </div>

        {/* Action Choices */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            AUTHORIZE CONTINGENCY RESPONSE:
          </div>

          {event.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playBeep(900, 0.08);
                onResolve(choice);
              }}
              className="w-full text-left p-3.5 rounded-lg border border-slate-700 hover:border-cyan-400 bg-space-900/80 hover:bg-cyan-950/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {choice.text}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  EXECUTE →
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mb-2">
                {choice.explanation}
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                {choice.batteryDelta !== 0 && (
                  <span className={`px-2 py-0.5 rounded ${choice.batteryDelta < 0 ? 'bg-red-950/60 text-red-300 border border-red-500/30' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'}`}>
                    Battery: {choice.batteryDelta > 0 ? `+${choice.batteryDelta}` : choice.batteryDelta} Wh
                  </span>
                )}
                {choice.tempDelta !== 0 && (
                  <span className={`px-2 py-0.5 rounded ${choice.tempDelta > 0 ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'}`}>
                    Temp: {choice.tempDelta > 0 ? `+${choice.tempDelta}` : choice.tempDelta} °C
                  </span>
                )}
                {choice.scienceDelta !== 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    Science: +{choice.scienceDelta} pts
                  </span>
                )}
                {choice.distanceDelta !== 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Traverse: {choice.distanceDelta} m
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
