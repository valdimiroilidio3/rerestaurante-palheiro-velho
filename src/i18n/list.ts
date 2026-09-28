/**
 * Listas com tradução (faixas, hashtags, vantagens).
 *
 * O painel mostra uma caixa de texto por língua, uma entrada por linha, e as
 * linhas emparelham-se pela ordem: a terceira linha do inglês traduz a
 * terceira linha do português. O que não tiver par fica numa língua só — o
 * site mostra o que houver, nunca um buraco.
 */
import type { Locale, Text } from "./types";

/**
 * Junta o que foi escrito numa língua à lista que já existe.
 * Escrever em inglês quando a lista está vazia cria entradas só em inglês.
 */
export function mergeLines(lines: string[], current: readonly Text[], locale: Locale): Text[] {
  const trimmed = lines.map((line) => line.trim());
  const size = Math.max(trimmed.length, current.length);
  const next: Text[] = [];

  for (let i = 0; i < size; i += 1) {
    const line = trimmed[i] ?? "";
    const previous = current[i];
    // um texto simples que já lá estava é o português dessa entrada
    const pair = typeof previous === "string" ? { pt: previous, en: "" } : { ...previous };
    next.push(compact({ ...pair, [locale]: line }));
  }

  return next.filter((item) => (typeof item === "string" ? item.trim() : item.pt || item.en));
}

/** Só com uma das línguas escrita, guarda-se como texto simples — é a mesma coisa. */
function compact(pair: { pt?: string; en?: string }): Text {
  const pt = pair.pt?.trim() ?? "";
  const en = pair.en?.trim() ?? "";
  return pt && en ? { pt, en } : pt || en;
}
