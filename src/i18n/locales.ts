/**
 * As línguas do site.
 *
 * Módulo sem `window` nem `localStorage`: também é lido pelo vite (node) no
 * build, para escrever os `hreflang` e o sitemap.
 */
import type { Locale } from "./types";

export const LOCALES: Locale[] = ["pt", "en"];

/** A língua de origem: é para aqui que tudo cai. */
export const DEFAULT_LOCALE: Locale = "pt";

/** Etiquetas curtas do seletor. */
export const LOCALE_LABEL: Record<Locale, string> = { pt: "PT", en: "EN" };

/** O que o navegador lê como tag HTML: pt-PT / en-GB. */
export const HTML_LANG: Record<Locale, string> = { pt: "pt-PT", en: "en-GB" };

/** "pt-PT" → "pt"; tudo o que não for inglês fica em português. */
export function localeFromLanguage(tag: string): Locale {
  return tag.trim().toLowerCase().startsWith("en") ? "en" : "pt";
}

export const isLocale = (value: unknown): value is Locale => value === "pt" || value === "en";
