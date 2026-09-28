import { useEffect, useState } from "react";
import { Presence } from "@/lib/presence";
import { Menu, X, Phone } from "lucide-react";
import { Btn, IgIcon } from "./primitives";
import { cn } from "@/utils/cn";
import { useSite } from "@/content/context";
import { isDesktop, reduced, scrollToId, scrollToTop } from "@/lib/anim";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLocale, useUi } from "@/i18n/context";

export function Nav({ onReserve }: { onReserve: () => void }) {
  const { contact: CONTACT, hero: HERO, nav: NAV } = useSite().content;
  const { t } = useLocale();
  const ui = useUi();

  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > window.innerHeight * 0.72);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
      let current = "";
      for (const item of NAV) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.42) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [NAV]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToId(id), open && isDesktop() ? 240 : 0);
  };

  return (
    <>
      {/*
        A barra: vidro fosco, uma linha de cabelo por baixo e nada mais.
        Ao contrário do resto do site — que muda de tom entre secções — esta
        fica sempre igual (escura e translúcida), como a da Apple: reconhece-se
        pelo sítio e pela altura, não pela cor.
      */}
      <header className="fixed inset-x-0 top-0 z-[90] border-b border-cream/10 bg-char/72 text-cream backdrop-blur-[20px] backdrop-saturate-[180%]">
        <div className="mx-auto flex h-12 max-w-[1680px] items-center gap-5 px-5 sm:px-8 xl:px-12">
          {/* wordmark */}
          <button
            onClick={() => (scrolled ? go("top") : scrollToTop())}
            className="group flex shrink-0 items-baseline gap-1.5 text-left"
          >
            <span className="font-display text-[0.98rem] leading-none font-medium tracking-[0.01em]">
              Palheiro
            </span>
            <span className="font-display text-[0.98rem] leading-none italic opacity-90">Velho</span>
            <span className="mb-[3px] block h-[4px] w-[4px] rounded-full bg-sun transition-opacity duration-500 group-hover:opacity-60" />
          </button>

          {/* desktop links */}
          <nav className="mx-auto hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                aria-current={active === item.id ? "true" : undefined}
                className={cn(
                  "relative px-3 py-2 text-[0.8rem] leading-none tracking-[0.005em] transition-opacity duration-300",
                  active === item.id ? "opacity-100" : "opacity-65 hover:opacity-100",
                )}
              >
                {t(item.label)}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:gap-4">
            <button
              onClick={onReserve}
              className="hidden rounded-full bg-cream px-3.5 py-1.5 text-[0.72rem] leading-none font-medium text-char transition-colors duration-300 hover:bg-white sm:inline-flex"
            >
              {ui["nav.contact"]}
            </button>
            <LanguageSwitch plain className="hidden lg:flex" tone="dark" />
            <button
              onClick={() => setOpen(true)}
              className="-mr-1 flex h-9 w-9 items-center justify-center text-cream/80 transition-colors hover:text-cream lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* scroll progress: uma linha de cabelo, não uma barra */}
        <div className="absolute inset-x-0 -bottom-px h-px">
          <div
            className="h-full origin-left bg-cream/45"
            style={{ transform: `scaleX(${progress})`, width: "100%" }}
          />
        </div>
      </header>

      {/* ————— mobile overlay ————— */}
      <Presence
        show={open}
        duration={reduced() ? 1 : 350}
        className="fixed inset-0 z-[92] flex flex-col bg-char text-cream lg:hidden"
      >
        <div className="absolute inset-0 opacity-45">
          <img
            src={HERO.overlay}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-char/70 via-char/85 to-char" />
        </div>

        <div className="relative flex items-center justify-between px-5 py-5">
          <span className="label opacity-60">{ui["nav.place"]}</span>
          <button
            onClick={() => setOpen(false)}
            aria-label={ui["nav.close"]}
            className="flex h-11 w-11 items-center justify-center border border-cream/25"
          >
            <X size={19} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="relative mt-6 flex flex-1 flex-col justify-center gap-1 px-5">
          {["top", ...NAV.map((n) => n.id)].map((id, i) => (
            <button
              key={id}
              onClick={() => (id === "top" ? scrollToTop() : go(id))}
              style={{ "--delay": `${0.06 * i + 0.1}s` } as React.CSSProperties}
              className={cn(
                "group flex items-baseline justify-between border-b border-cream/12 py-3 text-left",
                !reduced() && "nav-item-in",
              )}
            >
              <span className="font-display text-[2.35rem] leading-[1.05] transition-transform duration-500 group-active:translate-x-1">
                {id === "top" ? ui["nav.home"] : t(NAV.find((n) => n.id === id)?.label)}
              </span>
              <span className="label opacity-40">0{i}</span>
            </button>
          ))}
        </nav>

        <div className="relative mt-8 space-y-3 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Btn
            onClick={() => {
              setOpen(false);
              onReserve();
            }}
            tone="light"
            className="w-full"
          >
            {ui["nav.reserve"]}
          </Btn>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={`tel:${CONTACT.phone}`}
              className="label flex items-center justify-center gap-2 border border-cream/25 py-4"
            >
              <Phone size={13} /> {ui["nav.call"]}
            </a>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="label flex items-center justify-center gap-2 border border-cream/25 py-4"
            >
              <IgIcon size={14} /> {ui["nav.instagram"]}
            </a>
          </div>
          <LanguageSwitch className="w-full justify-center pt-3 text-cream" tone="dark" />
          <button
            onClick={() => go("contacto")}
            className="label w-full pt-2 opacity-60 underline decoration-1 underline-offset-4"
          >
            Como chegar →
          </button>
        </div>
      </Presence>
    </>
  );
}
