import { useEffect, useMemo, useState } from "react";
import { useSite } from "@/content/context";
import { useUi } from "@/i18n/context";
import { fill } from "@/i18n/ui";
import { statusNow } from "@/lib/hours-status";
import { cn } from "@/utils/cn";

/**
 * O estado da casa agora: aberto, a fechar, a abrir ou encerrado.
 *
 * É vivo no sentido literal — relógio próprio, actualiza a cada minuto — mas
 * só diz o que a casa publicou: sem horário no painel, diz “horário a
 * confirmar” em vez de inventar uma hora.
 */
export function OpenNow({
  className,
  tone = "light",
  /** Mostra os serviços de hoje por extenso (usado na secção de contacto). */
  withRanges = false,
}: {
  className?: string;
  /** `dark` em fundos escuros, `light` em fundos claros. */
  tone?: "dark" | "light";
  withRanges?: boolean;
}) {
  const { hours } = useSite().content;
  const ui = useUi();

  // o relógio do componente: um minuto de cada vez chega
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const status = useMemo(() => statusNow(hours, now), [hours, now]);

  const label = (() => {
    switch (status.state) {
      case "open":
        return fill(ui["status.openUntil"], { time: status.until ?? "" });
      case "closing":
        return fill(ui["status.closingIn"], { minutes: status.minutes });
      case "opens-today":
        return status.minutes <= 60
          ? fill(ui["status.opensIn"], { minutes: status.minutes })
          : fill(ui["status.opensToday"], { time: status.next?.open ?? "" });
      case "closed": {
        if (!status.next) return ui["status.closedToday"];
        const day = ui[`day.${status.next.dayId}` as const];
        return fill(ui["status.opensDay"], { day, time: status.next.open });
      }
      default:
        return ui["status.unknown"];
    }
  })();

  const live = status.state === "open" || status.state === "closing";

  return (
    <span className={cn("label inline-flex flex-wrap items-center gap-x-2 gap-y-1", className)} title={label}>
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
        <span
          className={cn(
            "absolute inset-0 rounded-full",
            live && "animate-pulse-ring",
            status.state === "open" && "bg-sun",
            status.state === "closing" && "bg-ember",
            status.state === "opens-today" && "bg-ocean",
            (status.state === "closed" || status.state === "unknown") &&
              (tone === "dark" ? "bg-cream/35" : "bg-char/35"),
          )}
        />
        <span
          className={cn(
            "relative h-1.5 w-1.5 rounded-full",
            status.state === "open" && "bg-sun",
            status.state === "closing" && "bg-ember",
            status.state === "opens-today" && "bg-ocean",
            (status.state === "closed" || status.state === "unknown") &&
              (tone === "dark" ? "bg-cream/35" : "bg-char/35"),
          )}
        />
      </span>
      <span className={tone === "dark" ? "text-cream/70" : "text-espresso/70"}>{label}</span>
      {withRanges && status.today.length > 0 && (
        <span
          className={cn("font-mono tabular-nums", tone === "dark" ? "text-cream/45" : "text-espresso/45")}
        >
          {status.today.map((range) => `${range.open}—${range.close}`).join(" · ")}
        </span>
      )}
    </span>
  );
}
