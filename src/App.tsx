import { useEffect, useRef, useState } from "react";
import { Presence } from "@/lib/presence";
import { Phone } from "lucide-react";
import { Nav } from "@/components/Nav";
import { SectionRail } from "@/components/SectionRail";
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
import { CookieBanner } from "@/components/CookieBanner";
import { Grain } from "@/components/primitives";
import { useSite } from "@/content/context";
import { reduced, useSmoothScroll } from "@/lib/anim";
import { applySeo } from "@/lib/seo-dom";
import { useConsent } from "@/lib/consent";
import { mountAnalytics, unmountAnalytics } from "@/lib/analytics";
import { useLocale, useUi } from "@/i18n/context";

/* ————— cinematic curtain: no asset waiting, just a beat of anticipation ————— */
function Curtain() {
  // Sem movimento reduzido o arranque começa logo concluído: evita escrever
  // estado dentro do efeito só para saltar a cortina.
  const [done, setDone] = useState(() => reduced());
  const [count, setCount] = useState(0);

  // contador da cortina: um simples requestAnimationFrame, sem biblioteca
  useEffect(() => {
    if (done || reduced()) return;
    let frame = 0;
    let hide = 0;
    const began = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - began) / 850);
      setCount(Math.round(progress * 100));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      hide = window.setTimeout(() => setDone(true), 1000);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hide);
    };
  }, [done]);

  if (done) return null;
  return (
    <div
      aria-hidden
      className="curtain pointer-events-none fixed inset-0 z-[120] flex flex-col items-center justify-center bg-char text-cream"
    >
      <div className="absolute inset-0 opacity-[0.5] mix-blend-overlay grain-layer" />
      <p className="label relative mb-6 text-cream/45">Esmoriz · Portugal</p>
      <p className="relative font-display text-[clamp(2.4rem,11vw,7rem)] leading-[0.86] tracking-[-0.03em]">
        Palheiro
        <br />
        <span className="italic text-sand/85">Velho</span>
      </p>
      <p className="label relative mt-8 flex items-center gap-4 tabular-nums text-cream/60">
        <span className="h-px w-16 bg-cream/25" />
        {String(count).padStart(3, "0")}% · a acender a luz do fim da tarde
      </p>
    </div>
  );
}

/* ————— mobile conversion bar ————— */
function MobileBar({ onReserve }: { onReserve: () => void }) {
  const { contact: CONTACT } = useSite().content;
  const ui = useUi();
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
    <Presence
      show={show}
      duration={450}
      from="translateY(90px)"
      className="fixed inset-x-0 bottom-0 z-[88] flex gap-px border-t border-cream/15 bg-char/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
    >
      <a
        href={`tel:${CONTACT.phone}`}
        className="label flex flex-1 items-center justify-center gap-2 py-4 text-cream/80"
      >
        <Phone size={14} /> {ui["nav.call"]}
      </a>
      <button
        onClick={onReserve}
        className="label flex flex-[1.2] items-center justify-center gap-2 bg-cream py-4 text-char"
      >
        {ui["nav.reserve"]}
      </button>
    </Presence>
  );
}

export default function App() {
  useSmoothScroll();
  const { content } = useSite();
  const { locale } = useLocale();
  const ui = useUi();
  const { consent } = useConsent();
  const [reserve, setReserve] = useState<{ open: boolean; subject?: string }>({ open: false });
  const root = useRef<HTMLDivElement>(null);

  const openReserve = (subject?: string) => setReserve({ open: true, subject });

  // título, descrição, partilhas e dados estruturados seguem o conteúdo real
  useEffect(() => {
    applySeo(content, locale);
  }, [content, locale]);

  // a medição só entra com consentimento e sai quando ele é retirado
  useEffect(() => {
    if (consent?.analytics) mountAnalytics();
    else unmountAnalytics();
  }, [consent?.analytics]);

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

      {/* quem navega com o teclado não precisa de passar pelo menu */}
      <a
        href="#menu"
        className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[130] focus:bg-char focus:px-4 focus:py-3 focus:text-cream"
      >
        {ui["common.skip"]}
      </a>

      <Nav onReserve={() => openReserve("Contacto direto")} />
      <SectionRail />

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
      <CookieBanner />
    </div>
  );
}
