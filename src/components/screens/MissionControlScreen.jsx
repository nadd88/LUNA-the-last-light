import React from 'react';
import { 
  Battery, 
  Sun, 
  Play, 
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { sound } from '../../utils/sound';
import Button from '../common/Button';
import Badge from '../common/Badge';
import StageHeader from '../common/StageHeader';
import Callout from '../common/Callout';

export default function MissionControlScreen({
  roverConfig,
  selectedSite,
  onLaunchSurfaceOps,
  onBack
}) {
  const netDaylightWatts = roverConfig.peakSolarGen - roverConfig.totalBasePowerDraw;
  const darkDrawWatts = Math.round(
    ((roverConfig.chassis?.drivePower || 55) * 0.4) + 
    (roverConfig.thermal?.powerDraw || 35) + 
    (roverConfig.comm?.powerDraw || 15)
  );

  return (
    <div className="h-full w-full flex flex-col justify-between max-w-5xl mx-auto px-4 py-2 select-none">
      {/* 1. StageHeader */}
      <StageHeader
        stepNumber={4}
        totalSteps={6}
        title="Mission Control: Final Pre-Descent Check"
        goal={`All systems verified on the rim of ${selectedSite?.name || 'the landing site'}. Review checklist before driving.`}
      />

      {/* 2. Main 2-Column Layout (No page scroll) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden my-auto items-stretch">
        {/* Left Column: Readiness Checklist + Warning Callout (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-2.5 min-h-0">
          <div className="hud-panel p-3.5 rounded-xl border border-cyan-500/30 bg-space-900/80 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
              <span className="font-display font-bold text-sm text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>FLIGHT READINESS CHECKLIST</span>
              </span>
              <Badge variant="success">READY FOR DESCENT</Badge>
            </div>

            <div className="space-y-2 text-xs font-mono flex-1 flex flex-col justify-around">
              {/* Check 1: Chassis */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-space-950/80 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-100 font-bold truncate">1. Chassis: {roverConfig.chassis.name.split(' ')[0]}</span>
                </div>
                <span className="text-slate-400 shrink-0">${roverConfig.chassis.cost}M · {roverConfig.chassis.mass}kg</span>
              </div>

              {/* Check 2: Battery */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-space-950/80 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-100 font-bold truncate">2. Battery: {roverConfig.battery.name.split(' (')[0]}</span>
                </div>
                <span className="text-emerald-400 font-bold shrink-0">{roverConfig.battery.capacity} Wh</span>
              </div>

              {/* Check 3: Thermal */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-space-950/80 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-100 font-bold truncate">3. Thermal: {roverConfig.thermal.name.split(' (')[0]}</span>
                </div>
                <span className="text-amber-400 font-bold shrink-0">{roverConfig.thermal.heatOutput}W Heat</span>
              </div>

              {/* Check 4: Included Subsystems Line */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-cyan-200 font-bold font-sans text-xs">Included: Solar panels · Radio · Science tools</span>
                </div>
                <span className="text-cyan-400 font-bold shrink-0">Standard</span>
              </div>
            </div>
          </div>

          {/* Big Bold Warning Callout */}
          <Callout variant="warning" title="SHADOW LINE = ZERO SOLAR POWER">
            <p className="text-sm text-slate-100 leading-snug font-sans">
              Once you cross the shadow boundary, solar drops strictly to 0.0W. You run purely on battery. Monitor charge and return to sunlight before you freeze.
            </p>
          </Callout>
        </div>

        {/* Right Column: Visual Power Comparison (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-2.5 min-h-0 hud-panel p-3.5 rounded-xl border border-cyan-500/30 bg-space-900/80">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-100 mb-2 flex items-center space-x-2 border-b border-slate-700/60 pb-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>POWER IN VS. POWER USED (COMPARISON)</span>
            </h3>

            {/* Sunlight State */}
            <div className="p-3 rounded-xl bg-space-950/80 border border-cyan-500/30 mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold text-xs text-cyan-300 flex items-center space-x-1.5">
                  <Sun className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ON THE SUNLIT RIM</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  +{netDaylightWatts}W (CHARGING)
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-1 leading-snug font-sans">
                Solar generates +{roverConfig.peakSolarGen}W while systems use {roverConfig.totalBasePowerDraw}W. Batteries recharge to 100%.
              </p>
              <div className="w-full bg-space-900 h-2 rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Darkness State */}
            <div className="p-3 rounded-xl bg-space-950/80 border border-red-500/40 mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold text-xs text-red-400 flex items-center space-x-1.5">
                  <Battery className="w-3.5 h-3.5 text-red-400" />
                  <span>INSIDE THE DARK CRATER</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/40">
                  -{darkDrawWatts}W (DRAINING)
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-1 leading-snug font-sans">
                Solar generation drops to 0.0W. Wheels and heating drain ~{darkDrawWatts}W. You have ~{roverConfig.estimatedSurvivalMinutes || 28} min survival time.
              </p>
              <div className="w-full bg-space-900 h-2 rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>

          {/* Quick Summary Pill */}
          <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <span>Target Dark Zone Distance:</span>
            <span className="font-bold">{selectedSite.psrDistance} meters away</span>
          </div>
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
          ← Adjust Configuration
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            sound.playBeep(980, 0.1);
            onLaunchSurfaceOps();
          }}
          className="shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)]"
          icon={<Play className="w-4 h-4 text-slate-950 fill-current" />}
          iconRight={<ArrowRight className="w-4 h-4 text-slate-950" />}
        >
          DRIVE ONTO THE MOON
        </Button>
      </footer>
    </div>
  );
}
