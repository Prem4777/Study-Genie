import { createClient } from '@supabase/supabase-js';

// --- PASTE YOUR SUPABASE CREDENTIALS HERE ---
// You can find these in your Supabase project's dashboard under:
// Project Settings > API

// IMPORTANT: This is for development purposes only. In a real-world application,
// you should use environment variables to keep your keys secure and private.
// Never commit your secret keys to a public repository.

const supabaseUrl = '<Put supbase supabase url>'; // Replace with your Supabase project URL
const supabaseKey = '<put supabase anon key>'; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
