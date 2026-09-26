import { useState } from "react";
import { useSite } from "@/content/context";
import { useIsDesktop, useReveals } from "@/lib/anim";
import { Btn, Eyebrow, Img, MaskWords } from "./primitives";
import { cn } from "@/utils/cn";

const ACCENT: Record<string, string> = {
  view: "#d1854a",
  outside: "#c9743a",
  music: "#9fbcbd",
  brunch: "#e8dcc8",
  parking: "#b4552a",
};

export function Experience({ onReserve }: { onReserve: (s?: string) => void }) {
  const { experience: EXPERIENCE } = useSite().content;
  const [open, setOpen] = useState(0);
  const desktop = useIsDesktop();
  useReveals([]);

  return (
    <section id="experiencia" className="relative overflow-hidden bg-cream py-20 text-char sm:py-28">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Eyebrow index="04">A experiência</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.3rem,7.6vw,5.4rem)] leading-[0.9]">
              <MaskWords text="Elementos" />
              <br />
              <span className="italic text-espresso/65">
                <MaskWords text="publicados." />
              </span>
            </h2>
          </div>
          <p data-reveal className="max-w-[38ch] text-[0.98rem] leading-relaxed text-char/65 lg:pb-3">
            Informação recolhida em canais públicos associados à marca. As fotografias desta secção são
            referências temporárias e não representam o Palheiro Velho.
          </p>
        </div>
      </div>

      {/* panels */}
      {desktop ? (
        <div className="mx-auto mt-14 flex h-[74vh] max-h-[680px] min-h-[440px] w-full gap-2 px-5 sm:px-8 lg:px-12">
          {EXPERIENCE.map((x, i) => {
            const isOpen = open === i;
            return (
              <button
                key={x.id}
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                onClick={() => onReserve(`Contacto sobre: ${x.label}`)}
                aria-label={`${x.label}: ${x.text}`}
                className="group relative overflow-hidden text-left transition-[flex] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ flex: isOpen ? "3.4 1 0%" : "0.75 1 0%" }}
              >
                <Img
                  {...x.image}
                  sizes="(min-width: 1024px) 40vw, 80vw"
                  hover={false}
                  className="absolute inset-0 h-full w-full"
                  imgClassName={cn(
                    "transition-transform duration-[1200ms]",
                    isOpen ? "scale-[1.02] saturate-[1.05]" : "scale-[1.14] saturate-[0.35] brightness-[0.7]",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700",
                    isOpen ? "bg-gradient-to-t from-char/90 via-char/25 to-transparent" : "bg-char/55",
                  )}
                />
                {/* collapsed label */}
                <span
                  className={cn(
                    "absolute bottom-6 left-1/2 -translate-x-1/2 [writing-mode:vertical-rl] font-display text-[1.35rem] tracking-[0.06em] text-cream transition-opacity duration-500",
                    isOpen ? "opacity-0" : "opacity-100",
                  )}
                >
                  {x.idx} {x.label}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-[3px] origin-left transition-transform duration-[900ms]",
                    isOpen ? "scale-x-100" : "scale-x-0",
                  )}
                  style={{ background: ACCENT[x.id] }}
                />

                {/* open content */}
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 p-6 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-8",
                    isOpen ? "translate-y-0 opacity-100 delay-150" : "translate-y-6 opacity-0",
                  )}
                >
                  <p className="label flex items-center gap-3 text-cream/60">
                    <span className="tabular-nums">{x.idx}</span>
                    <span className="h-px w-6 bg-cream/35" />
                    {x.meta}
                  </p>
                  <h3 className="mt-4 font-display text-[clamp(2rem,4.2vw,3.6rem)] leading-none text-cream">
                    {x.label}
                  </h3>
                  <p className="mt-4 max-w-[42ch] text-[0.98rem] leading-relaxed text-cream/75">{x.text}</p>
                  <span className="label mt-6 inline-flex items-center gap-2 border-b border-cream/35 pb-1 text-cream">
                    confirmar com a casa →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="no-bar mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {EXPERIENCE.map((x, i) => (
            <article
              key={x.id}
              className="group relative w-[80vw] shrink-0 snap-center overflow-hidden bg-char text-cream"
              style={{ aspectRatio: "3 / 4" }}
            >
              <Img {...x.image} sizes="80vw" className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-char via-char/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="label flex items-center gap-3 text-cream/60">
                  <span className="tabular-nums">{x.idx}</span>
                  <span className="h-px w-6 bg-cream/35" />
                  {x.meta}
                </p>
                <h3 className="mt-3 font-display text-[2.4rem] leading-none">{x.label}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-cream/75">{x.text}</p>
                <span
                  className="mt-5 block h-[3px] w-full origin-left"
                  style={{ background: ACCENT[x.id], opacity: i === 0 ? 1 : 0.65 }}
                />
              </div>
            </article>
          ))}
          <div className="w-2 shrink-0" />
        </div>
      )}

      <div className="mx-auto mt-14 flex max-w-[1680px] flex-wrap items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <p className="max-w-[46ch] text-[0.95rem] leading-relaxed text-char/60">
          Os serviços publicados incluem vista para o mar, mesas exteriores, música ao vivo, brunch e
          estacionamento. Horários, carta e condições devem ser confirmados diretamente com a marca.
        </p>
        <Btn onClick={() => onReserve("Informações e disponibilidade")} tone="dark">
          <span className="label">Contactar a casa</span>
        </Btn>
      </div>
    </section>
  );
}
