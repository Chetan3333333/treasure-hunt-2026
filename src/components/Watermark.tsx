import React from "react";
import { useGame } from "@/context/GameContext";

const Watermark = () => {
    const { team_id } = useGame();
    const [time, setTime] = React.useState(new Date().toLocaleTimeString());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden opacity-[0.08] select-none flex flex-wrap content-start">
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="text-xs font-mono p-8 text-primary rotate-[-15deg]">
                    {team_id || "GLITCH_PROTOCOL"} <br /> {time}
                </div>
            ))}
        </div>
    );
};

export default Watermark;
