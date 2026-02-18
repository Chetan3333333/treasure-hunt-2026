import { useEffect, useState } from "react";

interface RoundTransitionProps {
    round: number;
    onComplete: () => void;
}

const glitchChars = "01!@#$%&*<>{}[]";
const roundNames = ["", "LOGIC & APTITUDE", "TECH RIDDLES", "RAPID FIRE", "FINAL DSA CHALLENGE"];

const RoundTransition = ({ round, onComplete }: RoundTransitionProps) => {
    const [phase, setPhase] = useState<"glitch" | "reveal" | "fade">("glitch");
    const [glitchText, setGlitchText] = useState("");

    useEffect(() => {
        const target = `ROUND ${round} UNLOCKED`;
        let frame = 0;
        const maxFrames = 12;

        const interval = setInterval(() => {
            frame++;
            if (frame <= maxFrames) {
                // Glitch phase: random characters resolving into real text
                const resolved = Math.floor((frame / maxFrames) * target.length);
                let text = "";
                for (let i = 0; i < target.length; i++) {
                    if (i < resolved) {
                        text += target[i];
                    } else if (target[i] === " ") {
                        text += " ";
                    } else {
                        text += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    }
                }
                setGlitchText(text);
            }
        }, 80);

        // Phase transitions
        setTimeout(() => setPhase("reveal"), maxFrames * 80);
        setTimeout(() => setPhase("fade"), 2200);
        setTimeout(() => onComplete(), 2800);

        return () => clearInterval(interval);
    }, [round, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${phase === "fade" ? "opacity-0" : "opacity-100"
                }`}
        >
            {/* Scan lines overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
            }} />

            {/* Glowing horizontal scan bar */}
            <div
                className="absolute left-0 right-0 h-1 bg-primary/60 blur-sm"
                style={{
                    animation: "scanBar 1.5s ease-in-out infinite",
                    top: phase === "glitch" ? "20%" : "50%",
                }}
            />

            {/* Main text */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="text-primary/40 text-xs font-mono tracking-[0.3em] animate-pulse">
                    ► SYSTEM ACCESS GRANTED
                </div>
                <h1
                    className={`font-display text-3xl md:text-4xl tracking-[0.2em] transition-all duration-500 ${phase === "glitch"
                            ? "text-primary/70 blur-[1px]"
                            : "text-primary neon-text blur-0"
                        }`}
                    style={{ fontFamily: "monospace" }}
                >
                    {phase === "reveal" || phase === "fade"
                        ? `ROUND ${round} UNLOCKED`
                        : glitchText}
                </h1>
                <div
                    className={`text-muted-foreground text-sm font-display tracking-wider transition-all duration-500 ${phase === "reveal" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                >
                    {roundNames[round]}
                </div>

                {/* Decorative corners */}
                <div className="absolute -top-8 -left-8 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
                <div className="absolute -top-8 -right-8 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
                <div className="absolute -bottom-8 -left-8 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
                <div className="absolute -bottom-8 -right-8 w-6 h-6 border-b-2 border-r-2 border-primary/50" />
            </div>
        </div>
    );
};

export default RoundTransition;
