import { useEffect, useState } from "react";
import { useSite } from "@/content/context";
import { useLocale, useUi } from "@/i18n/context";
import { scrollToId } from "@/lib/anim";
import { cn } from "@/utils/cn";

/**
 * Régua de secções: o sítio onde se está, sempre à vista.
 *
 * Em ecrãs grandes fica encostada à direita; cada traço é uma secção e o nome
 * aparece na que está ativa (ou quando se passa o rato). Serve para duas
 * coisas: saber onde se está numa página longa e saltar sem voltar ao topo.
 *
 * Usa `mix-blend-difference` para se ler tanto sobre o creme como sobre o
 * carvão — as secções do site alternam entre os dois.
 */
export function SectionRail() {
  const { nav: NAV } = useSite().content;
  const { t } = useLocale();
  const ui = useUi();
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
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

  return (
    <nav
      aria-label={ui["rail.label"]}
      className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 mix-blend-difference xl:block"
    >
      <ul className="flex flex-col items-end gap-4">
        {NAV.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToId(item.id)}
                aria-current={on ? "true" : undefined}
                className="group pointer-events-auto flex items-center gap-2 py-1"
              >
                <span
                  className={cn(
                    "label text-[0.58rem] whitespace-nowrap text-cream transition-all duration-500",
                    on
                      ? "translate-x-0 opacity-80"
                      : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60 group-focus-visible:translate-x-0 group-focus-visible:opacity-60",
                  )}
                >
                  {t(item.label)}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "block h-px bg-cream transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    on ? "w-7 opacity-90" : "w-3 opacity-35 group-hover:w-6 group-hover:opacity-70",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
