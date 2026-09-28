import { useEffect, useRef, useState } from "react";
import { useSite } from "@/content/context";
import { useLocale, useUi } from "@/i18n/context";
import { reduced, scrollToId, useAnim } from "@/lib/anim";
import { Btn, LightLeaks } from "./primitives";

export function Hero() {
  const { contact: CONTACT, hero: HERO } = useSite().content;
  const { t } = useLocale();
  const ui = useUi();
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOn, setVideoOn] = useState(false);
  const [playing, setPlaying] = useState(false);

  /* load the film only when it is cheap to do so */
  useEffect(() => {
    if (reduced()) return;
    if (!window.matchMedia("(min-width: 900px)").matches) return;
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    if (conn?.saveData || /(^|\b)2g/.test(conn?.effectiveType || "")) return;
    const t = window.setTimeout(() => setVideoOn(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  useAnim(({ gsap }) => {
    const ctx = gsap.context(() => {
      /* entrance */
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        "[data-hero-mask] .word",
        { yPercent: 118, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.45, stagger: 0.09 },
        0.15,
      )
        .fromTo(
          "[data-hero-fade]",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.11 },
          0.75,
        )
        .fromTo("[data-hero-side]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1 }, 1.1);

      /* scroll: the film pulls back and blurs behind the page */
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        })
        .to(media.current, { scale: 0.84, yPercent: 5, filter: "blur(8px)", ease: "none" }, 0)
        .to(inner.current, { yPercent: -11, opacity: 0, ease: "none" }, 0);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={root}
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-char text-cream"
    >
      {/* ——— media ——— */}
      <div ref={media} className="absolute inset-0 will-change-transform">
        <img
          src={HERO.poster}
          srcSet={HERO.posterSrcSet}
          sizes="100vw"
          width={HERO.posterWidth}
          height={HERO.posterHeight}
          alt="Imagem de ambiente temporária: praia ao pôr do sol"
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${playing ? "opacity-0" : "ken opacity-100"}`}
        />
        {videoOn && (
          <video
            ref={videoRef}
            aria-hidden
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={HERO.poster}
            onPlaying={() => setPlaying(true)}
            className={`absolute inset-0 h-full w-full scale-[1.06] object-cover transition-opacity duration-[2500ms] ${
              playing ? "opacity-100" : "opacity-0"
            }`}
          >
            <source
              src={HERO.videoSources[window.innerWidth >= 1440 ? 0 : 1] ?? HERO.videoSources[0]}
              type="video/mp4"
            />
          </video>
        )}
        {/* grade */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,13,12,0.62)_0%,rgba(14,13,12,0.18)_32%,rgba(14,13,12,0.42)_66%,rgba(14,13,12,0.92)_100%)]" />
        <div className="absolute inset-0 bg-ocean/18 mix-blend-multiply" />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_60px_rgba(14,13,12,0.75)]" />
        <LightLeaks />
      </div>

      {/* ——— content ——— */}
      <div
        ref={inner}
        className="relative z-20 mx-auto flex h-full max-w-[1680px] flex-col px-5 pt-24 pb-7 sm:px-8 sm:pt-28 lg:px-12"
      >
        {/* top meta row */}
        <div className="flex items-start justify-between gap-4">
          <div data-hero-fade className="label flex flex-col gap-2 text-cream/70">
            <span>{t(CONTACT.kind)}</span>
            <span className="hidden sm:block">{CONTACT.locality}</span>
          </div>
          <div data-hero-fade className="border border-cream/25 bg-char/25 px-3 py-2 backdrop-blur-md">
            <span className="label text-cream/75">{ui["hero.ambient"]}</span>
          </div>
        </div>

        {/* title */}
        <div className="mt-auto">
          <p data-hero-fade className="label mb-5 flex items-center gap-3 text-sun/90">
            <span className="inline-block h-1.5 w-1.5 animate-bob rounded-full bg-sun" />
            {ui["hero.place"]}
          </p>

          <h1 className="relative -ml-[0.04em] leading-[0.8]">
            <span data-hero-mask className="mask-line block">
              <span className="word font-display block text-[clamp(3.1rem,17.5vw,15rem)] font-light tracking-[-0.03em]">
                Palheiro
              </span>
            </span>
            <span data-hero-mask className="mask-line block">
              <span className="word font-display block text-[clamp(3.1rem,17.5vw,15rem)] italic font-normal text-sand/95">
                Velho
              </span>
            </span>
          </h1>

          <div className="mt-6 flex flex-col gap-7 border-t border-cream/15 pt-6 sm:mt-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p data-hero-mask className="mask-line">
                <span className="word label block text-[0.72rem] text-cream/80 sm:text-[0.86rem] sm:tracking-[0.3em]">
                  {t(HERO.tagline)}
                </span>
              </p>
              <p
                data-hero-fade
                className="mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed text-cream/60 sm:text-base"
              >
                {ui["hero.intro"]}
              </p>
            </div>

            <div data-hero-fade className="flex flex-wrap items-center gap-3">
              <Btn onClick={() => scrollToId("menu")} tone="light" className="px-8 py-4">
                <span className="label">{ui["hero.structure"]}</span>
              </Btn>
              <Btn
                onClick={() => scrollToId("contacto")}
                tone="light"
                variant="outline"
                className="px-6 py-4"
              >
                <span className="label">{ui["hero.directions"]}</span>
              </Btn>
            </div>
          </div>
        </div>

        {/* bottom rail */}
        <div className="mt-7 flex items-end justify-between gap-4 sm:mt-9">
          <div data-hero-side className="label space-y-1 text-cream/55">
            <p className="text-cream">{CONTACT.locality}</p>
            <p>{CONTACT.address}</p>
          </div>

          <div data-hero-side className="hidden flex-1 items-center justify-center gap-3 lg:flex">
            <span className="label text-cream/40">{ui["hero.sources"]}</span>
            <span className="h-px w-16 bg-cream/25" />
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="label text-cream/70 hover:text-sun"
            >
              {ui["hero.instagram"]}
            </a>
          </div>

          <button
            onClick={() => scrollToId("intro")}
            data-hero-side
            className="group flex flex-col items-center gap-2 text-cream/60 transition-colors hover:text-cream"
            aria-label={ui["hero.scroll"]}
          >
            <span className="label [writing-mode:vertical-rl]">{ui["hero.scroll"]}</span>
            <span className="relative block h-12 w-px overflow-hidden bg-cream/25">
              <span className="absolute inset-x-0 top-0 h-4 animate-bob bg-cream" />
            </span>
          </button>
        </div>
      </div>

      {/* fade into the page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-cream" />
    </section>
  );
}
