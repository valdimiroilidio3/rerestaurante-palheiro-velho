import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * A base de dados é opcional: sem variáveis de ambiente o site continua a
 * funcionar com o conteúdo de origem (`src/content/defaults.ts`).
 */
export const supabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;

/** Nome do bucket onde ficam as fotografias submetidas pelo painel. */
export const MEDIA_BUCKET = "media";
