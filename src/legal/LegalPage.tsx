import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useSite } from "@/content/context";
import { formatDate, paragraphs } from "@/lib/text";
import { useLocale, useUi } from "@/i18n/context";
import { fill } from "@/i18n/ui";
import { localeHref } from "@/i18n";
import type { Text } from "@/i18n";

/**
 * Página legal: privacidade, cookies e termos.
 *
 * É uma página a sério (com endereço próprio) porque é assim que a lei a quer
 * — acessível a partir de qualquer ponto do site, incluindo do aviso de
 * cookies, e sem dependências. O texto vem do painel, tal como o resto do
 * conteúdo: a entidade responsável e os contactos mudam com a casa.
 */
export function LegalPage() {
  const { content } = useSite();
  const { legal, contact } = content;
  const { t, locale } = useLocale();
  const ui = useUi();

  return (
    <main className="min-h-screen bg-cream text-char">
      <div className="mx-auto max-w-[820px] px-5 py-12 sm:px-8 sm:py-20">
        <a
          href={localeHref(locale, "./index.html")}
          className="label inline-flex items-center gap-2 text-espresso/60 transition-colors hover:text-char"
        >
          <ArrowLeft size={13} /> {ui["legal.back"]}
        </a>

        <h1 className="mt-8 font-display text-[2.6rem] leading-[1.02] sm:text-[3.4rem]">
          {ui["legal.title"]}
        </h1>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-char/65">
          {fill(ui["legal.updated"], { date: formatDate(legal.updatedAt, locale) })} {ui["legal.doubt"]}{" "}
          <a className="underline underline-offset-4" href={`mailto:${legal.email}`}>
            {legal.email}
          </a>
          .
        </p>

        <Section id="privacidade" title={ui["legal.privacy"]} body={legal.privacy} />
        <Section id="cookies" title={ui["legal.cookies"]} body={legal.cookies} />
        <Section id="termos" title={ui["legal.terms"]} body={legal.terms} />

        <section className="mt-14 border-t border-espresso/20 pt-8">
          <h2 className="font-display text-[1.7rem] leading-none">{ui["legal.responsible"]}</h2>
          <dl className="mt-5 space-y-3 text-[0.95rem]">
            <Row label={ui["legal.entity"]} value={t(legal.entity)} />
            <Row label={ui["legal.address"]} value={t(legal.address)} />
            <Row
              label={ui["legal.email"]}
              value={
                <a className="underline underline-offset-4" href={`mailto:${legal.email}`}>
                  {legal.email}
                </a>
              }
            />
            {legal.phone && (
              <Row
                label={ui["legal.phone"]}
                value={
                  <a className="underline underline-offset-4" href={`tel:${legal.phone}`}>
                    {legal.phone}
                  </a>
                }
              />
            )}
          </dl>
          <p className="mt-6 text-[0.85rem] leading-relaxed text-char/55">{ui["legal.rights"]}</p>
        </section>

        <p className="mt-12 text-[0.8rem] leading-relaxed text-char/45">
          Palheiro Velho · {contact.locality} · {contact.phoneLabel}
        </p>
      </div>
    </main>
  );
}

function Section({ id, title, body }: { id: string; title: string; body: Text }) {
  const { t } = useLocale();
  return (
    <section id={id} className="mt-14 scroll-mt-8 border-t border-espresso/20 pt-8">
      <h2 className="font-display text-[1.7rem] leading-none">{title}</h2>
      <div className="mt-5 space-y-4">
        {paragraphs(t(body)).map((paragraph, index) => (
          <p key={index} className="max-w-[70ch] text-[1rem] leading-[1.75] text-char/75">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-espresso/15 pb-2">
      <dt className="label w-28 shrink-0 text-espresso/50">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
