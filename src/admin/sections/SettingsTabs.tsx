import { Loader2, Wand2 } from "lucide-react";
import { useAdminContent } from "@/admin/lib/hooks";
import { saveHours, saveSettings } from "@/admin/lib/api";
import {
  WEEK_DAYS,
  type Contact,
  type DayId,
  type Hero,
  type HoursEntry,
  type NavItem,
  type Ocean,
  type Text,
} from "@/content/types";
import { resolve } from "@/i18n";
import {
  AddButton,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  SaveBar,
  SectionHeader,
} from "@/admin/components/ui";
import { cn } from "@/utils/cn";
import { useDraft, useSave } from "@/admin/lib/hooks";
import { LocalizedInput, LocalizedLines, LocalizedTextarea } from "@/admin/components/LocalizedField";
import { ImageField } from "@/admin/components/ImageField";

const Loading = () => (
  <p className="flex items-center gap-2 text-cream/40">
    <Loader2 size={16} className="animate-spin" /> a carregar conteúdo…
  </p>
);

/* ————————————————————————————— contactos ————————————————————————————— */

export function ContactTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<Contact | null>(content?.contact ?? null);
  const { saving, save } = useSave(
    draft,
    () => draft && commit(draft),
    async (value) => {
      if (value) await saveSettings({ contact: value });
    },
    "Contactos atualizados — o site já mostra as alterações.",
  );

  if (loading || !draft) return <Loading />;
  const set = (patch: Partial<Contact>) => update({ ...draft, ...patch });

  return (
    <div>
      <SectionHeader
        title="Contactos"
        description="Tudo o que aparece no rodapé, no painel de contacto e no mapa. A morada também gera as ligações para o Google Maps."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <Input value={draft.name} onChange={(v) => set({ name: v })} />
        </Field>
        <LocalizedInput label="Tipo de espaço" value={draft.kind} onChange={(v) => set({ kind: v })} />
        <Field label="Morada">
          <Input value={draft.address} onChange={(v) => set({ address: v })} />
        </Field>
        <Field label="Localidade">
          <Input value={draft.locality} onChange={(v) => set({ locality: v })} />
        </Field>
        <Field label="Região">
          <Input value={draft.region} onChange={(v) => set({ region: v })} />
        </Field>
        <Field label="Consulta para o Google Maps" hint="Usada para gerar as direções e o mapa embebido.">
          <Input value={draft.mapsQuery} onChange={(v) => set({ mapsQuery: v })} />
        </Field>
        <Field label="Telefone (para ligar)" hint="Só dígitos e o indicativo: +351220124331">
          <Input value={draft.phone} onChange={(v) => set({ phone: v })} />
        </Field>
        <Field label="Telefone (como aparece)">
          <Input value={draft.phoneLabel} onChange={(v) => set({ phoneLabel: v })} />
        </Field>
        <Field label="Email">
          <Input value={draft.email} onChange={(v) => set({ email: v })} type="email" />
        </Field>
        <Field label="Utilizador do Instagram">
          <Input value={draft.instagram} onChange={(v) => set({ instagram: v })} />
        </Field>
        <Field label="Endereço do Instagram">
          <Input value={draft.instagramUrl} onChange={(v) => set({ instagramUrl: v })} />
        </Field>
        <Field label="Página de Facebook">
          <Input value={draft.facebookUrl} onChange={(v) => set({ facebookUrl: v })} />
        </Field>
        <Field label="Latitude" hint="Opcional. Usada nos dados estruturados para o Google (40.95).">
          <Input
            value={draft.lat === undefined ? "" : String(draft.lat)}
            onChange={(v) => set({ lat: v.trim() === "" ? undefined : Number(v.replace(",", ".")) })}
          />
        </Field>
        <Field label="Longitude" hint="Opcional. mesma ideia (-8.64).">
          <Input
            value={draft.lng === undefined ? "" : String(draft.lng)}
            onChange={(v) => set({ lng: v.trim() === "" ? undefined : Number(v.replace(",", ".")) })}
          />
        </Field>
      </div>

      <Card className="mt-5">
        <LocalizedTextarea
          label="Nota curta sobre a casa"
          value={draft.note}
          onChange={(v) => set({ note: v })}
          rows={2}
        />
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

/* ————————————————————————————— abertura e oceano ————————————————————————————— */

export function HeroTab() {
  const { content, loading } = useAdminContent();

  const hero = useDraft<Hero | null>(content?.hero ?? null);
  const ocean = useDraft<Ocean | null>(content?.ocean ?? null);
  const dirty = hero.dirty || ocean.dirty;
  const { saving, save } = useSave(
    { hero: hero.draft, ocean: ocean.draft },
    () => {
      hero.commit(hero.draft);
      ocean.commit(ocean.draft);
    },
    async (value) => {
      if (value.hero) await saveSettings({ hero: value.hero });
      if (value.ocean) await saveSettings({ ocean: value.ocean });
    },
    "Abertura atualizada — o site já mostra as alterações.",
  );

  if (loading || !hero.draft || !ocean.draft) return <Loading />;
  const setHero = (patch: Partial<Hero>) => hero.update({ ...hero.draft!, ...patch });
  const setOcean = (patch: Partial<Ocean>) => ocean.update({ ...ocean.draft!, ...patch });

  const reset = () => {
    hero.reset();
    ocean.reset();
  };

  return (
    <div>
      <SectionHeader
        title="Abertura"
        description="A primeira imagem que o site mostra. O vídeo é opcional: se ficar vazio, fica só o fotograma."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ImageField
          label="Fotograma de abertura"
          hint="É o que se vê enquanto o vídeo carrega (e em telemóvel)."
          value={hero.draft.posterImage ?? { src: hero.draft.poster }}
          onChange={(img) =>
            setHero({
              poster: img.src,
              posterImage: img,
              posterWidth: img.width ?? 1920,
              posterHeight: img.height ?? 1080,
            })
          }
          aspect="16 / 9"
        />
        <div className="space-y-4">
          <LocalizedInput
            label="Frase de abertura"
            value={hero.draft.tagline}
            onChange={(v) => setHero({ tagline: v })}
          />
          <Field label="Vídeo (ecrãs grandes)" hint="MP4 alojado em HTTPS.">
            <Input
              value={hero.draft.videoSources[0] ?? ""}
              onChange={(v) => setHero({ videoSources: [v, hero.draft!.videoSources[1] ?? ""] })}
            />
          </Field>
          <Field label="Vídeo (mais leve)">
            <Input
              value={hero.draft.videoSources[1] ?? ""}
              onChange={(v) => setHero({ videoSources: [hero.draft!.videoSources[0] ?? "", v] })}
            />
          </Field>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeader
          title="Panorâmica do oceano"
          description="O intervalo visual entre a carta e o espaço."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <ImageField
            label="Imagem (ecrãs largos)"
            value={ocean.draft.wide}
            onChange={(img) => setOcean({ wide: img })}
            aspect="2 / 1"
          />
          <ImageField
            label="Imagem (ecrãs pequenos)"
            value={ocean.draft.mid}
            onChange={(img) => setOcean({ mid: img })}
            aspect="4 / 3"
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <LocalizedInput
                key={i}
                label={`Palavra ${i + 1}`}
                value={ocean.draft!.line[i] ?? ""}
                onChange={(v) => {
                  const line = [...ocean.draft!.line];
                  line[i] = v;
                  setOcean({ line });
                }}
              />
            ))}
          </div>
          <LocalizedTextarea
            label="Legenda"
            value={ocean.draft.sub}
            onChange={(v) => setOcean({ sub: v })}
            rows={3}
          />
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

