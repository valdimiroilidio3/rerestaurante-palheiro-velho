import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, ExternalLink, LogOut } from "lucide-react";
import { supabaseEnabled } from "@/lib/supabase";
import {
  accessConfigured,
  deriveToken,
  endSession,
  restoreSession,
  startSession,
  verifyCredentials,
} from "@/admin/lib/access";
import { ContactTab, HeroTab, HoursTab, TextsTab } from "@/admin/sections/SettingsTabs";
import { MenuTab } from "@/admin/sections/MenuTab";
import { GalleryTab, InstagramTab, IntroTab } from "@/admin/sections/MediaTabs";
import { FilesTab } from "@/admin/sections/FilesTab";
import { ReservationsTab } from "@/admin/sections/ReservationsTab";
import { LegalTab } from "@/admin/sections/LegalTab";
import { EventsTab, ExperienceTab } from "@/admin/sections/StoryTabs";
import { Button, Card, LiveDot } from "@/admin/components/ui";
import { DiagnosticsButton } from "@/admin/components/Diagnostics";
import { cn } from "@/utils/cn";

type Tab = { id: string; label: string; hint: string; render: () => ReactNode };

const TABS: Tab[] = [
  { id: "ficheiros", label: "Ficheiros", hint: "biblioteca de fotografias", render: () => <FilesTab /> },
  {
    id: "contactos",
    label: "Contactos",
    hint: "morada, telefone, email, redes",
    render: () => <ContactTab />,
  },
  { id: "horario", label: "Horário", hint: "dias e horas de funcionamento", render: () => <HoursTab /> },
  { id: "reservas", label: "Reservas", hint: "pedidos de mesa", render: () => <ReservationsTab /> },
  { id: "abertura", label: "Abertura", hint: "vídeo, fotograma e panorâmica", render: () => <HeroTab /> },
  { id: "carta", label: "Carta", hint: "categorias, pratos e preços", render: () => <MenuTab /> },
  { id: "espaco", label: "O espaço", hint: "painéis do espaço", render: () => <ExperienceTab /> },
  { id: "galeria", label: "Galeria", hint: "carrossel de fotografias", render: () => <GalleryTab /> },
  { id: "instagram", label: "Instagram", hint: "mosaico de publicações", render: () => <InstagramTab /> },
  { id: "momentos", label: "Momentos", hint: "eventos e formatos", render: () => <EventsTab /> },
  { id: "servicos", label: "Serviços", hint: "fotografias e lista de serviços", render: () => <IntroTab /> },
  { id: "textos", label: "Textos", hint: "navegação e faixas", render: () => <TextsTab /> },
  {
    id: "legal",
    label: "Legal",
    hint: "privacidade, cookies e termos",
    render: () => <LegalTab />,
  },
];

/**
 * Painel do restaurante.
 * Uma única forma de entrada — utilizador e palavra-passe definidos por
 * `scripts/set-admin-password.mjs`. Não há criação de contas.
 */
export function AdminApp() {
  // a sessão vive só neste separador: fechar o separador termina a sessão
  const [entered] = useState(() => restoreSession());

  if (!entered) return <LoginScreen />;

  return <Shell />;
}

/* ————————————————————————————— login ————————————————————————————— */

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!(await verifyCredentials(username.trim(), password))) {
        setError("Utilizador ou palavra-passe errados.");
        return;
      }
      startSession(await deriveToken(username.trim(), password));
      // recarrega para o cliente da base de dados nascer já com o token de acesso
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-char px-5 py-16 text-cream">
      <div className="w-full max-w-md">
        <p className="label text-sun">Palheiro Velho</p>
        <h1 className="mt-4 font-display text-[2.6rem] leading-[0.95]">Painel do restaurante</h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/60">
          Acesso único da casa. Não é possível criar contas nem recuperar a palavra-passe por email.
        </p>

        <Card className="mt-8">
          {accessConfigured() ? (
            <form onSubmit={(event) => void submit(event)} className="space-y-4">
              <label className="block">
                <span className="label block text-cream/45">Utilizador</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="mt-2 w-full border border-cream/15 bg-char/60 px-3.5 py-3 text-[1rem] text-cream outline-none focus:border-sun"
                />
              </label>
              <label className="block">
                <span className="label block text-cream/45">Palavra-passe</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="mt-2 w-full border border-cream/15 bg-char/60 px-3.5 py-3 text-[1rem] text-cream outline-none focus:border-sun"
                />
              </label>
              {error && <p className="text-[0.85rem] text-ember">{error}</p>}
              <Button variant="primary" type="submit" loading={busy} disabled={!username || !password}>
                entrar
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="font-display text-[1.4rem] leading-tight">Falta definir o acesso</p>
              <p className="text-[0.92rem] leading-relaxed text-cream/60">
                Correr{" "}
                <span className="text-sand">
                  node scripts/set-admin-password.mjs utilizador palavra-passe
                </span>{" "}
                e meter o sal e o resumo no <span className="text-sand">.env.local</span> (e nas variáveis de
                ambiente do alojamento). A palavra-passe não fica gravada em lado nenhum.
              </p>
            </div>
          )}
        </Card>

        <a
          href="./index.html"
          className="label mt-6 inline-flex items-center gap-2 text-cream/40 transition-colors hover:text-sun"
        >
          <ExternalLink size={12} /> voltar ao site
        </a>
      </div>
    </div>
  );
}

