import React, { useState } from 'react';
import { 
  MapPin, 
  Sun, 
  Mountain, 
  ArrowRight, 
  Droplet, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { LANDING_SITES } from '../../data/landingSites';
import { sound } from '../../utils/sound';

export default function SiteSelectionScreen({
  selectedSiteId,
  onSelectSite,
  onProceed,
  onBack
}) {
  const [activeSiteId, setActiveSiteId] = useState(selectedSiteId || LANDING_SITES[0].id);

  const activeSite = LANDING_SITES.find((s) => s.id === activeSiteId) || LANDING_SITES[0];

  const handleSelectSite = (site) => {
    sound.playBeep(850, 0.05);
    setActiveSiteId(site.id);
    onSelectSite(site);
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 tracking-wider flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>STAGE 01 // ORBITAL TARGET RECONNAISSANCE</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide mt-1">
            SELECT ARTEMIS CANDIDATE LANDING SITE
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 mt-2 sm:mt-0">
          DATA SOURCE: <span className="text-cyan-300">NASA LOLA & LROC NAC SURVEY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Interactive Site Selector List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>CANDIDATE POLAR LOCATIONS</span>
            <span>{LANDING_SITES.length} SITES SURVEYED</span>
          </div>

          {LANDING_SITES.map((site) => {
            const isSelected = site.id === activeSiteId;
            return (
              <button
                key={site.id}
                onClick={() => handleSelectSite(site)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.25)] text-slate-100'
                    : 'bg-space-900/60 border-slate-700/60 hover:border-cyan-500/40 hover:bg-space-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                      <span className="font-display font-bold text-sm tracking-wide text-slate-100">
                        {site.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 ml-4">
                      {site.coords} • <span className="text-cyan-400">{site.elevation}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    site.difficulty === 'Challenging'
                      ? 'border-amber-500/40 text-amber-300 bg-amber-950/30'
                      : site.difficulty === 'Extreme'
                      ? 'border-red-500/40 text-red-300 bg-red-950/30'
                      : 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30'
                  }`}>
                    {site.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-700/40 text-[10px] font-mono ml-4">
                  <div>
                    <span className="text-slate-400 block">Peak Sun</span>
                    <span className="text-cyan-300 font-bold">{site.peakIllumination}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PSR Proximity</span>
                    <span className="text-slate-200">{site.psrDistance}m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Ice Yield</span>
                    <span className="text-emerald-400">{site.estimatedIceConcentration.split(' ')[0]}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute right-2 bottom-2 text-cyan-400">
                    <ChevronRight className="w-4 h-4 animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: Site Detail Dossier & LOLA Altimetry (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Site Dossier Card */}
          <div className="hud-panel p-5 rounded-lg border border-cyan-500/30 bg-space-900/80">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 uppercase">
                  {activeSite.badge}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-100 mt-1">
                  {activeSite.name}
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                <div>COORD: <span className="text-cyan-300">{activeSite.coords}</span></div>
                <div>BASE ALT: <span className="text-slate-200">{activeSite.elevation}</span></div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {activeSite.description}
            </p>

            {/* Tactical Grid Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 mb-1">
                  <Sun className="w-3 h-3 text-cyan-400" />
                  <span>Sunlight Avail</span>
                </div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {activeSite.peakIllumination}%
                </div>
              </div>

              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 mb-1">
                  <Mountain className="w-3 h-3 text-amber-400" />
                  <span>Slope Hazard</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-200 truncate" title={activeSite.slopeHazard}>
                  {activeSite.slopeHazard.split(' ')[0]}
                </div>
              </div>

              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 mb-1">
                  <TrendingDown className="w-3 h-3 text-blue-400" />
                  <span>Distance to PSR</span>
                </div>
                <div className="text-sm font-mono font-bold text-blue-300">
                  {activeSite.psrDistance} m
                </div>
              </div>

              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 mb-1">
                  <Droplet className="w-3 h-3 text-emerald-400" />
                  <span>Ice Yield Est</span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300">
                  {activeSite.estimatedIceConcentration.split(' ')[0]}
                </div>
              </div>
            </div>

            {/* Tactical Advice Box */}
            <div className="p-3 rounded bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-200 mb-4">
              <span className="text-cyan-400 font-bold">TACTICAL INTEL:</span> {activeSite.tacticalTip}
            </div>

            {/* Altimetry Elevation Profile (Recharts) */}
            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded bg-cyan-400" />
                  <span>LOLA Topographic Traverse Profile (Meters vs Descent)</span>
                </div>
                <span className="text-[10px] text-cyan-400">Sunlit Rim → Crater Floor</span>
              </div>

              <div className="h-44 w-full bg-space-950/80 rounded border border-slate-800 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeSite.elevationProfile}>
                    <defs>
                      <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="distance" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickFormatter={(val) => `${val}m`}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickFormatter={(val) => `${val}m`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#070b18', borderColor: '#00f0ff', fontSize: '11px', fontFamily: 'monospace' }}
                      formatter={(val, name) => [
                        name === 'elevation' ? `${val} m` : `${val}%`, 
                        name === 'elevation' ? 'Elevation' : 'Illumination'
                      ]}
                      labelFormatter={(label) => `Distance: ${label} meters from rim`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="elevation" 
                      stroke="#00f0ff" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#elevGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0m: Sunlit Summit Ridge</span>
                <span>{activeSite.psrDistance}m: Permanently Shadowed Boundary (0% Solar)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
          className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs transition-colors"
        >
          ← Back to Briefing
        </button>

        <button
          onClick={() => {
            sound.playBeep(980, 0.08);
            onProceed(activeSite);
          }}
          className="flex items-center space-x-2 px-6 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all transform hover:-translate-y-0.5"
        >
          <span>CONFIRM SITE & CONFIGURE ROVER</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
