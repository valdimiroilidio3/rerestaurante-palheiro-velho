import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/utils/cn";
import { CONTACT, NAV } from "@/data/site";
import { isDesktop, reduced, scrollToId, scrollToTop } from "@/lib/anim";
import { Btn, IgIcon } from "./primitives";

export function Nav({ onReserve }: { onReserve: () => void }) {
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
  }, []);

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
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[90] transition-[background-color,border-color,padding,color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "border-b border-espresso/12 bg-cream/88 py-3 text-char backdrop-blur-xl"
            : "border-b border-transparent py-5 text-cream",
        )}
      >
        <div className="mx-auto flex max-w-[1680px] items-center gap-4 px-5 sm:px-8 xl:px-12">
          {/* wordmark */}
          <button
            onClick={() => (scrolled ? go("top") : scrollToTop())}
            className="group flex items-baseline gap-2 text-left"
            data-cursor="topo"
          >
            <span className="font-display text-[1.05rem] leading-none font-semibold tracking-[0.02em] sm:text-[1.28rem]">
              Palheiro
            </span>
            <span className="font-display text-[1.05rem] leading-none italic sm:text-[1.28rem]">Velho</span>
            <span
              className={cn(
                "mb-[3px] block h-[5px] w-[5px] rounded-full transition-colors duration-500",
                scrolled ? "bg-ember" : "bg-sun",
              )}
            />
          </button>

          {/* desktop links */}
          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  "label relative px-4 py-3 transition-colors duration-300 hoverable",
                  active === item.id ? "text-current" : "opacity-60 hover:opacity-100",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-2 h-px origin-left bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    active === item.id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-4">
            <a
              href={`tel:${CONTACT.phone}`}
              className="label hidden items-center gap-2 opacity-70 transition-opacity hover:opacity-100 md:flex"
              data-cursor="ligar"
            >
              <Phone size={13} strokeWidth={1.7} />
              {CONTACT.phoneLabel}
            </a>
            <Btn
              onClick={onReserve}
              variant={scrolled ? "solid" : "outline"}
              tone={scrolled ? "dark" : "light"}
              className="hidden text-[0.6rem] sm:inline-flex"
              icon={null}
            >
              Contactar
            </Btn>
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "flex h-11 w-11 items-center justify-center border transition-colors duration-500 lg:hidden",
                scrolled ? "border-espresso/20 text-char" : "border-cream/30 text-cream",
              )}
              aria-label="Abrir menu"
            >
              <Menu size={19} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* scroll progress */}
        <div className="absolute inset-x-0 -bottom-px h-[2px] bg-transparent">
          <div
            className="h-full origin-left bg-gradient-to-r from-ocean via-sun to-ember transition-transform duration-200"
            style={{ transform: `scaleX(${progress})`, width: "100%" }}
          />
        </div>
      </header>

      {/* ————— mobile overlay ————— */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced() ? 0 : 0.35 }}
            className="fixed inset-0 z-[92] flex flex-col bg-char text-cream lg:hidden"
          >
            <div className="absolute inset-0 opacity-45">
              <img
                src={
                  "https://images.pexels.com/videos/9259112/beach-cloud-dawn-dusk-9259112.jpeg?auto=compress&cs=tinysrgb&w=900"
                }
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-char/70 via-char/85 to-char" />
            </div>

            <div className="relative flex items-center justify-between px-5 py-5">
              <span className="label opacity-60">Esmoriz · Portugal</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="flex h-11 w-11 items-center justify-center border border-cream/25"
              >
                <X size={19} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="relative mt-6 flex flex-1 flex-col justify-center gap-1 px-5">
              {["top", ...NAV.map((n) => n.id)].map((id, i) => (
                <motion.button
                  key={id}
                  onClick={() => (id === "top" ? scrollToTop() : go(id))}
                  initial={reduced() ? false : { y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-baseline justify-between border-b border-cream/12 py-3 text-left"
                >
                  <span className="font-display text-[2.35rem] leading-[1.05] transition-transform duration-500 group-active:translate-x-1">
                    {id === "top" ? "Início" : NAV.find((n) => n.id === id)?.label}
                  </span>
                  <span className="label opacity-40">0{i}</span>
                </motion.button>
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
                Contactar a casa
              </Btn>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="label flex items-center justify-center gap-2 border border-cream/25 py-4"
                >
                  <Phone size={13} /> Ligar
                </a>
                <a
                  href={CONTACT.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="label flex items-center justify-center gap-2 border border-cream/25 py-4"
                >
                  <IgIcon size={14} /> Instagram
                </a>
              </div>
              <button
                onClick={() => go("contacto")}
                className="label w-full pt-2 opacity-60 underline decoration-1 underline-offset-4"
              >
                Como chegar →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
