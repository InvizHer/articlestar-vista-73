
// This file needs to be updated with your Supabase project credentials.
// Replace the URL and key values with your own from the Supabase dashboard.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ----------------------------------------------------------------
// IMPORTANT: Replace these values with your own Supabase credentials
// ----------------------------------------------------------------
const SUPABASE_URL = "https://acbehoachstpcfnslump.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjYmVob2FjaHN0cGNmbnNsdW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMDI3ODksImV4cCI6MjA1NzY3ODc4OX0.3wonOKq68gG_pLeZWe5JZSnejmqIC5R7qgnwl01N6mY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
