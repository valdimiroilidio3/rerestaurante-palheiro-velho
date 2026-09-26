import { ArrowUp, ExternalLink, Phone } from "lucide-react";
import { BRAND, CONCEPT_NOTICE, CONTACT, MAPS_DIRECTIONS, NAV, TICKER } from "@/data/site";
import { scrollToId, scrollToTop, useReveals } from "@/lib/anim";
import { Btn, IgIcon, Marquee, MaskWords } from "./primitives";

export function Footer({ onReserve }: { onReserve: (s?: string) => void }) {
  useReveals([]);

  return (
    <footer className="relative overflow-hidden bg-char pt-16 text-cream sm:pt-20">
      <div className="border-y border-cream/12 py-4 font-display text-[1.6rem] italic text-cream/40 sm:text-[2.2rem]">
        <Marquee items={[...TICKER, "Palheiro Velho"]} speed={54} separator="✳" />
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
              {CONTACT.note} Informação de contacto e serviços recolhida em fontes públicas; confirmar sempre
              antes de visitar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn onClick={() => onReserve("Contacto direto")} tone="light">
                <span className="label">Contactar</span>
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
                consulta a fonte
              </span>
            </a>
          </div>
          <div className="grid gap-10 sm:grid-cols-2">
            <nav>
              <p className="label text-cream/40">Navegar</p>
              <ul className="mt-4 space-y-2.5">
                {NAV.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => scrollToId(n.id)}
                      className="link-swipe font-display text-[1.35rem] text-cream/85 transition-colors hover:text-cream"
                    >
                      {n.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => scrollToId("intro")}
                    className="link-swipe font-display text-[1.35rem] text-cream/85 transition-colors hover:text-cream"
                  >
                    A casa
                  </button>
                </li>
              </ul>
            </nav>
            <div>
              <p className="label text-cream/40">Canais públicos</p>
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
                    <IgIcon size={13} /> Instagram
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="label flex items-center gap-2 text-cream/70 transition-colors hover:text-sun"
                  >
                    <ExternalLink size={13} /> Facebook
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="label flex items-center gap-2 text-cream/70 transition-colors hover:text-sun"
                  >
                    <Phone size={13} /> Telefone
                  </a>
                </li>
                <li>
                  <a
                    href={MAPS_DIRECTIONS}
                    target="_blank"
                    rel="noreferrer"
                    className="label flex items-center gap-2 text-cream/70 transition-colors hover:text-sun"
                  >
                    <ArrowUp size={13} /> Localização
                  </a>
                </li>
              </ul>
              <div className="mt-7 border-t border-cream/12 pt-4">
                <p className="label text-cream/40">Nota de publicação</p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/50">
                  Horários, carta e condições não são exibidos devido a divergências nas fontes públicas.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t border-cream/12 py-7">
          <p className="label text-cream/40">© 2026 Palheiro Velho · conceito privado</p>
          <p className="max-w-[56ch] text-[0.72rem] leading-relaxed text-cream/35">
            {CONCEPT_NOTICE} {BRAND.photoStatus}
          </p>
          <button
            onClick={scrollToTop}
            className="group label flex items-center gap-3 border border-cream/25 px-4 py-3 transition-colors hover:bg-cream hover:text-char"
            data-cursor="topo"
          >
            voltar ao topo{" "}
            <ArrowUp size={13} className="transition-transform duration-500 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
