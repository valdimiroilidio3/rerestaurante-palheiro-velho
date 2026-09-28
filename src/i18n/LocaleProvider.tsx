import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { LocaleContext, type LocaleValue } from "./context";
import type { Locale } from "./types";
import { HTML_LANG, detectLocale, localeHref, resolve, storeLocale } from "./index";
import { uiStrings } from "./ui";

/**
 * Idioma do site, para todos os componentes.
 *
 * A escolha vive no endereço (`?lang=en`) e no navegador: um link partilhado
 * abre na língua certa e a pessoa não tem de escolher duas vezes.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((next: Locale) => {
    storeLocale(next);
    // o endereço muda sem recarregar: manter o ?lang na barra ajuda a partilhar
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", localeHref(next));
    }
    setLocaleState(next);
  }, []);

  // o <html lang> segue a escolha: é o que os leitores de ecrã e os motores lêem
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      setLocale,
      other: locale === "pt" ? "en" : "pt",
      ui: uiStrings(locale),
      t: (text) => resolve(text, locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
