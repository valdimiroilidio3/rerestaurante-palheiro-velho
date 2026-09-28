import { useLocale } from "@/i18n/context";
import { LOCALES, LOCALE_LABEL } from "@/i18n";
import { cn } from "@/utils/cn";

/**
 *Troca de idioma (PT / EN).
 *
 * Está onde as pessoas esperam: no topo e no rodapé. Marca o idioma ativo e
 * diz o nome por extenso a quem usa leitor de ecrã.
 */
export function LanguageSwitch({
  className,
  tone = "dark",
}: {
  className?: string;
  /** `dark` para fundos escuros, `light` para claros. */
  tone?: "dark" | "light";
}) {
  const { locale, setLocale, ui } = useLocale();

  const base = tone === "dark" ? "text-cream/50 hover:text-cream" : "text-espresso/60 hover:text-char";
  const active = tone === "dark" ? "text-cream" : "text-char";

  return (
    <div
      role="group"
      aria-label={ui["language.label"]}
      className={cn("label flex items-center gap-2", className)}
    >
      {LOCALES.map((option, index) => (
        <span key={option} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="opacity-30">
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={locale === option}
            title={ui[option === "pt" ? "language.pt" : "language.en"]}
            className={cn(
              "transition-colors",
              locale === option ? active : base,
              locale === option && "underline decoration-1 underline-offset-4",
            )}
          >
            {LOCALE_LABEL[option]}
          </button>
        </span>
      ))}
    </div>
  );
}
