import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface SoundContextType {
    playSound: (type: "click" | "correct" | "wrong" | "scan" | "glitch") => void;
    toggleMute: () => void;
    isMuted: boolean;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
    const ctx = useContext(SoundContext);
    if (!ctx) throw new Error("useSound must be used within a SoundProvider");
    return ctx;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const audioContext = useRef<AudioContext | null>(null);
    const droneNode = useRef<OscillatorNode | null>(null);
    const gainNode = useRef<GainNode | null>(null);

    useEffect(() => {
        // Initialize AudioContext on user interaction if needed (browser policy)
        const initAudio = () => {
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();

                // Setup Ambient Drone (Low frequency saw/sine mix)
                const osc = audioContext.current.createOscillator();
                const gain = audioContext.current.createGain();

                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(50, audioContext.current.currentTime); // 50Hz drone
                gain.gain.setValueAtTime(0.02, audioContext.current.currentTime); // Very low volume

                const filter = audioContext.current.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.setValueAtTime(200, audioContext.current.currentTime);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioContext.current.destination);

                osc.start();
                droneNode.current = osc;
                gainNode.current = gain;
            } else if (audioContext.current.state === "suspended") {
                audioContext.current.resume();
            }
        };

        const handleInteract = () => {
            initAudio();
            window.removeEventListener("click", handleInteract);
            window.removeEventListener("keydown", handleInteract);
        };

        window.addEventListener("click", handleInteract);
        window.addEventListener("keydown", handleInteract);

        return () => {
            window.removeEventListener("click", handleInteract);
            window.removeEventListener("keydown", handleInteract);
            if (droneNode.current) droneNode.current.stop();
            if (audioContext.current) audioContext.current.close();
        };
    }, []);

    useEffect(() => {
        if (gainNode.current) {
            const now = audioContext.current?.currentTime || 0;
            gainNode.current.gain.setTargetAtTime(isMuted ? 0 : 0.02, now, 0.5);
        }
    }, [isMuted]);

    const toggleMute = () => setIsMuted(prev => !prev);

    const playSynthesizedSound = (type: "click" | "correct" | "wrong" | "scan" | "glitch") => {
        if (isMuted || !audioContext.current) return;

        const ctx = audioContext.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case "correct":
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case "wrong":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case "scan":
                osc.type = "square";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1200, now + 0.05);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case "glitch":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(400, now); // Random frequencies for glitch
                osc.frequency.linearRampToValueAtTime(1000, now + 0.05);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case "click":
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
        }
    };

    const playSound = (type: "click" | "correct" | "wrong" | "scan" | "glitch") => {
        playSynthesizedSound(type);

        // Haptics
        if (navigator.vibrate) {
            switch (type) {
                case "correct": navigator.vibrate([100, 50, 100]); break;
                case "wrong": navigator.vibrate(300); break;
                case "scan": navigator.vibrate(50); break;
                case "click": navigator.vibrate(10); break;
            }
        }
    };

    return (
        <SoundContext.Provider value={{ playSound, toggleMute, isMuted }}>
            {children}
        </SoundContext.Provider>
    );
};
