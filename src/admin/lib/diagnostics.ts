import { MEDIA_BUCKET, getAdminToken, supabase, supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

/**
 * Diagnóstico da ligação à base de dados.
 * Serve para dizer exatamente o que falta — em vez de um ecrã em branco.
 */

/** Tabelas que o site precisa de ler. */
export const TABLES = [
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

export type CheckStatus = "ok" | "aviso" | "falha";
export type Check = { id: string; label: string; status: CheckStatus; detail: string };

/** Cabeçalhos públicos, iguais aos que o site usa para ler. */
const publicHeaders = () => ({ apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` });

/** Lê uma tabela com a chave pública (é o que o site faz). */
async function readTable(table: string): Promise<string | null> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, { headers: publicHeaders() });
    if (res.ok) return null;
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    return body?.message ?? `resposta ${res.status}`;
  } catch (err) {
    return err instanceof Error ? err.message : "sem ligação";
  }
}

/** O bucket existe e é legível? */
async function probeBucket(): Promise<string | null> {
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${MEDIA_BUCKET}`, {
      method: "POST",
      headers: { ...publicHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 1, sortBy: { column: "name", order: "asc" } }),
    });
    if (res.ok) return null;
    if (res.status === 404) return "o bucket «media» não existe (correr a migração)";
    return `resposta ${res.status}`;
  } catch (err) {
    return err instanceof Error ? err.message : "sem ligação";
  }
}

/** A base de dados aceita o token do painel? */
async function probeAdmin(): Promise<{ status: CheckStatus; detail: string }> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/is_admin`, {
      method: "POST",
      headers: {
        ...publicHeaders(),
        "Content-Type": "application/json",
        ...(getAdminToken() ? { "x-admin-token": getAdminToken() as string } : {}),
      },
      body: "{}",
    });
    if (!res.ok) {
      if (res.status === 404) {
        return { status: "falha", detail: "falta a função is_admin() (correr a migração 0002)" };
      }
      return { status: "falha", detail: `resposta ${res.status}` };
    }
    const accepted = (await res.text()).trim() === "true";
    return accepted
      ? { status: "ok", detail: "o envio de fotografias está autorizado" }
      : {
          status: "aviso",
          detail: "a base de dados não reconhece o token — sem token não é possível enviar",
        };
  } catch (err) {
    return { status: "falha", detail: err instanceof Error ? err.message : "sem ligação" };
  }
}

/** O canal em tempo real abre? */
async function probeRealtime(): Promise<{ status: CheckStatus; detail: string }> {
  const db = supabase;
  if (!db) return { status: "falha", detail: "sem cliente" };
  try {
    const opened = await new Promise<boolean>((resolve) => {
      const timer = window.setTimeout(() => resolve(false), 4000);
      const channel = db.channel("diagnostico");
      channel.subscribe((state) => {
        if (state === "SUBSCRIBED") {
          window.clearTimeout(timer);
          void db.removeChannel(channel);
          resolve(true);
        } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
          window.clearTimeout(timer);
          void db.removeChannel(channel);
          resolve(false);
        }
      });
    });
    return opened
      ? { status: "ok", detail: "o site atualiza sozinho quando algo muda" }
      : { status: "aviso", detail: "sem tempo real — as alterações aparecem ao recarregar" };
  } catch (err) {
    return { status: "aviso", detail: err instanceof Error ? err.message : "não foi possível testar" };
  }
}

/** Corre todas as verificações e devolve o resultado de cada uma. */
export async function runDiagnostics(): Promise<Check[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return [
      {
        id: "env",
        label: "Variáveis de ambiente",
        status: "falha",
        detail: "falta VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no .env.local",
      },
    ];
  }

  const checks: Check[] = [
    { id: "env", label: "Variáveis de ambiente", status: "ok", detail: `${new URL(supabaseUrl).host}` },
  ];

  // tabelas
  const results = await Promise.all(TABLES.map(async (t) => ({ table: t, error: await readTable(t) })));
  const broken = results.filter((r) => r.error);
  checks.push(
    broken.length === 0
      ? {
          id: "tables",
          label: "Tabelas do site",
          status: "ok",
          detail: `${TABLES.length} tabelas legíveis`,
        }
      : {
          id: "tables",
          label: "Tabelas do site",
          status: "falha",
          detail: `em falta ou sem leitura: ${broken.map((b) => b.table).join(", ")}`,
        },
  );

  // conteúdo carregado
  const settings = results.find((r) => r.table === "site_settings");
  checks.push({
    id: "seed",
    label: "Conteúdo carregado",
    status: settings?.error ? "aviso" : "ok",
    detail: settings?.error
      ? "não foi possível verificar — correr supabase/seed.sql no SQL Editor"
      : "a tabela de definições responde",
  });

  // bucket
  const bucketError = await probeBucket();
  checks.push({
    id: "bucket",
    label: "Bucket das fotografias",
    status: bucketError ? "falha" : "ok",
    detail: bucketError ?? "«media» pronto a receber ficheiros",
  });

  // token
  const admin = await probeAdmin();
  checks.push({ id: "admin", label: "Acesso para escrever", ...admin });

  // tempo real
  checks.push({ id: "realtime", label: "Atualização em tempo real", ...(await probeRealtime()) });

  return checks;
}
