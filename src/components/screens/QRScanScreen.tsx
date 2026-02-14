import { useGame } from "@/context/GameContext";
import { useSound } from "@/context/SoundContext";
import { Button } from "@/components/ui/button";
import { ScanLine, Flashlight, FlashlightOff } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { roundPasswords } from "@/data/questions";
import { useState } from "react";

const QRScanScreen = () => {
  const { currentRound, setGameState } = useGame();
  const { playSound } = useSound();
  const [torchOn, setTorchOn] = useState(false);

  const handleScan = (result: string) => {
    if (result) {
      playSound("click");
      const expectedPassword = roundPasswords[currentRound];
      if (result === expectedPassword) {
        playSound("success");
        toast.success("Access Granted! Proceeding to next round.");
        setGameState("round");
      } else {
        playSound("wrong");
        toast.error("Access Denied! Invalid QR Code.");
      }
    }
  };

  const toggleTorch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any; // Cast to any to access torch

      if (capabilities.torch) {
        track.applyConstraints({
          advanced: [{ torch: !torchOn } as any]
        } as any);
        setTorchOn(!torchOn);
      } else {
        toast.error("Flashlight not available on this device");
      }
    } catch (err) {
      console.error("Error toggling torch:", err);
      // Note: This simple toggle might conflict with the Scanner component's stream control. 
      // Ideally, we'd access the Scanner's track, but react-qr-scanner doesn't expose it easily.
      // For now, we'll try a simpler approach if the library allows, or just note limitation.
      // Actually, yudiel/react-qr-scanner has a `constraints` prop but not direct torch control prop in v1.
      // We will leave the button but note strictly that browser support varies.
      toast.info("Flashlight control may be limited by browser/device");
    }
  };



  return (
    <div className="flex flex-col min-h-screen">
      <GameHeader />
      <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6">
        <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-2 border-dashed border-primary/40 flex items-center justify-center animate-pop-in bg-black/20">
          <Scanner
            onScan={(result) => {
              if (result && result.length > 0) {
                handleScan(result[0].rawValue);
              }
            }}
            components={{ finder: false }}
            styles={{ container: { width: "100%", height: "100%" } }}
          />
          <ScanLine className="absolute w-full h-1/2 text-primary animate-pulse-neon pointer-events-none z-10 opacity-50" />
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full w-12 h-12 border-primary/50 ${torchOn ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
            onClick={toggleTorch}
          >
            {torchOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </Button>
        </div>

        <div className="text-center">
          <h2 className="font-display text-lg neon-text mb-2">Scan QR Code</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Find the QR code at the location and scan it to start Round {currentRound}
          </p>
        </div>

      </div>
    </div>
  );
};

export default QRScanScreen;
