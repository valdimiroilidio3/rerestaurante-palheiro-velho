import { Loader2 } from "lucide-react";
import { useAdminContent } from "@/admin/lib/hooks";
import { saveGallery, saveInstagram, saveIntro } from "@/admin/lib/api";
import type { GalleryItem, IdentifiedImage, InstagramItem, IntroFact } from "@/content/types";
import {
  AddButton,
  Card,
  EmptyState,
  Field,
  Input,
  ListRow,
  SaveBar,
  SectionHeader,
} from "@/admin/components/ui";
import { useDraft, useSave } from "@/admin/lib/hooks";
import { ImageField } from "@/admin/components/ImageField";
import { LocalizedInput, LocalizedTextarea } from "@/admin/components/LocalizedField";

const Loading = ({ what }: { what: string }) => (
  <p className="flex items-center gap-2 text-cream/40">
    <Loader2 size={16} className="animate-spin" /> a carregar {what}…
  </p>
);

const SPAN_OPTIONS = [
  { value: "", label: "normal" },
  { value: "sm:col-span-2", label: "largo" },
  { value: "sm:row-span-2", label: "alto" },
  { value: "sm:col-span-2 sm:row-span-2", label: "grande" },
];

/* ————————————————————————————— galeria ————————————————————————————— */

export function GalleryTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<GalleryItem[]>(content?.gallery ?? []);
  const { saving, save } = useSave(
    draft,
    commit,
    saveGallery,
    "Galeria atualizada — o site já mostra as alterações.",
  );

  if (loading) return <Loading what="a galeria" />;

  return (
    <div>
      <SectionHeader
        title="Galeria"
        description="As fotografias grandes que passam em carrossel. Arraste os ficheiros para os cartões."
        action={<span className="label text-cream/40">{draft.length} fotografias</span>}
      />

      {draft.length === 0 && <EmptyState>Sem fotografias. Adicione a primeira.</EmptyState>}

      <div className="space-y-4">
        {draft.map((item, i) => (
          <ListRow
            key={item.id || i}
            index={i}
            canUp={i > 0}
            canDown={i < draft.length - 1}
            onUp={() => {
              const next = [...draft];
              [next[i - 1], next[i]] = [next[i], next[i - 1]];
              update(next);
            }}
            onDown={() => {
              const next = [...draft];
              [next[i + 1], next[i]] = [next[i], next[i + 1]];
              update(next);
            }}
            onRemove={() => update(draft.filter((_, j) => j !== i))}
          >
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <ImageField
                label="Fotografia"
                value={item.image}
                onChange={(img) =>
                  update(
                    draft.map((it, j) =>
                      j === i ? { ...it, image: { ...img, alt: `${item.cap} — ${item.loc}` } } : it,
                    ),
                  )
                }
                aspect="4 / 3"
              />
              <div className="grid gap-3">
                <LocalizedInput
                  label="Legenda"
                  value={item.cap}
                  onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, cap: v } : it)))}
                />
                <LocalizedInput
                  label="Nota"
                  hint="Ex.: “substituir por fotografia autorizada”."
                  value={item.loc}
                  onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, loc: v } : it)))}
                />
              </div>
            </div>
          </ListRow>
        ))}
      </div>

      <div className="mt-5">
        <AddButton
          label="adicionar fotografia"
          onClick={() =>
            update([
              ...draft,
              { id: crypto.randomUUID(), cap: "Nova fotografia", loc: "", image: { src: "", alt: "" } },
            ])
          }
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

/* ————————————————————————————— Instagram ————————————————————————————— */

