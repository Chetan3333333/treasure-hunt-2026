import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useSound } from "@/context/SoundContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Zap, Loader2 } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";

const LoginScreen = () => {
  const { registerParticipant, setGameState } = useGame();
  const { playSound } = useSound();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) {
      playSound("wrong");
      return;
    }
    playSound("click");
    setLoading(true);
    await registerParticipant(name.trim());
    playSound("correct");
    setGameState("qr-scan");
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 gap-8 overflow-hidden">
      <MatrixRain />

      <div className="relative z-10 flex flex-col items-center gap-3 animate-pop-in">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center neon-border animate-float backdrop-blur-sm">
          <Crosshair className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl neon-text tracking-wider text-center">
          TREASURE HUNT
        </h1>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          4 rounds. 4 lifelines. Scan, solve, and survive.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-xs flex flex-col gap-4 animate-pop-in" style={{ animationDelay: "0.15s" }}>
        <Input
          placeholder="Enter your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          className="bg-secondary/80 backdrop-blur-md border-border text-center text-foreground placeholder:text-muted-foreground focus:neon-border h-12"
          disabled={loading}
        />
        <Button
          onClick={handleStart}
          disabled={!name.trim() || loading}
          className="h-12 font-display tracking-wider gap-2 text-sm z-10"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? "JOINING..." : "START GAME"}
        </Button>
      </div>

      <div className="relative z-10 flex gap-6 text-muted-foreground text-xs mt-4">
        <span>🧩 4 Rounds</span>
        <span>❤️ 4 Lives</span>
        <span>📍 Location-Based</span>
      </div>
    </div>
  );
};

export default LoginScreen;
