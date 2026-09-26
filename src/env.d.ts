/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do projeto Supabase (ex.: https://abcdefgh.supabase.co). */
  readonly VITE_SUPABASE_URL?: string;
  /** Chave pública (anon) do projeto Supabase. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
