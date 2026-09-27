import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SiteContent } from "@/content/types";
import { defaultContent } from "@/content/defaults";
import { fetchSiteContent, isSupabaseConfigured, subscribeToContent } from "@/content/store";
import { SiteContentContext, type SiteContentValue } from "@/content/context";

/**
 * Mantém o conteúdo do site em memória e sincronizado com a base de dados.
 * Começa sempre pelo conteúdo de origem — o site pinta de imediato — e é
 * substituído assim que a base de dados responde (ou quando algo muda lá).
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const load = async () => {
      try {
        const next = await fetchSiteContent();
        if (cancelled) return;
        setContent(next);
        setLive(true);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Não foi possível ler o conteúdo.");
      }
    };

    void load();

    void subscribeToContent(() => {
      window.clearTimeout(timer.current);
      // agrupa rajadas de alterações (arrastar para reordenar, por exemplo)
      timer.current = window.setTimeout(load, 250);
    }).then((fn) => {
      if (cancelled) fn();
      else unsubscribe = fn;
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<SiteContentValue>(() => ({ content, live, error }), [content, live, error]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}
