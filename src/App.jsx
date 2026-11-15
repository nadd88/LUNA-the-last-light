import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import CinematicBackground from './components/CinematicBackground';
import PageTransition from './components/common/PageTransition';
import CinematicLoader from './components/common/CinematicLoader';
import LandingScreen from './components/screens/LandingScreen';
import BriefingScreen from './components/screens/BriefingScreen';
import SiteSelectionScreen from './components/screens/SiteSelectionScreen';
import ConfigurationScreen from './components/screens/ConfigurationScreen';
import MissionControlScreen from './components/screens/MissionControlScreen';
import SimulationScreen from './components/screens/SimulationScreen';
import DebriefScreen from './components/screens/DebriefScreen';
import ScienceManualModal from './components/modals/ScienceManualModal';
import SavedMissionsModal from './components/modals/SavedMissionsModal';
import HowToPlayModal from './components/modals/HowToPlayModal';
import SettingsModal from './components/modals/SettingsModal';

import { LANDING_SITES } from './data/landingSites';
import { ROVER_COMPONENTS } from './data/componentsData';
import { 
  saveCurrentMission, 
  loadCurrentMission, 
  clearCurrentMission 
} from './utils/storage';
import { sound } from './utils/sound';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedSite, setSelectedSite] = useState(LANDING_SITES[0]);
  
  // Default rover config (All rovers equipped with TRIDENT Drill standard)
  const [roverConfig, setRoverConfig] = useState({
    chassis: ROVER_COMPONENTS.chassis[1],
    solar: ROVER_COMPONENTS.solar[1],
    battery: ROVER_COMPONENTS.battery[1],
    thermal: ROVER_COMPONENTS.thermal[1],
    comm: ROVER_COMPONENTS.comm[1],
    instruments: [
      ROVER_COMPONENTS.instruments[0],
      ROVER_COMPONENTS.instruments[1],
      ROVER_COMPONENTS.instruments[2] // TRIDENT 1-Meter Cryogenic Percussive Rotary Drill
    ],
    totalCost: 182,
    totalMass: 289,
    peakSolarGen: 148,
    totalBasePowerDraw: 65
  });

  const [missionReport, setMissionReport] = useState(null);
  const [missionTimeSeconds, setMissionTimeSeconds] = useState(0);
  const [isMissionActive, setIsMissionActive] = useState(false);

  // Modals
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSavedMission, setHasSavedMission] = useState(false);

  // Cinematic launch transition state
  const [isLaunchingSurfaceOps, setIsLaunchingSurfaceOps] = useState(false);

  // Check saved flight on mount
  useEffect(() => {
    const saved = loadCurrentMission();
    if (saved && saved.screen && saved.screen !== 'landing') {
      setHasSavedMission(true);
    }
  }, []);

  // Mission MET clock timer
  useEffect(() => {
    let timer;
    if (isMissionActive) {
      timer = setInterval(() => {
        setMissionTimeSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMissionActive]);

  // Autosave mission state
  useEffect(() => {
    if (currentScreen !== 'landing' && currentScreen !== 'debrief') {
      saveCurrentMission({
        screen: currentScreen,
        site: selectedSite,
        config: roverConfig,
        elapsedTime: missionTimeSeconds
      });
      setHasSavedMission(true);
    }
  }, [currentScreen, selectedSite, roverConfig, missionTimeSeconds]);

  // Screen Transitions
  const handleStartMission = () => {
    setCurrentScreen('briefing');
  };

  const handleResumeMission = () => {
    const saved = loadCurrentMission();
    if (saved) {
      if (saved.site) setSelectedSite(saved.site);
      if (saved.config) setRoverConfig(saved.config);
      if (saved.elapsedTime) setMissionTimeSeconds(saved.elapsedTime);
      if (saved.screen === 'simulation') setIsMissionActive(true);
      setCurrentScreen(saved.screen || 'briefing');
    }
  };

  const handleResetMission = () => {
    clearCurrentMission();
    setHasSavedMission(false);
    setIsMissionActive(false);
    setMissionTimeSeconds(0);
    setMissionReport(null);
    setCurrentScreen('landing');
  };

  const handleCompleteMission = (report) => {
    setIsMissionActive(false);
    clearCurrentMission();
    setHasSavedMission(false);
    setMissionReport(report);
    setCurrentScreen('debrief');
  };

  const handleInitiateSurfaceDescent = () => {
    sound.playQuindar();
    setIsLaunchingSurfaceOps(true);
  };

  const handleDescentTransitionComplete = () => {
    setIsLaunchingSurfaceOps(false);
    setIsMissionActive(true);
    setCurrentScreen('simulation');
  };

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Starfield & Lunar Horizon Background */}
      <CinematicBackground />

      {/* Persistent Mission Control Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetMission={handleResetMission}
        missionTimeSeconds={missionTimeSeconds}
        isMissionActive={isMissionActive}
      />

      {/* Main View Router with Animated Page Transitions */}
      <main className="flex-1 min-h-0 relative overflow-hidden flex flex-col w-full">
        <AnimatePresence mode="wait">
          {currentScreen === 'landing' && (
            <PageTransition key="landing">
              <LandingScreen
                onStartMission={handleStartMission}
                onResumeMission={handleResumeMission}
                hasSavedMission={hasSavedMission}
                onOpenManual={() => setIsManualOpen(true)}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </PageTransition>
          )}

          {currentScreen === 'briefing' && (
            <PageTransition key="briefing">
              <BriefingScreen
                onProceed={() => setCurrentScreen('site-selection')}
                onBack={() => setCurrentScreen('landing')}
              />
            </PageTransition>
          )}

          {currentScreen === 'site-selection' && (
            <PageTransition key="site-selection">
              <SiteSelectionScreen
                selectedSiteId={selectedSite?.id}
                onSelectSite={setSelectedSite}
                onProceed={(site) => {
                  setSelectedSite(site);
                  setCurrentScreen('configuration');
                }}
                onBack={() => setCurrentScreen('briefing')}
              />
            </PageTransition>
          )}

          {currentScreen === 'configuration' && (
            <PageTransition key="configuration">
              <ConfigurationScreen
                initialConfig={roverConfig}
                selectedSite={selectedSite}
                onProceed={(config) => {
                  setRoverConfig(config);
                  setCurrentScreen('mission-control');
                }}
                onBack={() => setCurrentScreen('site-selection')}
              />
            </PageTransition>
          )}

          {currentScreen === 'mission-control' && (
            <PageTransition key="mission-control">
              <MissionControlScreen
                roverConfig={roverConfig}
                selectedSite={selectedSite}
                onLaunchSurfaceOps={handleInitiateSurfaceDescent}
                onBack={() => setCurrentScreen('configuration')}
              />
            </PageTransition>
          )}

          {currentScreen === 'simulation' && (
            <PageTransition key="simulation">
              <SimulationScreen
                roverConfig={roverConfig}
                selectedSite={selectedSite}
                onCompleteMission={handleCompleteMission}
              />
            </PageTransition>
          )}

          {currentScreen === 'debrief' && (
            <PageTransition key="debrief">
              <DebriefScreen
                missionReport={missionReport}
                roverConfig={roverConfig}
                selectedSite={selectedSite}
                onRestart={handleResetMission}
              />
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      {/* Cinematic Transition Overlay (Mission Control -> Surface Ops) */}
      <CinematicLoader
        active={isLaunchingSurfaceOps}
        message="INITIATING LUNAR SURFACE DESCENT..."
        submessage={`SITE: ${selectedSite?.name?.toUpperCase() || 'SHACKLETON'} // 90.0°S`}
        duration={950}
        onComplete={handleDescentTransitionComplete}
      />

      {/* Science Reference Manual Modal */}
      <ScienceManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />

      {/* Historic Flight Records Modal */}
      <SavedMissionsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* How to Play Manual Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Mission Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