export function InstagramTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<InstagramItem[]>(content?.instagram ?? []);
  const { saving, save } = useSave(
    draft,
    commit,
    saveInstagram,
    "Grelha atualizada — o site já mostra as alterações.",
  );

  if (loading) return <Loading what="a grelha" />;

  return (
    <div>
      <SectionHeader
        title="Instagram"
        description="O mosaico em forma de grelha. Escolha o tamanho de cada peça, a ligação para a publicação e o tipo (foto ou reel)."
        action={<span className="label text-cream/40">{draft.length} publicações</span>}
      />

      {draft.length === 0 && <EmptyState>Sem publicações. Adicione a primeira.</EmptyState>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {draft.map((item, i) => (
          <Card key={item.id || i}>
            <div className="mb-3 flex items-center justify-between">
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

            <ImageField
              label="Imagem"
              value={item.image}
              onChange={(img) => update(draft.map((it, j) => (j === i ? { ...it, image: img } : it)))}
              aspect="1 / 1"
            />

            <div className="mt-4 grid gap-3">
              <LocalizedInput
                label="Legenda"
                value={item.cap}
                onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, cap: v } : it)))}
              />
              <Field label="Gostos" hint="Texto livre: número ou nota.">
                <Input
                  value={item.likes}
                  onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, likes: v } : it)))}
                />
              </Field>
              <Field label="Ligação da publicação" hint="Opcional. Sem ligação, a peça abre o perfil.">
                <Input
                  value={item.url ?? ""}
                  placeholder="https://www.instagram.com/p/..."
                  onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, url: v } : it)))}
                />
              </Field>
              <Field label="Tipo">
                <select
                  value={item.kind ?? "foto"}
                  onChange={(e) =>
                    update(
                      draft.map((it, j) =>
                        j === i ? { ...it, kind: e.target.value as InstagramItem["kind"] } : it,
                      ),
                    )
                  }
                  className="w-full border border-cream/15 bg-char/60 px-3 py-2.5 text-[0.95rem] text-cream outline-none focus:border-sun"
                >
                  <option value="foto">foto</option>
                  <option value="reel">reel (vídeo)</option>
                </select>
              </Field>
              <Field label="Tamanho no mosaico">
                <select
                  value={item.span}
                  onChange={(e) =>
                    update(draft.map((it, j) => (j === i ? { ...it, span: e.target.value } : it)))
                  }
                  className="w-full border border-cream/15 bg-char/60 px-3 py-2.5 text-[0.95rem] text-cream outline-none focus:border-sun"
                >
                  {SPAN_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5">
        <AddButton
          label="adicionar publicação"
          onClick={() =>
            update([
              ...draft,
              {
                id: crypto.randomUUID(),
                cap: "Nova publicação",
                likes: "",
                span: "",
                url: "",
                kind: "foto" as const,
                image: { src: "", alt: "" },
              },
            ])
          }
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

/* ————————————————————————————— abertura do site (intro) ————————————————————————————— */

type IntroDraft = { images: IdentifiedImage[]; facts: IntroFact[] };

export function IntroTab() {
  const { content, loading } = useAdminContent();
  const initial: IntroDraft = { images: content?.intro.images ?? [], facts: content?.intro.facts ?? [] };
  const { draft, update, commit, reset, dirty } = useDraft<IntroDraft>(initial);
  const { saving, save } = useSave(
    draft,
    commit,
    async (value) => {
      await saveIntro(value.images, value.facts);
    },
    "Abertura atualizada — o site já mostra as alterações.",
  );

  if (loading) return <Loading what="a abertura" />;

  const setImages = (images: IntroDraft["images"]) => update({ ...draft, images });
  const setFacts = (facts: IntroFact[]) => update({ ...draft, facts });

  return (
    <div>
      <SectionHeader
        title="Abertura e serviços"
        description="As três fotografias junto ao texto de apresentação e a lista de serviços da casa."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {draft.images.map((image, i) => (
          <Card key={image.id || i}>
            <ImageField
              label={`Fotografia ${i + 1}`}
              value={image}
              onChange={(img) => setImages(draft.images.map((it, j) => (j === i ? { ...it, ...img } : it)))}
              aspect={i === 0 ? "4 / 5" : i === 1 ? "3 / 4" : "1 / 1"}
            />
            <Field label="Texto alternativo" className="mt-3">
              <Input
                value={image.alt ?? ""}
                onChange={(v) => setImages(draft.images.map((it, j) => (j === i ? { ...it, alt: v } : it)))}
              />
            </Field>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {draft.facts.map((fact, i) => (
          <ListRow
            key={fact.id || i}
            index={i}
            canUp={i > 0}
            canDown={i < draft.facts.length - 1}
            onUp={() => {
              const next = [...draft.facts];
              [next[i - 1], next[i]] = [next[i], next[i - 1]];
              setFacts(next);
            }}
            onDown={() => {
              const next = [...draft.facts];
              [next[i + 1], next[i]] = [next[i], next[i + 1]];
              setFacts(next);
            }}
            onRemove={() => setFacts(draft.facts.filter((_, j) => j !== i))}
          >
            <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <Field label="Número">
                <Input
                  value={fact.k}
                  onChange={(v) => setFacts(draft.facts.map((f, j) => (j === i ? { ...f, k: v } : f)))}
                />
              </Field>
              <LocalizedInput
                label="Serviço"
                value={fact.t}
                onChange={(v) => setFacts(draft.facts.map((f, j) => (j === i ? { ...f, t: v } : f)))}
              />
            </div>
            <LocalizedTextarea
              label="Descrição"
              rows={2}
              value={fact.d}
              onChange={(v) => setFacts(draft.facts.map((f, j) => (j === i ? { ...f, d: v } : f)))}
            />
          </ListRow>
        ))}
      </div>

      <div className="mt-5">
        <AddButton
          label="adicionar serviço"
          onClick={() =>
            setFacts([
              ...draft.facts,
              { id: crypto.randomUUID(), k: String(draft.facts.length + 1).padStart(2, "0"), t: "", d: "" },
            ])
          }
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
