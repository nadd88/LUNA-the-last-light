import React from 'react';
import { X, BookOpen, ExternalLink, ShieldCheck, Cpu, Sun, Thermometer, Radio } from 'lucide-react';
import { NASA_REFERENCES, SCIENTIFIC_ASSUMPTIONS } from '../../data/nasaReferences';
import { sound } from '../../utils/sound';

export default function ScienceManualModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative max-w-4xl w-full max-h-[85vh] rounded-xl border border-cyan-500/40 bg-space-950 p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-display text-xl font-bold text-slate-100">
                NASA SCIENTIFIC MANUAL & MATHEMATICAL FORMULATION
              </h3>
              <p className="text-[11px] font-mono text-cyan-400">
                LOLA • SHADOWCAM • DIVINER • VIPER HERITAGE
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 pr-2 text-xs font-mono text-slate-300">
          {/* Mission Accuracy Disclaimer */}
          <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
            <div className="font-bold text-cyan-300 mb-1 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>SCIENTIFIC TRANSPARENCY DISCLAIMER</span>
            </div>
            <p className="leading-relaxed">
              {SCIENTIFIC_ASSUMPTIONS.accuracyDisclaimer}
            </p>
          </div>

          {/* Transparent Equations Section */}
          <div>
            <h4 className="text-sm font-display font-bold text-slate-100 mb-3 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>TRANSPARENT MATHEMATICAL MODELS</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded bg-space-900 border border-slate-800">
                <div className="text-cyan-300 font-bold mb-1">1. Solar Power Generation (Watts)</div>
                <div className="bg-space-950 p-2 rounded text-[11px] text-cyan-200 mb-1.5">
                  P_gen = P_rated * (Illumination% / 100) * η_angle<br/>
                  <strong className="text-red-400">If in PSR: Illumination = 0.0% → P_gen = 0.0 W</strong>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  In direct sunlight, body-mounted or tracking masts capture grazing solar flux. Once cross into a PSR, solar flux is strictly zero.
                </p>
              </div>

              <div className="p-3 rounded bg-space-900 border border-slate-800">
                <div className="text-amber-300 font-bold mb-1">2. Thermal Lumped-Capacitance Model</div>
                <div className="bg-space-950 p-2 rounded text-[11px] text-amber-200 mb-1.5">
                  dT/dt = (Q_internal + Q_heater - Q_loss) / C_thermal<br/>
                  Q_loss = k * (1 - MLI_eff) * (T_rover - T_ambient)
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Avionics dissipate internal electrical heat. The active heater adds warmth. Radiative cooling into the 40K cold trap rapidly pulls temperature down without insulation.
                </p>
              </div>

              <div className="p-3 rounded bg-space-900 border border-slate-800">
                <div className="text-emerald-300 font-bold mb-1">3. Battery State of Charge Flow</div>
                <div className="bg-space-950 p-2 rounded text-[11px] text-emerald-200 mb-1.5">
                  ΔP = P_gen - P_total_draw<br/>
                  Wh(t + Δt) = clamp(0, Cap, Wh(t) + ΔP * Δt)
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  In daylight, net power is positive, charging the battery. In PSR darkness, net power is strictly negative.
                </p>
              </div>

              <div className="p-3 rounded bg-space-900 border border-slate-800">
                <div className="text-blue-300 font-bold mb-1">4. Radio Telemetry Signal Margin</div>
                <div className="bg-space-950 p-2 rounded text-[11px] text-blue-200 mb-1.5">
                  Link_Margin = P_tx + G_ant - FSPL - L_rim<br/>
                  Relay Mode: Constant +18 dB via Gateway Halo
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Direct Earth antennas lose line-of-sight behind deep crater rims. Orbital relays maintain constant connectivity.
                </p>
              </div>
            </div>
          </div>

          {/* NASA Data References */}
          <div>
            <h4 className="text-sm font-display font-bold text-slate-100 mb-3 flex items-center space-x-2">
              <Sun className="w-4 h-4 text-cyan-400" />
              <span>NASA EMPIRICAL DATASETS & INSTRUMENT CITATIONS</span>
            </h4>
            <div className="space-y-3">
              {NASA_REFERENCES.map((ref, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-space-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300">{ref.instrument}</span>
                    <span className="text-[10px] text-slate-400">{ref.mission}</span>
                  </div>
                  <p className="text-slate-300 mb-1.5 text-[11px] leading-normal">{ref.scientificRole}</p>
                  <div className="text-[10px] text-slate-400 bg-space-950 p-2 rounded mb-1">
                    <span className="text-emerald-400 font-bold">In-Game Role:</span> {ref.howUsedInGame}
                  </div>
                  <div className="text-[10px] text-cyan-200/80 italic">
                    <span className="text-cyan-400 font-bold">NASA Fact:</span> {ref.nasaFact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empirical vs Simplified Modeling Table */}
          <div>
            <h4 className="text-sm font-display font-bold text-slate-100 mb-3">
              SCIENTIFIC REALITY VS. GAMEPLAY MODELING COMPARISON
            </h4>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-space-900 border-b border-slate-800 text-cyan-400">
                  <tr>
                    <th className="p-2.5">Domain</th>
                    <th className="p-2.5">NASA Scientific Reality</th>
                    <th className="p-2.5">LUNA Gameplay Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {SCIENTIFIC_ASSUMPTIONS.documentedAssumptions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-space-900/40">
                      <td className="p-2.5 font-bold text-slate-200">{item.domain}</td>
                      <td className="p-2.5 text-slate-400">{item.reality}</td>
                      <td className="p-2.5 text-cyan-200">{item.gameModel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-4 border-t border-slate-800 flex justify-end flex-shrink-0">
          <button
            onClick={() => {
              sound.playBeep(700, 0.04);
              onClose();
            }}
            className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs tracking-wider transition-colors"
          >
            CLOSE REFERENCE MANUAL
          </button>
        </div>
      </div>
    </div>
  );
}
