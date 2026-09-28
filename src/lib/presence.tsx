import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { reduced } from "./anim";

/**
 * Entrar e sair sem biblioteca de animação.
 *
 * O framer-motion pesava 42 kB (gzip) só para fazer aparecer e desaparecer
 * coisas — o que o navegador já faz com CSS. Esta peça guarda o elemento
 * montado o tempo da saída e troca `data-state`; o resto são `@keyframes`
 * em `index.css`.
 *
 * Quem preferir sem movimento (`prefers-reduced-motion`) fica só com o
 * desvanecer, e rapidinho.
 */
export function Presence({
  show,
  children,
  className,
  style,
  from,
  duration = 340,
  id,
  ...rest
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Transform de partida e de saída: `translateY(24px)`, `translateX(100%)`. */
  from?: string;
  /** Milissegundos de cada percurso. */
  duration?: number;
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-modal"?: boolean;
  "aria-hidden"?: boolean;
}) {
  // entrar decide-se já no render: não há nada para animar antes de montar
  const [montado, setMontado] = useState(show);
  if (show && !montado) setMontado(true);

  // sair: fica montado o tempo da animação, que é o CSS a ler `data-state`
  useEffect(() => {
    if (show || !montado) return undefined;
    const timer = window.setTimeout(() => setMontado(false), duration);
    return () => window.clearTimeout(timer);
  }, [show, montado, duration]);

  if (!montado) return null;

  return (
    <div
      id={id}
      data-state={show ? "in" : "out"}
      className={cn("presence", className)}
      style={
        {
          ...style,
          "--presence-duration": `${duration}ms`,
          "--presence-from": reduced() ? "none" : (from ?? "none"),
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
}
