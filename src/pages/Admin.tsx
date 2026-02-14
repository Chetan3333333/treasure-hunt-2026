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

    // In a real app, verify on server. Here just simple client-side check.
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

    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    // Initialize Global Settings Row
    useEffect(() => {
        if (authenticated) {
            checkGlobalSettings();
        }
    }, [authenticated]);

    const checkGlobalSettings = async () => {
        // Use ID to find the row, even if username (broadcast msg) changes
        const { data } = await supabase
            .from("participants")
            .select("*")
            .eq("id", "00000000-0000-0000-0000-000000000000") // Fixed ID
            .maybeSingle();

        if (!data) {
            // Create if missing with FIXED ID
            await supabase.from("participants").insert({
                id: "00000000-0000-0000-0000-000000000000",
                username: "GLOBAL_SETTINGS",
                score: 0,
                lifelines: 999,
                current_round: 999
            });
        } else {
            setIsPaused(data.score === 1);
        }
    };

    const togglePause = async () => {
        const newStatus = !isPaused;
        // Use upsert to ensure row exists
        const { error } = await supabase
            .from("participants")
            .upsert({
                id: "00000000-0000-0000-0000-000000000000",
                score: newStatus ? 1 : 0,
                username: "GLOBAL_SETTINGS", // Reset name just in case
                lifelines: 999,
                current_round: 999
            });

        if (error) {
            toast.error("Action failed: " + error.message);
        } else {
            setIsPaused(newStatus);
            toast.info(newStatus ? "GAME PAUSED ⏸️" : "GAME RESUMED ▶️");
        }
    };

    const sendBroadcast = async () => {
        if (!broadcastMsg) return;

        // 1. Send Message via UPSERT (creates row if missing)
        const { error } = await supabase
            .from("participants")
            .upsert({
                id: "00000000-0000-0000-0000-000000000000",
                username: `📢 ${broadcastMsg}`,
                // Preserve existing pause state if possible, or default to current local state
                score: isPaused ? 1 : 0,
                lifelines: 999,
                current_round: 999
            });

        if (error) {
            toast.error("Broadcast failed: " + error.message);
            return;
        }

        toast.success("Broadcast Sent!");

        // 2. Clear after 8s
        setTimeout(async () => {
            await supabase
                .from("participants")
                .upsert({
                    id: "00000000-0000-0000-0000-000000000000",
                    username: "GLOBAL_SETTINGS",
                    score: isPaused ? 1 : 0,
                    lifelines: 999,
                    current_round: 999
                });
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

    // DIAGNOSIS STATE
    const [diagStatus, setDiagStatus] = useState<string>("Ready");
    const [diagLogs, setDiagLogs] = useState<string[]>([]);

    const runDiagnosis = async () => {
        setDiagStatus("Running...");
        setDiagLogs([]);
        const logs: string[] = [];
        const log = (msg: string) => { logs.push(msg); setDiagLogs([...logs]); };

        try {
            log("1. Checking Supabase Connection...");
            const { count, error: countErr } = await supabase.from("participants").select("*", { count: "exact", head: true });
            if (countErr) throw new Error("Connection Failed: " + countErr.message);
            log(`✅ Connected. Rows: ${count}`);

            log("2. Checking Global Settings Row...");
            const { data: globalRow, error: fetchErr } = await supabase
                .from("participants")
                .select("*")
                .eq("id", "00000000-0000-0000-0000-000000000000")
                .maybeSingle();

            if (fetchErr) throw new Error("Fetch Failed: " + fetchErr.message);

            if (!globalRow) {
                log("⚠️ Global Row MISSING. Attempting creation...");
                const { error: createErr } = await supabase.from("participants").insert({
                    id: "00000000-0000-0000-0000-000000000000",
                    username: "GLOBAL_SETTINGS",
                    score: 0,
                    lifelines: 999,
                    current_round: 999
                });
                if (createErr) throw new Error("Creation Failed: " + createErr.message);
                log("✅ Global Row Created.");
            } else {
                log(`✅ Global Row READY. Score: ${globalRow.score}, Name: ${globalRow.username}`);
            }

            log("3. Testing Update...");
            const { error: updateErr } = await supabase
                .from("participants")
                .update({ current_round: 999 }) // Harmless update
                .eq("id", "00000000-0000-0000-0000-000000000000");

            if (updateErr) throw new Error("Update Failed: " + updateErr.message);
            log("✅ Update Verified.");

            setDiagStatus("✅ SYSTEM OPTIMAL");
        } catch (e: any) {
            log("❌ ERROR: " + e.message);
            setDiagStatus("❌ SYSTEM FAILURE");
        }
    };

    return (
        <div className="p-8 min-h-screen bg-background pb-20">
            {/* DIAGNOSIS PANEL */}
            <div className="mb-8 p-4 border border-zinc-700 rounded bg-zinc-900/50">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-zinc-400">🔧 SYSTEM DIAGNOSTICS</h3>
                    <Button onClick={runDiagnosis} size="sm" variant="outline">RUN CHECK</Button>
                </div>
                <div className="font-mono text-xs text-green-400 bg-black p-2 rounded h-32 overflow-y-auto border border-zinc-800">
                    <div className="text-zinc-500">Status: {diagStatus}</div>
                    {diagLogs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>

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
                        <span className="font-mono text-sm">{isPaused ? "STATUS: PAUSED ⏸️" : "STATUS: LIVE 🟢"}</span>
                        <Button
                            onClick={togglePause}
                            variant={isPaused ? "secondary" : "destructive"}
                        >
                            {isPaused ? "RESUME GAME ▶️" : "PAUSE GAME ⏸️"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                const { error } = await supabase.from("participants").upsert({
                                    id: "00000000-0000-0000-0000-000000000000",
                                    username: "GLOBAL_SETTINGS"
                                });
                                if (error) alert("GOD MODE ERROR: " + error.message);
                                else alert("GOD MODE CONNECTED! ✅");
                            }}
                        >
                            Test 🛠️
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
                        {participants.filter(p => p.username !== "GLOBAL_SETTINGS").map((p) => (
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

// Helper for location
import { locationHints } from "@/data/questions";
const getLocationHint = (round: number) => {
    if (round > 4) return "Finish Line";
    return locationHints[round - 1] || "Unknown";
};

export default Admin;
