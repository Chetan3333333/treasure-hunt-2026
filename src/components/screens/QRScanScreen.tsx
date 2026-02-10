import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { QrCode, ScanLine } from "lucide-react";
import GameHeader from "@/components/GameHeader";

const QRScanScreen = () => {
  const { currentRound, setGameState } = useGame();

  const handleSimulateScan = () => {
    setGameState("round");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <GameHeader />
      <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6">
        <div className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center animate-pop-in">
          <QrCode className="w-24 h-24 text-primary/30" />
          <ScanLine className="absolute w-32 text-primary animate-pulse-neon" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-lg neon-text mb-2">Scan QR Code</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Find the QR code at the location and scan it to start Round {currentRound}
          </p>
        </div>
        <Button onClick={handleSimulateScan} variant="outline" className="neon-border gap-2">
          <ScanLine className="w-4 h-4" />
          Simulate QR Scan
        </Button>
      </div>
    </div>
  );
};

export default QRScanScreen;
