import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Star, Clock, Award } from "lucide-react";
import Leaderboard from "@/components/Leaderboard";
import { sampleLeaderboard, formatTime, LeaderboardEntry } from "@/data/leaderboard";
import { useMemo } from "react";

const WinnerScreen = () => {
  const { username, resetGame, finalScore, finalTime } = useGame();

  const leaderboardEntries = useMemo(() => {
    const currentUser: LeaderboardEntry = {
      username,
      score: finalScore ?? 0,
      timeSeconds: finalTime ?? 0,
      isCurrentUser: true,
    };
    return [...sampleLeaderboard, currentUser];
  }, [username, finalScore, finalTime]);

  const userRank = useMemo(() => {
    const sorted = [...leaderboardEntries].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });
    return sorted.findIndex(e => e.isCurrentUser) + 1;
  }, [leaderboardEntries]);

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-10 gap-6">
      {/* Trophy */}
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center animate-float"
        style={{ boxShadow: "0 0 30px hsl(var(--gold) / 0.3)" }}>
        <Trophy className="w-10 h-10 text-accent" />
      </div>

      <h1 className="font-display text-2xl gold-text animate-pop-in">CONGRATULATIONS!</h1>
      <p className="text-foreground text-base">
        <span className="text-primary font-semibold">{username}</span>, you completed the treasure hunt! 🎉
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm animate-pop-in">
        <div className="glass-card rounded-lg p-3 text-center neon-border">
          <Star className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="font-display text-lg text-foreground">{finalScore ?? 0}</p>
          <p className="text-[10px] text-muted-foreground font-display tracking-wider">SCORE</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center neon-border">
          <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="font-display text-lg text-foreground">{formatTime(finalTime ?? 0)}</p>
          <p className="text-[10px] text-muted-foreground font-display tracking-wider">TIME</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center neon-border">
          <Award className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="font-display text-lg text-foreground">#{userRank}</p>
          <p className="text-[10px] text-muted-foreground font-display tracking-wider">RANK</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-lg animate-pop-in" style={{ animationDelay: "0.2s" }}>
        <Leaderboard entries={leaderboardEntries} />
      </div>

      <Button onClick={resetGame} variant="outline" className="neon-border gap-2 mt-2">
        <RotateCcw className="w-4 h-4" /> Play Again
      </Button>
    </div>
  );
};

export default WinnerScreen;
