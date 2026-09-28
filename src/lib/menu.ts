/**
 * Carta: alergénios.
 *
 * A informação de alergénios é matéria de saúde — não se inventa. Por isso o
 * site só mostra filtros e etiquetas quando a casa declarou alguma coisa, e
 * nunca Transforma ausência de dados em “sem alergénios”.
 */
import type { Dish, MenuCategory } from "@/content/types";

/** "glúten, ovo; leite" → ["glúten", "ovo", "leite"]. */
export function splitAllergens(value: string): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const raw of value.split(/[,;\n]/)) {
    const item = raw.trim();
    if (!item) continue;
    const key = item.toLocaleLowerCase("pt");
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(item);
  }
  return list;
}

/** Tem esta substância declarada? (comparação sem sensibilidade a maiúsculas). */
export const hasAllergen = (dish: Dish, allergen: string): boolean =>
  (dish.allergens ?? []).some((item) => item.toLocaleLowerCase("pt") === allergen.toLocaleLowerCase("pt"));

/** Todos os alergénios declarados na carta, por ordem alfabética. */
export function allergensIn(menu: MenuCategory[]): string[] {
  const seen = new Set<string>();
  for (const category of menu) {
    for (const dish of category.items) {
      for (const item of dish.allergens ?? []) seen.add(item);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "pt"));
}

/**
 * A carta sem os pratos que contêm uma substância.
 * As categorias que ficarem vazias saem da lista — ninguém quer um separador
 * sem nada dentro.
 */
export function menuWithoutAllergen(menu: MenuCategory[], allergen: string): MenuCategory[] {
  return menu
    .map((category) => ({
      ...category,
      items: category.items.filter((dish) => !hasAllergen(dish, allergen)),
    }))
    .filter((category) => category.items.length > 0);
}
