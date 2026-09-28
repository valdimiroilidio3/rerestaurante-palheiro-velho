/**
 * Texto: pequenas funções que o site e o painel usam da mesma maneira.
 * São puras — é o que permite testá-las sem montar nada.
 */
import type { Locale } from "@/i18n/types";

/** Texto com parágrafos separados por uma linha em branco. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * "2026-09-28" → "28 de setembro de 2026" (ou "28 September 2026", em inglês).
 * Datas inválidas voltam como estão.
 */
export function formatDate(value: string, locale: Locale = "pt"): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return value;
  }
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
