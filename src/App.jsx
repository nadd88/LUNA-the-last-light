import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CinematicBackground from './components/CinematicBackground';
import LandingScreen from './components/screens/LandingScreen';
import BriefingScreen from './components/screens/BriefingScreen';
import SiteSelectionScreen from './components/screens/SiteSelectionScreen';
import ConfigurationScreen from './components/screens/ConfigurationScreen';
import MissionControlScreen from './components/screens/MissionControlScreen';
import SimulationScreen from './components/screens/SimulationScreen';
import DebriefScreen from './components/screens/DebriefScreen';
import ScienceManualModal from './components/modals/ScienceManualModal';
import SavedMissionsModal from './components/modals/SavedMissionsModal';

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
  
  // Default rover config
  const [roverConfig, setRoverConfig] = useState({
    chassis: ROVER_COMPONENTS.chassis[1],
    solar: ROVER_COMPONENTS.solar[1],
    battery: ROVER_COMPONENTS.battery[1],
    thermal: ROVER_COMPONENTS.thermal[1],
    comm: ROVER_COMPONENTS.comm[1],
    instruments: [ROVER_COMPONENTS.instruments[0], ROVER_COMPONENTS.instruments[1]],
    totalCost: 119,
    totalMass: 216,
    peakSolarGen: 148,
    totalBasePowerDraw: 65
  });

  const [missionReport, setMissionReport] = useState(null);
  const [missionTimeSeconds, setMissionTimeSeconds] = useState(0);
  const [isMissionActive, setIsMissionActive] = useState(false);

  // Modals
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasSavedMission, setHasSavedMission] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Starfield & Lunar Horizon Background */}
      <CinematicBackground />

      {/* Persistent Mission Control Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onResetMission={handleResetMission}
        missionTimeSeconds={missionTimeSeconds}
        isMissionActive={isMissionActive}
      />

      {/* Main View Router */}
      <main className="flex-grow flex flex-col justify-center">
        {currentScreen === 'landing' && (
          <LandingScreen
            onStartMission={handleStartMission}
            onResumeMission={handleResumeMission}
            hasSavedMission={hasSavedMission}
            onOpenManual={() => setIsManualOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {currentScreen === 'briefing' && (
          <BriefingScreen
            onProceed={() => setCurrentScreen('site-selection')}
            onBack={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'site-selection' && (
          <SiteSelectionScreen
            selectedSiteId={selectedSite?.id}
            onSelectSite={setSelectedSite}
            onProceed={(site) => {
              setSelectedSite(site);
              setCurrentScreen('configuration');
            }}
            onBack={() => setCurrentScreen('briefing')}
          />
        )}

        {currentScreen === 'configuration' && (
          <ConfigurationScreen
            initialConfig={roverConfig}
            selectedSite={selectedSite}
            onProceed={(config) => {
              setRoverConfig(config);
              setCurrentScreen('mission-control');
            }}
            onBack={() => setCurrentScreen('site-selection')}
          />
        )}

        {currentScreen === 'mission-control' && (
          <MissionControlScreen
            roverConfig={roverConfig}
            selectedSite={selectedSite}
            onLaunchSurfaceOps={() => {
              setIsMissionActive(true);
              setCurrentScreen('simulation');
            }}
            onBack={() => setCurrentScreen('configuration')}
          />
        )}

        {currentScreen === 'simulation' && (
          <SimulationScreen
            roverConfig={roverConfig}
            selectedSite={selectedSite}
            onCompleteMission={handleCompleteMission}
          />
        )}

        {currentScreen === 'debrief' && (
          <DebriefScreen
            missionReport={missionReport}
            roverConfig={roverConfig}
            selectedSite={selectedSite}
            onRestart={handleResetMission}
          />
        )}
      </main>

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
    </div>
  );
}
