import { useEffect, useState } from "react";

interface ScoreChange {
    id: number;
    points: number;
}

let nextId = 0;

const ScorePopup = () => {
    const [changes, setChanges] = useState<ScoreChange[]>([]);

    useEffect(() => {
        const handler = (e: CustomEvent<{ points: number }>) => {
            const id = nextId++;
            setChanges(prev => [...prev, { id, points: e.detail.points }]);
            setTimeout(() => {
                setChanges(prev => prev.filter(c => c.id !== id));
            }, 1200);
        };

        window.addEventListener("score-change", handler as EventListener);
        return () => window.removeEventListener("score-change", handler as EventListener);
    }, []);

    return (
        <div className="fixed top-14 right-4 z-[200] pointer-events-none flex flex-col items-end gap-1">
            {changes.map(c => (
                <div
                    key={c.id}
                    className={`score-fly font-display text-lg font-bold tracking-wider ${c.points >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                >
                    {c.points >= 0 ? `+${c.points}` : c.points}
                </div>
            ))}
        </div>
    );
};

export default ScorePopup;
