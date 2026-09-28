/**
 * Define (ou muda) o acesso único ao painel.
 *
 *   node scripts/set-admin-password.mjs <utilizador> <palavra-passe> [--write]
 *
 * O que fica gravado não é a palavra-passe:
 *   1. a palavra-passe é esticada com PBKDF2-SHA256 (200 000 iterações) e o
 *      utilizador entra no sal — dá o "token" de acesso;
 *   2. guarda-se só a resumo SHA-256 desse token.
 *
 * Quem abrir o repositório vê um sal e um resumo — nunca a palavra-passe.
 * Sem `--write` o script apenas mostra as linhas para meter no .env.
 */
import { pbkdf2Sync, randomBytes, createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const [username, password, ...flags] = process.argv.slice(2);

if (!username || !password) {
  console.error("Uso: node scripts/set-admin-password.mjs <utilizador> <palavra-passe> [--write]");
  process.exit(1);
}

/** Mantido em sincronia com src/admin/lib/access.ts */
const ITERATIONS = 200_000;
const KEY_LENGTH = 32;

const deriveToken = (user, pass, salt) =>
  pbkdf2Sync(pass, `${salt}:${user}`, ITERATIONS, KEY_LENGTH, "sha256");

const salt = randomBytes(16).toString("base64url");
const token = deriveToken(username, password, salt).toString("base64url");
const hash = createHash("sha256").update(token).digest("hex");

const lines = [`VITE_ADMIN_SALT=${salt}`, `VITE_ADMIN_TOKEN_HASH=${hash}`];
const env = lines.join("\n") + "\n";

if (!flags.includes("--write")) {
  console.log("# acrescentar ao .env.local (e às variáveis de ambiente do alojamento):");
  console.log(env);
  console.log("# o utilizador e a palavra-passe não são guardados em lado nenhum.");
  process.exit(0);
}

const path = new URL("../.env.local", import.meta.url);
let current = "";
try {
  current = await readFile(path, "utf8");
} catch {
  current = "";
}

const withoutAdmin = current
  .split("\n")
  .filter((line) => !line.startsWith("VITE_ADMIN_SALT=") && !line.startsWith("VITE_ADMIN_TOKEN_HASH="))
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trimStart();

const next = `${withoutAdmin}${withoutAdmin && !withoutAdmin.endsWith("\n") ? "\n" : ""}${env}`;
await writeFile(path, next, "utf8");
console.log(`.env.local atualizado — acesso único definido (sem palavra-passe em texto limpo).`);
