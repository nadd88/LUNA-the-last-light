import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Copy, 
  RotateCcw, 
  Droplet, 
  Battery, 
  Compass, 
  TrendingUp, 
  FileText,
  Share2,
  Sparkles
} from 'lucide-react';
import { calculateMissionScore } from '../../utils/physics';
import { archiveCompletedMission } from '../../utils/storage';
import { sound } from '../../utils/sound';

export default function DebriefScreen({
  missionReport,
  roverConfig,
  selectedSite,
  onRestart
}) {
  const [copied, setCopied] = useState(false);

  // Evaluate mission score
  const scoreResult = calculateMissionScore({
    scienceCollected: missionReport?.scienceCollected || 0,
    waterIceDetectedKg: missionReport?.waterIceDetectedKg || 0,
    maxDepthInPSR: missionReport?.maxDepthInPSR || 0,
    batteryRemainingPercent: missionReport?.batteryRemainingPercent || 0,
    roverHealth: missionReport?.roverHealth || 0,
    budgetSpentM: roverConfig?.totalCost || 120,
    maxBudgetM: 160,
    missionOutcome: missionReport?.missionOutcome || 'SUCCESS'
  });

  const isSuccess = missionReport?.missionOutcome !== 'LOST';

  // Trigger celebration on success
  useEffect(() => {
    if (isSuccess) {
      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#38bdf8', '#fbbf24', '#ffffff']
      });
    }

    // Archive to localStorage
    archiveCompletedMission({
      site: selectedSite,
      scoreResult,
      ...missionReport
    });
  }, []);

  const handleDownloadJSON = () => {
    sound.playBeep(880, 0.08);
    const exportData = {
      mission: 'LUNA: THE LAST LIGHT',
      organization: 'NASA Space Apps Challenge 2026',
      timestamp: new Date().toISOString(),
      site: selectedSite,
      hardwareConfiguration: roverConfig,
      telemetryOutcome: missionReport,
      scoreEvaluation: scoreResult
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUNA_MISSION_LOG_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    sound.playBeep(880, 0.08);
    const summary = `
🚀 NASA Space Apps 2026 // LUNA: THE LAST LIGHT — Mission Debrief
Site: ${selectedSite.name}
Outcome: ${missionReport?.missionOutcome}
Final Score: ${scoreResult.score} [Grade: ${scoreResult.grade}]
Water Ice Extracted: ${missionReport?.waterIceDetectedKg || 0} kg
Deepest PSR Penetration: ${missionReport?.maxDepthInPSR || 0} meters
Scientific Points: ${missionReport?.scienceCollected || 0}
Rover Health: ${missionReport?.roverHealth || 0}%
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className={`hud-panel p-6 rounded-xl border mb-6 shadow-2xl ${
        isSuccess ? 'border-cyan-400 bg-space-900/90 glow-cyan' : 'border-red-500 bg-red-950/40 glow-red'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${
              isSuccess ? 'bg-cyan-950 border border-cyan-400 text-cyan-300' : 'bg-red-950 border border-red-500 text-red-400'
            }`}>
              {isSuccess ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 tracking-wider">
                NASA SPACE APPS 2026 // EXPEDITION POST-FLIGHT FORENSIC DEBRIEF
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">
                {missionReport?.missionOutcome === 'FULL_SUCCESS'
                  ? 'MISSION ACCOMPLISHED: FULL RECOVERY & ICE DISCOVERY'
                  : missionReport?.missionOutcome === 'PARTIAL_SUCCESS'
                  ? 'MISSION SUCCEEDED: TELEMETRY OFF-LOADED PRIOR TO FREEZE'
                  : 'MISSION LOST: ROVER STRANDED IN CRATER COLD TRAP'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">OVERALL RATING</div>
            <div className="font-display text-3xl font-bold text-cyan-300">
              {scoreResult.grade}
            </div>
          </div>
        </div>

        {/* Narrative Forensic Summary */}
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {isSuccess
            ? `Commander, your rover successfully negotiated the extreme lighting and thermal boundaries of ${selectedSite.name}. By penetrating deep into the permanently shadowed region and managing limited battery reserves, you confirmed cryogenic volatile deposits essential for NASA's Artemis base.`
            : `During the traverse down ${selectedSite.name}, your rover succumbed to extreme polar conditions: ${missionReport?.failureReason || 'Thermal starvation in 38K darkness'}. However, the scientific telemetry transmitted before loss of signal provides vital data for future robotic attempts.`}
        </p>
      </div>

      {/* Score Grid Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Droplet className="w-4 h-4 text-cyan-400" />
            <span>Water Ice Extracted</span>
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-300">
            {missionReport?.waterIceDetectedKg || 0} kg
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">
            +{scoreResult.breakdown.iceScore} Score Pts
          </div>
        </div>

        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Max PSR Depth</span>
          </div>
          <div className="text-2xl font-mono font-bold text-blue-300">
            {missionReport?.maxDepthInPSR || 0} m
          </div>
          <div className="text-[10px] font-mono text-cyan-400 mt-1">
            +{scoreResult.breakdown.depthScore} Score Pts
          </div>
        </div>

        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Science Collected</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-300">
            {missionReport?.scienceCollected || 0} pts
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">
            +{scoreResult.breakdown.scienceScore} Score Pts
          </div>
        </div>

        <div className="hud-panel p-4 rounded-lg border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Total Mission Score</span>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300">
            {scoreResult.score}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Eff. Bonus: +{scoreResult.breakdown.efficiencyBonus}
          </div>
        </div>
      </div>

      {/* Educational NASA Comparison Section */}
      <div className="hud-panel p-5 rounded-lg border border-cyan-500/20 bg-space-900/80 mb-6">
        <div className="text-xs font-mono text-cyan-400 font-bold mb-3 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>EDUCATIONAL RETROSPECTIVE: HOW YOUR FLIGHT COMPARES TO NASA MISSIONS</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300 leading-relaxed">
          <div className="p-3 rounded bg-space-950 border border-slate-800">
            <strong className="text-cyan-300 block mb-1">NASA VIPER Parallel:</strong>
            NASA’s Volatiles Investigating Polar Exploration Rover (VIPER) was planned around the exact tactical trade-offs you faced: short solar-charging stints on high rims punctuated by daring traverses into pitch-black PSRs to drill for ice.
          </div>
          <div className="p-3 rounded bg-space-950 border border-slate-800">
            <strong className="text-amber-300 block mb-1">Thermal Survival Reality:</strong>
            Real lunar rovers require Radioisotope Heater Units (RHUs) or phase-change heat capacitors. Without them, lunar night or cold traps cool systems below -180°C, causing catastrophic structural failure.
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleDownloadJSON}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded bg-space-900 hover:bg-space-800 border border-slate-700 hover:border-cyan-400 text-slate-200 font-mono text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Flight JSON</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded bg-space-900 hover:bg-space-800 border border-slate-700 hover:border-cyan-400 text-slate-200 font-mono text-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            sound.playBeep(980, 0.1);
            onRestart();
          }}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all transform hover:-translate-y-0.5"
        >
          <RotateCcw className="w-4 h-4 text-slate-950" />
          <span>RUN ANOTHER EXPEDITION</span>
        </button>
      </div>
    </div>
  );
}
