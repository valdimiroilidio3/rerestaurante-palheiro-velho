import { useRef, useState } from "react";
import { PartyPopper, Phone } from "lucide-react";
import { CONTACT, EVENT_PERKS, EVENTS, px, pxSrcSet } from "@/data/site";
import { isDesktop, reduced, useReveals } from "@/lib/anim";
import { Eyebrow, IgIcon, MaskWords } from "./primitives";
import { cn } from "@/utils/cn";

export function Events({ onReserve }: { onReserve: (s?: string) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const fine = isDesktop() && !reduced();
  useReveals([]);

  const onMove = (e: React.PointerEvent) => {
    const g = ghost.current;
    const z = zone.current;
    if (!g || !z || !fine) return;
    const r = z.getBoundingClientRect();
    g.style.transform = `translate3d(${e.clientX - r.left - 150}px, ${e.clientY - r.top - 190}px, 0) rotate(${
      (e.clientX - r.left - r.width / 2) * 0.012
    }deg)`;
  };

  return (
    <section id="eventos" className="relative overflow-hidden bg-abyss py-20 text-cream sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_15%_0%,rgba(24,60,70,0.75),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Eyebrow index="07" tone="light">
              Momentos
            </Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,8.4vw,5.8rem)] leading-[0.88]">
              <MaskWords text="Atividade" tone="light" />
              <br />
              <span className="italic text-sand/85">
                <MaskWords text="publicada." tone="light" />
              </span>
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:pb-4">
            <p className="text-[0.98rem] leading-relaxed text-cream/65">
              O site público associado à marca refere música ao vivo. O registo empresarial público indica a
              organização de eventos culturais e desportivos. Não são apresentadas datas, capacidades ou
              condições sem confirmação direta da casa.
            </p>
            <ul className="space-y-2">
              {EVENT_PERKS.map((p) => (
                <li key={p} className="label flex items-center gap-3 text-cream/55">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-sun" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* list + pré-visualização no hover */}
        <div ref={zone} onPointerMove={onMove} className="relative mt-16">
          {fine && (
            <div
              ref={ghost}
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-0 left-0 z-20 w-[300px] overflow-hidden border border-cream/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-[opacity,filter] duration-500",
                hover === null ? "opacity-0 blur-[2px]" : "opacity-100 blur-0",
              )}
              style={{ aspectRatio: "3 / 4" }}
            >
              {hover !== null && (
                <img
                  src={px(EVENTS[hover].img, 400, 533)}
                  srcSet={pxSrcSet(EVENTS[hover].img, 400, 533)}
                  sizes="300px"
                  width={400}
                  height={533}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          )}

          <div className="border-t border-cream/15">
            {EVENTS.map((ev, i) => (
              <button
                key={ev.id}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => onReserve(`${ev.title}`)}
                className={cn(
                  "group relative grid w-full grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 border-b border-cream/15 py-6 text-left transition-[background-color,padding] duration-500 sm:grid-cols-[3.5rem_1fr_auto] sm:py-8",
                  hover === i ? "bg-cream/[0.05] sm:px-5" : "sm:px-0",
                )}
              >
                <span className="font-mono text-[0.7rem] tracking-[0.2em] text-cream/35">{ev.n}</span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-4">
                    <span className="font-display text-[1.75rem] leading-tight transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 sm:text-[2.5rem]">
                      {ev.title}
                    </span>
                    <span className="label border border-cream/20 px-2 py-1 text-cream/50">{ev.tag}</span>
                  </span>
                  <span className="mt-2 block max-w-[58ch] text-[0.92rem] leading-relaxed text-cream/55">
                    {ev.desc}
                  </span>
                </span>
                <span className="col-span-2 label flex items-center gap-2 text-sun opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 sm:col-span-1 sm:col-start-3">
                  planear <PartyPopper size={13} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onReserve("Pedido sobre eventos")}
          className="group relative mt-14 flex w-full flex-col items-start gap-6 overflow-hidden border border-cream/25 p-7 text-left transition-colors duration-700 sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <span
            aria-hidden
            className="absolute inset-0 z-0 translate-y-full bg-cream transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
          />
          <span className="relative z-10 font-display text-[clamp(1.9rem,6.4vw,4.4rem)] leading-[0.92] transition-colors duration-500 group-hover:text-char">
            Fale com a casa
          </span>
          <span className="relative z-10 flex flex-col items-start gap-3 transition-colors duration-500 group-hover:text-char sm:items-end">
            <span className="label text-cream/60 group-hover:text-char/60">contacto direto</span>
            <span className="label flex items-center gap-2 border-b border-current/40 pb-1">
              enviar mensagem <IgIcon size={13} />
            </span>
            <a
              href={`tel:${CONTACT.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="label flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100"
            >
              <Phone size={12} /> {CONTACT.phoneLabel}
            </a>
          </span>
        </button>
      </div>
    </section>
  );
}
