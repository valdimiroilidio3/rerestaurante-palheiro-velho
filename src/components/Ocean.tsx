import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OCEAN } from "@/data/site";
import { reduced, scrollToId } from "@/lib/anim";
import { Eyebrow } from "./primitives";

/** Full-bleed panorama with a scrubbed giant line: the visual exhale of the page. */
export function Ocean() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        media.current,
        { yPercent: -9, scale: 1.22 },
        {
          yPercent: 9,
          scale: 1.1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      const tl = gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        })
        .fromTo(text.current, { xPercent: 7 }, { xPercent: -7, ease: "none" }, 0);
      gsap.utils.toArray<HTMLElement>("[data-ocean-word]").forEach((w, i) => {
        tl.fromTo(
          w,
          { yPercent: 55 + i * 8, opacity: 0.15 },
          { yPercent: 0, opacity: 1, ease: "none" },
          0.02 * i,
        );
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex h-[108svh] min-h-[520px] w-full items-center justify-center overflow-hidden bg-abyss text-cream"
    >
      <div ref={media} className="absolute inset-[-6%] will-change-transform">
        <picture>
          <source media="(min-width: 1100px)" srcSet={OCEAN.wide} />
          <img
            src={OCEAN.mid}
            alt="Vista aérea do oceano e das dunas junto a Esmoriz ao fim da tarde"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-90"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/80 via-ocean/25 to-abyss/85" />
        <div className="absolute inset-0 bg-ocean/25 mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full px-5 sm:px-8">
        <div ref={text} className="mx-auto max-w-[1680px]">
          <Eyebrow tone="light" index="03" className="justify-center">
            Oceano Atlântico · maré a baixar
          </Eyebrow>

          <h2 className="mt-8 flex flex-wrap items-baseline justify-center gap-x-[0.22em] text-center font-display text-[clamp(2.9rem,15vw,13rem)] leading-[0.82] font-light tracking-[-0.035em]">
            {OCEAN.line.map((w, i) => (
              <span key={w} data-ocean-word className="inline-block">
                {i === 2 ? <em className="font-normal text-sand">{w}</em> : w}
              </span>
            ))}
          </h2>

          <div className="mx-auto mt-10 flex max-w-[900px] flex-col items-center gap-6">
            <p className="max-w-[40ch] text-center text-[1rem] leading-relaxed text-cream/70 sm:text-[1.15rem]">
              {OCEAN.sub}
            </p>
            <button
              onClick={() => scrollToId("galeria")}
              className="group label flex items-center gap-3 border-b border-cream/35 pb-1 text-cream/85 transition-colors hover:border-sun hover:text-sun"
              data-cursor="ver"
            >
              continuar a ver a casa
              <span className="inline-block h-px w-8 bg-current transition-transform duration-500 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* edge frames */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-char via-char/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
