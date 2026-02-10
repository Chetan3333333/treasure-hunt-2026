import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw } from "lucide-react";

const WinnerScreen = () => {
  const { username, resetGame } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6 text-center">
      <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center animate-float"
        style={{ boxShadow: "0 0 30px hsl(var(--gold) / 0.3)" }}>
        <Trophy className="w-12 h-12 text-accent" />
      </div>
      <h1 className="font-display text-3xl gold-text animate-pop-in">
        CONGRATULATIONS!
      </h1>
      <p className="text-foreground text-lg max-w-sm">
        <span className="text-primary font-semibold">{username}</span>, you completed the treasure hunt! 🎉
      </p>
      <p className="text-muted-foreground text-sm max-w-xs">
        You solved all 4 rounds and proved your skills. You're a true treasure hunter!
      </p>
      <Button onClick={resetGame} variant="outline" className="neon-border gap-2 mt-4">
        <RotateCcw className="w-4 h-4" /> Play Again
      </Button>
    </div>
  );
};

export default WinnerScreen;
