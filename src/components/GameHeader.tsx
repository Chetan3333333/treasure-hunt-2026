import LifelineBar from "./LifelineBar";
import ProgressIndicator from "./ProgressIndicator";
import { useGame } from "@/context/GameContext";

const GameHeader = () => {
  const { currentRound, lifelines, roundScores, username } = useGame();

  return (
    <div className="w-full px-4 py-3 flex flex-col gap-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-lg mx-auto w-full">
        <span className="text-xs text-muted-foreground font-medium">
          Player: <span className="text-primary">{username}</span>
        </span>
        <LifelineBar lifelines={lifelines} />
      </div>
      <div className="max-w-lg mx-auto w-full">
        <ProgressIndicator currentRound={currentRound} roundScores={roundScores} />
      </div>
    </div>
  );
};

export default GameHeader;
