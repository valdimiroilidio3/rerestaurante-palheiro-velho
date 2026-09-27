import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useSite } from "@/content/context";
import { reduced, useAnim, useIsDesktop } from "@/lib/anim";
import { Eyebrow, Img, MaskWords } from "./primitives";
import { cn } from "@/utils/cn";

/** Horizontal gallery: pinned rail on desktop, native snap-scroll on mobile. */
export function Gallery() {
  const { gallery: GALLERY } = useSite().content;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();

  useAnim(
    ({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const el = track.current;
        if (reduced() || !el) return;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + 48);
        const move = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance() + 120}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        return () => {
          move.kill();
          move.scrollTrigger?.kill();
        };
      });
      const id = window.setTimeout(() => ScrollTrigger.refresh(), 600);
      return () => {
        mm.revert();
        window.clearTimeout(id);
      };
    },
    [desktop],
  );

  const tiles = (
    <>
      <div className="flex w-[86vw] shrink-0 flex-col justify-center pr-6 lg:w-[34vw] lg:max-w-[520px]">
        <Eyebrow index="05" tone="light">
          Referências visuais
        </Eyebrow>
        <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.92] text-cream">
          <MaskWords text="Atmosferas" tone="light" />
          <br />
          <span className="italic text-sand/80">
            <MaskWords text="de referência." tone="light" />
          </span>
        </h2>
        <p className="mt-6 max-w-[36ch] text-[0.98rem] leading-relaxed text-cream/60">
          Imagens editoriais temporárias para demonstrar a composição. Substitua por fotografia e vídeo
          autorizados do Palheiro Velho antes de publicar.
        </p>
        <span className="label mt-8 flex items-center gap-3 text-cream/45">
          <ArrowRight size={16} /> swipe
        </span>
      </div>

      {GALLERY.map((g, i) => (
        <figure
          key={g.id}
          className="group relative w-[78vw] shrink-0 sm:w-[58vw] lg:mr-6 lg:w-[38vw] xl:w-[30vw]"
        >
          <div
            className={cn(
              "relative overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto",
              i % 3 === 1 ? "lg:h-[76svh]" : "lg:h-[58svh]",
            )}
          >
            <Img
              {...g.image}
              sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 38vw, (min-width: 640px) 58vw, 78vw"
              className="h-full w-full"
              imgClassName="brightness-[0.92]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-abyss/75 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
              <div>
                <p className="font-display text-[1.5rem] leading-none text-cream">{g.cap}</p>
                <p className="label mt-2 text-cream/55">{g.loc}</p>
              </div>
              <span className="label tabular-nums text-cream/40">{String(i + 1).padStart(2, "0")}</span>
            </figcaption>
          </div>
        </figure>
      ))}
    </>
  );

  return (
    <section
      ref={root}
      id="galeria"
      className="relative overflow-hidden bg-[#0f2429] py-16 lg:h-[100svh] lg:py-0"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay grain-layer"
      />
      {/* desktop rail */}
      {desktop && (
        <>
          <div className="flex h-full items-center">
            <div ref={track} className="flex items-center pl-12 will-change-transform">
              {tiles}
            </div>
          </div>
          <div className="absolute inset-x-12 bottom-10 hidden h-px bg-cream/15 lg:block">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-sun" />
          </div>
        </>
      )}

      {/* mobile rail */}
      {!desktop && (
        <div className="no-bar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3">{tiles}</div>
      )}
    </section>
  );
}
