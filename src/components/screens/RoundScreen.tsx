import { useState, useCallback, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import GameHeader from "@/components/GameHeader";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import { round1Questions, round2Questions, round3Questions, round4Questions, locationHints, Question } from "@/data/questions";
import HintScreen from "@/components/HintScreen";
import { useSound } from "@/context/SoundContext";
import { toast } from "sonner";

const roundTitles = ["VR + Aptitude", "Tech Riddles + Memes", "Rapid Fire", "DSA Final"];
const roundTimers = [60, 60, 15, 90];

const getRoundQuestions = (round: number): Question[] => {
  switch (round) {
    case 1: return round1Questions;
    case 2: return round2Questions;
    case 3: return round3Questions;
    case 4: return round4Questions;
    default: return [];
  }
};

const RoundScreen = () => {
  const { currentRound, setCurrentRound, loseLifeline, setGameState, setRoundComplete, gameState, addScore, startGlobalTimer, finishGame } = useGame();
  const { playSound } = useSound();
  const [qIndex, setQIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  // Anti-Cheat: Focus Mode Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState === "round" && !showHint) {
        // Player switched tabs or minimized
        playSound("wrong");
        toast.error("⚠️ SYSTEM BREACH: Tab switching detected! Lifeline Lost.", {
          duration: 4000,
          style: { border: "1px solid red", color: "red" }
        });
        loseLifeline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameState, showHint, loseLifeline, playSound]);

  // Start global timer on first render of round 1
  useEffect(() => {
    if (currentRound === 1 && !timerStarted) {
      startGlobalTimer();
      setTimerStarted(true);
    }
  }, [currentRound, timerStarted, startGlobalTimer]);

  const questions = getRoundQuestions(currentRound);
  const currentQ = questions[qIndex];

  const advanceQuestion = useCallback(() => {
    if (qIndex + 1 < questions.length) {
      setQIndex(prev => prev + 1);
      setTimerKey(prev => prev + 1);
    } else {
      // Round complete
      setRoundComplete(currentRound);
      if (currentRound >= 4) {
        finishGame();
      } else {
        setShowHint(true);
      }
    }
  }, [qIndex, questions.length, currentRound, setRoundComplete, finishGame]);

  const handleCorrect = useCallback(() => {
    addScore(10); // +10 for correct answer
    setTimeout(() => advanceQuestion(), 600);
  }, [advanceQuestion, addScore]);

  const handleWrong = useCallback(() => {
    addScore(-5); // -5 for wrong answer
    setTimeout(() => {
      const alive = loseLifeline();
      if (alive) advanceQuestion();
    }, 600);
  }, [loseLifeline, advanceQuestion, addScore]);

  const handleTimeout = useCallback(() => {
    addScore(-5);
    const alive = loseLifeline();
    if (alive) advanceQuestion();
  }, [loseLifeline, advanceQuestion, addScore]);

  const handleNextRound = useCallback(() => {
    const next = currentRound + 1;
    setCurrentRound(next);
    setQIndex(0);
    setTimerKey(0);
    setShowHint(false);
    setGameState("qr-scan");
  }, [currentRound, setCurrentRound, setGameState]);

  if (gameState === "eliminated") return null;

  if (showHint) {
    return (
      <div className="flex flex-col min-h-screen">
        <GameHeader />
        <HintScreen
          hint={locationHints[currentRound - 1]}
          onContinue={handleNextRound}
          roundCompleted={currentRound}
        />
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <GameHeader />
      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5">
        <div className="flex items-center justify-between w-full max-w-lg">
          <div>
            <h2 className="font-display text-sm neon-text tracking-wider">
              ROUND {currentRound}
            </h2>
            <p className="text-xs text-muted-foreground">{roundTitles[currentRound - 1]}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Q{qIndex + 1}/{questions.length}
            </span>
            <Timer
              key={timerKey}
              seconds={roundTimers[currentRound - 1]}
              onTimeout={handleTimeout}
              isRunning={true}
            />
          </div>
        </div>

        <QuestionCard
          key={`${currentRound}-${qIndex}`}
          question={currentQ.question}
          options={currentQ.options}
          correctIndex={currentQ.correctIndex}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          image={currentQ.image}
        />
      </div>
    </div>
  );
};

export default RoundScreen;
