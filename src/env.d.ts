/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do projeto Supabase (ex.: https://abcdefgh.supabase.co). */
  readonly VITE_SUPABASE_URL?: string;
  /** Chave pública (anon) do projeto Supabase. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Sal do acesso único, gerado por `scripts/set-admin-password.mjs`. */
  readonly VITE_ADMIN_SALT?: string;
  /** Resumo do token de acesso — nunca a palavra-passe. */
  readonly VITE_ADMIN_TOKEN_HASH?: string;
  /** Endereço público do site (para sitemap, canonical e partilhas). */
  readonly VITE_SITE_URL?: string;
  /** "1" para servir as fotografias do Storage com reduções por largura. */
  readonly VITE_SUPABASE_TRANSFORM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
