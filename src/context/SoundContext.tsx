import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface SoundContextType {
    playSound: (name: "click" | "success" | "scary" | "laugh" | "win" | "siren" | "airhorn" | "wrong") => void;
    toggleMute: () => void;
    isMuted: boolean;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error("useSound must be used within a SoundProvider");
    return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        // Preload sounds
        const sounds = {
            click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
            success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
            scary: "https://assets.mixkit.co/active_storage/sfx/378/378-preview.mp3", // Ambient Drone
            laugh: "https://assets.mixkit.co/active_storage/sfx/416/416-preview.mp3", // Evil Laugh
            win: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
            siren: "https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3", // Siren
            airhorn: "https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3", // Airhorn-ish
            wrong: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3" // Error sound
        };

        Object.entries(sounds).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.preload = "auto";
            audioRefs.current[key] = audio;
        });
    }, []);

    const playSound = (name: keyof typeof audioRefs.current) => {
        if (isMuted) return;
        const audio = audioRefs.current[name];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <SoundContext.Provider value={{ playSound, toggleMute, isMuted }}>
            {children}
        </SoundContext.Provider>
    );
};
