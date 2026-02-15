import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { locationHints } from "@/data/questions";

const GLOBAL_ID = "00000000-0000-0000-0000-000000000000";

interface Participant {
    id: string;
    username: string;
    score: number;
    current_round: number;
    lifelines: number;
    completed: boolean;
    completion_time: number;
}

const getLocationHint = (round: number) => {
    if (round > 4) return "Finish Line";
    return locationHints[round - 1] || "Unknown";
};

const Admin = () => {
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    const checkAuth = () => {
        if (password === "admin123") {
            setAuthenticated(true);
            fetchParticipants();
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

    // ============ GLOBAL SETTINGS ROW ============
    // Ensure the GLOBAL_SETTINGS row exists with the fixed ID
    useEffect(() => {
        if (authenticated) {
            ensureGlobalSettings();
        }
    }, [authenticated]);

    const ensureGlobalSettings = async () => {
        // First, try to read the row by ID
        const { data, error: readError } = await supabase
            .from("participants")
            .select("*")
            .eq("id", GLOBAL_ID)
            .maybeSingle();

        if (readError) {
            console.error("Error reading global settings:", readError);
            toast.error("Failed to read global settings");
            return;
        }

        if (!data) {
            // Row doesn't exist — try to create it with fixed ID
            const { error: insertError } = await supabase
                .from("participants")
                .insert({
                    id: GLOBAL_ID,
                    username: "GLOBAL_SETTINGS",
                    score: 0,
                    lifelines: 999,
                    current_round: 999,
                    completed: false,
                });

            if (insertError) {
                console.error("Error creating global settings row:", insertError);
                toast.error("Failed to create global settings row. Check console.");
            } else {
                toast.success("Global settings row created ✅");
            }
        } else {
            setIsPaused(data.score === 1);
            toast.success("Global settings loaded ✅");
        }
    };

    // ============ GAME ACTIONS ============
    const resetGame = async () => {
        if (!confirm("ARE YOU SURE? This will DELETE all participants/scores.")) return;

        const { error } = await supabase
            .from("participants")
            .delete()
            .neq("id", GLOBAL_ID);

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
        const { error } = await supabase
            .from("participants")
            .update({ lifelines: 4, completed: false })
            .eq("id", id);
        if (error) toast.error("Revive failed");
        else { toast.success("Player Revived! ❤️"); fetchParticipants(); }
    };

    const adjustScore = async (id: string, currentScore: number, amount: number) => {
        const { error } = await supabase
            .from("participants")
            .update({ score: currentScore + amount })
            .eq("id", id);
        if (error) toast.error("Score update failed");
        else { toast.success(`Score ${amount > 0 ? '+' : ''}${amount}`); fetchParticipants(); }
    };

    // ============ GOD MODE: PAUSE / BROADCAST ============
    const togglePause = async () => {
        const newStatus = !isPaused;
        const { error } = await supabase
            .from("participants")
            .update({ score: newStatus ? 1 : 0 })
            .eq("id", GLOBAL_ID);

        if (error) {
            console.error("Pause toggle error:", error);
            toast.error("Pause toggle failed! Check console.");
        } else {
            setIsPaused(newStatus);
            toast.info(newStatus ? "GAME PAUSED ⏸️" : "GAME RESUMED ▶️");
        }
    };

    const sendBroadcast = async () => {
        if (!broadcastMsg.trim()) {
            toast.error("Please type a message first");
            return;
        }

        const message = `📢 ${broadcastMsg.trim()}`;

        // Step 1: Write the broadcast message to GLOBAL_SETTINGS username
        const { error } = await supabase
            .from("participants")
            .update({ username: message })
            .eq("id", GLOBAL_ID);

        if (error) {
            console.error("Broadcast send error:", error);
            toast.error("Broadcast failed! Check console.");
            return;
        }

        toast.success("📢 Broadcast Sent!");
        setBroadcastMsg("");

        // Step 2: Reset username back to GLOBAL_SETTINGS after 10s
        setTimeout(async () => {
            const { error: resetError } = await supabase
                .from("participants")
                .update({ username: "GLOBAL_SETTINGS" })
                .eq("id", GLOBAL_ID);

            if (resetError) {
                console.error("Broadcast reset error:", resetError);
            }
        }, 10000);
    };

    // ============ UI ============
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
                    onKeyDown={e => e.key === "Enter" && checkAuth()}
                />
                <Button onClick={checkAuth}>Login</Button>
            </div>
        );
    }

    // Filter out the GLOBAL_SETTINGS row by ID (not by username!)
    const realParticipants = participants.filter(p => p.id !== GLOBAL_ID);

    return (
        <div className="p-4 md:p-8 min-h-screen bg-background pb-20">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center flex-wrap gap-2">
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
                            onKeyDown={e => e.key === "Enter" && sendBroadcast()}
                        />
                        <Button onClick={sendBroadcast} variant="default">SEND</Button>
                    </div>
                    <div className="flex gap-4 items-center justify-end">
                        <span className="font-mono text-sm">{isPaused ? "STATUS: PAUSED ⏸️" : "STATUS: LIVE 🟢"}</span>
                        <Button
                            onClick={togglePause}
                            variant={isPaused ? "secondary" : "destructive"}
                        >
                            {isPaused ? "RESUME GAME ▶️" : "PAUSE GAME ⏸️"}
                        </Button>
                    </div>
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
                        {realParticipants.map((p) => (
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
    );
};

export default Admin;
