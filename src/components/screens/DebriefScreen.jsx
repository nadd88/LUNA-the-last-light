import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  DollarSign,
  Heart,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Clock,
  ArrowRight
} from 'lucide-react';
import { calculateMissionScore } from '../../utils/physics';
import { archiveCompletedMission } from '../../utils/storage';
import { sound } from '../../utils/sound';
import { useGameMode } from '../../context/GameModeContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import StageHeader from '../common/StageHeader';
import Callout from '../common/Callout';

export default function DebriefScreen({
  missionReport,
  roverConfig,
  selectedSite,
  onRestart
}) {
  const { isEngineerMode } = useGameMode();
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
  const iceKg = missionReport?.waterIceDetectedKg || 0;
  const maxDepth = missionReport?.maxDepthInPSR || 0;
  const isSafelyOnRim = missionReport?.isSafelyOnRim !== false && isSuccess;

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
Site: ${selectedSite?.name || 'Lunar South Pole'}
Outcome: ${missionReport?.missionOutcome}
Final Score: ${scoreResult.score} [Grade: ${scoreResult.grade}]
Water Ice Extracted: ${iceKg} kg
Deepest Crater Penetration: ${maxDepth} meters
Scientific Points: ${missionReport?.scienceCollected || 0}
Rover Health: ${missionReport?.roverHealth || 0}%
Battery Remaining: ${missionReport?.batteryRemainingPercent || 0}%
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Plain language outcome headline
  const outcomeHeadline = isSuccess
    ? (isSafelyOnRim
        ? `MISSION ACCOMPLISHED — Rover returned safely with ${iceKg} kg of water ice!`
        : `MISSION SUCCEEDED — Science telemetry transmitted from dark zone (${iceKg} kg ice logged).`)
    : `ROVER LOST — ${missionReport?.failureReason || 'Depleted power in crater floor.'}`;

  // Plain language grade explanation
  const gradeExplanation = isSuccess
    ? (scoreResult.score >= 750
        ? "Exemplary expedition! You discovered high-grade ice deposits and returned the rover intact to the sunny rim."
        : "Good mission! You collected valuable polar science, though rover reserves were stretched close to limits.")
    : "Your rover succumbed to the extreme polar cold trap. Study your power consumption and try again with a bigger battery.";

  // What went well & what to improve sentences
  const whatWentWell = iceKg > 0
    ? `You successfully prospected and extracted ${iceKg} kg of cryogenic water ice essential for NASA's Artemis base.`
    : `You mapped ${maxDepth} meters of lunar south-pole terrain and transmitted valuable regolith sensor telemetry.`;

  const whatToImprove = !isSafelyOnRim || !isSuccess
    ? "Drive back to the sunny rim before your battery drops below 30% to guarantee full vehicle recovery."
    : (roverConfig?.totalCost > 140
        ? "Try trimming hardware costs on your next build to maximize your budget efficiency bonus."
        : "Equip the deep TRIDENT drill to extract richer volatile ice cores on your next expedition.");

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
      {/* Top Result Banner */}
      <div className={`hud-panel p-6 rounded-2xl border mb-6 shadow-2xl ${
        isSuccess ? 'border-cyan-400 bg-space-900/90 shadow-[0_0_30px_rgba(0,240,255,0.2)]' : 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4 mb-4">
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-2xl ${
              isSuccess ? 'bg-cyan-950 border border-cyan-400 text-cyan-300' : 'bg-red-950 border border-red-500 text-red-400'
            }`}>
              {isSuccess ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <div>
              <Badge variant={isSuccess ? 'success' : 'danger'}>
                {isSuccess ? 'EXPEDITION COMPLETE' : 'MISSION TERMINATED'}
              </Badge>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                {outcomeHeadline}
              </h2>
            </div>
          </div>

          {/* Letter Grade */}
          <div className="text-left sm:text-right bg-space-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">OVERALL RATING</div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-cyan-300">
              {scoreResult.grade.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Narrative Explanation */}
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-3">
          {gradeExplanation}
        </p>
      </div>

      {/* 4 Clear Category Scores with Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Science Score */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Droplet className="w-4 h-4 text-cyan-400" />
            <span>Science & Ice</span>
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-300">
            {scoreResult.breakdown.scienceScore + scoreResult.breakdown.iceScore}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">
            {iceKg} kg ice extracted
          </div>
        </div>

        {/* Exploration Depth */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Dark Exploration</span>
          </div>
          <div className="text-2xl font-mono font-bold text-blue-300">
            {scoreResult.breakdown.depthScore}
          </div>
          <div className="text-[11px] font-mono text-cyan-400 mt-1">
            {maxDepth} m into shadow
          </div>
        </div>

        {/* Survival & Health */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <Heart className="w-4 h-4 text-emerald-400" />
            <span>Rover Health</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-300">
            {scoreResult.breakdown.healthScore}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">
            {missionReport?.roverHealth || 100}% integrity
          </div>
        </div>

        {/* Budget Efficiency */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-500/30 bg-space-900/70 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 font-mono text-xs mb-1">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Budget Savings</span>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300">
            +{scoreResult.breakdown.efficiencyBonus}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            ${Math.max(0, 160 - (roverConfig?.totalCost || 120))}M unspent
          </div>
        </div>
      </div>

      {/* What Went Well / What to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="hud-panel p-4 rounded-xl border border-emerald-500/30 bg-space-900/80">
          <div className="flex items-center space-x-2 text-emerald-400 font-display font-bold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>WHAT WENT WELL:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {whatWentWell}
          </p>
        </div>

        <div className="hud-panel p-4 rounded-xl border border-amber-500/30 bg-space-900/80">
          <div className="flex items-center space-x-2 text-amber-400 font-display font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>HOW TO IMPROVE NEXT TIME:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {whatToImprove}
          </p>
        </div>
      </div>

      {/* Engineer Mode: NASA Technical Comparison & Point Formulas */}
      {isEngineerMode && (
        <div className="hud-panel p-5 rounded-xl border border-cyan-500/20 bg-space-950/90 mb-6">
          <div className="text-xs font-mono text-cyan-400 font-bold mb-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ENGINEER MODE: NASA TELEMETRY MATH & MISSION BENCHMARKS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-slate-300 leading-relaxed mb-3">
            <div className="p-3 rounded bg-space-900 border border-slate-800">
              <strong className="text-cyan-300 block mb-1">NASA VIPER Baseline:</strong>
              VIPER plan budgeted 120-minute traverses into PSR cold traps with an 80% battery recharge margin on elevated rim ridges.
            </div>
            <div className="p-3 rounded bg-space-900 border border-slate-800">
              <strong className="text-amber-300 block mb-1">Score Formula:</strong>
              Score = (Science × 3.5) + (Ice_kg × 12) + (Depth_m × 0.8) + (Health × 1.5) + (Battery% × 1.2) + (Budget_Saved × 2.0).
            </div>
            <div className="p-3 rounded bg-space-900 border border-slate-800">
              <strong className="text-blue-300 block mb-1">Residual Telemetry:</strong>
              Final Core Temp: {missionReport?.coreTempC || -45}°C • Battery Left: {missionReport?.batteryRemainingPercent || 0}% • Comm Margin: nominal.
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons (Play again is primary) */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={handleDownloadJSON}
            icon={<Download className="w-4 h-4 text-cyan-400" />}
          >
            Export Flight Log
          </Button>

          <Button
            variant="ghost"
            onClick={handleCopySummary}
            icon={<Copy className="w-4 h-4 text-cyan-400" />}
          >
            {copied ? 'Copied!' : 'Copy Summary'}
          </Button>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            sound.playBeep(980, 0.1);
            onRestart();
          }}
          className="w-full sm:w-auto shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          icon={<RotateCcw className="w-4 h-4 text-slate-950" />}
        >
          <span>PLAY AGAIN</span>
        </Button>
      </div>
    </div>
  );
}
