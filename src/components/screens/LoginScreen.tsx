import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Zap } from "lucide-react";

const LoginScreen = () => {
  const { setUsername, setGameState } = useGame();
  const [name, setName] = useState("");

  const handleStart = () => {
    if (!name.trim()) return;
    setUsername(name.trim());
    setGameState("qr-scan");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-8">
      <div className="flex flex-col items-center gap-3 animate-pop-in">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center neon-border animate-float">
          <Crosshair className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl neon-text tracking-wider text-center">
          TREASURE HUNT
        </h1>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          4 rounds. 4 lifelines. Scan, solve, and survive.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-4 animate-pop-in" style={{ animationDelay: "0.15s" }}>
        <Input
          placeholder="Enter your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          className="bg-secondary border-border text-center text-foreground placeholder:text-muted-foreground focus:neon-border h-12"
        />
        <Button
          onClick={handleStart}
          disabled={!name.trim()}
          className="h-12 font-display tracking-wider gap-2 text-sm"
        >
          <Zap className="w-4 h-4" />
          START GAME
        </Button>
      </div>

      <div className="flex gap-6 text-muted-foreground text-xs mt-4">
        <span>🧩 4 Rounds</span>
        <span>❤️ 4 Lives</span>
        <span>📍 Location-Based</span>
      </div>
    </div>
  );
};

export default LoginScreen;
