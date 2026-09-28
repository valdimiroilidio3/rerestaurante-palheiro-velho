/**
 * Carta: alergénios.
 *
 * A informação de alergénios é matéria de saúde — não se inventa. Por isso o
 * site só mostra filtros e etiquetas quando a casa declarou alguma coisa, e
 * nunca Transforma ausência de dados em “sem alergénios”.
 *
 * Cada alergénio é um `Text`: a casa escreve "glúten" em português e "gluten"
 * em inglês. O que faltar cai no português — como em todo o site.
 */
import type { Locale, Text } from "@/i18n/types";
import { resolve } from "@/i18n";
import type { Dish, MenuCategory } from "@/content/types";

/** "glúten, ovo; leite" → ["glúten", "ovo", "leite"]. */
export function splitAllergens(value: string): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const raw of value.split(/[,;\n]/)) {
    const item = raw.trim();
    if (!item) continue;
    const key = item.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(item);
  }
  return list;
}

/** Os alergénios do prato, na língua pedida. */
export const dishAllergens = (dish: Dish, locale: Locale): string[] =>
  (dish.allergens ?? []).map((item) => resolve(item, locale)).filter(Boolean);

/** Tem esta substância declarada? (comparação sem sensibilidade a maiúsculas). */
export const hasAllergen = (dish: Dish, allergen: string, locale: Locale): boolean =>
  dishAllergens(dish, locale).some((item) => item.toLocaleLowerCase() === allergen.toLocaleLowerCase());

/** Todos os alergénios declarados na carta, por ordem alfabética. */
export function allergensIn(menu: MenuCategory[], locale: Locale): string[] {
  const seen = new Set<string>();
  for (const category of menu) {
    for (const dish of category.items) {
      for (const item of dishAllergens(dish, locale)) {
        if (item) seen.add(item);
      }
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, locale === "en" ? "en" : "pt"));
}

/**
 * A carta sem os pratos que contêm uma substância.
 * As categorias que ficarem vazias saem da lista — ninguém quer um separador
 * sem nada dentro.
 */
export function menuWithoutAllergen(menu: MenuCategory[], allergen: string, locale: Locale): MenuCategory[] {
  return menu
    .map((category) => ({
      ...category,
      items: category.items.filter((dish) => !hasAllergen(dish, allergen, locale)),
    }))
    .filter((category) => category.items.length > 0);
}

/**
 * Junta o que a casa escreveu nas duas línguas, entrada a entrada:
 * "glúten, ovo" + "gluten, egg" → [{pt:"glúten",en:"gluten"}, {pt:"ovo",en:"egg"}].
 * O que não tiver par fica só numa língua (e o site mostra essa).
 */
export function mergeAllergens(pt: string, en: string): Text[] {
  const ptItems = splitAllergens(pt);
  const enItems = splitAllergens(en);
  const size = Math.max(ptItems.length, enItems.length);
  const next: Text[] = [];

  for (let i = 0; i < size; i += 1) {
    const ptValue = ptItems[i];
    const enValue = enItems[i];
    if (ptValue && enValue) next.push({ pt: ptValue, en: enValue });
    else next.push(ptValue || enValue);
  }

  return next;
}

/** A linha que o painel mostra para editar, na língua pedida. */
export const allergenLine = (items: readonly Text[] | undefined, locale: Locale): string =>
  (items ?? []).map((item) => resolve(item, locale)).join(", ");

/* ————————————————————————————— preços ————————————————————————————— */

export type PriceStats = { min: number; max: number; currency: string };

/**
 * Lê um preço escrito pela casa: "14 €", "14,50€", "9.50 EUR".
 * Sem número (por exemplo "—" ou "sob consulta") devolve `null` — o site
 * mostra então só o que souber, sem inventar valores.
 */
export function parsePrice(value: string): { amount: number; currency: string } | null {
  const text = value.trim();
  if (!text) return null;

  // o último número da frase é o preço; o que vem a seguir é a moeda
  const match = /(\d[\d.,\s]*\d|\d)\s*([^\d\s]*)\s*$/.exec(text);
  if (!match) return null;

  const raw = match[1].replace(/\s/g, "");
  // "1.234,50" e "1,234.50": fica-se com o separador que aparece em último
  const amount = Number(
    /[.,]\d{1,2}$/.test(raw)
      ? raw.replace(/[.,](?=\d{1,2}$)/, ".").replace(/[.,](?=\d{3}\b)/g, "")
      : raw.replace(/[.,]/g, ""),
  );
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return { amount, currency: match[2].trim() };
}

/** O intervalo de preços de uma lista de pratos. Vazio = a casa não publicou. */
export function priceStats(items: readonly Dish[]): PriceStats | null {
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  let currency = "";

  for (const dish of items) {
    const price = parsePrice(dish.price ?? "");
    if (!price) continue;
    min = Math.min(min, price.amount);
    max = Math.max(max, price.amount);
    // a moeda da casa: a última que apareceu (todas deviam ser a mesma)
    currency = price.currency || currency;
  }

  if (!Number.isFinite(min)) return null;
  return { min, max, currency };
}

/** "9,50" em português e "9.50" em inglês — a moeda é a que a casa escreveu. */
export const formatPrice = (value: number, locale: Locale): string =>
  new Intl.NumberFormat(locale === "en" ? "en-GB" : "pt-PT", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

/** A casa publicou um preço com número? "—", "" ou "sob consulta" não contam. */
export const hasPrice = (value: string | undefined): boolean => parsePrice(value ?? "") !== null;
