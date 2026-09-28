import { useMemo, useRef, useState } from "react";

import { ArrowUpRight, Info } from "lucide-react";
import { useSite } from "@/content/context";
import type { Dish } from "@/content/types";
import { reduced } from "@/lib/anim";
import { cn } from "@/utils/cn";
import { allergensIn, dishAllergens, formatPrice, menuWithoutAllergen, priceStats } from "@/lib/menu";
import { Btn, Eyebrow, Img, MaskWords } from "./primitives";
import { useLocale, useUi } from "@/i18n/context";
import { fill } from "@/i18n/ui";

function useSpotlight() {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return { ref, onMove };
}

function DishRow({ dish, i, onPick }: { dish: Dish; i: number; onPick: () => void }) {
  const { ref, onMove } = useSpotlight();
  const { t, locale } = useLocale();
  const ui = useUi();
  return (
    <button
      ref={ref as never}
      onPointerMove={onMove}
      onClick={onPick}
      type="button"
      className={cn(
        "group/row relative grid w-full grid-cols-[76px_1fr] items-center gap-4 border-b border-cream/12 py-4 text-left transition-colors duration-500 hover:border-cream/30 sm:grid-cols-[110px_1fr] sm:gap-7 sm:py-5",
        !reduced() && "menu-swap",
      )}
      style={{
        animationDelay: `${0.04 * i + 0.08}s`,
        backgroundImage:
          "radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgba(232,220,200,0.09), transparent 62%)",
      }}
    >
      <div className="relative overflow-hidden">
        <Img
          {...dish.image}
          sizes="(min-width: 640px) 110px, 76px"
          ratio="1 / 1"
          className="w-full"
          imgClassName="saturate-[0.9] grayscale-[35%] group-hover/row:saturate-[1.15] group-hover/row:grayscale-0"
        />
        <span className="absolute inset-0 bg-char/25 transition-opacity duration-500 group-hover/row:opacity-0" />
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <h4 className="font-display text-[1.25rem] leading-snug transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-1 sm:text-[1.5rem]">
            {t(dish.name)}
          </h4>
          {dish.flag && (
            <span className="label hidden shrink-0 border border-sun/45 px-2 py-1 text-sun/90 sm:inline-block">
              {t(dish.flag)}
            </span>
          )}
          <span className="mx-2 hidden h-px flex-1 self-end border-b border-dotted border-cream/25 sm:block" />
          <span className="label ml-auto shrink-0 tabular-nums text-cream/55 transition-colors duration-500 group-hover/row:text-sun sm:ml-0">
            {dish.price}
          </span>
        </div>
        <p className="mt-1 max-w-[52ch] text-[0.88rem] leading-relaxed text-cream/50">{t(dish.desc)}</p>
        {dish.allergens.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.72rem] text-cream/45">
            <span className="label text-cream/35">{ui["menu.contains"]}</span>
            {dishAllergens(dish, locale).map((item) => (
              <span key={item} className="border border-cream/15 px-2 py-0.5">
                {item}
              </span>
            ))}
          </p>
        )}
        <span className="label mt-2 hidden items-center gap-1.5 text-cream/0 transition-colors duration-500 group-hover/row:text-cream/70 sm:flex">
          {ui["menu.confirm"]} <ArrowUpRight size={12} />
        </span>
      </div>
    </button>
  );
}