/* ————————————————————————————— navegação e listas ————————————————————————————— */

/** Um texto do conteúdo visto como par de línguas — aceita texto simples. */
const asPair = (value: Text): { pt: string; en: string } =>
  typeof value === "string" ? { pt: value, en: "" } : { pt: value?.pt ?? "", en: value?.en ?? "" };

export function TextsTab() {
  const { content, loading } = useAdminContent();
  const nav = useDraft<NavItem[]>(content?.nav ?? []);
  // as listas já não são só texto: cada entrada pode ter versão nas duas línguas
  const tickerList = useDraft<Text[]>(content?.ticker ?? []);
  const hashtagList = useDraft<Text[]>(content?.hashtags ?? []);
  const perkList = useDraft<Text[]>(content?.eventPerks ?? []);

  const dirty = nav.dirty || tickerList.dirty || hashtagList.dirty || perkList.dirty;
  const commit = () => {
    nav.commit(nav.draft);
    tickerList.commit(tickerList.draft);
    hashtagList.commit(hashtagList.draft);
    perkList.commit(perkList.draft);
  };
  const { saving, save } = useSave(
    dirty,
    commit,
    async () => {
      await saveSettings({
        nav: nav.draft,
        ticker: tickerList.draft,
        hashtags: hashtagList.draft,
        eventPerks: perkList.draft,
      });
    },
    "Textos atualizados — o site já mostra as alterações.",
  );

  if (loading) return <Loading />;

  const reset = () => {
    nav.reset();
    tickerList.reset();
    hashtagList.reset();
    perkList.reset();
  };

  return (
    <div>
      <SectionHeader
        title="Navegação e textos"
        description="Os nomes dos separadores e as listas que correm em faixa. Uma entrada por linha."
      />

      <Card>
        <div className="space-y-3">
          {nav.draft.map((item, i) => (
            <div key={`${item.id}-${i}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                value={item.id}
                placeholder="identificador (ex.: carta)"
                onChange={(v) => nav.update(nav.draft.map((it, j) => (j === i ? { ...it, id: v } : it)))}
              />
              <div className="grid gap-2">
                <Input
                  value={resolve(item.label, "pt")}
                  placeholder="nome visível (PT)"
                  onChange={(v) =>
                    nav.update(
                      nav.draft.map((it, j) =>
                        j === i ? { ...it, label: { ...asPair(it.label), pt: v } } : it,
                      ),
                    )
                  }
                />
                <Input
                  value={
                    resolve(item.label, "en") === resolve(item.label, "pt") ? "" : resolve(item.label, "en")
                  }
                  placeholder="nome visível (EN)"
                  onChange={(v) =>
                    nav.update(
                      nav.draft.map((it, j) =>
                        j === i ? { ...it, label: { ...asPair(it.label), en: v } } : it,
                      ),
                    )
                  }
                />
              </div>
              <Button variant="danger" onClick={() => nav.update(nav.draft.filter((_, j) => j !== i))}>
                remover
              </Button>
            </div>
          ))}
        </div>
        <Button
          className="mt-4"
          onClick={() =>
            nav.update([...nav.draft, { id: `seccao-${nav.draft.length + 1}`, label: "Nova secção" }])
          }
        >
          + separador
        </Button>
      </Card>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <LocalizedLines
          label="Faixa do rodapé"
          hint="Uma entrada por linha."
          value={tickerList.draft}
          onChange={tickerList.update}
          rows={6}
        />
        <LocalizedLines
          label="Hashtags (faixa do Instagram)"
          value={hashtagList.draft}
          onChange={hashtagList.update}
          rows={6}
        />
        <LocalizedLines
          label="Vantagens em “Momentos”"
          value={perkList.draft}
          onChange={perkList.update}
          rows={5}
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

/* ————————————————————————————— horário ————————————————————————————— */

/** Rótulo legível a partir dos dias escolhidos: "Terça a domingo", "Segunda"… */
function labelFromDays(days: DayId[]): string {
  if (!days.length) return "";
  const order = WEEK_DAYS.map((w) => w.id);
  const sorted = order.filter((d) => days.includes(d));
  const labels = sorted.map((d) => WEEK_DAYS.find((w) => w.id === d)!.label);

  if (labels.length === 1) return labels[0];
  if (labels.length === order.length) return "Todos os dias";

  const first = order.indexOf(sorted[0]);
  const last = order.indexOf(sorted[sorted.length - 1]);
  const consecutive = last - first === sorted.length - 1;
  if (consecutive) return `${labels[0]} a ${labels[labels.length - 1]}`;
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

export function HoursTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<HoursEntry[]>(content?.hours ?? []);
  const { saving, save } = useSave(
    draft,
    commit,
    saveHours,
    "Horário atualizado — o site já mostra as alterações.",
  );

  if (loading) return <Loading />;

  const setEntry = (i: number, patch: Partial<HoursEntry>) =>
    update(draft.map((h, j) => (j === i ? { ...h, ...patch } : h)));

  const toggleDay = (i: number, day: DayId) => {
    const entry = draft[i];
    const days = entry.days.includes(day)
      ? entry.days.filter((d) => d !== day)
      : WEEK_DAYS.map((w) => w.id).filter((d) => d === day || entry.days.includes(d));
    setEntry(i, { days });
  };

  return (
    <div>
      <SectionHeader
        title="Horário"
        description="Os períodos de funcionamento da casa. Sem horas de abertura e fecho, a linha aparece como encerrada nesses dias — serve também para publicar o dia de descanso."
        action={<span className="label text-cream/40">{draft.length} linhas</span>}
      />

      {draft.length === 0 && (
        <EmptyState>Sem horário definido. O site mostra “a confirmar” até haver uma linha.</EmptyState>
      )}

      <div className="grid gap-4">
        {draft.map((item, i) => (
          <Card key={item.id || i}>
            <div className="mb-4 flex items-center justify-between">
              <span className="label text-cream/35">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = [...draft];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    update(next);
                  }}
                  disabled={i === 0}
                  className="label px-2 py-1 text-cream/45 transition-colors hover:text-cream disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...draft];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    update(next);
                  }}
                  disabled={i === draft.length - 1}
                  className="label px-2 py-1 text-cream/45 transition-colors hover:text-cream disabled:opacity-25"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => update(draft.filter((_, j) => j !== i))}
                  className="label px-2 py-1 text-cream/45 transition-colors hover:text-ember"
                >
                  remover
                </button>
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <LocalizedInput
                label="Rótulo"
                hint="É o que se lê no site, por exemplo “Terça a domingo”."
                value={item.label}
                onChange={(v) => setEntry(i, { label: v })}
              />
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => setEntry(i, { label: labelFromDays(item.days) })}
                  className="mb-[2px]"
                >
                  <Wand2 size={13} />
                  <span className="label">sugerir</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <p className="label mb-2 text-cream/45">Dias da semana</p>
              <div className="flex flex-wrap gap-1.5">
                {WEEK_DAYS.map((day) => {
                  const on = item.days.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleDay(i, day.id)}
                      className={cn(
                        "label px-3 py-2 border transition-colors",
                        on
                          ? "border-sun bg-sun/15 text-cream"
                          : "border-cream/15 text-cream/45 hover:border-cream/30 hover:text-cream/70",
                      )}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Abertura" hint="Vazio = encerrado nestes dias.">
                <Input value={item.open} onChange={(v) => setEntry(i, { open: v })} placeholder="12:30" />
              </Field>
              <Field label="Fecho">
                <Input value={item.close} onChange={(v) => setEntry(i, { close: v })} placeholder="23:00" />
              </Field>
            </div>

            <div className="mt-4">
              <LocalizedInput
                label="Observação"
                hint="Opcional: “cozinha até às 22:00”, “a confirmar”…"
                value={item.note ?? ""}
                onChange={(v) => setEntry(i, { note: v })}
              />
            </div>

            <p className="mt-4 border-t border-cream/10 pt-4 text-[0.9rem] text-cream/55">
              {resolve(item.label, "pt") || labelFromDays(item.days) || "Sem rótulo"} ·{" "}
              <span className="font-mono">
                {item.open && item.close ? `${item.open} — ${item.close}` : "encerrado"}
              </span>
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-5">
        <AddButton
          label="adicionar período"
          onClick={() =>
            update([
              ...draft,
              { id: crypto.randomUUID(), label: "", days: [], open: "12:30", close: "23:00" },
            ])
          }
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
