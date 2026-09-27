import { useRef, useState } from "react";
import { useSite } from "@/content/context";
import { isDesktop, useAnim, useReveals } from "@/lib/anim";
import { Eyebrow, Img, Marquee, MaskWords } from "./primitives";

export function Intro() {
  const { brand: BRAND, intro, ticker: TICKER } = useSite().content;
  const INTRO_IMAGES = intro.images;
  const INTRO_FACTS = intro.facts;
  const root = useRef<HTMLElement>(null);
  const imgA = useRef<HTMLDivElement>(null);
  const imgB = useRef<HTMLDivElement>(null);
  useReveals([]);

  useAnim(({ gsap, ScrollTrigger }) => {
    if (!isDesktop()) return;
    const ctx = gsap.context(() => {
      gsap.to(imgA.current, {
        yPercent: -9,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(imgB.current, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  const [hover, setHover] = useState<number | null>(null);

  return (
    <section
      ref={root}
      id="intro"
      className="relative overflow-hidden bg-cream pt-16 pb-0 text-char sm:pt-24"
    >
      {/* warm paper texture lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5] grain-layer mix-blend-multiply"
      />

      <div className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ——— text ——— */}
          <div>
            <Eyebrow index="01">Informação confirmada</Eyebrow>
            <h2 className="mt-7 font-display text-[clamp(2.5rem,8.6vw,5.6rem)] leading-[0.9]">
              <MaskWords text="Mais do que" />
              <br />
              <span className="text-espresso/70">
                <MaskWords text="uma refeição." />
              </span>
            </h2>

            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              <p data-reveal className="text-[1.05rem] leading-[1.75] text-char/80">
                O <strong className="font-semibold">Palheiro Velho</strong> é identificado publicamente como
                um bar de praia em Esmoriz, na Travessa da Barrinha. As páginas públicas associadas ao espaço
                referem vista para o mar e mesas exteriores.
              </p>
              <p data-reveal data-delay="0.1" className="text-[1.05rem] leading-[1.75] text-char/70">
                Este website é um conceito privado de design, criado a partir dos canais públicos encontrados.
                A carta, o horário, as imagens e qualquer campanha comercial devem ser confirmados com a marca
                antes de serem publicados.
              </p>
            </div>
          </div>

          {/* ——— image stack ——— */}
          <div className="relative">
            <div ref={imgA} className="group relative">
              <div data-reveal="img">
                <Img
                  {...INTRO_IMAGES[0]}
                  sizes="(min-width: 1024px) 45vw, 92vw"
                  ratio="4 / 5"
                  className="w-full"
                  imgClassName="grayscale-[18%]"
                />
              </div>
              <figcaption className="label mt-3 flex items-center justify-between text-espresso/55">
                <span>imagem de referência</span>
                <span>não representa a casa</span>
              </figcaption>
            </div>

            <div
              ref={imgB}
              className="absolute -bottom-10 -left-3 w-[46%] max-w-[230px] sm:-left-8 sm:w-[38%]"
            >
              <div data-reveal="img" className="border-[6px] border-cream bg-cream">
                <Img {...INTRO_IMAGES[1]} sizes="(min-width: 640px) 240px, 180px" ratio="3 / 4" />
              </div>
            </div>

            <div className="absolute -right-3 bottom-24 hidden w-[27%] max-w-[190px] -rotate-2 border-[6px] border-cream bg-cream shadow-[0_20px_50px_-25px_rgba(58,42,32,0.6)] lg:block">
              <div data-reveal="img">
                <Img {...INTRO_IMAGES[2]} sizes="190px" ratio="1 / 1" />
              </div>
            </div>

            <a
              href={BRAND.publicLogoSource}
              target="_blank"
              rel="noreferrer"
              className="absolute -top-4 right-0 hidden w-[180px] rotate-[3deg] border border-espresso/15 bg-sand/90 p-3 backdrop-blur-sm sm:block"
            >
              <img
                src={BRAND.publicLogo}
                alt="Logótipo público Palheiro Velho"
                loading="lazy"
                decoding="async"
                className="h-14 w-full object-contain"
              />
              <p className="label mt-2 text-espresso/50">{BRAND.assetStatus}</p>
            </a>
          </div>
        </div>

        {/* ——— facts ——— */}
        <ul className="mt-20 border-t border-espresso/15 sm:mt-28">
          {INTRO_FACTS.map((f, i) => (
            <li
              key={f.k}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="group relative grid grid-cols-[auto_1fr] items-start gap-4 border-b border-espresso/15 py-6 transition-colors duration-500 hover:bg-sand/45 sm:grid-cols-[5rem_1fr_1.3fr] sm:items-center sm:gap-8 sm:py-8"
            >
              <span
                className="font-mono text-[0.7rem] tracking-[0.2em] text-espresso/45 transition-transform duration-500 sm:translate-x-2"
                style={{ transform: hover === i ? "translateX(6px)" : undefined }}
              >
                {f.k}
              </span>
              <h3 className="font-display text-[1.6rem] leading-tight transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 sm:text-[2.1rem]">
                {f.t}
              </h3>
              <p className="col-start-2 text-[0.95rem] leading-relaxed text-char/65 sm:col-start-3">{f.d}</p>
              <span
                aria-hidden
                className="absolute top-0 -left-2 hidden h-full w-[calc(100%+1rem)] origin-left bg-gradient-to-r from-sun/12 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:block"
                style={{ transform: `scaleX(${hover === i ? 1 : 0})` }}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* ——— ticker ——— */}
      <div className="relative mt-16 border-y border-ocean/20 bg-ocean py-4 text-cream sm:mt-24">
        <Marquee items={TICKER} speed={46} className="label text-[0.72rem] sm:text-[0.8rem]" separator="✳" />
      </div>
    </section>
  );
}
