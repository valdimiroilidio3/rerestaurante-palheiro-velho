import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminContent } from "@/admin/lib/hooks";
import { saveMenu } from "@/admin/lib/api";
import type { Dish, MenuCategory } from "@/content/types";
import {
  AddButton,
  Card,
  EmptyState,
  Field,
  IconButton,
  Input,
  SaveBar,
  SectionHeader,
  Textarea,
} from "@/admin/components/ui";
import { useDraft, useSave } from "@/admin/lib/hooks";
import { ImageField } from "@/admin/components/ImageField";
import { splitAllergens } from "@/lib/menu";

const slugify = (value: string, fallback: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || fallback;

const newDish = (id: string): Dish => ({
  id,
  name: "Novo item",
  desc: "",
  price: "",
  image: { src: "", alt: "" },
  allergens: [],
});

/** Editor da carta: categorias, pratos, preços e fotografias. */
export function MenuTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<MenuCategory[]>(content?.menu ?? []);
  const { saving, save } = useSave(
    draft,
    commit,
    async (value) => {
      await saveMenu(value);
    },
    "Carta atualizada — o site já mostra as alterações.",
  );
  const [open, setOpen] = useState<string | null>(null);

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-cream/40">
        <Loader2 size={16} className="animate-spin" /> a carregar a carta…
      </p>
    );
  }

  const setCategory = (index: number, patch: Partial<MenuCategory>) =>
    update(draft.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const setDish = (category: number, dish: number, patch: Partial<Dish>) =>
    update(
      draft.map((c, ci) =>
        ci === category ? { ...c, items: c.items.map((d, di) => (di === dish ? { ...d, ...patch } : d)) } : c,
      ),
    );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.length) return;
    const next = [...draft];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  const moveDish = (category: number, from: number, to: number) => {
    const items = [...draft[category].items];
    if (to < 0 || to >= items.length) return;
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    setCategory(category, { items });
  };

  return (
    <div>
      <SectionHeader
        title="Carta"
        description="Categorias, pratos, preços e fotografias. O primeiro prato de cada categoria é o que aparece em destaque."
        action={<span className="label text-cream/40">{draft.length} categorias</span>}
      />

      {draft.length === 0 && <EmptyState>Ainda não há categorias. Comece por criar uma.</EmptyState>}

      <div className="space-y-5">
        {draft.map((category, ci) => (
          <Card key={category.id || ci}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cream/10 pb-4">
              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                <Field label="Categoria">
                  <Input
                    value={category.label}
                    onChange={(v) =>
                      setCategory(ci, {
                        label: v,
                        id: ci === 0 && !category.id ? slugify(v, category.id) : category.id,
                      })
                    }
                  />
                </Field>
                <Field label="Identificador" hint="Usado nos endereços internos.">
                  <Input
                    value={category.id}
                    onChange={(v) => setCategory(ci, { id: slugify(v, category.id) })}
                  />
                </Field>
                <Field label="Etiqueta">
                  <Input value={category.kicker} onChange={(v) => setCategory(ci, { kicker: v })} />
                </Field>
              </div>
              <span className="flex items-center gap-1.5">
                <IconButton label="Subir categoria" onClick={() => move(ci, ci - 1)} disabled={ci === 0}>
                  <span className="text-[0.9rem]">↑</span>
                </IconButton>
                <IconButton
                  label="Descer categoria"
                  onClick={() => move(ci, ci + 1)}
                  disabled={ci === draft.length - 1}
                >
                  <span className="text-[0.9rem]">↓</span>
                </IconButton>
                <IconButton
                  label="Remover categoria"
                  onClick={() => update(draft.filter((_, i) => i !== ci))}
                >
                  <span className="text-[0.9rem]">✕</span>
                </IconButton>
              </span>
            </div>

            <Field label="Descrição da categoria" className="mt-4">
              <Textarea value={category.blurb} onChange={(v) => setCategory(ci, { blurb: v })} rows={2} />
            </Field>

            <div className="mt-5 space-y-4">
              {category.items.map((dish, di) => (
                <div key={dish.id || di} className="border border-cream/10 bg-char/40 p-4">
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <span className="label text-cream/35">
                      {String(ci + 1).padStart(2, "0")}.{String(di + 1).padStart(2, "0")} ·{" "}
                      {dish.name || "sem nome"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconButton
                        label="Subir prato"
                        onClick={() => moveDish(ci, di, di - 1)}
                        disabled={di === 0}
                      >
                        <span className="text-[0.9rem]">↑</span>
                      </IconButton>
                      <IconButton
                        label="Descer prato"
                        onClick={() => moveDish(ci, di, di + 1)}
                        disabled={di === category.items.length - 1}
                      >
                        <span className="text-[0.9rem]">↓</span>
                      </IconButton>
                      <IconButton
                        label="Remover prato"
                        onClick={() => setCategory(ci, { items: category.items.filter((_, i) => i !== di) })}
                      >
                        <span className="text-[0.9rem]">✕</span>
                      </IconButton>
                    </span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <ImageField
                      label="Fotografia"
                      value={dish.image}
                      onChange={(img) => setDish(ci, di, { image: { ...img, alt: img.alt || dish.name } })}
                      aspect="1 / 1"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Nome">
                        <Input value={dish.name} onChange={(v) => setDish(ci, di, { name: v })} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Preço">
                          <Input value={dish.price} onChange={(v) => setDish(ci, di, { price: v })} />
                        </Field>
                        <Field label="Etiqueta" hint="Opcional: “novo”, “vegetariano”…">
                          <Input
                            value={dish.flag ?? ""}
                            onChange={(v) => setDish(ci, di, { flag: v || undefined })}
                          />
                        </Field>
                      </div>
                      <Field label="Descrição" className="sm:col-span-2">
                        <Textarea value={dish.desc} onChange={(v) => setDish(ci, di, { desc: v })} rows={3} />
                      </Field>
                      <Field
                        label="Alergénios"
                        hint="Separados por vírgula, por exemplo: glúten, ovo, leite. Vazio = informação por publicar."
                        className="sm:col-span-2"
                      >
                        <Input
                          value={(dish.allergens ?? []).join(", ")}
                          onChange={(v) => setDish(ci, di, { allergens: splitAllergens(v) })}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}

              <AddButton
                label="adicionar prato"
                onClick={() =>
                  setCategory(ci, { items: [...category.items, newDish(`${category.id}-${Date.now()}`)] })
                }
              />
            </div>

            <button
              type="button"
              onClick={() => setOpen(open === category.id ? null : category.id)}
              className="label mt-4 text-cream/40 transition-colors hover:text-cream"
            >
              {open === category.id ? "ocultar ajuda" : "como escolher as fotografias"}
            </button>
            {open === category.id && (
              <p className="mt-2 max-w-[70ch] text-[0.85rem] leading-relaxed text-cream/45">
                Use fotografias em quadrado, bem iluminadas e com pouca profundidade de campo. O painel reduz
                automaticamente cada imagem antes de a enviar, por isso pode carregar ficheiros diretos da
                câmara.
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-5">
        <AddButton
          label="adicionar categoria"
          onClick={() => {
            const id = `categoria-${Date.now()}`;
            update([
              ...draft,
              { id, label: "Nova categoria", kicker: "", blurb: "", items: [newDish(`${id}-1`)] },
            ]);
            setOpen(id);
          }}
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
