/**
 * Cópia de segurança do conteúdo para o repositório.
 *
 *   SUPABASE_URL=… SUPABASE_ANON_KEY=… node scripts/backup-content.mjs
 *
 * Lê as tabelas públicas pela API REST e escreve `content/snapshot.json`.
 * É o que a acção `content-backup` corre todas as noites: o código fica no
 * Git e o conteúdo também, sem depender de ninguém se lembrar de exportar.
 */
import { writeFile, mkdir } from "node:fs/promises";

const url = process.env.SUPABASE_URL?.trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY)?.trim();

if (!url || !key) {
  console.error("Faltam SUPABASE_URL e/ou SUPABASE_ANON_KEY.");
  process.exit(1);
}

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
];

const snapshot = { takenAt: new Date().toISOString(), tables: {} };

for (const table of TABLES) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    console.error(`Falhou a leitura de ${table}: ${response.status} ${response.statusText}`);
    process.exit(1);
  }
  snapshot.tables[table] = await response.json();
}

await mkdir(new URL("../content", import.meta.url), { recursive: true });
await writeFile(
  new URL("../content/snapshot.json", import.meta.url),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  "utf8",
);

const counts = Object.entries(snapshot.tables)
  .map(([name, rows]) => `${name}: ${rows.length}`)
  .join(" · ");
console.log(`content/snapshot.json atualizado — ${counts}`);
