/**
 * Resolver textos por língua.
 *
 * Fica separado do resto porque também é usado fora do browser (o `seo.ts` é
 * lido pelo vite no build), por isto aqui não há `window` nem `localStorage`.
 */
import type { Locale, Text } from "./types";
import { DEFAULT_LOCALE } from "./locales";

/**
 * O texto numa língua. Ordem: o que está escrito nessa língua → o português →
 * o que existir. Nunca devolve vazio por falta de tradução.
 */
export function resolve(text: Text | undefined, locale: Locale): string {
  if (typeof text === "string") return text;
  if (!text) return "";
  const direct = text[locale]?.trim();
  if (direct) return direct;
  const fallback = text[DEFAULT_LOCALE]?.trim();
  if (fallback) return fallback;
  return (locale === "pt" ? text.en : text.pt)?.trim() ?? "";
}

/** Uma lista de textos, resolvida de uma vez. */
export const resolveList = (items: readonly Text[] | undefined, locale: Locale): string[] =>
  (items ?? []).map((item) => resolve(item, locale));

/** Há tradução própria para esta língua? (Serve para avisar o que falta.) */
export function isTranslated(text: Text | undefined, locale: Locale): boolean {
  if (typeof text === "string") return true;
  if (!text) return false;
  return Boolean(text[locale]?.trim());
}

/** Conta quantos textos de uma lista estão traduzidos — usado no painel. */
export function translatedCount(items: readonly Text[] | undefined, locale: Locale): number {
  return (items ?? []).filter((item) => isTranslated(item, locale)).length;
}
