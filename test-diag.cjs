const { createClient } = require("@supabase/supabase-js");
const s = createClient(
    "https://bgqzlvkoxqjmgsgclpli.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncXpsdmtveHFqbWdzZ2NscGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDIwNDgsImV4cCI6MjA4NjQxODA0OH0.uLwNX6IqYr_IofmPgj1k3BbukYa_Um4XSkvxRVIm9m8"
);
const GID = "00000000-0000-0000-0000-000000000000";
const fs = require("fs");

async function main() {
    let log = "";
    function l(msg) { log += msg + "\n"; }

    const { data: row } = await s.from("participants").select("*").eq("id", GID).maybeSingle();
    l("GLOBAL ROW EXISTS: " + (row ? "YES" : "NO"));
    if (row) l("GLOBAL ROW: " + JSON.stringify(row));

    const { data: all } = await s.from("participants").select("id, username, score, completed");
    l("ALL ROWS:");
    if (all) all.forEach(r => l("  " + r.id + " | " + r.username + " | " + r.score));

    // Try insert with fixed ID if missing
    if (!row) {
        l("TRYING INSERT WITH FIXED ID...");
        const { data: i1, error: e1 } = await s.from("participants")
            .insert({ id: GID, username: "GLOBAL_SETTINGS", score: 0, completed: false })
            .select().single();
        l("INSERT RESULT: " + JSON.stringify(i1));
        l("INSERT ERROR: " + (e1 ? JSON.stringify(e1) : "none"));
    }

    fs.writeFileSync("diag-output.txt", log);
    console.log(log);
}
main();
