import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { useMagnetic } from "@/lib/anim";

/* ————————————————— film grain + light leaks ————————————————— */
export function Grain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[80] opacity-[0.35] mix-blend-soft-light grain-layer",
        className,
      )}
    />
  );
}

export function LightLeaks({ tone = "warm" }: { tone?: "warm" | "cool" }) {
  const warm =
    "radial-gradient(45% 55% at 18% 12%, rgba(209,133,74,0.42), transparent 62%), radial-gradient(38% 48% at 88% 22%, rgba(232,220,200,0.28), transparent 60%)";
  const cool =
    "radial-gradient(45% 55% at 82% 88%, rgba(159,188,189,0.32), transparent 62%), radial-gradient(38% 48% at 8% 78%, rgba(24,60,70,0.42), transparent 60%)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen"
      style={{ backgroundImage: tone === "warm" ? warm : cool }}
    >
      <div className="absolute inset-y-0 -left-1/3 w-2/3 animate-sweep bg-gradient-to-r from-transparent via-cream/12 to-transparent" />
    </div>
  );
}

/* ————————————————— marquee ————————————————— */
export function Marquee({
  items,
  speed = 40,
  className,
  separator = "·",
  reverse = false,
}: {
  items: string[];
  speed?: number;
  className?: string;
  separator?: string;
  reverse?: boolean;
}) {
  const track = [...items, ...items];
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div
        className="marquee-track flex w-max shrink-0 items-center gap-8 whitespace-nowrap"
        style={
          {
            "--speed": `${speed}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        {track.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span>{t}</span>
            <span className="opacity-45">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ————————————————— labels ————————————————— */
export function Eyebrow({
  index,
  children,
  className,
  tone = "dark",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={cn(
        "label flex items-center gap-3",
        tone === "light" ? "text-cream/65" : "text-espresso/60",
        className,
      )}
    >
      {index && <span className="tabular-nums opacity-70">{index}</span>}
      <span className={cn("h-px w-8", tone === "light" ? "bg-cream/35" : "bg-espresso/25")} />
      <span>{children}</span>
    </p>
  );
}

/* ————————————————— masked words for display type ————————————————— */
export function MaskWords({
  text,
  className,
  tone = "dark",
}: {
  text: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-block", tone === "light" && "text-cream", className)} data-reveal="words">
      {text.split(" ").map((w, i, arr) => (
        <span className={cn("mask-line", i < arr.length - 1 && "mr-[0.24em]")} key={`${w}-${i}`}>
          <span className="word">{w}</span>
        </span>
      ))}
    </span>
  );
}

/* ————————————————— image with graceful load ————————————————— */
export function Img({
  src,
  alt,
  className,
  imgClassName,
  ratio = "auto",
  eager = false,
  hover = true,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  eager?: boolean;
  hover?: boolean;
  sizes?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={cn("relative overflow-hidden bg-shell/60", className)}
      style={ratio !== "auto" ? { aspectRatio: ratio } : undefined}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-shell to-clay/50 transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100",
        )}
      />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          loaded ? "opacity-100" : "opacity-0",
          hover && "group-hover:scale-[1.05] group-hover:saturate-[1.1]",
          imgClassName,
        )}
      />
    </div>
  );
}

/* ————————————————— buttons ————————————————— */
type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "solid" | "outline" | "quiet";
  tone?: "light" | "dark";
  className?: string;
  icon?: ReactNode;
  magnetic?: boolean;
  ariaLabel?: string;
  cursor?: string;
};

export function Btn({
  children,
  onClick,
  href,
  variant = "solid",
  tone = "dark",
  className,
  icon,
  magnetic = true,
  ariaLabel,
  cursor,
}: BtnProps) {
  const ref = useMagnetic<HTMLAnchorElement & HTMLButtonElement>(magnetic ? 0.28 : 0);

  const base =
    "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden px-7 py-[0.95rem] label transition-colors duration-500";
  const skin =
    variant === "solid"
      ? tone === "light"
        ? "bg-cream text-char"
        : "bg-char text-cream"
      : variant === "outline"
        ? tone === "light"
          ? "border border-cream/35 text-cream"
          : "border border-char/25 text-char"
        : tone === "light"
          ? "text-cream/80"
          : "text-char/75";

  const fill =
    variant === "solid"
      ? tone === "light"
        ? "bg-sand"
        : "bg-cream"
      : variant === "outline"
        ? tone === "light"
          ? "bg-cream"
          : "bg-char"
        : "bg-transparent";

  const hoverText =
    variant === "quiet"
      ? ""
      : tone === "light" || variant === "solid"
        ? "group-hover/btn:text-char"
        : "group-hover/btn:text-cream";

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 z-0 translate-y-[101%] transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0",
          fill,
        )}
      />
      <span className={cn("relative z-10 flex items-center gap-3 transition-colors duration-500", hoverText)}>
        {children}
        {icon === undefined ? (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
        ) : (
          icon
        )}
      </span>
    </>
  );

  const cls = cn(base, skin, "hoverable", className);

  if (href) {
    const external = href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel");
    return (
      <a
        ref={ref}
        href={href}
        aria-label={ariaLabel}
        className={cls}
        data-cursor={cursor || "abrir"}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cls}
      data-cursor={cursor || "escolher"}
    >
      {inner}
    </button>
  );
}

/* ————————————————— Instagram glyph (lucide dropped brand icons) ————————————————— */
export function IgIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SunIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 18h16M6.5 14.5h11M9 11h6" strokeLinecap="round" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  );
}

/* ————————————————— hairline rule with label ————————————————— */
export function Rule({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="h-px flex-1 bg-current/15" />
      {label && <span className="label opacity-55">{label}</span>}
      <span className="h-px flex-1 bg-current/15" />
    </div>
  );
}
