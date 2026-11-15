import React, { useState } from 'react';
import { 
  Sun, 
  ArrowRight, 
  Droplet
} from 'lucide-react';
import { LANDING_SITES } from '../../data/landingSites';
import { sound } from '../../utils/sound';
import { useGameMode } from '../../context/GameModeContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import StageHeader from '../common/StageHeader';
import LunarSurface3D from '../../visualization/LunarSurface3D';

export default function SiteSelectionScreen({
  selectedSiteId,
  onSelectSite,
  onProceed,
  onBack
}) {
  const { isEngineerMode } = useGameMode();

  const SITE_PRESETS = {
    'malapert-mountain': {
      difficultyBadge: 'Easy',
      badgeVariant: 'success',
      tagline: 'Gentle slopes and long sunlight. Great for beginners.',
      sunlightLevel: 93,
      scienceReward: 'Moderate',
      scienceRewardScore: 65,
    },
    'shackleton-ridge': {
      difficultyBadge: 'Medium ⭐',
      isRecommended: true,
      badgeVariant: 'info',
      tagline: 'Classic Artemis target. Good balance of sunlight and crater ice.',
      sunlightLevel: 88,
      scienceReward: 'High',
      scienceRewardScore: 85,
    },
    'haworth-crater': {
      difficultyBadge: 'Hard',
      badgeVariant: 'danger',
      tagline: 'Steep slopes and short sunlight windows. Extreme ice payoff.',
      sunlightLevel: 68,
      scienceReward: 'Extreme',
      scienceRewardScore: 100,
    }
  };

  const curatedSiteIds = ['malapert-mountain', 'shackleton-ridge', 'haworth-crater'];
  const displayedSites = LANDING_SITES.filter(s => curatedSiteIds.includes(s.id));

  const [activeSiteId, setActiveSiteId] = useState(() => {
    if (selectedSiteId && displayedSites.some(s => s.id === selectedSiteId)) {
      return selectedSiteId;
    }
    return 'shackleton-ridge';
  });

  const activeSite = LANDING_SITES.find((s) => s.id === activeSiteId) || displayedSites[1];
  const activePreset = SITE_PRESETS[activeSite.id] || SITE_PRESETS['shackleton-ridge'];

  const handleSelectSite = (site) => {
    sound.playBeep(850, 0.05);
    setActiveSiteId(site.id);
    onSelectSite(site);
  };

  return (
    <div className="h-full w-full flex flex-col justify-between max-w-6xl mx-auto px-4 py-2 select-none">
      {/* 1. StageHeader */}
      <StageHeader
        stepNumber={2}
        totalSteps={6}
        title="Choose Your Landing Site"
        goal="Each crater rim offers different sunlight, terrain slopes, and ice deposits."
      />

      {/* 2. Main Content Grid (No page scroll) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden my-auto items-stretch">
        {/* Left Column: 3 Curated Site Cards Stacked (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-2 min-h-0 overflow-y-auto pr-1">
          {displayedSites.map((site) => {
            const isSelected = site.id === activeSiteId;
            const preset = SITE_PRESETS[site.id] || SITE_PRESETS['shackleton-ridge'];

            return (
              <div
                key={site.id}
                onClick={() => handleSelectSite(site)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex-1 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.2)] text-slate-100 ring-2 ring-cyan-400/40'
                    : 'bg-space-900/60 border-slate-700/60 hover:border-cyan-500/40 hover:bg-space-800/80 text-slate-300'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectSite(site);
                  }
                }}
              >
                {/* Header: Name + Badge */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ${
                      isSelected ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-slate-600'
                    }`} />
                    <span className="font-display font-bold text-sm text-slate-100 truncate">
                      {site.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    {preset.isRecommended && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">
                        Recommended
                      </span>
                    )}
                    <Badge variant={preset.badgeVariant}>
                      {preset.difficultyBadge}
                    </Badge>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-sm text-slate-300 mb-2 pl-4 leading-snug font-sans">
                  {preset.tagline}
                </p>

                {/* 2 Meters */}
                <div className="space-y-1.5 pl-4 pt-1.5 border-t border-slate-700/40 text-xs font-mono">
                  {/* Sunlight */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <Sun className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>Sunlight:</span>
                    </span>
                    <span className="font-bold text-cyan-300">{preset.sunlightLevel}%</span>
                  </div>
                  <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${preset.sunlightLevel}%` }}
                    />
                  </div>

                  {/* Science Reward */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <Droplet className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Science Reward:</span>
                    </span>
                    <span className="font-bold text-emerald-300">{preset.scienceReward}</span>
                  </div>
                  <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${preset.scienceRewardScore}%` }}
                    />
                  </div>
                </div>

                {/* Raw coordinates ONLY in Engineer Mode */}
                {isEngineerMode && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] font-mono text-slate-400 pl-4 flex justify-between">
                    <span>{site.coords}</span>
                    <span>Elev: {site.elevation}</span>
                    <span>Slope: {site.slopeHazard.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Site Detail & Cross-Section Chart (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0 hud-panel p-3.5 rounded-xl border border-cyan-500/30 bg-space-900/80 overflow-hidden">
          {/* (a) Site Title + Difficulty Badge Row */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 shrink-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-display text-base font-bold text-slate-100">
                {activeSite.name}
              </h3>
              {activePreset.isRecommended && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">
                  Recommended
                </span>
              )}
              <Badge variant={activePreset.badgeVariant}>
                {activePreset.difficultyBadge}
              </Badge>
            </div>
            {isEngineerMode && (
              <div className="font-mono text-xs text-cyan-300 font-bold">
                {activeSite.coords}
              </div>
            )}
          </div>

          {/* (b) 4 Mini Stat Cards */}
          <div className="grid grid-cols-4 gap-2 text-xs font-mono shrink-0">
            <div className="px-2 py-1.5 rounded-lg bg-space-950/80 border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px] mb-0.5 uppercase tracking-wide">SUNLIGHT</div>
              <div className="text-sm font-bold text-cyan-300">{activeSite.peakIllumination}%</div>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-space-950/80 border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px] mb-0.5 uppercase tracking-wide">SLOPE</div>
              <div className="text-sm font-bold text-amber-300 truncate">{activeSite.slopeHazard.split(' ')[0]}</div>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-space-950/80 border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px] mb-0.5 uppercase tracking-wide">DARK ZONE</div>
              <div className="text-sm font-bold text-blue-300">{activeSite.psrDistance}m</div>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-space-950/80 border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px] mb-0.5 uppercase tracking-wide">ICE YIELD</div>
              <div className="text-sm font-bold text-emerald-300 truncate">{activeSite.estimatedIceConcentration.split(' ')[0]}</div>
            </div>
          </div>

          {/* (c) Tactical Intel Tip (allows 2 lines wrapping, no truncate) */}
          <p className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 shrink-0 leading-snug break-words">
            <strong className="text-cyan-200">MISSION TIP:</strong> {activeSite.tacticalTip}
          </p>

          {/* (d) 3D Lunar Surface Visualization (Takes all remaining vertical space) */}
          <LunarSurface3D site={activeSite} isEngineerMode={isEngineerMode} className="flex-1 min-h-0" />
        </div>
      </div>

      {/* 3. Footer Action Bar (Fixed height) */}
      <footer className="shrink-0 h-14 flex items-center justify-between border-t border-slate-800 pt-2 px-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            sound.playBeep(700, 0.05);
            onBack();
          }}
        >
          ← Back to Briefing
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            sound.playBeep(980, 0.08);
            onProceed(activeSite);
          }}
          iconRight={<ArrowRight className="w-4 h-4 text-slate-950" />}
        >
          CONFIRM SITE & BUILD ROVER →
        </Button>
      </footer>
    </div>
  );
}
