import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSession } from "@/admin/lib/session";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * A base de dados é opcional: sem variáveis de ambiente o site continua a
 * funcionar com o conteúdo de origem (`src/content/defaults.ts`).
 */
export const supabaseEnabled = Boolean(url && anonKey);

/** URL e chave pública, para pedidos diretos ao Storage (ver admin/lib/uploads). */
export const supabaseUrl = url ?? "";
export const supabaseAnonKey = anonKey ?? "";

/** Cabeçalho com o token de acesso, validado pela função `public.is_admin()`. */
export const ADMIN_HEADER = "x-admin-token";

/**
 * O token é lido antes de criar o cliente, para que todos os pedidos de
 * escrita já saiam com ele. Depois de entrar no painel a página é recarregada
 * precisamente para garantir isto.
 */
let adminToken: string | null = readSession()?.token ?? null;

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anonKey as string, {
      // sem autenticação por utilizador: o acesso é único e controlado por token
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 5 } },
      global: {
        headers: adminToken ? { [ADMIN_HEADER]: adminToken } : {},
      },
    })
  : null;

/**
 * Guarda o token em memória (usado nos pedidos diretos ao Storage).
 * Alterar o token a meio implica recarregar a página, para o cliente ser
 * recriado com o cabeçalho certo.
 */
export function setAdminToken(token: string | null): void {
  adminToken = token;
}

export const getAdminToken = () => adminToken;

/** Nome do bucket onde ficam as fotografias submetidas pelo painel. */
export const MEDIA_BUCKET = "media";
