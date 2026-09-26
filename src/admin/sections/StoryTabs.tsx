import { Loader2 } from "lucide-react";
import { useAdminContent } from "@/admin/lib/hooks";
import { saveEvents, saveExperience } from "@/admin/lib/api";
import type { EventItem, ExperiencePanel } from "@/content/types";
import {
  AddButton,
  Card,
  EmptyState,
  Field,
  Input,
  ListRow,
  SaveBar,
  SectionHeader,
  Textarea,
} from "@/admin/components/ui";
import { useDraft, useSave } from "@/admin/lib/hooks";
import { ImageField } from "@/admin/components/ImageField";

const Loading = ({ what }: { what: string }) => (
  <p className="flex items-center gap-2 text-cream/40">
    <Loader2 size={16} className="animate-spin" /> a carregar {what}…
  </p>
);

/* ————————————————————————————— espaço (painéis) ————————————————————————————— */

export function ExperienceTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<ExperiencePanel[]>(content?.experience ?? []);
  const { saving, save } = useSave(
    draft,
    commit,
    saveExperience,
    "Espaço atualizado — o site já mostra as alterações.",
  );

  if (loading) return <Loading what="o espaço" />;

  return (
    <div>
      <SectionHeader
        title="O espaço"
        description="Os painéis que abrem ao passar o rato: vista, esplanada, música, brunch, chegar."
        action={<span className="label text-cream/40">{draft.length} painéis</span>}
      />

      {draft.length === 0 && <EmptyState>Sem painéis. Adicione o primeiro.</EmptyState>}

      <div className="space-y-4">
        {draft.map((panel, i) => (
          <ListRow
            key={panel.id || i}
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
            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <ImageField
                label="Fotografia"
                value={panel.image}
                onChange={(img) =>
                  update(
                    draft.map((p, j) =>
                      j === i ? { ...p, image: { ...img, alt: img.alt || panel.label } } : p,
                    ),
                  )
                }
                aspect="3 / 4"
              />
              <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                <Field label="Número">
                  <Input
                    value={panel.idx}
                    onChange={(v) => update(draft.map((p, j) => (j === i ? { ...p, idx: v } : p)))}
                  />
                </Field>
                <Field label="Nome">
                  <Input
                    value={panel.label}
                    onChange={(v) => update(draft.map((p, j) => (j === i ? { ...p, label: v } : p)))}
                  />
                </Field>
                <Field label="Etiqueta" className="sm:col-span-2">
                  <Input
                    value={panel.meta}
                    onChange={(v) => update(draft.map((p, j) => (j === i ? { ...p, meta: v } : p)))}
                  />
                </Field>
                <Field label="Texto" className="sm:col-span-2">
                  <Textarea
                    value={panel.text}
                    rows={3}
                    onChange={(v) => update(draft.map((p, j) => (j === i ? { ...p, text: v } : p)))}
                  />
                </Field>
              </div>
            </div>
          </ListRow>
        ))}
      </div>

      <div className="mt-5">
        <AddButton
          label="adicionar painel"
          onClick={() =>
            update([
              ...draft,
              {
                id: `painel-${Date.now()}`,
                label: "Novo painel",
                idx: String(draft.length + 1).padStart(2, "0"),
                image: { src: "", alt: "" },
                text: "",
                meta: "",
              },
            ])
          }
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

/* ————————————————————————————— momentos ————————————————————————————— */

export function EventsTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<EventItem[]>(content?.events ?? []);
  const { saving, save } = useSave(
    draft,
    commit,
    saveEvents,
    "Momentos atualizados — o site já mostra as alterações.",
  );

  if (loading) return <Loading what="os momentos" />;

  return (
    <div>
      <SectionHeader
        title="Momentos"
        description="Os formatos que a casa recebe. A imagem aparece quando se passa o rato por cima de cada linha."
        action={<span className="label text-cream/40">{draft.length} momentos</span>}
      />

      {draft.length === 0 && <EmptyState>Sem momentos. Adicione o primeiro.</EmptyState>}

      <div className="grid gap-4 lg:grid-cols-2">
        {draft.map((item, i) => (
          <Card key={item.id || i}>
            <div className="mb-3 flex items-center justify-between">
              <span className="label text-cream/35">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...draft];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    update(next);
                  }}
                  className="label px-2 py-1 text-cream/45 transition-colors hover:text-cream disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === draft.length - 1}
                  onClick={() => {
                    const next = [...draft];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    update(next);
                  }}
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

            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <ImageField
                label="Imagem"
                value={item.image}
                onChange={(img) =>
                  update(
                    draft.map((it, j) =>
                      j === i ? { ...it, image: { ...img, alt: img.alt || item.title } } : it,
                    ),
                  )
                }
                aspect="3 / 4"
              />
              <div className="grid gap-3">
                <div className="grid grid-cols-[70px_1fr] gap-3">
                  <Field label="Número">
                    <Input
                      value={item.n}
                      onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, n: v } : it)))}
                    />
                  </Field>
                  <Field label="Tipo" hint="Ex.: “publicado”, “a confirmar”.">
                    <Input
                      value={item.tag}
                      onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, tag: v } : it)))}
                    />
                  </Field>
                </div>
                <Field label="Título">
                  <Input
                    value={item.title}
                    onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, title: v } : it)))}
                  />
                </Field>
                <Field label="Descrição">
                  <Textarea
                    value={item.desc}
                    rows={4}
                    onChange={(v) => update(draft.map((it, j) => (j === i ? { ...it, desc: v } : it)))}
                  />
                </Field>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5">
        <AddButton
          label="adicionar momento"
          onClick={() =>
            update([
              ...draft,
              {
                id: `momento-${Date.now()}`,
                n: String(draft.length + 1).padStart(2, "0"),
                title: "Novo momento",
                desc: "",
                image: { src: "", alt: "" },
                tag: "a confirmar",
              },
            ])
          }
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
