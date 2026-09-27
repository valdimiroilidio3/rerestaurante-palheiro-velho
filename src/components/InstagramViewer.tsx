import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, Play, X } from "lucide-react";
import { getLenis } from "@/lib/anim";
import { IgIcon, Img } from "./primitives";
import type { InstagramItem } from "@/content/types";
import { cn } from "@/utils/cn";

/**
 * Visualizador de uma publicação do mosaico.
 * Abre por cima do site, navega com as setas e fecha com Esc.
 */
export function InstagramViewer({
  items,
  index,
  profileUrl,
  onClose,
  onIndex,
}: {
  items: InstagramItem[];
  index: number;
  profileUrl: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const item = items[index];

  // bloqueia o scroll e devolve o foco a quem abriu
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      getLenis()?.start();
      before?.focus?.();
    };
  }, []);

  // teclado: Esc fecha, setas navegam, Tab não sai da janela
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        onIndex((index + 1) % items.length);
        return;
      }
      if (e.key === "ArrowLeft") {
        onIndex((index - 1 + items.length) % items.length);
        return;
      }
      if (e.key !== "Tab") return;
      // foco preso dentro da janela
      const focusable = dialog.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;

  const postUrl = item.url?.trim() || profileUrl;
  const total = items.length;

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Publicação ${index + 1} de ${total}`}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 lg:p-10"
    >
      {/* fundo: clicar fecha */}
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 animate-pop-in bg-abyss/92 backdrop-blur-[3px] motion-reduce:animate-none"
      />

      <div className="relative z-10 flex max-h-full w-full max-w-5xl flex-col animate-pop-in motion-reduce:animate-none">
        <figure className="relative min-h-0 overflow-hidden bg-char">
          <Img
            {...item.image}
            eager
            sizes="(min-width: 1024px) 70vw, 94vw"
            className="max-h-[62svh] w-full sm:max-h-[68svh]"
          />
          {item.kind === "reel" && (
            <span className="label absolute top-4 left-4 inline-flex items-center gap-2 bg-abyss/75 px-2.5 py-1.5 text-[0.62rem] text-cream backdrop-blur-sm">
              <Play size={10} className="fill-cream text-cream" /> reel
            </span>
          )}
        </figure>

        <figcaption className="flex flex-wrap items-end justify-between gap-4 bg-cream px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="label text-char/45">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            <p className="mt-2 font-display text-[1.35rem] leading-tight text-char sm:text-[1.6rem]">
              {item.cap}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {item.likes && (
              <span className="label flex items-center gap-2 text-char/55">
                <Heart size={12} className="fill-ember text-ember" /> {item.likes}
              </span>
            )}
            <a
              href={postUrl}
              target="_blank"
              rel="noreferrer"
              className="label group/link inline-flex items-center gap-2 border-b border-char/25 pb-1 text-char transition-colors hover:border-sun hover:text-sun"
            >
              <IgIcon size={14} />
              abrir no Instagram
              <ArrowUpRight
                size={12}
                className="transition-transform duration-500 group-hover/link:-translate-y-0.5"
              />
            </a>
          </div>
        </figcaption>

        {/* controlos */}
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute -top-11 right-0 inline-flex h-9 w-9 items-center justify-center text-cream/70 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun sm:-top-12"
        >
          <X size={20} />
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => onIndex((index - 1 + total) % total)}
              aria-label="Publicação anterior"
              className={cn(
                "absolute top-1/2 -left-1 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center",
                "bg-abyss/70 text-cream backdrop-blur-sm transition-colors hover:bg-sun hover:text-char",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun sm:-left-5 lg:-left-14",
              )}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => onIndex((index + 1) % total)}
              aria-label="Publicação seguinte"
              className={cn(
                "absolute top-1/2 -right-1 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center",
                "bg-abyss/70 text-cream backdrop-blur-sm transition-colors hover:bg-sun hover:text-char",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun sm:-right-5 lg:-right-14",
              )}
            >
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>

      <p className="label pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-cream/35 sm:hidden">
        deslize as setas para navegar
      </p>
    </div>,
    document.body,
  );
}
