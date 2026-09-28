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
