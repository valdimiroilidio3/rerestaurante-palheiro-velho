import { ArrowUp, Cookie, ExternalLink, FileText, Phone } from "lucide-react";
import { useSite } from "@/content/context";
import { mapsUrls } from "@/content/types";
import { scrollToId, scrollToTop, useReveals } from "@/lib/anim";
import { Btn, IgIcon, Marquee, MaskWords } from "./primitives";
import { openConsent } from "@/lib/consent";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLocale, useUi } from "@/i18n/context";
import { localeHref, resolveList } from "@/i18n";

export function Footer({ onReserve }: { onReserve: (s?: string) => void }) {
  const { brand: BRAND, contact: CONTACT, nav: NAV, ticker: TICKER } = useSite().content;
  const { t, locale } = useLocale();
  const ui = useUi();
  const legalLinks: [string, string][] = [
    [ui["footer.privacy"], "./legal.html#privacidade"],
    [ui["footer.cookiesLink"], "./legal.html#cookies"],
    [ui["footer.terms"], "./legal.html#termos"],
  ];
  const maps = mapsUrls(CONTACT.mapsQuery);
  useReveals([]);

  return (
    <footer className="relative overflow-hidden bg-char pt-16 text-cream sm:pt-20">
      <div className="border-y border-cream/12 py-4 font-display text-[1.6rem] italic text-cream/40 sm:text-[2.2rem]">
        <Marquee items={[...resolveList(TICKER, locale), CONTACT.name]} speed={54} separator="✳" />
      </div>
      <div className="mx-auto max-w-[1680px] px-5 pt-14 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <h2 className="font-display text-[clamp(2.7rem,13vw,9.5rem)] leading-[0.84] tracking-[-0.03em]">
              <MaskWords text="Palheiro" tone="light" />
              <br />
              <span className="italic text-sand/75">
                <MaskWords text="Velho" tone="light" />
              </span>
            </h2>
            <p className="mt-7 max-w-[44ch] text-[1rem] leading-relaxed text-cream/55">
              {t(CONTACT.note)} {ui["footer.disclaimer"]}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn onClick={() => onReserve("Contacto direto")} tone="light">
                <span className="label">{ui["nav.reserve"]}</span>
              </Btn>
              <Btn href={`tel:${CONTACT.phone}`} tone="light" variant="outline" icon={<Phone size={14} />}>
                <span className="label">{CONTACT.phoneLabel}</span>
              </Btn>
            </div>
            <a
              href={BRAND.publicLogoSource}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 border-t border-cream/12 pt-5"
            >
              <img
                src={BRAND.publicLogo}
                alt="Logótipo público do Palheiro Velho"
                loading="lazy"
                decoding="async"
                className="h-10 w-24 object-contain brightness-0 invert"
              />
              <span className="label text-cream/45">
                {BRAND.assetStatus}
                <br />
                {ui["footer.source"]}
              </span>
            </a>
          </div>
          <div className="grid gap-10 sm:grid-cols-2">
            <nav>
              <p className="label text-cream/40">{ui["footer.navigate"]}</p>
              <ul className="mt-4 space-y-2.5">
                {NAV.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => scrollToId(n.id)}
                      className="link-swipe font-display text-[1.35rem] text-cream/85 transition-colors hover:text-cream"
                    >
                      {t(n.label)}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => scrollToId("intro")}
                    className="link-swipe font-display text-[1.35rem] text-cream/85 transition-colors hover:text-cream"
                  >
                    {ui["footer.house"]}
                  </button>
                </li>
              </ul>
            </nav>
            <div>
              <p className="label text-cream/40">{ui["footer.channels"]}</p>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/70">
                {CONTACT.address}
                <br />
                {CONTACT.locality}
                <br />
                {CONTACT.region}
              </p>
              <ul className="mt-5 space-y-2.5">
                <li>
                  <a
                    href={CONTACT.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="label flex items-center gap-2 text-cream/70 transition-colors hover:text-sun"
                  >
                    <IgIcon size={13} /> {ui["footer.instagram"]}
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="label flex items-center gap-2 text-cream/70 transition-colors hover:text-sun"
                  >
                    <ExternalLink size={13} /> {ui["footer.facebook"]}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="label flex items-center gap-2 text-cream/70 transition-colors hover:text-sun"
                  >
                    <Phone size={13} /> {ui["footer.phone"]}
                  </a>
                </li>
                <li>
                  <a
                    href={maps.directions}
                    target="_blank"
                    rel="noreferrer"
                    className="label flex items-center gap-2 text-cream/70 transition-colors hover:text-sun"
                  >
                    <ArrowUp size={13} /> {ui["footer.location"]}
                  </a>
                </li>
              </ul>
              <div className="mt-7 border-t border-cream/12 pt-4">
                <p className="label text-cream/40">{ui["footer.legal"]}</p>
                <ul className="mt-3 space-y-2">
                  {legalLinks.map(([label, href]) => (
                    <li key={href}>
                      <a
                        href={localeHref(locale, href)}
                        className="label flex items-center gap-2 text-cream/60 transition-colors hover:text-sun"
                      >
                        <FileText size={12} /> {label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={openConsent}
                      className="label flex items-center gap-2 text-cream/60 transition-colors hover:text-sun"
                    >
                      <Cookie size={12} /> {ui["footer.cookies"]}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t border-cream/12 py-7">
          <p className="label text-cream/40">
            © {new Date().getFullYear()} {CONTACT.name} · {CONTACT.locality}
          </p>
          {/* em baixo também se muda de língua — quem chega ao fim não tem de subir */}
          <LanguageSwitch className="text-cream/45" tone="dark" />
          <button
            onClick={scrollToTop}
            className="group label flex items-center gap-3 border border-cream/25 px-4 py-3 transition-colors hover:bg-cream hover:text-char"
          >
            {ui["footer.top"]}{" "}
            <ArrowUp size={13} className="transition-transform duration-500 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
