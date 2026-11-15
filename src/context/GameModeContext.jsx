import React, { createContext, useContext, useState, useEffect } from 'react';
import { LABELS } from '../content/labels';

const GameModeContext = createContext(null);

const STORAGE_KEY = 'luna_game_mode';

export function GameModeProvider({ children }) {
  const [gameMode, setGameModeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'engineer' ? 'engineer' : 'explorer';
    } catch {
      return 'explorer';
    }
  });

  const setGameMode = (newMode) => {
    const validMode = newMode === 'engineer' ? 'engineer' : 'explorer';
    setGameModeState(validMode);
    try {
      localStorage.setItem(STORAGE_KEY, validMode);
    } catch (e) {
      console.warn('Could not persist game mode to localStorage', e);
    }
  };

  const toggleGameMode = () => {
    setGameMode(gameMode === 'explorer' ? 'engineer' : 'explorer');
  };

  const isEngineer = gameMode === 'engineer';

  /**
   * Translates a term based on the active mode (Explorer vs Engineer)
   */
  const t = (key, subkey = null) => {
    const item = LABELS[key];
    if (!item) return key;

    if (subkey && item[subkey]) {
      const sub = item[subkey];
      if (typeof sub === 'object') {
        return isEngineer ? (sub.engineer || sub.simple) : (sub.simple || sub.engineer);
      }
      return sub;
    }

    if (typeof item === 'object') {
      return isEngineer ? (item.engineer || item.simple) : (item.simple || item.engineer);
    }
    return item;
  };

  /**
   * Retrieves educational NASA tooltip for a given term
   */
  const getTooltip = (key, subkey = null) => {
    const item = LABELS[key];
    if (!item) return null;
    if (subkey && item[subkey] && item[subkey].tooltip) return item[subkey].tooltip;
    return item.tooltip || null;
  };

  return (
    <GameModeContext.Provider
      value={{
        gameMode,
        setGameMode,
        toggleGameMode,
        isEngineer,
        t,
        getTooltip,
        labels: LABELS,
      }}
    >
      {children}
    </GameModeContext.Provider>
  );
}

export function useGameMode() {
  const context = useContext(GameModeContext);
  if (!context) {
    // Return safe fallback if rendered outside provider
    return {
      gameMode: 'explorer',
      isEngineer: false,
      setGameMode: () => {},
      toggleGameMode: () => {},
      t: (key) => LABELS[key]?.simple || key,
      getTooltip: (key) => LABELS[key]?.tooltip || null,
      labels: LABELS,
    };
  }
  return context;
}
