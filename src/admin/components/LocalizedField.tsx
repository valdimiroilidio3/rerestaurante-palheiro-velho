import type { Text } from "@/i18n";
import { resolve } from "@/i18n";
import { mergeLines } from "@/i18n/list";
import { Field, Input, Textarea } from "./ui";

/**
 * Campos com tradução.
 *
 * O painel é da casa, por isso fala português — mas cada texto que aparece no
 * site tem duas caixas: uma para português e outra para inglês. A da direita
 * pode ficar vazia: o site cai no português e ninguém vê um buraco.
 */
const asLocalized = (value: Text): { pt: string; en: string } =>
  typeof value === "string" ? { pt: value, en: "" } : { pt: value?.pt ?? "", en: value?.en ?? "" };

const updated = (value: Text, locale: "pt" | "en", next: string): Text => ({
  ...asLocalized(value),
  [locale]: next,
});

export function LocalizedInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  hint?: string;
  value: Text;
  onChange: (next: Text) => void;
  placeholder?: string;
  className?: string;
}) {
  const current = asLocalized(value);
  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`${label} · PT`} hint={hint}>
          <Input
            value={current.pt}
            placeholder={placeholder}
            onChange={(next) => onChange(updated(value, "pt", next))}
          />
        </Field>
        <Field label={`${label} · EN`} hint="Em branco, mostra-se o português.">
          <Input
            value={current.en}
            placeholder={placeholder}
            onChange={(next) => onChange(updated(value, "en", next))}
          />
        </Field>
      </div>
    </div>
  );
}

export function LocalizedTextarea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  className,
}: {
  label: string;
  hint?: string;
  value: Text;
  onChange: (next: Text) => void;
  rows?: number;
  className?: string;
}) {
  const current = asLocalized(value);
  return (
    <div className={className}>
      <div className="grid gap-3 lg:grid-cols-2">
        <Field label={`${label} · PT`} hint={hint}>
          <Textarea
            rows={rows}
            value={current.pt}
            onChange={(next) => onChange(updated(value, "pt", next))}
          />
        </Field>
        <Field label={`${label} · EN`} hint="Em branco, mostra-se o português.">
          <Textarea
            rows={rows}
            value={current.en}
            onChange={(next) => onChange(updated(value, "en", next))}
          />
        </Field>
      </div>
    </div>
  );
}

/**
 * Listas (faixas, hashtags, vantagens): uma linha por entrada, em cada língua.
 * As linhas emparelham-se pela ordem; o que não tiver par fica em português.
 */
export function LocalizedLines({
  label,
  hint,
  value,
  onChange,
  rows = 6,
  className,
}: {
  label: string;
  hint?: string;
  value: readonly Text[];
  onChange: (next: Text[]) => void;
  rows?: number;
  className?: string;
}) {
  const ptLines = value.map((item) => resolve(item, "pt")).join("\n");
  const enLines = value.map((item) => resolve(item, "en")).join("\n");

  const set = (locale: "pt" | "en", text: string) => {
    const lines = text.split("\n");
    onChange(mergeLines(lines, value, locale));
  };

  return (
    <div className={className}>
      <div className="grid gap-3 lg:grid-cols-2">
        <Field label={`${label} · PT`} hint={hint}>
          <Textarea rows={rows} value={ptLines} onChange={(next) => set("pt", next)} />
        </Field>
        <Field label={`${label} · EN`} hint="Uma entrada por linha, na mesma ordem.">
          <Textarea rows={rows} value={enLines} onChange={(next) => set("en", next)} />
        </Field>
      </div>
    </div>
  );
}
