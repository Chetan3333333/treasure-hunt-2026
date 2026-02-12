import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bgqzlvkoxqjmgsgclpli.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncXpsdmtveHFqbWdzZ2NscGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDIwNDgsImV4cCI6MjA4NjQxODA0OH0.uLwNX6IqYr_IofmPgj1k3BbukYa_Um4XSkvxRVIm9m8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
