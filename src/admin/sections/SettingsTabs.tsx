import { Loader2 } from "lucide-react";
import { useAdminContent } from "@/admin/lib/hooks";
import { saveSettings } from "@/admin/lib/api";
import type { Contact, Hero, NavItem, Ocean } from "@/content/types";
import { Button, Card, Field, Input, SaveBar, SectionHeader, Textarea } from "@/admin/components/ui";
import { useDraft, useSave } from "@/admin/lib/hooks";
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
        <Field label="Tipo de espaço">
          <Input value={draft.kind} onChange={(v) => set({ kind: v })} />
        </Field>
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
      </div>

      <Card className="mt-5">
        <Field label="Nota curta sobre a casa">
          <Textarea value={draft.note} onChange={(v) => set({ note: v })} rows={2} />
        </Field>
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
          <Field label="Frase de abertura">
            <Input value={hero.draft.tagline} onChange={(v) => setHero({ tagline: v })} />
          </Field>
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
          <Field label="Frase (uma palavra por campo)">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={ocean.draft!.line[i] ?? ""}
                  onChange={(v) => {
                    const line = [...ocean.draft!.line];
                    line[i] = v;
                    setOcean({ line });
                  }}
                />
              ))}
            </div>
          </Field>
          <Field label="Legenda">
            <Textarea value={ocean.draft.sub} onChange={(v) => setOcean({ sub: v })} rows={3} />
          </Field>
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

/* ————————————————————————————— navegação e listas ————————————————————————————— */

const splitList = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function TextsTab() {
  const { content, loading } = useAdminContent();
  const nav = useDraft<NavItem[]>(content?.nav ?? []);
  const ticker = useDraft<string>((content?.ticker ?? []).join("\n"));
  const hashtags = useDraft<string>((content?.hashtags ?? []).join("\n"));
  const perks = useDraft<string>((content?.eventPerks ?? []).join("\n"));
  const notice = useDraft<string>(content?.conceptNotice ?? "");

  const dirty = nav.dirty || ticker.dirty || hashtags.dirty || perks.dirty || notice.dirty;
  const commit = () => {
    nav.commit(nav.draft);
    ticker.commit(ticker.draft);
    hashtags.commit(hashtags.draft);
    perks.commit(perks.draft);
    notice.commit(notice.draft);
  };
  const { saving, save } = useSave(
    dirty,
    commit,
    async () => {
      await saveSettings({
        nav: nav.draft,
        ticker: splitList(ticker.draft),
        hashtags: splitList(hashtags.draft),
        eventPerks: splitList(perks.draft),
        conceptNotice: notice.draft,
      });
    },
    "Textos atualizados — o site já mostra as alterações.",
  );

  if (loading) return <Loading />;

  const reset = () => {
    nav.reset();
    ticker.reset();
    hashtags.reset();
    perks.reset();
    notice.reset();
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
              <Input
                value={item.label}
                placeholder="nome visível"
                onChange={(v) => nav.update(nav.draft.map((it, j) => (j === i ? { ...it, label: v } : it)))}
              />
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
        <Field label="Faixa do rodapé" hint="Uma entrada por linha.">
          <Textarea value={ticker.draft} onChange={ticker.update} rows={6} />
        </Field>
        <Field label="Hashtags (faixa do Instagram)">
          <Textarea value={hashtags.draft} onChange={hashtags.update} rows={6} />
        </Field>
        <Field label="Vantagens em “Momentos”">
          <Textarea value={perks.draft} onChange={perks.update} rows={5} />
        </Field>
        <Field label="Nota de conceito" hint="Aviso legal que aparece no mapa e no rodapé.">
          <Textarea value={notice.draft} onChange={notice.update} rows={5} />
        </Field>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
