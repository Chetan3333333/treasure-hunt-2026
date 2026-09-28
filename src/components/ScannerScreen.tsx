import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScanLine, Camera, AlertTriangle } from "lucide-react";

interface ScannerScreenProps {
    onScanComplete: () => void;
}

const ScannerScreen = ({ onScanComplete }: ScannerScreenProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
                // Simulate scan success after 3 seconds for gameplay flow
                setTimeout(() => {
                    handleScanSuccess();
                }, 3500);
            } catch (err) {
                console.error("Camera access denied:", err);
                setHasPermission(false);
                toast.error("OPTICAL SENSORS OFFLINE (Camera Denied)");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleScanSuccess = () => {
        setScanning(false);
        toast.success("TARGET ACQUIRED");
        setTimeout(onScanComplete, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Camera Feed */}
            <div className="absolute inset-0 opacity-60">
                {hasPermission ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover filter grayscale contrast-125 brightness-75"
                    />
                ) : (
                    <div className="w-full h-full bg-noise flex items-center justify-center flex-col text-destructive gap-4 animate-pulse">
                        <AlertTriangle className="w-16 h-16" />
                        <p className="font-mono text-xl">NO SIGNAL</p>
                    </div>
                )}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 border-[2px] border-primary/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary m-4" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary m-4" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary m-4" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary m-4" />

            {/* Scanning Animation */}
            {scanning && hasPermission && (
                <div className="absolute w-full h-[2px] bg-primary/80 shadow-[0_0_15px_rgba(0,255,65,0.8)] animate-scan-y top-1/2" />
            )}

            {/* HUD */}
            <div className="z-10 bg-black/80 backdrop-blur-md border border-primary/30 p-6 rounded-lg text-center space-y-4 max-w-sm mx-4 animate-in zoom-in slide-in-from-bottom-8 duration-500">
                <h2 className="text-2xl font-black text-primary glitched-text flex items-center justify-center gap-2">
                    <Camera className="w-6 h-6" />
                    SENSORS ACTIVE
                </h2>
                <p className="text-primary/70 font-mono text-sm">
                    {scanning ? "SEARCHING FOR ENCRYPTED MARKER..." : "IDENTIFIED"}
                </p>

                {!hasPermission && (
                    <Button onClick={() => onScanComplete()} variant="destructive" className="w-full font-mono font-bold mt-4 animate-pulse">
                        BYPASS SECURITY PROTOCOL
                    </Button>
                )}

                {/* Debug/Skip Button for Dev */}
                {hasPermission && (
                    <Button onClick={handleScanSuccess} variant="outline" className="w-full font-mono text-xs border-primary/20 hover:bg-primary/20 text-primary/50">
                        [DEBUG] FORCE MATCH
                    </Button>
                )}
            </div>

            <style>{`
        @keyframes scan-y {
            0% { top: 10%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
        }
        .animate-scan-y {
            animation: scan-y 2s linear infinite;
        }
        .bg-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
        </div>
    );
};

export default ScannerScreen;
