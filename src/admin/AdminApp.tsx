import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, LogOut, Mail } from "lucide-react";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { signOut } from "@/admin/lib/api";
import { ContactTab, HeroTab, TextsTab } from "@/admin/sections/SettingsTabs";
import { MenuTab } from "@/admin/sections/MenuTab";
import { GalleryTab, InstagramTab, IntroTab } from "@/admin/sections/MediaTabs";
import { EventsTab, ExperienceTab } from "@/admin/sections/StoryTabs";
import { Button, Card, LiveDot } from "@/admin/components/ui";
import { useToast } from "@/admin/lib/hooks";
import { cn } from "@/utils/cn";

type Tab = { id: string; label: string; hint: string; render: () => ReactNode };

const TABS: Tab[] = [
  {
    id: "contactos",
    label: "Contactos",
    hint: "morada, telefone, email, redes",
    render: () => <ContactTab />,
  },
  { id: "abertura", label: "Abertura", hint: "vídeo, fotograma e panorâmica", render: () => <HeroTab /> },
  { id: "carta", label: "Carta", hint: "categorias, pratos e preços", render: () => <MenuTab /> },
  { id: "espaco", label: "O espaço", hint: "painéis do espaço", render: () => <ExperienceTab /> },
  { id: "galeria", label: "Galeria", hint: "carrossel de fotografias", render: () => <GalleryTab /> },
  { id: "instagram", label: "Instagram", hint: "mosaico de publicações", render: () => <InstagramTab /> },
  { id: "momentos", label: "Momentos", hint: "eventos e formatos", render: () => <EventsTab /> },
  { id: "servicos", label: "Serviços", hint: "fotografias e lista de serviços", render: () => <IntroTab /> },
  { id: "textos", label: "Textos", hint: "navegação e faixas", render: () => <TextsTab /> },
];

/**
 * Painel do restaurante.
 * Sem base de dados configurada mostra o que falta fazer; com base de dados
 * pede login por magic link e depois deixa editar tudo.
 */
export function AdminApp() {
  const [session, setSession] = useState<{ user: { email?: string } } | null>(null);
  // sem base de dados não há sessão: o painel fica pronto logo
  const [ready, setReady] = useState(!supabaseEnabled);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ? { user: { email: data.session.user.email } } : null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ? { user: { email: next.user.email } } : null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!supabaseEnabled) return <SetupScreen />;
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-char text-cream/50">
        <p className="label">a carregar painel…</p>
      </div>
    );
  }
  if (!session) return <LoginScreen />;

  return <Shell email={session.user.email} />;
}

/* ————————————————————————————— login ————————————————————————————— */

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!supabase || !email.includes("@")) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-char px-5 py-16 text-cream">
      <div className="w-full max-w-md">
        <p className="label text-sun">Palheiro Velho</p>
        <h1 className="mt-4 font-display text-[2.6rem] leading-[0.95]">Painel do restaurante</h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/60">
          Entre com o seu email. Enviamos uma ligação de acesso — sem palavra-passe para decorar.
        </p>

        <Card className="mt-8">
          {sent ? (
            <div>
              <p className="font-display text-[1.4rem] leading-tight">Verifique o seu email</p>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-cream/60">
                Enviámos uma ligação para <span className="text-sand">{email}</span>. Abrir essa ligação neste
                mesmo browser dá-lhe acesso ao painel.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="label block text-cream/45">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void send()}
                  placeholder="geral@palheirovelho.pt"
                  className="mt-2 w-full border border-cream/15 bg-char/60 px-3.5 py-3 text-[1rem] text-cream outline-none placeholder:text-cream/25 focus:border-sun"
                />
              </label>
              {error && <p className="text-[0.85rem] text-ember">{error}</p>}
              <Button
                variant="primary"
                onClick={() => void send()}
                loading={busy}
                disabled={!email.includes("@")}
              >
                <Mail size={14} /> enviar ligação de acesso
              </Button>
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

function Shell({ email }: { email?: string }) {
  const [tab, setTab] = useState(TABS[0].id);
  const toast = useToast();
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
            <LiveDot live />
            <a
              href="./index.html"
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center gap-2 border-b border-cream/25 pb-1 text-cream/70 transition-colors hover:border-sun hover:text-sun"
            >
              ver o site <ExternalLink size={12} />
            </a>
            <span className="label hidden text-cream/40 sm:inline">{email}</span>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                toast("Sessão terminada.");
              }}
              className="label inline-flex items-center gap-2 text-cream/50 transition-colors hover:text-ember"
            >
              <LogOut size={13} /> sair
            </button>
          </div>
        </div>
      </header>

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

function SetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-char px-5 py-16 text-cream">
      <div className="w-full max-w-xl">
        <p className="label text-sun">Palheiro Velho</p>
        <h1 className="mt-4 font-display text-[2.4rem] leading-[1]">Falta ligar a base de dados</h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/60">
          O painel precisa de um projeto Supabase. São três passos e o site continua a funcionar entretanto.
        </p>

        <Card className="mt-8">
          <ol className="space-y-4 text-[0.92rem] leading-relaxed text-cream/70">
            <li>
              <span className="label block text-cream/45">1 · criar o projeto</span>
              Criar um projeto em <span className="text-sand">supabase.com</span> e copiar a URL e a chave
              <span className="text-sand"> anon</span> (Project Settings → API).
            </li>
            <li>
              <span className="label block text-cream/45">2 · criar as tabelas</span>
              Correr <span className="text-sand">supabase/migrations/0001_init.sql</span> no editor SQL e
              depois o<span className="text-sand"> supabase/seed.sql</span> para carregar o conteúdo atual.
            </li>
            <li>
              <span className="label block text-cream/45">3 · configurar o ambiente</span>
              Copiar <span className="text-sand">.env.example</span> para{" "}
              <span className="text-sand">.env.local</span> com as duas variáveis e reiniciar o servidor.
            </li>
          </ol>
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
