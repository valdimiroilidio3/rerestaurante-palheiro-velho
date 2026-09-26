import { setAdminToken } from "@/lib/supabase";
import { clearSession, readSession, writeSession } from "@/admin/lib/session";

/**
 * Acesso único ao painel.
 *
 * Não há criação de contas nem recuperação por email: existe um único par
 * utilizador/palavra-passe, definido por `scripts/set-admin-password.mjs`.
 *
 * A palavra-passe nunca é guardada nem enviada:
 *   1. é esticada com PBKDF2-SHA256 (200 000 iterações), com o utilizador a
 *      entrar no sal, o que produz o token de acesso;
 *   2. no repositório fica apenas o resumo SHA-256 desse token (`VITE_ADMIN_TOKEN_HASH`);
 *   3. o token — nunca a palavra-passe — segue em cada pedido de escrita, no
 *      cabeçalho `x-admin-token`, e é validado na base de dados pela função
 *      `public.is_admin()` (ver supabase/migrations).
 */

/* Manter em sincronia com scripts/set-admin-password.mjs */
const ITERATIONS = 200_000;
const KEY_LENGTH = 32;

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

async function pbkdf2(password: string, salt: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: ITERATIONS },
    key,
    KEY_LENGTH * 8,
  );
  return new Uint8Array(bits);
}

const sha256 = async (value: string) =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

/** Token de acesso derivado das credenciais. */
export async function deriveToken(username: string, password: string): Promise<string> {
  const salt = import.meta.env.VITE_ADMIN_SALT ?? "";
  return toBase64Url(await pbkdf2(password, `${salt}:${username}`));
}

/** O painel só tem acesso definido se o sal e o resumo estiverem configurados. */
export const accessConfigured = () =>
  Boolean(import.meta.env.VITE_ADMIN_SALT && import.meta.env.VITE_ADMIN_TOKEN_HASH);

/**
 * Confirma as credenciais sem falar com a base de dados: compara o resumo do
 * token derivado com o resumo guardado nas variáveis de ambiente.
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (!accessConfigured() || !username || !password) return false;
  const expected = import.meta.env.VITE_ADMIN_TOKEN_HASH ?? "";
  const actual = toHex(await sha256(await deriveToken(username, password)));
  if (actual.length !== expected.length) return false;
  // comparação de comprimento constante (evita fugas por tempo de resposta)
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/* ————————————————————————————— sessão ————————————————————————————— */

/**
 * Abre a sessão. O token fica guardado para o cliente da base de dados o
 * enviar em cada pedido de escrita — nunca a palavra-passe.
 */
export function startSession(token: string): void {
  writeSession(token);
  setAdminToken(token);
}

/** Termina a sessão e limpa o token dos pedidos. */
export function endSession(): void {
  clearSession();
  setAdminToken(null);
}

/** Restaura a sessão ao recarregar a página, se ainda estiver dentro do prazo. */
export function restoreSession(): boolean {
  const session = readSession();
  if (!session) return false;
  setAdminToken(session.token);
  return true;
}
