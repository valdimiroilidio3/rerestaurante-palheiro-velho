import type { LegalContent } from "@/content/types";
import { useAdminContent, useDraft, useSave } from "@/admin/lib/hooks";
import { saveSettings } from "@/admin/lib/api";
import { Card, Field, Input, SaveBar, SectionHeader, Textarea } from "@/admin/components/ui";

const EMPTY: LegalContent = {
  updatedAt: "",
  entity: "",
  address: "",
  email: "",
  phone: "",
  privacy: "",
  cookies: "",
  terms: "",
};

/**
 * Textos legais.
 *
 * Estão no painel porque a entidade responsável e os contactos mudam com a
 * casa — não com o site. Os valores de origem são neutros e devem ser
 * revistos antes de publicar.
 */
export function LegalTab() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<LegalContent>(content?.legal ?? EMPTY);
  const { saving, save } = useSave(
    draft,
    commit,
    async (value) => {
      await saveSettings({ legal: value });
    },
    "Textos legais guardados — a página legal já mostra as alterações.",
  );

  if (loading) return <p className="text-[0.9rem] text-cream/40">A carregar…</p>;

  const set = <K extends keyof LegalContent>(key: K, value: LegalContent[K]) =>
    update({ ...draft, [key]: value });

  return (
    <div>
      <SectionHeader
        title="Legal"
        description="Privacidade, cookies e termos. Estes textos alimentam a página legal (/legal.html) e o aviso de cookies do site."
      />

      <Card>
        <p className="max-w-[60ch] text-[0.9rem] leading-relaxed text-sand/80">
          Os textos de origem são neutros e servem de base — mas quem é a entidade responsável, que dados se
          tratam e durante quanto tempo depende da casa. Vale a pena uma leitura com quem trata da
          contabilidade antes de publicar.
        </p>
      </Card>

      <Card className="mt-6">
        <h3 className="font-display text-[1.5rem] leading-none text-cream">Responsável</h3>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Entidade responsável" hint="Nome, NIF e sede, como devem constar no site.">
            <Input value={draft.entity} onChange={(next) => set("entity", next)} />
          </Field>
          <Field label="Morada para exercício de direitos">
            <Input value={draft.address} onChange={(next) => set("address", next)} />
          </Field>
          <Field label="Email de privacidade">
            <Input value={draft.email} onChange={(next) => set("email", next)} />
          </Field>
          <Field label="Telefone de privacidade (opcional)">
            <Input value={draft.phone} onChange={(next) => set("phone", next)} />
          </Field>
          <Field label="Última revisão" hint="Formato AAAA-MM-DD. É a data que aparece na página.">
            <Input value={draft.updatedAt} onChange={(next) => set("updatedAt", next)} />
          </Field>
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="font-display text-[1.5rem] leading-none text-cream">Textos</h3>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-cream/50">
          Parágrafos separados por uma linha em branco.
        </p>
        <div className="mt-6 space-y-6">
          <Field
            label="Privacidade"
            hint="Que dados se recolhem, para quê, durante quanto tempo e como exercer direitos."
          >
            <Textarea rows={10} value={draft.privacy} onChange={(next) => set("privacy", next)} />
          </Field>
          <Field label="Cookies" hint="Que cookies existem, para que servem e como se desligam.">
            <Textarea rows={8} value={draft.cookies} onChange={(next) => set("cookies", next)} />
          </Field>
          <Field
            label="Termos de utilização"
            hint="O que o site é — e que um pedido de mesa não é uma reserva confirmada."
          >
            <Textarea rows={8} value={draft.terms} onChange={(next) => set("terms", next)} />
          </Field>
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
