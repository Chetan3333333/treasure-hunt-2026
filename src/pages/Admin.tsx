import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Participant {
    id: string;
    username: string;
    score: number;
    current_round: number;
    lifelines: number;
    completed: boolean;
    completion_time: number;
}

const Admin = () => {
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    // In a real app, verify on server. Here just simple client-side check.
    const checkAuth = () => {
        if (password === "admin123") {
            setAuthenticated(true);
            fetchParticipants();
            checkGlobalSettings(); // Check immediately on login
        } else {
            toast.error("Invalid Password");
        }
    };

    const fetchParticipants = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("participants")
            .select("*")
            .order("score", { ascending: false });

        if (error) {
            toast.error("Failed to fetch data");
            console.error(error);
        } else {
            setParticipants(data);
        }
        setLoading(false);
    };

    // Ensure the God Mode row exists
    const checkGlobalSettings = async () => {
        // 1. Try to find the settings row
        const { data } = await supabase
            .from("participants")
            .select("*")
            .eq("id", "00000000-0000-0000-0000-000000000000") // Fixed ID
            .maybeSingle();

        // 2. If missing, create it once.
        if (!data) {
            console.log("Creating Global Settings Row...");
            const { error } = await supabase.from("participants").insert({
                id: "00000000-0000-0000-0000-000000000000",
                username: "GLOBAL_SETTINGS",
                score: 0,
                lifelines: 999,
                current_round: 999
            });
            if (error) {
                console.error("Failed to init Global Settings", error);
                toast.error("Init Failed: " + error.message);
            } else {
                toast.success("System Initialized 📡");
            }
        } else {
            // Check current numeric states for UI sync
            setIsPaused(data.score === 1 || data.score === 2);
        }
    };

    // Initialize Global Settings Row when mounting/auth changes
    useEffect(() => {
        if (authenticated) {
            checkGlobalSettings();

            // Auto-refresh stats every 5s
            const interval = setInterval(fetchParticipants, 5000);
            return () => clearInterval(interval);
        }
    }, [authenticated]);


    const resetGame = async () => {
        if (!confirm("ARE YOU SURE? This will DELETE all participants/scores.")) return;

        const { error } = await supabase
            .from("participants")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

        if (error) {
            toast.error("Reset failed");
        } else {
            toast.success("Game Reset for Everyone");
            fetchParticipants();
        }
    };

    const forceNextRound = async (id: string, currentRound: number) => {
        const { error } = await supabase
            .from("participants")
            .update({ current_round: currentRound + 1 })
            .eq("id", id);
        if (error) toast.error("Failed to unlock");
        else { toast.success(`Unlocked Round ${currentRound + 1}`); fetchParticipants(); }
    };

    const revivePlayer = async (id: string) => {
        const { error } = await supabase.from("participants").update({ lifelines: 4, completed: false }).eq("id", id);
        if (error) toast.error("Revive failed"); else { toast.success("Player Revived! ❤️"); fetchParticipants(); }
    };

    const adjustScore = async (id: string, currentScore: number, amount: number) => {
        const { error } = await supabase.from("participants").update({ score: currentScore + amount }).eq("id", id);
        if (error) toast.error("Score update failed"); else { toast.success(`Score ${amount > 0 ? '+' : ''}${amount}`); fetchParticipants(); }
    };

    const togglePause = async () => {
        // Toggle between 0 (Live) and 1 (Paused). 
        const newStatus = !isPaused;
        const newScore = newStatus ? 1 : 0;

        // Update ONLY score.
        const { error } = await supabase
            .from("participants")
            .update({ score: newScore })
            .eq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            toast.error("Pause Action Failed: " + error.message);
        } else {
            setIsPaused(newStatus);
            toast.info(newStatus ? "GAME PAUSED ⏸️" : "GAME RESUMED ▶️");
        }
    };

    const sendBroadcast = async () => {
        if (!broadcastMsg) return;

        // Update ONLY username
        const { error } = await supabase
            .from("participants")
            .update({ username: `📢 ${broadcastMsg}` })
            .eq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            toast.error("Broadcast Failed: " + error.message);
            return;
        }

        toast.success("Broadcast Sent!");

        // Clear after 8s
        setTimeout(async () => {
            await supabase
                .from("participants")
                .update({ username: "GLOBAL_SETTINGS" })
                .eq("id", "00000000-0000-0000-0000-000000000000");
        }, 8000);

        setBroadcastMsg("");
    };

    if (!authenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-xl font-bold">Admin Access</h1>
                <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter Passkey"
                    className="max-w-xs"
                />
                <Button onClick={checkAuth}>Login</Button>
            </div>
        );
    }

    // Helper to get global state from participants list
    const globalState = participants.find(p => p.id === "00000000-0000-0000-0000-000000000000");
    const isBlackout = globalState?.score === 2;

    return (
        <div className="p-8 min-h-screen bg-background pb-20">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold neon-text">Game Control Center</h1>
                    <div className="flex gap-2">
                        <Button onClick={fetchParticipants} variant="outline">Refresh</Button>
                        <Button onClick={resetGame} variant="destructive">RESET GAME</Button>
                    </div>
                </div>

                {/* GOD MODE CONTROLS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-primary/20">
                    <div className="flex gap-2 items-center">
                        <Input
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            placeholder="📢 Broadcast Message to All..."
                        />
                        <Button onClick={sendBroadcast} variant="default">SEND</Button>
                    </div>
                    <div className="flex gap-4 items-center justify-end">
                        <div className="text-right">
                            <div className="font-mono text-xs text-muted-foreground">STATUS</div>
                            <div className={`font-bold ${isPaused ? "text-red-500" : "text-green-500"}`}>
                                {isPaused ? "PAUSED ⏸️" : (isBlackout ? "BLACKOUT 🌑" : "LIVE 🟢")}
                            </div>
                        </div>

                        {/* Toggle Pause */}
                        <Button
                            onClick={togglePause}
                            variant={isPaused ? "secondary" : "destructive"}
                            size="sm"
                        >
                            {isPaused ? "RESUME" : "PAUSE"}
                        </Button>

                        {/* Toggle Blackout (Status 2) */}
                        <Button
                            onClick={async () => {
                                const newScore = isBlackout ? 0 : 2; // Toggle Blackout

                                const { error } = await supabase
                                    .from("participants")
                                    .update({ score: newScore })
                                    .eq("id", "00000000-0000-0000-0000-000000000000");

                                if (error) toast.error("Blackout Failed");
                                else {
                                    setIsPaused(newScore !== 0);
                                    fetchParticipants(); // Refresh local list to see change
                                    toast.info(newScore === 2 ? "BLACKOUT ACTIVATED 🌑" : "BLACKOUT ENDED ☀️");
                                }
                            }}
                            variant="outline"
                            className="border-purple-500 text-purple-500 hover:bg-purple-950"
                            size="sm"
                        >
                            BLACKOUT
                        </Button>
                    </div>
                </div>

                {/* ADVANCED ADMIN: Soundboard & Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SOUNDBOARD */}
                    <div className="bg-muted/20 p-4 rounded-lg border border-yellow-500/20">
                        <h3 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">ðŸŽµ LIVE SFX</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { verify: 801, label: "🚨 Siren", color: "bg-red-900/50 hover:bg-red-800" },
                                { verify: 802, label: "🤡 Laugh", color: "bg-purple-900/50 hover:bg-purple-800" },
                                { verify: 803, label: "👻 Scary", color: "bg-zinc-800 hover:bg-zinc-700" },
                                { verify: 804, label: "📣 Airhorn", color: "bg-green-900/50 hover:bg-green-800" },
                                { verify: 805, label: "🏆 Win", color: "bg-yellow-900/50 hover:bg-yellow-800" },
                                { verify: 999, label: "🔇 Stop", color: "border border-red-500 text-red-500 hover:bg-red-950" },
                            ].map(sound => (
                                <button
                                    key={sound.verify}
                                    onClick={async () => {
                                        // Update ONLY lifelines for sound trigger
                                        const { error } = await supabase
                                            .from("participants")
                                            .update({ lifelines: sound.verify })
                                            .eq("id", "00000000-0000-0000-0000-000000000000");

                                        if (error) toast.error("Sound failed: " + error.message);
                                        else toast.success(`Playing ${sound.label}`);
                                    }}
                                    className={`p-2 rounded text-xs font-bold transition-all active:scale-95 ${sound.color}`}
                                >
                                    {sound.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LIVE ANALYTICS */}
                    <div className="bg-muted/20 p-4 rounded-lg border border-blue-500/20">
                        <h3 className="text-blue-500 font-bold mb-3 flex items-center gap-2">📊 LIVE PROGRESS</h3>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(round => {
                                const count = participants.filter(p => p.username !== "GLOBAL_SETTINGS" && p.current_round === round && !p.completed).length;
                                const winners = participants.filter(p => round === 5 && p.completed).length;
                                const displayCount = round === 5 ? winners : count;
                                const label = round === 5 ? "🏆 Winners" : `Round ${round}`;
                                const barColor = round === 5 ? "bg-yellow-500" : "bg-blue-500";

                                return (
                                    <div key={round} className="flex items-center gap-2 text-xs">
                                        <div className="w-16 font-mono text-muted-foreground">{label}</div>
                                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${barColor} transition-all duration-500`}
                                                style={{ width: `${(displayCount / (participants.length || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <div className="w-6 text-right font-bold">{displayCount}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* QR CODES CHEAT SHEET */}
                <div className="p-4 rounded-lg border border-zinc-800 bg-black/20">
                    <h3 className="text-zinc-500 font-bold mb-2 text-xs uppercase tracking-widest">QR Reference</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] font-mono text-zinc-400">
                        <div>R1: library_entrance</div>
                        <div>R2: cafeteria_main</div>
                        <div>R3: sports_complex</div>
                        <div>R4: main_auditorium</div>
                        <div>R5: admin_block</div>
                    </div>
                </div>

                {loading ? <p>Loading...</p> : (
                    <Table className="border rounded-md bg-card/50">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Round</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Lifelines</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>God Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {participants.filter(p => p.id !== "00000000-0000-0000-0000-000000000000").map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.username}</TableCell>
                                    <TableCell className="text-xs max-w-[150px] truncate" title={getLocationHint(p.current_round)}>
                                        {getLocationHint(p.current_round)}
                                    </TableCell>
                                    <TableCell>R{p.current_round}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {p.score}
                                            <div className="flex flex-col">
                                                <button onClick={() => adjustScore(p.id, p.score, 10)} className="text-[10px] bg-green-900 px-1 rounded hover:bg-green-700">▲</button>
                                                <button onClick={() => adjustScore(p.id, p.score, -10)} className="text-[10px] bg-red-900 px-1 rounded hover:bg-red-700">▼</button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{p.lifelines}</TableCell>
                                    <TableCell>{p.completed ? "🏆 WINNER" : (p.lifelines <= 0 ? "💀 DEAD" : "ALIVE")}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {!p.completed && p.lifelines > 0 && (
                                            <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => forceNextRound(p.id, p.current_round)}>
                                                Skip ⏩
                                            </Button>
                                        )}
                                        {p.lifelines <= 0 && (
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-green-500 text-green-500 hover:bg-green-900" onClick={() => revivePlayer(p.id)}>
                                                Revive ❤️
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};

// Helper for location
import { locationHints } from "@/data/questions";
const getLocationHint = (round: number) => {
    if (round > 4) return "Finish Line";
    return locationHints[round - 1] || "Unknown";
};

export default Admin;