/* ————————————————————————————— painel ————————————————————————————— */

function Shell() {
  const [tab, setTab] = useState(TABS[0].id);
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="min-h-screen bg-char text-cream">
      <header className="sticky top-0 z-40 border-b border-cream/12 bg-char/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="label text-sun">Palheiro Velho</p>
            <p className="mt-1 font-display text-[1.25rem] leading-none">Painel</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <LiveDot live={supabaseEnabled} />
            <DiagnosticsButton />
            <a
              href="./index.html"
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center gap-2 border-b border-cream/25 pb-1 text-cream/70 transition-colors hover:border-sun hover:text-sun"
            >
              ver o site <ExternalLink size={12} />
            </a>
            <span className="label hidden text-cream/40 sm:inline">acesso único</span>
            <button
              type="button"
              onClick={() => {
                endSession();
                window.location.reload();
              }}
              className="label inline-flex items-center gap-2 text-cream/50 transition-colors hover:text-ember"
            >
              <LogOut size={13} /> sair
            </button>
          </div>
        </div>
      </header>

      {!supabaseEnabled && <DbNotice />}

      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-8 lg:flex-row">
        <nav className="lg:w-60 lg:shrink-0">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TABS.map((item) => (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "w-full border-l-2 px-3 py-2.5 text-left transition-colors lg:px-4",
                    item.id === active.id
                      ? "border-sun bg-white/[0.05] text-cream"
                      : "border-transparent text-cream/50 hover:text-cream",
                  )}
                >
                  <span className="label block">{item.label}</span>
                  <span className="mt-1 hidden text-[0.76rem] text-cream/35 lg:block">{item.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <div key={active.id}>{active.render()}</div>
        </main>
      </div>
    </div>
  );
}

/* ————————————————————————————— configuração em falta ————————————————————————————— */

/**
 * Sem base de dados o painel abre na mesma — só não grava. O aviso fica
 * numa faixa discreta, com os passos guardados para quem os precisar.
 */
function DbNotice() {
  return (
    <div className="border-b border-sun/25 bg-sun/10">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <span className="flex items-center gap-2 text-sun">
          <AlertTriangle size={15} />
          <span className="label">sem base de dados</span>
        </span>
        <p className="text-[0.9rem] text-cream/75">
          Pode navegar e editar à vontade, mas <span className="text-cream">nada fica guardado</span> até o
          projeto Supabase estar ligado.
        </p>
        <details className="w-full lg:w-auto">
          <summary className="label inline-flex cursor-pointer list-none text-sun transition-colors hover:text-cream lg:ml-auto">
            como ligar
          </summary>
          <ol className="mt-3 w-full space-y-3 border-t border-sun/20 pt-3 text-[0.88rem] leading-relaxed text-cream/70 lg:max-w-3xl">
            <li>
              <span className="label block text-cream/45">1 · criar o projeto</span>
              Criar um projeto em <span className="text-sand">supabase.com</span> e copiar a URL e a chave
              <span className="text-sand"> anon</span> (Project Settings → API).
            </li>
            <li>
              <span className="label block text-cream/45">2 · criar as tabelas</span>
              Correr, no editor SQL do projeto e por esta ordem, as migrações em{" "}
              <span className="text-sand">supabase/migrations/</span> — hoje:{" "}
              <span className="text-sand">0001_init.sql</span>,{" "}
              <span className="text-sand">0002_admin_access.sql</span>,{" "}
              <span className="text-sand">0003_instagram_posts_fields.sql</span> e{" "}
              <span className="text-sand">0004_opening_hours.sql</span>. Depois o{" "}
              <span className="text-sand">supabase/seed.sql</span> para carregar o conteúdo atual.
            </li>
            <li>
              <span className="label block text-cream/45">3 · configurar o ambiente</span>
              Copiar <span className="text-sand">.env.example</span> para{" "}
              <span className="text-sand">.env.local</span> com as variáveis e reiniciar o servidor.
            </li>
            <li>
              <span className="label block text-cream/45">4 · conferir</span>
              Correr <span className="text-sand">npm run db:check</span> — diz o que está bem e o que falta,
              incluindo um teste de envio de fotografia.
            </li>
          </ol>
        </details>
      </div>
    </div>
  );
}
