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
  isPaused: boolean;
  broadcastMessage: string | null;
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

  const [isPaused, setIsPaused] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  // Poll for Admin Commands (Force Unlock, Revive, Bonus) AND Global State
  React.useEffect(() => {
    // Poll Global State (Participant ID: 00000000-0000-0000-0000-000000000000)
    // We use a specific ID or just filter by username 'GLOBAL_SETTINGS' if ID is dynamic.
    // Let's assume the component handling Admin will create/update a row with username 'GLOBAL_SETTINGS'.

    const pollInterval = setInterval(async () => {
      // 1. Poll User Data (Revive, Unlock, Score)
      if (participantId && gameState !== "winner" && gameState !== "eliminated") {
        const { data: userData } = await supabase
          .from("participants")
          .select("current_round, lifelines, score")
          .eq("id", participantId)
          .single();

        if (userData) {
          if (userData.current_round > currentRound) {
            setCurrentRound(userData.current_round);
            setGameState("qr-scan");
          }
          // Sync lifelines (Revive)
          if (userData.lifelines > lifelines) {
            setLifelines(userData.lifelines);
            if (gameState === "eliminated") setGameState("round"); // REVIVED!
          }
          // Sync Score (Bonus/Penalty)
          if (userData.score !== score) {
            setScore(userData.score);
          }
        }
      }

      // 2. Poll Global Settings (Pause, Broadcast)
      // We look for a user named "GLOBAL_SETTINGS"
      const { data: globalData } = await supabase
        .from("participants")
        .select("score, username") // score = paused state (1=paused), username = broadcast msg (encoded?)
        // Actually, let's use a workaround. We will use 'score' for PAUSED (1=true)
        // And we can't easily store a long message in existing fields without hijacking.
        // Let's use 'username' for the message itself if it starts with "MSG:"
        .eq("username", "GLOBAL_SETTINGS") // This row must exist!
        .maybeSingle();

      if (globalData) {
        const paused = globalData.score === 1;
        setIsPaused(paused);

        // If username contains a message format like "MSG:Hello World"
        // This is hacky but avoids schema changes.
        // Actually, let's look for a row with username "BROADCAST_MSG" for the message separately if needed.
        // For simplicity: Admin toggles PAUSE by setting score=1 on GLOBAL_SETTINGS.
        // Admin sends MESSAGE by setting username="MSG:Alert text" on GLOBAL_SETTINGS (then resets to GLOBAL_SETTINGS after 10s?)
        // Let's just use a separate row for message? 
        // Let's assume GLOBAL_SETTINGS username field IS the message.
        // Default username is "GLOBAL_SETTINGS". If it changes to something else, it's a broadcast.
        if (globalData.username !== "GLOBAL_SETTINGS" && globalData.username.startsWith("📢")) {
          setBroadcastMessage(globalData.username);
        } else {
          setBroadcastMessage(null);
        }
      }

    }, 3000);

    return () => clearInterval(pollInterval);
  }, [participantId, currentRound, gameState, lifelines, score]);

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
        isPaused, broadcastMessage
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
