import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { MenuSection } from "@/components/MenuSection";
import { Ocean } from "@/components/Ocean";
import { Experience } from "@/components/Experience";
import { Gallery } from "@/components/Gallery";
import { InstagramGrid } from "@/components/InstagramGrid";
import { Events } from "@/components/Events";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { ReservePanel } from "@/components/ReservePanel";
import { Grain } from "@/components/primitives";
import { useSite } from "@/content/context";
import { reduced, useSmoothScroll } from "@/lib/anim";

/* ————— cinematic curtain: no asset waiting, just a beat of anticipation ————— */
function Curtain() {
  // Sem movimento reduzido o arranque começa logo concluído: evita escrever
  // estado dentro do efeito só para saltar a cortina.
  const [done, setDone] = useState(() => reduced());
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (done || reduced()) return;
    const o = { v: 0 };
    let hide = 0;
    const tween = gsap.to(o, {
      v: 100,
      duration: 0.85,
      ease: "power2.inOut",
      onUpdate: () => setCount(Math.round(o.v)),
      onComplete: () => {
        hide = window.setTimeout(() => setDone(true), 1000);
      },
    });
    return () => {
      window.clearTimeout(hide);
      tween.kill();
    };
  }, [done]);

  if (done) return null;
  return (
    <motion.div
      aria-hidden
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ delay: 0.88, duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
      className="pointer-events-none fixed inset-0 z-[120] flex flex-col items-center justify-center bg-char text-cream"
    >
      <div className="absolute inset-0 opacity-[0.5] mix-blend-overlay grain-layer" />
      <p className="label relative mb-6 text-cream/45">Esmoriz · Portugal</p>
      <h1 className="relative font-display text-[clamp(2.4rem,11vw,7rem)] leading-[0.86] tracking-[-0.03em]">
        Palheiro
        <br />
        <span className="italic text-sand/85">Velho</span>
      </h1>
      <p className="label relative mt-8 flex items-center gap-4 tabular-nums text-cream/60">
        <span className="h-px w-16 bg-cream/25" />
        {String(count).padStart(3, "0")}% · a acender a luz do fim da tarde
      </p>
    </motion.div>
  );
}

/* ————— mobile conversion bar ————— */
function MobileBar({ onReserve }: { onReserve: () => void }) {
  const { contact: CONTACT } = useSite().content;
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 460;
      setShow(y > window.innerHeight * 0.85 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[88] flex gap-px border-t border-cream/15 bg-char/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
        >
          <a
            href={`tel:${CONTACT.phone}`}
            className="label flex flex-1 items-center justify-center gap-2 py-4 text-cream/80"
          >
            <Phone size={14} /> Ligar
          </a>
          <button
            onClick={onReserve}
            className="label flex flex-[1.2] items-center justify-center gap-2 bg-cream py-4 text-char"
          >
            Contactar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  useSmoothScroll();
  const [reserve, setReserve] = useState<{ open: boolean; subject?: string }>({ open: false });
  const root = useRef<HTMLDivElement>(null);

  const openReserve = (subject?: string) => setReserve({ open: true, subject });

  useEffect(() => {
    // keep ScrollTrigger honest once webfonts + above-the-fold images have landed
    const bump = () => window.dispatchEvent(new Event("resize"));
    if (document.fonts?.ready) document.fonts.ready.then(bump).catch(() => {});
    window.addEventListener("load", bump);
    return () => window.removeEventListener("load", bump);
  }, []);

  return (
    <div ref={root} className="relative bg-cream">
      <Curtain />
      <Grain />

      <Nav onReserve={() => openReserve("Contacto direto")} />

      <main>
        <Hero />
        <Intro />
        <MenuSection onReserve={openReserve} />
        <Ocean />
        <Experience onReserve={openReserve} />
        <Gallery />
        <InstagramGrid />
        <Events onReserve={openReserve} />
        <LocationSection onReserve={openReserve} />
      </main>

      <Footer onReserve={openReserve} />
      <MobileBar onReserve={() => openReserve("Contacto direto")} />
      <ReservePanel
        open={reserve.open}
        subject={reserve.subject}
        onClose={() => setReserve({ open: false })}
      />
    </div>
  );
}
