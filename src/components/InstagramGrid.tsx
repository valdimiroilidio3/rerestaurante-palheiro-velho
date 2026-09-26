import { Heart, ArrowUpRight } from "lucide-react";
import { useSite } from "@/content/context";
import { useReveals } from "@/lib/anim";
import { Btn, Eyebrow, IgIcon, Img, MaskWords, Marquee } from "./primitives";
import { cn } from "@/utils/cn";

export function InstagramGrid() {
  const { contact: CONTACT, instagram: INSTAGRAM, hashtags: HASHTAGS } = useSite().content;
  useReveals([]);
  return (
    <section id="instagram" className="relative overflow-hidden bg-sand py-20 text-char sm:py-28">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <Eyebrow index="06">Instagram</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,9.5vw,6.4rem)] leading-[0.86]">
              <MaskWords text="Follow" />
              <br />
              <span className="italic text-espresso/70">
                <MaskWords text="the moment." />
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-6 lg:pb-4">
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 border-y border-espresso/20 py-4"
            >
              <IgIcon
                size={26}
                className="text-espresso transition-transform duration-500 group-hover:scale-110"
              />
              <span className="min-w-0">
                <span className="block font-display text-[1.4rem] leading-none">@{CONTACT.instagram}</span>
                <span className="label mt-2 block text-espresso/55">
                  perfil público oficial identificado na pesquisa
                </span>
              </span>
              <ArrowUpRight
                size={20}
                className="ml-auto shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>
            <p className="text-[0.95rem] leading-relaxed text-char/65">
              As publicações oficiais não são reproduzidas neste conceito sem autorização. Abra o perfil da
              marca para ver o conteúdo atual e usar os seus canais de contacto.
            </p>
            <Btn href={CONTACT.instagramUrl} tone="dark" className="self-start">
              <span className="label">Abrir Instagram</span>
            </Btn>
          </div>
        </div>

        {/* asymmetric grid */}
        <div className="mt-14 grid auto-rows-[43vw] grid-cols-2 gap-2 [grid-auto-flow:dense] sm:auto-rows-[23vw] sm:grid-cols-4 sm:gap-3 lg:auto-rows-[11.5rem] lg:grid-cols-6">
          {INSTAGRAM.map((p, i) => (
            <a
              key={p.id}
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noreferrer"
              data-reveal
              data-delay={String((i % 6) * 0.04)}
              className={cn("group relative overflow-hidden bg-shell", p.span)}
              aria-label="Abrir perfil oficial de Instagram"
            >
              <Img
                {...p.image}
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 23vw, 43vw"
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-char/85 via-char/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-all duration-500 group-hover:opacity-100">
                <p className="text-[0.85rem] leading-snug text-cream">{p.cap}</p>
                <p className="label mt-2 flex items-center gap-2 text-cream/70">
                  <Heart size={11} className="fill-sun text-sun" /> {p.likes}
                  <span className="ml-auto inline-flex items-center gap-1">
                    abrir <ArrowUpRight size={11} />
                  </span>
                </p>
              </div>
              <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-cream/0 transition-colors duration-500 group-hover:bg-cream/70" />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-14 border-y border-espresso/15 py-3 text-espresso/70">
        <Marquee
          items={HASHTAGS}
          speed={38}
          className="font-mono text-[0.72rem] tracking-[0.18em] uppercase"
          separator="◦"
        />
      </div>
    </section>
  );
}
