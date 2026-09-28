import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchSiteContent } from "@/content/store";
import type { SiteContent } from "@/content/types";

/* ————————————————————————————— notificações ————————————————————————————— */

type ToastTone = "ok" | "erro";

export const ToastContext = createContext<(text: string, tone?: ToastTone) => void>(() => {});

export const useToast = () => useContext(ToastContext);

/* ————————————————————————————— conteúdo ————————————————————————————— */

/**
 * Conteúdo para o painel. Ao contrário do site, o painel não segue as
 * alterações em tempo real: lê uma vez e volta a ler depois de gravar, para
 * que uma edição a meio não seja substituída por dados novos.
 */
export function useAdminContent() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const next = await fetchSiteContent();
      setContent(next);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível ler o conteúdo.");
      setLoading(false);
    }
  }, []);

  // lê o conteúdo ao montar; `reload` continua disponível para reler depois
  // de gravar (o painel não segue as alterações em tempo real)
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const next = await fetchSiteContent();
        if (!alive) return;
        setContent(next);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Não foi possível ler o conteúdo.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  return { content, error, loading, reload };
}

/* ————————————————————————————— edição ————————————————————————————— */

/** Estado de edição de um bloco: valor atual, alterações pendentes e gravação. */
export function useDraft<T>(initial: T) {
  const [saved, setSaved] = useState<T>(initial);
  const [draft, setDraft] = useState<T>(initial);
  const [dirty, setDirty] = useState(false);

  const update = useCallback((next: T) => {
    setDraft(next);
    setDirty(true);
  }, []);

  const commit = useCallback((next: T) => {
    setDraft(next);
    setSaved(next);
    setDirty(false);
  }, []);

  // O conteúdo chega depois da primeira renderização (é lido da base de
  // dados). Enquanto não houver alterações pendentes, o rascunho acompanha o
  // conteúdo — sem isto os separadores ficavam com os valores vazios do
  // primeiro instante. É o padrão que o React recomenda para estado derivado:
  // ajustar durante a renderização, comparando uma assinatura do conteúdo.
  const signature = useMemo(() => JSON.stringify(initial ?? null), [initial]);
  const [seen, setSeen] = useState(signature);
  if (seen !== signature) {
    setSeen(signature);
    if (!dirty) {
      setSaved(initial);
      setDraft(initial);
    }
  }

  const reset = useCallback(() => {
    setDraft(saved);
    setDirty(false);
  }, [saved]);

  return { draft, update, commit, reset, dirty };
}

/** Grava um bloco na base de dados e avisa no fim. */
export function useSave<T>(
  draft: T,
  commit: (value: T) => void,
  run: (value: T) => Promise<void>,
  message: string,
) {
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await run(draft);
      commit(draft);
      toast(message);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível guardar.", "erro");
    } finally {
      setSaving(false);
    }
  }, [draft, commit, run, message, toast]);

  return { saving, save };
}
