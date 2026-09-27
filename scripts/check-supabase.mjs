#!/usr/bin/env node
/**
 * Diagnóstico da base de dados.
 *
 *   npm run db:check
 *   node scripts/check-supabase.mjs --password <palavra-passe>
 *   ADMIN_PASSWORD=... npm run db:check
 *
 * Diz o que está bem e o que falta. Com a palavra-passe do painel, faz um
 * envio de fotografia a sério (e apaga-a a seguir) — é a prova de que as
 * fotos da casa vão mesmo para o Storage e aparecem no site.
 */
import { createHash } from "node:crypto";
import { pbkdf2Sync } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

/* ————————————————————————————— ambiente ————————————————————————————— */

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] === undefined) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

loadEnv(".env.local");
loadEnv(".env");

const url = (process.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
const salt = (process.env.VITE_ADMIN_SALT ?? "").trim();
const tokenHash = (process.env.VITE_ADMIN_TOKEN_HASH ?? "").trim();

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const username = flag("user") ?? flag("utilizador") ?? "";
const password = flag("password") ?? flag("palavra-passe") ?? process.env.ADMIN_PASSWORD ?? "";

/* ————————————————————————————— saída ————————————————————————————— */

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const OFF = "\x1b[0m";

const results = [];
const say = (status, label, detail = "") => {
  const mark =
    status === "ok" ? `${GREEN}✓${OFF}` : status === "aviso" ? `${YELLOW}!${OFF}` : `${RED}✗${OFF}`;
  console.log(` ${mark} ${label}${detail ? ` ${DIM}— ${detail}${OFF}` : ""}`);
  results.push(status);
};

const title = (text) => console.log(`\n${text}`);

/* ————————————————————————————— verificações ————————————————————————————— */

const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };

const TABLES = [
  "site_settings",
  "menu_categories",
  "dishes",
  "gallery_images",
  "instagram_posts",
  "intro_images",
  "intro_facts",
  "experience_panels",
  "events",
  "media",
];

const mask = (key) => (key ? `${key.slice(0, 6)}…${key.slice(-4)}` : "—");

/** Deriva o token de acesso tal como o painel faz. */
function deriveToken(user, pass) {
  const derived = pbkdf2Sync(pass, `${salt}:${user}`, 200_000, 32, "sha256").toString("base64url");
  return derived;
}

async function main() {
  console.log("\nPalheiro Velho · diagnóstico da base de dados");

  title("Ambiente");
  if (!url || !anonKey) {
    say("falha", "Variáveis de ambiente", "falta VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY");
    console.log(
      `\n${DIM}Copie .env.example para .env.local e preencha as duas variáveis (Project Settings → API).${OFF}`,
    );
    return 1;
  }
  say("ok", "Projeto", `${new URL(url).host} · chave ${mask(anonKey)}`);

  title("Leitura (o que o site faz)");
  let reachable = true;
  const broken = [];
  for (const table of TABLES) {
    let ok = false;
    let detail = "";
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
      ok = res.ok;
      if (!ok) {
        const body = await res.json().catch(() => null);
        detail = body?.message ?? `resposta ${res.status}`;
      }
    } catch (err) {
      detail = err instanceof Error ? err.message : "sem ligação";
    }
    if (!ok) {
      broken.push(`${table}${detail ? ` (${detail})` : ""}`);
      if (broken.length === 1) reachable = false;
    }
  }
  if (broken.length === 0) say("ok", "Tabelas", `${TABLES.length} tabelas legíveis`);
  else say("falha", "Tabelas", `em falta ou sem leitura: ${broken.join(", ")}`);

  if (reachable) {
    // conteúdo carregado?
    try {
      const res = await fetch(`${url}/rest/v1/site_settings?id=eq.main&select=id`, { headers });
      const rows = (await res.json().catch(() => [])) ?? [];
      if (rows.length) say("ok", "Conteúdo", "as definições do site estão na base de dados");
      else say("aviso", "Conteúdo", "sem conteúdo carregado — corra supabase/seed.sql no editor SQL");
    } catch {
      /* já acusado acima */
    }

    // bucket
    let bucketOk = false;
    try {
      const res = await fetch(`${url}/storage/v1/object/list/media`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: "", limit: 1, sortBy: { column: "name", order: "asc" } }),
      });
      bucketOk = res.ok;
      say(
        bucketOk ? "ok" : "falha",
        "Bucket das fotografias",
        bucketOk ? "«media» existe e é público" : `resposta ${res.status} — corra a migração 0001`,
      );
    } catch (err) {
      say("falha", "Bucket das fotografias", err instanceof Error ? err.message : "sem ligação");
    }

    // função is_admin (acesso para escrever)
    let adminOk = false;
    try {
      const res = await fetch(`${url}/rest/v1/rpc/is_admin`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: "{}",
      });
      if (res.status === 404) {
        say("falha", "Acesso para escrever", "falta a função is_admin() — corra a migração 0002");
      } else if (!res.ok) {
        say("falha", "Acesso para escrever", `resposta ${res.status}`);
      } else {
        adminOk = true;
        say("ok", "Acesso para escrever", "a função is_admin() responde");
      }
    } catch (err) {
      say("falha", "Acesso para escrever", err instanceof Error ? err.message : "sem ligação");
    }

    // token e envio de fotografia
    if (adminOk) {
      if (!salt || !tokenHash) {
        say("aviso", "Token do painel", "sem VITE_ADMIN_SALT/VITE_ADMIN_TOKEN_HASH no .env.local");
      } else if (!username || !password) {
        say(
          "aviso",
          "Token do painel",
          "não testado — corra `npm run db:check -- --utilizador <user> --palavra-passe <senha>` para testar o envio",
        );
      } else {
        const token = deriveToken(username, password);
        const matches = createHash("sha256").update(token).digest("hex") === tokenHash;
        if (!matches) {
          say("falha", "Credenciais", "utilizador ou palavra-passe não correspondem ao resumo guardado");
        } else {
          say("ok", "Credenciais", "o token derivado bate certo com o resumo");
          await testUpload(token);
        }
      }
    }
  }

  const failed = results.filter((r) => r === "falha").length;
  const warned = results.filter((r) => r === "aviso").length;
  console.log(
    `\n${failed ? RED : warned ? YELLOW : GREEN}Resumo:${OFF} ${results.length - failed - warned} ok · ${warned} avisos · ${failed} falhas\n`,
  );
  return failed ? 1 : 0;
}

/** Envia uma imagem de teste e apaga-a: prova que o envio funciona. */
async function testUpload(token) {
  const path = `__teste/palheiro-velho-${Date.now()}.png`;
  const file = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  const auth = { ...headers, "x-admin-token": token };
  let uploaded = false;

  try {
    const res = await fetch(`${url}/storage/v1/object/media/${path}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "image/png", "cache-control": "60" },
      body: file,
    });
    uploaded = res.ok;
    if (!uploaded) {
      const body = await res.json().catch(() => null);
      const message = body?.message ?? `resposta ${res.status}`;
      say(
        "falha",
        "Envio de fotografias",
        `${message} — confirme a migração 0002 e as políticas do bucket «media»`,
      );
      return;
    }
    say("ok", "Envio de fotografias", "a fotografia de teste foi aceite pelo Storage");
  } catch (err) {
    say("falha", "Envio de fotografias", err instanceof Error ? err.message : "sem ligação");
    return;
  }

  // limpeza
  try {
    await fetch(`${url}/storage/v1/object/media/${path}`, { method: "DELETE", headers: auth });
  } catch {
    /* o ficheiro de teste fica para apagar à mão */
  }
}

process.exit(await main());