export function MenuSection({ onReserve }: { onReserve: (subject?: string) => void }) {
  const { menu: MENU } = useSite().content;
  const { t, locale } = useLocale();
  const ui = useUi();
  const [cat, setCat] = useState(0);
  // "evitar um alergénio" só aparece quando a casa declarou algum
  const allergens = useMemo(() => allergensIn(MENU, locale), [MENU, locale]);
  const [avoid, setAvoid] = useState<string | null>(null);
  const menu = useMemo(
    () => (avoid ? menuWithoutAllergen(MENU, avoid, locale) : MENU),
    [MENU, avoid, locale],
  );
  // ao filtrar, a categoria escolhida pode deixar de existir
  const index = Math.min(cat, Math.max(0, menu.length - 1));
  const active = menu[index];
  const feature = active?.items[0];
  // os preços da categoria que se está a ver (só quando a casa os publicou)
  const prices = useMemo(() => (active ? priceStats(active.items) : null), [active]);
  const priceRange = (stats: NonNullable<typeof prices>): string => {
    const money = (value: number) =>
      `${formatPrice(value, locale)}${stats.currency ? ` ${stats.currency}` : ""}`;
    return stats.min === stats.max
      ? money(stats.min)
      : fill(ui["menu.priceRange"], { min: money(stats.min), max: money(stats.max) });
  };

  const rest = active ? active.items.slice(1) : [];

  return (
    <section id="menu" className="relative overflow-hidden bg-char pt-20 pb-24 text-cream sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(24,60,70,0.55),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        {/* header */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <Eyebrow index="02" tone="light">
              {ui["menu.eyebrow"]}
            </Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,9vw,6rem)] leading-[0.88]">
              <MaskWords text={ui["menu.title1"]} tone="light" />
              <br />
              <span className="italic text-sand/80">
                <MaskWords text={ui["menu.title2"]} tone="light" />
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-5 lg:pb-3">
            <p className="text-[1rem] leading-relaxed text-cream/60">{ui["menu.intro"]}</p>
            <div className="flex items-start gap-3 border border-dashed border-cream/25 p-4">
              <Info size={15} className="mt-0.5 shrink-0 text-sun" />
              <p className="text-[0.82rem] leading-relaxed text-cream/55">{ui["menu.provisional"]}</p>
            </div>
          </div>
        </div>

        {/* alergénios: só aparece quando a casa publicou essa informação */}
        {allergens.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-cream/12 pt-5">
            <span className="label text-cream/40">{ui["menu.avoid"]}</span>
            <button
              type="button"
              onClick={() => setAvoid(null)}
              aria-pressed={avoid === null}
              className={`label border px-3 py-2 transition-colors ${
                avoid === null
                  ? "border-cream/70 text-cream"
                  : "border-cream/15 text-cream/45 hover:border-cream/40 hover:text-cream/80"
              }`}
            >
              {ui["menu.all"]}
            </button>
            {allergens.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setAvoid((current) => (current === item ? null : item))}
                aria-pressed={avoid === item}
                className={`label border px-3 py-2 transition-colors ${
                  avoid === item
                    ? "border-sun text-sun"
                    : "border-cream/15 text-cream/45 hover:border-cream/40 hover:text-cream/80"
                }`}
              >
                {fill(ui["menu.without"], { item })}
              </button>
            ))}
          </div>
        )}

        {/* tabs */}
        <div className="sticky top-[58px] z-30 -mx-5 mt-12 bg-char/85 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:mt-16 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <div className="no-bar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:gap-3">
            {menu.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCat(i)}
                className={`relative shrink-0 snap-start border px-4 py-3 label transition-colors duration-400 sm:px-6 ${
                  i === index
                    ? "border-cream/70 text-cream"
                    : "border-cream/15 text-cream/45 hover:border-cream/40 hover:text-cream/80"
                }`}
              >
                {i === index && <span className="absolute inset-0 -z-10 bg-cream/8" />}
                <span className="mr-2 tabular-nums opacity-45">0{i + 1}</span>
                {t(c.label)}
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        {!active ? (
          <p className="mt-12 border border-dashed border-cream/20 px-5 py-10 text-center text-[0.92rem] text-cream/50">
            {fill(ui["menu.empty"], { item: avoid ?? "" })}
          </p>
        ) : (
          /* a `key` reinicia a animação CSS: cada categoria entra por cima da anterior */
          <div
            key={active.id}
            className={cn(
              "mt-10 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14",
              !reduced() && "menu-swap",
            )}
          >
            {/* feature */}
            <div className="group relative lg:sticky lg:top-28 lg:self-start">
              <div className="relative overflow-hidden">
                <Img
                  {...feature.image}
                  sizes="(min-width: 1024px) 45vw, 92vw"
                  ratio="4 / 5"
                  className="w-full"
                  imgClassName="brightness-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-char via-char/15 to-transparent opacity-90" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <p className="label text-sun">
                    {t(active.label)} · {ui["menu.reference"]}
                  </p>
                  <h3 className="mt-3 font-display text-[1.9rem] leading-[1.05] sm:text-[2.4rem]">
                    {t(feature.name)}
                  </h3>
                  <p className="mt-2 max-w-[38ch] text-[0.92rem] leading-relaxed text-cream/65">
                    {t(feature.desc)}
                  </p>
                  <div className="mt-5 flex items-center gap-4">
                    <span className="label border border-cream/25 px-3 py-2 tabular-nums">
                      {feature.price}
                    </span>
                    {feature.flag && <span className="label text-cream/50">{t(feature.flag)}</span>}
                  </div>
                </div>
              </div>
              <p className="mt-4 max-w-[42ch] text-[0.9rem] leading-relaxed text-cream/45 italic">
                {t(active.blurb)}
              </p>
            </div>

            {/* list */}
            <div>
              <div className="flex items-baseline justify-between border-b border-cream/20 pb-3">
                <p className="label text-cream/50">{t(active.kicker)}</p>
                <p className="label text-cream/35 tabular-nums">
                  {String(active.items.length).padStart(2, "0")} {ui["menu.items"]}
                  {/* o intervalo sai dos preços que a casa publicou — nada inventado */}
                  {prices && ` · ${priceRange(prices)}`}
                </p>
              </div>
              {rest.map((d, i) => (
                <DishRow
                  key={`${d.id}-${i}`}
                  dish={d}
                  i={i}
                  onPick={() => onReserve(`Carta: ${t(active.label)}`)}
                />
              ))}

              <div className="mt-9 flex flex-wrap items-center justify-between gap-5 border border-cream/15 p-6">
                <p className="max-w-[30ch] text-[0.95rem] leading-relaxed text-cream/60">{ui["menu.demo"]}</p>
                <Btn onClick={() => onReserve("Carta e disponibilidade")} tone="light" variant="outline">
                  <span className="label">{ui["menu.contact"]}</span>
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
