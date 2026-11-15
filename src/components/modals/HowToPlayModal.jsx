import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  HelpCircle, 
  Compass, 
  Wrench, 
  Navigation, 
  Search, 
  Award, 
  Zap, 
  ThermometerSnowflake, 
  Eye, 
  ChevronRight,
  ShieldCheck,
  MousePointer
} from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motionVariants';
import { sound } from '../../utils/sound';

export default function HowToPlayModal({ isOpen, onClose }) {
  const [activeGuideTab, setActiveGuideTab] = useState('overview');

  if (!isOpen) return null;

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
          className="relative max-w-4xl w-full max-h-[85vh] rounded-xl border border-cyan-500/40 bg-space-950 p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60 flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-100 flex items-center space-x-2">
                  <span>COMMANDER'S FLIGHT MANUAL</span>
                  <span className="text-xs font-mono text-cyan-400 font-normal px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                    HOW TO PLAY
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  LUNA OPERATIONAL DIRECTIVES // ROVER PILOTING & SCIENTIFIC PROSPECTING
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

          {/* Navigation Pill Bar */}
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-1 flex-shrink-0">
            {[
              { id: 'overview', label: '1. Mission Objective', icon: Compass },
              { id: 'engineering', label: '2. Rover Engineering', icon: Wrench },
              { id: 'navigation', label: '3. Surface Locomotion', icon: Navigation },
              { id: 'science', label: '4. Science & Survival', icon: Search },
              { id: 'controls', label: '5. Keybindings & 3D', icon: MousePointer },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeGuideTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playBeep(800, 0.04);
                    setActiveGuideTab(tab.id);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'bg-space-900 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Guide Content */}
          <div className="overflow-y-auto pr-2 space-y-4 text-xs font-mono text-slate-300 leading-relaxed">
            {activeGuideTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                  <h4 className="text-sm font-display font-bold text-cyan-300 mb-2 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>THE POLAR EXPEDITION CORE CHALLENGE</span>
                  </h4>
                  <p className="mb-2">
                    At the Lunar South Pole (90°S), sunlight strikes at a grazing angle of merely 1.5°. Elevated crater rim peaks enjoy 80–90% sunlight, but impact depressions remain in eternal darkness: <strong>Permanently Shadowed Regions (PSRs)</strong>.
                  </p>
                  <p>
                    Your mission: Descend from the sunlit rim into the frigid depths of the crater cold trap, locate and drill valuable volatile water-ice deposits using the VIPER science instrument suite, and safely maintain battery and thermal integrity before returning to claim NASA distinction.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-space-900 border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">STRICT PSR SOLAR RULE:</span>
                    <p className="text-slate-400">
                      Inside PSRs, solar generation is strictly <strong className="text-red-400">0.0 Watts</strong>. You rely 100% on battery storage. Once your battery hits 0 Wh, systems shut down.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-space-900 border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-1">CRYOGENIC COLD THREAT:</span>
                    <p className="text-slate-400">
                      Crater floors drop to -235°C (38 Kelvin). Use the thermal subsystem heater to prevent avionics from cooling past critical survival thresholds (-240°C).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeGuideTab === 'engineering' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-space-900 border border-slate-800">
                  <h4 className="text-sm font-display font-bold text-slate-100 mb-2 flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <span>ENGINEERING DESIGN & TRADEOFF BUDGETS</span>
                  </h4>
                  <p className="text-slate-400 mb-3">
                    Before launch, customize your rover across 6 subsystems. Every hardware choice affects mass, cost, electrical draw, and cold resistance:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-slate-300">
                    <li><strong className="text-cyan-300">Chassis & Suspension:</strong> Rocker-Bogie mechanical frame. Sets mass allowance, terrain stability, and maximum speed.</li>
                    <li><strong className="text-cyan-300">Solar Array:</strong> Gallium Arsenide mast arrays provide peak wattage on sunlit peaks. Ineffective in PSR.</li>
                    <li><strong className="text-cyan-300">Energy Storage:</strong> Solid-State and Li-Ion packs. Essential reserve capacity for deep crater sorties.</li>
                    <li><strong className="text-cyan-300">Thermal Protection:</strong> Multilayer Insulation (MLI), RHU heaters, or active Stirling heat pumps.</li>
                    <li><strong className="text-cyan-300">Telecommunications:</strong> High-gain X-band dish for direct Earth line-of-sight, or Lunar Gateway orbital relay link for deep occulted crater floors.</li>
                    <li><strong className="text-cyan-300">Prospecting Suite:</strong> NSS (Neutron Spectrometer for hydrogen sensing), NIRVSS spectrometer, and the 1-meter TRIDENT percussion drill.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-500/30 text-yellow-300">
                  <span className="font-bold">LAUNCH CONSTRAINTS:</span> Total payload mass must stay under <strong>350 kg</strong> and cost under <strong>$160 Million</strong> to receive a GO-FOR-LAUNCH flight authorization.
                </div>
              </div>
            )}

            {activeGuideTab === 'navigation' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-space-900 border border-slate-800">
                  <h4 className="text-sm font-display font-bold text-slate-100 mb-2 flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span>DUAL-PERSPECTIVE LOCOMOTION SYSTEM</span>
                  </h4>
                  <p className="text-slate-400 mb-3">
                    LUNA offers two synchronized perspectives that can be toggled at any moment by pressing <strong>[V]</strong> or clicking the header toggle:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-space-950 border border-cyan-500/30">
                      <span className="text-cyan-300 font-bold block mb-1">3D HORIZON VIEW</span>
                      <p className="text-[11px] text-slate-300">
                        Immersive, photorealistic 3D lunar terrain with real NASA LOLA topography, six-wheeled heavy rover with rocker-bogie kinematics, visible Earth in the sky, dynamic shadows, and live interactive navigation minimap HUD.
                      </p>
                    </div>
                    <div className="p-3 rounded bg-space-950 border border-cyan-500/30">
                      <span className="text-cyan-300 font-bold block mb-1">2D TACTICAL MAP & WAYPOINTS</span>
                      <p className="text-[11px] text-slate-300">
                        Top-down mission control tactical raster with temperature and lighting isolines. <strong>Click anywhere on the terrain</strong> to engage autonomous waypoint guidance!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200">
                  <span className="font-bold text-cyan-300">AUTONOMOUS WAYPOINT NAVIGATION:</span> Simply click on any crater coordinate in 2D view. The rover will lock bearing, calculate guidance vectors, and automatically drive toward the station. Manual steering immediately overrides.
                </div>
              </div>
            )}

            {activeGuideTab === 'science' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-space-900 border border-slate-800">
                  <h4 className="text-sm font-display font-bold text-slate-100 mb-2 flex items-center space-x-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>SCIENCE OPERATIONS & RECHARGE</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2.5">
                      <div className="p-1.5 rounded bg-cyan-950 text-cyan-400 mt-0.5">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-cyan-300">1. SCAN REGOLITH [Spacebar]:</strong>
                        <p className="text-slate-400">Activates the Neutron Spectrometer (NSS). Detects subsurface hydrogen signatures within a 70-meter radius, revealing sparkling ice deposits on your HUD.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <div className="p-1.5 rounded bg-amber-950 text-amber-400 mt-0.5">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-amber-300">2. TRIDENT DRILL [E or R]:</strong>
                        <p className="text-slate-400">Deploys the 1-meter rotary-percussive drill when positioned near a detected deposit. Extracts water ice (kg) and gathers critical volatile science data.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <div className="p-1.5 rounded bg-yellow-950 text-yellow-400 mt-0.5">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-yellow-300">3. SOLAR RECHARGE [WAIT FOR SUN]:</strong>
                        <p className="text-slate-400">When parked safely on the sunlit rim crest, click "WAIT FOR SUN / SOLAR RECHARGE" to fast-forward telemetry, recharge batteries, and normalize thermal temperatures before the next crater sortie.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <span className="font-bold">MISSION DEBRIEF:</span> When your objectives are met, click "CONCLUDE MISSION" in the top bar. You receive an official NASA grade from A+ (Distinction) down to F based on water ice extracted, science gathered, and whether the rover safely returned to illuminated terrain.
                </div>
              </div>
            )}

            {activeGuideTab === 'controls' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-space-900 border border-slate-800">
                  <h4 className="text-sm font-display font-bold text-slate-100 mb-3 flex items-center space-x-2">
                    <MousePointer className="w-4 h-4 text-cyan-400" />
                    <span>KEYBOARD & MOUSE CONTROLS</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">Advance Throttle:</span>
                      <span className="text-cyan-300 font-bold">[W] or [↑ Arrow]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">Reverse / Brake:</span>
                      <span className="text-cyan-300 font-bold">[S] or [↓ Arrow]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">Steer Left:</span>
                      <span className="text-cyan-300 font-bold">[A] or [← Arrow]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">Steer Right:</span>
                      <span className="text-cyan-300 font-bold">[D] or [→ Arrow]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">Toggle 2D / 3D Perspective:</span>
                      <span className="text-cyan-300 font-bold">[V]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">Scan Regolith (NSS):</span>
                      <span className="text-cyan-300 font-bold">[Spacebar]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">TRIDENT Drill:</span>
                      <span className="text-cyan-300 font-bold">[E] or [R]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-space-950 border border-slate-800">
                      <span className="text-slate-400">Cancel Waypoint:</span>
                      <span className="text-cyan-300 font-bold">Click Rover / [Esc]</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-space-900 border border-slate-800">
                  <h4 className="text-sm font-display font-bold text-slate-100 mb-2 flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>3D ORBIT CAMERA INTERACTION</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• <strong>Left Mouse Button + Drag:</strong> Smooth 360° orbit around rover.</li>
                    <li>• <strong>Right Mouse Button + Drag:</strong> Pan camera horizontally and vertically.</li>
                    <li>• <strong>Scroll Wheel:</strong> Smooth zoom in and out (clamped to prevent surface clipping).</li>
                    <li>• <strong>Touchscreen:</strong> One-finger drag to orbit, two-finger pinch to zoom.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 mt-4 border-t border-slate-700/60 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] font-mono text-slate-500">
              NASA SPACE APPS CHALLENGE 2026 // ARTEMIS POLAR SIMULATION
            </span>
            <button
              onClick={() => {
                sound.playBeep(850, 0.05);
                onClose();
              }}
              className="btn-primary px-5 py-2 text-xs"
            >
              CLOSE MANUAL
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
