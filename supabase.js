/* ═══════════════════════════════════════════
   Lumira — Supabase Client
   ═══════════════════════════════════════════ */

// ─── CONFIGURATION ───
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://djjezimrehgegrjosebe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cJeMSOVCHqBfUTUM7zmTSg_9tx8r_7x'; // Using the modern publishable key

// ─── CLIENT INIT ───
console.log('Supabase.js: Initializing with', SUPABASE_URL);
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.lumiraSupabase = supabase;
console.log('Supabase.js: Client created and assigned to window.lumiraSupabase');
