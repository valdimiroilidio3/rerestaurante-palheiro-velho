import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const EASE = "power3.out";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

/** Reactive media query — lets heavy branches stay out of the DOM on mobile. */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export const useIsDesktop = () => useMedia("(min-width: 1024px)");

/** Smooth scroll to a section id (uses Lenis when available). */
export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -56 + offset, duration: 1.5 });
  else el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
}

/** Momentum scrolling, synced with the GSAP ticker + ScrollTrigger. */
export function useSmoothScroll() {
  useEffect(() => {
    if (reduced()) return;
    const l = new Lenis({
      duration: 1.12,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.7,
      autoRaf: false,
      anchors: false,
    });
    lenis = l;

    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const onScroll = () => ScrollTrigger.update();
    l.on("scroll", onScroll);

    return () => {
      l.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      l.destroy();
      lenis = null;
    };
  }, []);
}

/** Splits a phrase into words wrapped in masked lines for reveal animations. */
export function words(phrase: string) {
  return phrase.split(" ");
}

type RevealOpts = { start?: string; stagger?: number };

/**
 * Scans the document for [data-reveal] nodes and animates them in.
 * Uses gsap.from + ScrollTrigger so nodes that are already past their start
 * position when created render in their final, visible state.
 */
export function useReveals(deps: unknown[] = [], opts: RevealOpts = {}) {
  const start = opts.start ?? "top 86%";
  useEffect(() => {
    if (reduced()) return;
    const tweens: gsap.core.Tween[] = [];
    const st = { start, once: true };

    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.rv === "1") return;
      el.dataset.rv = "1";
      const kind = el.dataset.reveal || "up";

      if (kind === "words") {
        const targets = gsap.utils.toArray<HTMLElement>(".word", el);
        if (!targets.length) return;
        tweens.push(
          gsap.from(targets, {
            yPercent: 128,
            opacity: 0,
            duration: 1.15,
            ease: EASE,
            stagger: opts.stagger ?? 0.065,
            scrollTrigger: { ...st, trigger: el },
          }),
        );
        return;
      }

      if (kind === "img") {
        tweens.push(
          gsap.from(el, {
            clipPath: "inset(0% 0% 100% 0%)",
            yPercent: 6,
            duration: 1.35,
            ease: EASE,
            scrollTrigger: { ...st, trigger: el },
          }),
        );
        return;
      }

      if (kind === "line") {
        tweens.push(
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.2,
            ease: EASE,
            scrollTrigger: { ...st, trigger: el },
          }),
        );
        return;
      }

      if (kind === "group") {
        tweens.push(
          gsap.from(el.children, {
            yPercent: 110,
            opacity: 0,
            duration: 1,
            ease: EASE,
            stagger: opts.stagger ?? 0.09,
            scrollTrigger: { ...st, trigger: el },
          }),
        );
        return;
      }

      tweens.push(
        gsap.from(el, {
          yPercent: 9,
          opacity: 0,
          duration: 1.05,
          delay: Number(el.dataset.delay || 0),
          ease: EASE,
          scrollTrigger: { ...st, trigger: el },
        }),
      );
    });

    ScrollTrigger.refresh();
    return () => {
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      document.querySelectorAll<HTMLElement>("[data-reveal][data-rv]").forEach((el) => delete el.dataset.rv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Vertical parallax tied to scroll progress. */
export function useParallax(
  target: React.RefObject<HTMLElement | null>,
  trigger: React.RefObject<HTMLElement | null>,
  amount = 14,
) {
  useEffect(() => {
    const el = target.current;
    const trig = trigger.current;
    if (!el || !trig || reduced() || !isDesktop()) return;
    const st = ScrollTrigger.create({
      trigger: trig,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(el, { yPercent: (0.5 - self.progress) * -2 * amount });
      },
    });
    return () => st.kill();
  }, [target, trigger, amount]);
}

/** Magnetic pull toward the pointer. */
export function useMagnetic<T extends HTMLElement>(strength = 0.4) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || isTouch()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.42)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.42)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(el);
    };
  }, [strength]);
  return ref;
}

/** Horizontal drift for oversized display type inside a pinned/scrubbed section. */
export function useScrubDrift(
  target: React.RefObject<HTMLElement | null>,
  trigger: React.RefObject<HTMLElement | null>,
  from = -6,
  to = 6,
) {
  useEffect(() => {
    const el = target.current;
    const trig = trigger.current;
    if (!el || !trig || reduced() || !isDesktop()) return;
    const tween = gsap.fromTo(
      el,
      { xPercent: from },
      {
        xPercent: to,
        ease: "none",
        scrollTrigger: { trigger: trig, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.kill();
    };
  }, [target, trigger, from, to]);
}
