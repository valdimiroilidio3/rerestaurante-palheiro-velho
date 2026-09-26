import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isTouch, reduced } from "@/lib/anim";

/** Cinematic cursor: a dot that snaps and a ring that lags + carries labels. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<{ label: string; big: boolean; hidden: boolean }>({
    label: "",
    big: false,
    hidden: true,
  });

  useEffect(() => {
    if (isTouch() || reduced()) return;
    document.body.classList.add("has-cursor");
    const r = ring.current!;
    const d = dot.current!;
    const xR = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const yR = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });
    const xD = gsap.quickTo(d, "x", { duration: 0.08 });
    const yD = gsap.quickTo(d, "y", { duration: 0.08 });

    const move = (e: PointerEvent) => {
      xR(e.clientX);
      yR(e.clientY);
      xD(e.clientX);
      yD(e.clientY);
      const t = (e.target as HTMLElement)?.closest?.("a,button,[data-cursor]") as HTMLElement | null;
      if (t) {
        setVariant({
          label: t.dataset.cursor || "",
          big: !!t.dataset.cursorBig || t.matches("button,a"),
          hidden: false,
        });
      } else {
        setVariant((v) => (v.hidden ? v : { label: "", big: false, hidden: true }));
      }
    };
    const leave = () => setVariant((v) => ({ ...v, hidden: true }));

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.body.classList.remove("has-cursor");
      gsap.killTweensOf([r, d]);
    };
  }, []);

  if (isTouch()) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] mix-blend-difference">
      <div
        ref={ring}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"
        style={{ translate: "0 0" }}
      >
        <div
          className="flex items-center justify-center rounded-full border border-cream/80 transition-[width,height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: variant.big ? 74 : 30,
            height: variant.big ? 74 : 30,
            opacity: variant.hidden ? 0.35 : 1,
          }}
        >
          <span className="label text-[7.5px] tracking-[0.18em] text-cream">{variant.label}</span>
        </div>
      </div>
      <div ref={dot} className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
        <span className="block h-[5px] w-[5px] rounded-full bg-cream" />
      </div>
    </div>
  );
}
