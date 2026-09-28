import { useCallback, useState } from "react";
import { ArrowUpRight, Heart, Maximize2, Play } from "lucide-react";
import { useSite } from "@/content/context";
import { useReveals } from "@/lib/anim";
import { Btn, Eyebrow, IgIcon, Img, Marquee, MaskWords } from "./primitives";
import { InstagramViewer } from "./InstagramViewer";
import type { InstagramItem } from "@/content/types";
import { cn } from "@/utils/cn";
import { useLocale, useUi } from "@/i18n/context";
import { resolveList } from "@/i18n";

export function InstagramGrid() {
  const { contact: CONTACT, instagram: INSTAGRAM, hashtags: HASHTAGS } = useSite().content;
  const { locale } = useLocale();
  const [open, setOpen] = useState<number | null>(null);
  useReveals([INSTAGRAM.length]);

  const close = useCallback(() => setOpen(null), []);
  const goTo = useCallback((i: number) => setOpen(i), []);

  return (
    <section id="instagram" className="relative overflow-hidden bg-sand py-20 text-char sm:py-28">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
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

          <div className="flex flex-col gap-6 lg:pb-3">
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group/profile flex items-center gap-4 border-y border-espresso/20 py-4"
            >
              <IgIcon
                size={26}
                className="text-espresso transition-transform duration-500 group-hover/profile:scale-110"
              />
              <span className="min-w-0">
                <span className="block font-display text-[1.4rem] leading-none">@{CONTACT.instagram}</span>
                <span className="label mt-2 block text-espresso/55">
                  perfil público oficial identificado na pesquisa
                </span>
              </span>
              <ArrowUpRight
                size={20}
                className="ml-auto shrink-0 transition-transform duration-500 group-hover/profile:-translate-y-1 group-hover/profile:translate-x-1"
              />
            </a>

            <p className="max-w-[52ch] text-[0.95rem] leading-relaxed text-char/65">
              As publicações oficiais não são reproduzidas neste conceito sem autorização. Abra uma peça para
              a ver em grande e siga para o perfil da marca.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Btn href={CONTACT.instagramUrl} tone="dark" icon={<IgIcon size={15} />}>
                <span className="label">Seguir no Instagram</span>
              </Btn>
              <span className="label flex items-center gap-2 text-char/45">
                <Maximize2 size={12} />
                {INSTAGRAM.length} publicações em destaque
              </span>
            </div>
          </div>
        </div>

        {/* mosaico: ritmo assimétrico, peças grandes e pequenas misturadas */}
        <div className="mt-14 grid auto-rows-[42vw] grid-cols-2 gap-2 [grid-auto-flow:dense] sm:auto-rows-[21vw] sm:grid-cols-4 sm:gap-3 lg:auto-rows-[11.5rem] lg:grid-cols-6">
          {INSTAGRAM.map((p, i) => (
            <Tile key={p.id} item={p} index={i} total={INSTAGRAM.length} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>

      <div className="mt-14 border-y border-espresso/15 py-3 text-espresso/70">
        <Marquee
          items={resolveList(HASHTAGS, locale)}
          speed={38}
          className="font-mono text-[0.72rem] tracking-[0.18em] uppercase"
          separator="◦"
        />
      </div>

      {open !== null && (
        <InstagramViewer
          items={INSTAGRAM}
          index={open}
          profileUrl={CONTACT.instagramUrl}
          onClose={close}
          onIndex={goTo}
        />
      )}
    </section>
  );
}

/**
 * Uma peça do mosaico.
 *
 * Em ecrãs táteis a legenda está sempre visível (não existe hover); em ecrã
 * grandes aparece com o rato ou com o teclado.
 */
function Tile({
  item,
  index,
  total,
  onOpen,
}: {
  item: InstagramItem;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const { t } = useLocale();
  const ui = useUi();
  const reel = item.kind === "reel";

  return (
    <button
      type="button"
      onClick={onOpen}
      data-reveal
      data-delay={String((index % 6) * 0.04)}
      aria-label={`Abrir publicação ${index + 1} de ${total}: ${item.cap}`}
      className={cn(
        "group relative overflow-hidden bg-shell text-left",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sun",
        item.span,
      )}
    >
      <Img
        {...item.image}
        sizes="(min-width: 1024px) 16vw, (min-width: 640px) 21vw, 42vw"
        className="absolute inset-0 h-full w-full"
      />

      {reel && (
        <span className="label absolute top-3 left-3 inline-flex items-center gap-1.5 bg-abyss/70 px-2 py-1.5 text-[0.6rem] text-cream backdrop-blur-sm">
          <Play size={9} className="fill-cream text-cream" /> reel
        </span>
      )}

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/20 to-transparent",
          "transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100",
        )}
      />

      <span
        className={cn(
          "pointer-events-none absolute inset-0 flex flex-col justify-end p-3 sm:p-4",
          "transition-all duration-500 lg:translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100",
        )}
      >
        <span className="max-w-[36ch] text-[0.8rem] leading-snug text-cream sm:text-[0.85rem]">
          {t(item.cap)}
        </span>
        <span className="label mt-2 flex items-center gap-2 text-cream/75">
          <Heart size={11} className="fill-sun text-sun" /> {item.likes}
          <span className="ml-auto inline-flex items-center gap-1 text-cream/60">
            {ui["instagram.view"]} <Maximize2 size={10} />
          </span>
        </span>
      </span>
    </button>
  );
}
