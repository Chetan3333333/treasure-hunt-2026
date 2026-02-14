import { useGame } from "@/context/GameContext";
import { useSound } from "@/context/SoundContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

const GlobalOverlay = () => {
    const { isPaused, broadcastMessage, isBlackout, globalSound } = useGame();
    const { playSound } = useSound();

    // Local state to prevent duplicate toasts for same message
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [lastSound, setLastSound] = useState<number | null>(null);

    // Handle Broadcasts
    useEffect(() => {
        if (broadcastMessage && broadcastMessage !== lastMessage) {
            // Message format: "📢 Actual Text"
            const content = broadcastMessage.replace("📢 ", "");
            toast(content, {
                duration: 8000,
                style: {
                    background: "#0d0d0d",
                    border: "2px solid #00f0ff",
                    color: "#00f0ff",
                    fontSize: "1.2rem",
                    boxShadow: "0 0 20px #00f0ff",
                },
                position: "top-center"
            });
            setLastMessage(broadcastMessage);
            playSound("click"); // Notification sound
        }
    }, [broadcastMessage, lastMessage, playSound]);

    // Handle Global Sounds
    useEffect(() => {
        if (globalSound && globalSound !== lastSound) {
            // Map lifeline codes to sounds
            // 801: Siren, 802: Laugh, 803: Scary, 804: Airhorn
            if (globalSound === 801) playSound("siren");
            if (globalSound === 802) playSound("laugh");
            if (globalSound === 803) playSound("scary");
            if (globalSound === 804) playSound("airhorn");
            if (globalSound === 805) playSound("win");

            setLastSound(globalSound);
        }
    }, [globalSound, lastSound, playSound]);

    // Render Blackout
    if (isBlackout) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-none">
                {/* Tiny flashlight tracking mouse for effect? Optional, keeping it simple black for now */}
                <div className="text-zinc-900 text-[10px] select-none">SYSTEM FAILURE</div>
            </div>
        );
    }

    if (!isPaused) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className="text-center space-y-4 p-8 border border-red-500/50 bg-red-950/20 rounded-xl neon-border border-red-500 max-w-md mx-4">
                <h1 className="text-4xl font-display font-bold text-red-500 animate-pulse">
                    GAME PAUSED
                </h1>
                <p className="text-muted-foreground text-lg">
                    Stand by for instructions from Admin.
                </p>
                <div className="h-1 w-full bg-red-900/50 overflow-hidden rounded-full mt-4">
                    <div className="h-full bg-red-500 animate-[pulse_2s_infinite] w-full origin-left"></div>
                </div>
            </div>
        </div>
    );
};

export default GlobalOverlay;
