/**
 * Idioma do site.
 *
 * Duas línguas — português (de origem) e inglês — escolhidas pela pessoa,
 * guardadas no navegador e visíveis no endereço (`?lang=en`), para que um link
 * partilhado abra sempre na língua certa.
 *
 * O conteúdo é `Text`: ou uma simples `string` (ainda por traduzir, vale para
 * todas as línguas) ou um par `{ pt, en }`. Assim a casa traduz ao seu ritmo,
 * sem nada ficar vazio: o que não estiver traduzido cai no português.
 */
import type { Locale, Localized, Text } from "./types";
import { DEFAULT_LOCALE, localeFromLanguage } from "./locales";

export type { Locale, Localized, Text };

/* línguas e resolução de textos (módulos sem browser, usados também no build) */
export { DEFAULT_LOCALE, HTML_LANG, isLocale, LOCALES, LOCALE_LABEL, localeFromLanguage } from "./locales";
export { isTranslated, resolve, resolveList, translatedCount } from "./resolve";

/* ——————————————————————————— idioma atual ——————————————————————————— */

const STORAGE_KEY = "palheiro-velho:locale";
const QUERY = "lang";

/** O idioma pedido no endereço, se houver. */
export function localeFromLocation(): Locale | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const asked = params.get(QUERY);
  if (asked && (asked === "pt" || asked === "en")) return asked;
  // também se aceita /en/… (o site é estático, mas quem alojar pode redireccionar)
  const first = window.location.pathname.split("/").filter(Boolean)[0];
  return first === "pt" || first === "en" ? first : null;
}

/** O idioma guardado numa visita anterior. */
export function storedLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "pt" || value === "en" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Que idioma mostrar: o do endereço, depois o da visita anterior, depois o do
 * navegador. O português é o destino quando não há pista nenhuma.
 */
export function detectLocale(): Locale {
  return (
    localeFromLocation() ??
    storedLocale() ??
    (typeof navigator !== "undefined" ? localeFromLanguage(navigator.language ?? "") : DEFAULT_LOCALE)
  );
}

export function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // modo privado: a escolha vale durante a visita
  }
}

/** O endereço da página noutro idioma, para partilhar ou para os robots. */
export function localeHref(locale: Locale, href?: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(href ?? window.location.href, window.location.href);
  if (locale === DEFAULT_LOCALE) url.searchParams.delete(QUERY);
  else url.searchParams.set(QUERY, locale);
  return `${url.pathname}${url.search}${url.hash}`;
}
