import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
// Cleaned up imports

interface SecurityConfig {
    maxLifelines: number;
    onPenalty: () => void;
    gameActive: boolean;
}

export const useGameSecurity = ({ maxLifelines, onPenalty, gameActive }: SecurityConfig) => {
    const { toast } = useToast();
    const [graceTimer, setGraceTimer] = useState<NodeJS.Timeout | null>(null);

    const handleVisibilityChange = useCallback(() => {
        if (!gameActive) return;

        if (document.hidden) {
            // User left the tab
            console.warn("Security Breach: Tab Switch Detected");
            const timer = setTimeout(() => {
                onPenalty();
                toast({
                    variant: "destructive",
                    title: "SECURITY VIOLATION",
                    description: "Focus lost for too long. Lifeline deducted.",
                });
            }, 5000); // 5 seconds grace period
            setGraceTimer(timer);

            toast({
                variant: "destructive",
                title: "WARNING: RETURN IMMEDIATELY",
                description: "You have 5 seconds to return before penalty.",
                duration: 5000,
            });
        } else {
            // User returned
            if (graceTimer) {
                clearTimeout(graceTimer);
                setGraceTimer(null);
                toast({
                    title: "Connection Restored",
                    description: "Security breach averted.",
                });
            }
        }
    }, [gameActive, graceTimer, onPenalty, toast]);

    const handleBlur = useCallback(() => {
        if (!gameActive) return;
        // Similar logic to visibility change, can be combined or treated separately
        // For now, treating same as visibility change for simplicity in this implementation
        // But often blur fires on simple clicks like notification shade interactions
        // So might want to be less aggressive or same logic.
        // Let's rely mainly on visibilityChange for mobile tab switching which is the main "cheat" vector.
        // Blur can be annoying on desktop if multi-monitor but on mobile it happens when switching apps too.
        // Just logging for now to not be too aggressive with double penalties if visibility also triggers.
        console.log("Window Blur Detected");
    }, [gameActive]);


    useEffect(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        // Disable context menu
        const handleContext = (e: Event) => e.preventDefault();
        document.addEventListener("contextmenu", handleContext);


        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("contextmenu", handleContext);
            if (graceTimer) clearTimeout(graceTimer);
        };
    }, [handleVisibilityChange, handleBlur, graceTimer]);

    return {};
};
