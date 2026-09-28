import { ArrowLeft, Phone } from "lucide-react";
import { useSite } from "@/content/context";
import { useLocale, useUi } from "@/i18n/context";
import { Btn, IgIcon } from "@/components/primitives";
import { OpenNow } from "@/components/OpenNow";
import { localeHref } from "@/i18n";

/**
 * Página de “não encontrado”.
 *
 * Uma casa profissional também responde quando se falha o caminho: aqui
 * diz-se o óbvio (a página não existe), mostra-se o estado da casa e abrem-se
 * as três portas que interessam — a carta, o contacto e o telefone.
 */
export function NotFound() {
  const { contact: CONTACT } = useSite().content;
  const { t, locale } = useLocale();
  const ui = useUi();

  return (
    <main className="flex min-h-screen flex-col justify-between bg-char text-cream">
      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <p className="label text-sun">404</p>
        <h1 className="mt-5 font-display text-[clamp(2.6rem,9vw,5rem)] leading-[0.92]">
          {ui["notfound.title"]}
        </h1>
        <p className="mt-6 max-w-[46ch] text-[1rem] leading-relaxed text-cream/65">{ui["notfound.body"]}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Btn href={localeHref(locale, "./index.html")} tone="light" icon={null}>
            <span className="label flex items-center gap-2">
              <ArrowLeft size={13} /> {ui["notfound.home"]}
            </span>
          </Btn>
          <Btn href={`${localeHref(locale, "./index.html")}#menu`} tone="light" variant="outline" icon={null}>
            <span className="label">{ui["notfound.menu"]}</span>
          </Btn>
          <Btn href={`tel:${CONTACT.phone}`} tone="light" variant="outline" icon={<Phone size={14} />}>
            <span className="label">{CONTACT.phoneLabel}</span>
          </Btn>
        </div>

        <div className="mt-10 border-t border-cream/12 pt-6">
          <OpenNow tone="dark" withRanges />
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="label mt-4 inline-flex items-center gap-2 text-cream/55 transition-colors hover:text-sun"
          >
            <IgIcon size={13} /> {CONTACT.instagram}
          </a>
          <p className="mt-3 text-[0.9rem] text-cream/45">{t(CONTACT.kind)}</p>
        </div>
      </div>
    </main>
  );
}
