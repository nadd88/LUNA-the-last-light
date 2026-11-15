import React, { useState, useEffect } from 'react';
import { X, History, Trash2, Award, Droplet, Compass } from 'lucide-react';
import { getMissionHistory, clearMissionHistory } from '../../utils/storage';
import { sound } from '../../utils/sound';

export default function SavedMissionsModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getMissionHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Clear all historic flight records?')) {
      clearMissionHistory();
      setHistory([]);
      sound.playWarning();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative max-w-3xl w-full max-h-[80vh] rounded-xl border border-cyan-500/40 bg-space-950 p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-display text-xl font-bold text-slate-100">
                HISTORIC FLIGHT LOG ARCHIVES
              </h3>
              <p className="text-[11px] font-mono text-cyan-400">
                LOCAL TELEMETRY FLIGHT RECORDS ({history.length} EXPEDITIONS)
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

        {/* Content Table */}
        <div className="overflow-y-auto flex-grow font-mono text-xs text-slate-300 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Compass className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No historic mission logs recorded yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Complete your first lunar south pole traverse to archive telemetry.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden">
              {history.map((item) => (
                <div key={item.id} className="p-3.5 bg-space-900/50 hover:bg-space-900 flex items-center justify-between transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-cyan-300">{item.id}</span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-slate-200 font-bold">{item.siteName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-3">
                      <span>Date: {new Date(item.date).toLocaleDateString()}</span>
                      <span>Ice: <strong className="text-cyan-400">{item.iceDiscoveredKg} kg</strong></span>
                      <span>Depth: <strong className="text-blue-400">{item.maxDepthM} m</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold font-display text-cyan-300">
                      {item.grade}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Score: {item.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          {history.length > 0 ? (
            <button
              onClick={handleClear}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-red-500/30 hover:border-red-400 text-red-400 hover:bg-red-950/30 font-mono text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge History</span>
            </button>
          ) : <div />}

          <button
            onClick={() => {
              sound.playBeep(700, 0.04);
              onClose();
            }}
            className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs tracking-wider transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
