import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import GameHeader from "@/components/GameHeader";

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

        if (error) {
            toast.error("Failed to unlock");
        } else {
            toast.success(`Unlocked Round ${currentRound + 1}`);
            fetchParticipants();
        }
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

    return (
        <div className="p-8 min-h-screen bg-background">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold neon-text">Game Control Center</h1>
                <div className="flex gap-2">
                    <Button onClick={fetchParticipants} variant="outline">Refresh</Button>
                    <Button onClick={resetGame} variant="destructive">RESET GAME</Button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <Table className="border rounded-md">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Location (Hint)</TableHead>
                            <TableHead>Round</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Lifelines</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.username}</TableCell>
                                <TableCell className="text-xs max-w-[200px] truncate" title={getLocationHint(p.current_round)}>
                                    {getLocationHint(p.current_round)}
                                </TableCell>
                                <TableCell>R{p.current_round}</TableCell>
                                <TableCell>{p.score}</TableCell>
                                <TableCell>{p.lifelines}</TableCell>
                                <TableCell>{p.completed ? "🏆 WINNER" : (p.lifelines <= 0 ? "💀 ELIMINATED" : "ACTIVE")}</TableCell>
                                <TableCell>
                                    {!p.completed && p.lifelines > 0 && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => forceNextRound(p.id, p.current_round)}
                                        >
                                            Force Unlock 🔓
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
