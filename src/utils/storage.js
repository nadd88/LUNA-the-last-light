// LocalStorage Persistence for Mission Saves and Historic Flight Logs

const STORAGE_KEYS = {
  CURRENT_MISSION: 'luna_current_mission_v1',
  MISSION_HISTORY: 'luna_mission_history_v1',
  SETTINGS: 'luna_user_settings_v1'
};

export function saveCurrentMission(missionState) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_MISSION, JSON.stringify({
      ...missionState,
      savedAt: new Date().toISOString()
    }));
    return true;
  } catch (e) {
    console.error('Failed to save mission to localStorage:', e);
    return false;
  }
}

export function loadCurrentMission() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_MISSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load mission from localStorage:', e);
    return null;
  }
}

export function clearCurrentMission() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_MISSION);
  } catch (e) {}
}

export function archiveCompletedMission(debriefReport) {
  try {
    const history = getMissionHistory();
    const entry = {
      id: 'LUNA-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      siteName: debriefReport.site?.name || 'Unknown Site',
      score: debriefReport.scoreResult?.score || 0,
      grade: debriefReport.scoreResult?.grade || 'N/A',
      iceDiscoveredKg: debriefReport.waterIceDetectedKg || 0,
      maxDepthM: debriefReport.maxDepthInPSR || 0,
      outcome: debriefReport.missionOutcome || 'UNKNOWN',
      sciencePoints: debriefReport.scienceCollected || 0
    };
    history.unshift(entry);
    // Keep last 25 missions
    const trimmed = history.slice(0, 25);
    localStorage.setItem(STORAGE_KEYS.MISSION_HISTORY, JSON.stringify(trimmed));
    return entry;
  } catch (e) {
    console.error('Failed to archive mission report:', e);
    return null;
  }
}

export function getMissionHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISSION_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function clearMissionHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.MISSION_HISTORY);
  } catch (e) {}
}
