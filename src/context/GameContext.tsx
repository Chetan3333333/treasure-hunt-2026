import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export type GameState = "login" | "qr-scan" | "round" | "hint" | "winner" | "eliminated";

export interface GameContextType {
  username: string;
  setUsername: (name: string) => void;
  currentRound: number;
  setCurrentRound: (round: number) => void;
  lifelines: number;
  loseLifeline: () => boolean;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  resetGame: () => void;
  roundScores: boolean[];
  setRoundComplete: (round: number) => void;
  score: number;
  addScore: (points: number) => void;
  elapsedSeconds: number;
  startGlobalTimer: () => void;
  stopGlobalTimer: () => void;
  finalScore: number | null;
  finalTime: number | null;
  finishGame: () => void;
  participantId: string | null;
  registerParticipant: (name: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [lifelines, setLifelines] = useState(4);
  const [gameState, setGameState] = useState<GameState>("login");
  const [roundScores, setRoundScores] = useState<boolean[]>([false, false, false, false]);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const registerParticipant = useCallback(async (name: string) => {
    const { data, error } = await supabase
      .from("participants")
      .insert({ username: name, score: 0, completion_time: null, completed: false, current_round: 1, lifelines: 4 })
      .select("id")
      .single();
    if (error) {
      console.error("Error registering participant:", error);
      return;
    }
    setParticipantId(data.id);
    setUsername(name);
  }, []);

  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  const startGlobalTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const stopGlobalTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishGame = useCallback(() => {
    stopGlobalTimer();
    setElapsedSeconds(prev => {
      const lifelineBonus = lifelines * 5;
      setScore(s => {
        const total = s + lifelineBonus;
        setFinalScore(total);

        // Update Supabase with final results
        setParticipantId(currentId => {
          if (currentId) {
            supabase
              .from("participants")
              .update({ score: total, completion_time: prev, completed: true })
              .eq("id", currentId)
              .then(({ error }) => {
                if (error) console.error("Error updating participant:", error);
              });
          }
          return currentId;
        });

        return total;
      });
      setFinalTime(prev);
      return prev;
    });
    setGameState("winner");
  }, [stopGlobalTimer, lifelines]);

  const loseLifeline = useCallback(() => {
    const next = lifelines - 1;
    setLifelines(next);
    if (next <= 0) {
      stopGlobalTimer();
      setGameState("eliminated");
      return false;
    }
    return true;
  }, [lifelines, stopGlobalTimer]);

  const setRoundComplete = useCallback((round: number) => {
    setRoundScores(prev => {
      const copy = [...prev];
      copy[round - 1] = true;
      return copy;
    });
    setScore(prev => prev + 10);
  }, []);

  const updateParticipant = useCallback(async (updates: any) => {
    if (!participantId) return;
    const { error } = await supabase
      .from("participants")
      .update(updates)
      .eq("id", participantId);
    if (error) console.error("Error updating participant:", error);
  }, [participantId]);

  // Sync Round Changes to DB
  React.useEffect(() => {
    if (participantId) {
      updateParticipant({ current_round: currentRound, lifelines: lifelines, score: score });
    }
  }, [currentRound, lifelines, score, participantId, updateParticipant]);

  // Poll for Admin Commands (Force Unlock)
  React.useEffect(() => {
    if (!participantId || gameState === "winner" || gameState === "eliminated") return;

    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from("participants")
        .select("current_round, lifelines")
        .eq("id", participantId)
        .single();

      if (data) {
        // If Admin forced a round skip
        if (data.current_round > currentRound) {
          setCurrentRound(data.current_round);
          setGameState("qr-scan"); // Reset to scanning phase for new round
        }
        // Could also sync lifelines if admin grants mercy
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(pollInterval);
  }, [participantId, currentRound, gameState]);

  const resetGame = useCallback(() => {
    stopGlobalTimer();
    setUsername("");
    setCurrentRound(1);
    setLifelines(4);
    setGameState("login");
    setRoundScores([false, false, false, false]);
    setScore(0);
    setElapsedSeconds(0);
    setFinalScore(null);
    setFinalTime(null);
    setParticipantId(null);
  }, [stopGlobalTimer]);

  return (
    <GameContext.Provider
      value={{
        username, setUsername,
        currentRound, setCurrentRound,
        lifelines, loseLifeline,
        gameState, setGameState,
        resetGame,
        roundScores, setRoundComplete,
        score, addScore,
        elapsedSeconds, startGlobalTimer, stopGlobalTimer,
        finalScore, finalTime, finishGame,
        participantId, registerParticipant,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
