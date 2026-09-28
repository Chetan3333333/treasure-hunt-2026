import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useGameSecurity } from "@/hooks/useGameSecurity";
import { GAME_DATA } from "@/data/gameData";
import Watermark from "@/components/Watermark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import QuestionCardComponent from "@/components/QuestionCard";
import { GameProvider } from "@/context/GameContext";
import ScannerScreen from "@/components/ScannerScreen";

const GameController = () => {
  const {
    game_status,
    lifelines,
    current_level_index,
    current_question_index,
    team_id,
    setTeamId,
    startGame,
    deductLifeline,
    advanceLevel,
    resetGame
  } = useGame();

  const [showScanner, setShowScanner] = useState(false);

  // Security Hook
  useGameSecurity({
    maxLifelines: 3,
    onPenalty: deductLifeline,
    gameActive: game_status === "ACTIVE" && !showScanner,
  });

  const [inputName, setInputName] = useState("");

  const handleStartInteraction = () => {
    if (!inputName.trim()) return;
    setTeamId(inputName.toUpperCase());
    setShowScanner(true);
    // Request permissions
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => console.log("Fullscreen denied:", err));
    }
    if ('wakeLock' in navigator) {
      // @ts-ignore
      navigator.wakeLock.request('screen').catch((err) => console.log("Wake Lock denied:", err));
    }
  };

  const handleScanComplete = () => {
    setShowScanner(false);
    startGame();
  };

  const handleAnswer = (answer: string) => {
    const currentLevel = GAME_DATA.levels[current_level_index];
    const currentQuestion = currentLevel.questions[current_question_index];

    // Fuzzy match logic
    const isCorrect = currentQuestion.correct_answers.some(a =>
      a.toLowerCase().trim() === answer.toLowerCase().trim()
    );

    if (isCorrect) {
      // Move to next
      const nextQIdx = current_question_index + 1;
      if (nextQIdx < currentLevel.questions.length) {
        advanceLevel(current_level_index, nextQIdx, false);
      } else {
        // Next Level
        const nextLevelIdx = current_level_index + 1;
        if (nextLevelIdx < GAME_DATA.levels.length) {
          advanceLevel(nextLevelIdx, 0, false);
        } else {
          // Victory
          advanceLevel(0, 0, true);
        }
      }
    } else {
      deductLifeline();
    }
  };

  if (game_status === "LOBBY") {
    if (showScanner) {
      return <ScannerScreen onScanComplete={handleScanComplete} />;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 animate-in fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-primary glitched-text">THE GLITCH PROTOCOL</h1>
          <p className="text-muted-foreground">INITIATE_SEQUENCE_V4.0</p>
        </div>
        <Card className="w-full max-w-sm bg-black/50 border-primary/20">
          <CardHeader>
            <CardTitle>IDENTITY_VERIFICATION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="ENTER_TEAM_ID"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              className="font-mono text-center uppercase"
            />
            <Button onClick={handleStartInteraction} className="w-full font-bold" disabled={!inputName}>
              ESTABLISH_UPLINK
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (game_status === "DISQUALIFIED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-destructive p-4 text-center animate-in zoom-in duration-300">
        <h1 className="text-6xl font-black mb-4">TERMINATED</h1>
        <p className="font-mono text-xl mb-8">CONNECTION_LOST_PERMANENTLY</p>
        <Button variant="outline" onClick={resetGame} className="border-destructive text-destructive hover:bg-destructive hover:text-white">
          SYSTEM_REBOOT (RESET)
        </Button>
      </div>
    );
  }

  if (game_status === "VICTORY") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 p-4 text-center animate-in zoom-in">
        <h1 className="text-6xl font-black mb-4">SYSTEM_OVERRIDE</h1>
        <p className="font-mono text-xl mb-8">ACCESS_GRANTED_LEVEL_MAX</p>
        <div className="text-2xl font-mono border border-green-500 p-4 rounded bg-green-500/10">
          TEAM_ID: {team_id}
        </div>
      </div>
    );
  }

  // ACTIVE GAME
  const currentQuestion = GAME_DATA.levels[current_level_index]?.questions[current_question_index];

  if (!currentQuestion) return <div>Error: Data Corruption</div>;

  return (
    <div className="min-h-screen flex flex-col p-4 relative overflow-hidden">
      <Watermark />

      {/* Header HUD */}
      <div className="flex justify-between items-center mb-6 z-10 font-mono text-sm">
        <div className="flex flex-col">
          <span className="text-muted-foreground">LIFELINES</span>
          <span className="text-xl text-primary font-bold">{"|".repeat(lifelines)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-muted-foreground">LEVEL_{current_level_index + 1}</span>
          <span className="text-xl text-primary font-bold">{GAME_DATA.levels[current_level_index].name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center z-10">
        <QuestionCardComponent
          question={currentQuestion}
          onSubmit={handleAnswer}
        />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-background text-foreground scheme-dark">
        <GameController />
        <Toaster />
      </div>
    </GameProvider>
  );
};

export default Index;
