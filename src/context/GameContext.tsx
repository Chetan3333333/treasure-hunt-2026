import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

export type GameStatus = "LOBBY" | "ACTIVE" | "LOCKED" | "DISQUALIFIED" | "VICTORY";

export interface GameState {
  team_id: string;
  device_id: string;
  current_level_index: number;
  current_question_index: number;
  lifelines: number;
  game_status: GameStatus;
  logs: string[];
}

interface GameContextType extends GameState {
  setTeamId: (id: string) => void;
  startGame: () => void;
  submitAnswer: (answer: string) => boolean;
  deductLifeline: () => void;
  resetGame: () => void;
  advanceLevel: (nextLevelIdx: number, nextQuestionIdx: number, done: boolean) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
};

const INITIAL_STATE: GameState = {
  team_id: "",
  device_id: "",
  current_level_index: 0,
  current_question_index: 0,
  lifelines: 3,
  game_status: "LOBBY",
  logs: [],
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("glitch_game_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse game state", e);
      }
    } else {
      // Init device ID if new
      const devId = uuidv4();
      setState(s => ({ ...s, device_id: devId }));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("glitch_game_state", JSON.stringify(state));
  }, [state]);

  const setTeamId = (id: string) => {
    setState(prev => ({ ...prev, team_id: id }));
  };

  const startGame = () => {
    setState(prev => ({ ...prev, game_status: "ACTIVE", lifelines: 3, current_level_index: 0, current_question_index: 0 }));
  };

  const deductLifeline = useCallback(() => {
    setState(prev => {
      const nextLifelines = prev.lifelines - 1;
      const nextStatus = nextLifelines <= 0 ? "DISQUALIFIED" : prev.game_status;
      return {
        ...prev,
        lifelines: nextLifelines,
        game_status: nextStatus as GameStatus,
        logs: [...prev.logs, new Date().toISOString()]
      };
    });
  }, []);

  // Only exposes state setter logic, actual answer checking will be in components or helper
  // For context, we just need to update the indices
  const submitAnswer = (/* logic handled in component for now, just advancing state here */) => {
    // Placeholder, detailed logic will be in the component using the data
    return true;
  };

  // Helper to advance to next question/level
  // Exposed as part of the context value for components to call
  const advanceLevel = useCallback((nextLevelIdx: number, nextQuestionIdx: number, done: boolean) => {
    if (done) {
      setState(prev => ({ ...prev, game_status: "VICTORY" }));
    } else {
      setState(prev => ({
        ...prev,
        current_level_index: nextLevelIdx,
        current_question_index: nextQuestionIdx
      }));
    }
  }, []);


  const resetGame = () => {
    localStorage.removeItem("glitch_game_state");
    setState({ ...INITIAL_STATE, device_id: uuidv4() });
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        setTeamId,
        startGame,
        submitAnswer: () => true, // handled locally in component usually, or we can move logic here
        deductLifeline,
        resetGame,
        advanceLevel
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
