import { describe, expect, it } from "vitest";
import type { Dish, MenuCategory } from "@/content/types";
import { allergensIn, hasAllergen, menuWithoutAllergen, splitAllergens } from "@/lib/menu";

const dish = (name: string, allergens: string[]): Dish => ({
  id: name,
  name,
  desc: "",
  price: "—",
  image: { src: "" },
  allergens,
});

const MENU: MenuCategory[] = [
  {
    id: "entradas",
    label: "Entradas",
    kicker: "",
    blurb: "",
    items: [dish("Pão", ["glúten"]), dish("Ovas", ["peixe", "ovo"])],
  },
  {
    id: "pratos",
    label: "Pratos",
    kicker: "",
    blurb: "",
    items: [dish("Polvo", []), dish("Bacalhau", ["peixe", "leite"])],
  },
];

describe("alergénios", () => {
  it("lê uma lista escrita à mão", () => {
    expect(splitAllergens("glúten, ovo; leite\nmostarda")).toEqual(["glúten", "ovo", "leite", "mostarda"]);
    expect(splitAllergens("glúten, glúten , GLÚTEN")).toEqual(["glúten"]);
    expect(splitAllergens("   ")).toEqual([]);
  });

  it("compara sem ligar a maiúsculas", () => {
    expect(hasAllergen(dish("x", ["Glúten"]), "glúten")).toBe(true);
    expect(hasAllergen(dish("x", []), "glúten")).toBe(false);
  });

  it("junta e ordena o que a carta declara", () => {
    expect(allergensIn(MENU)).toEqual(["glúten", "leite", "ovo", "peixe"]);
    expect(allergensIn([{ ...MENU[0], items: [dish("Pão", [])] }])).toEqual([]);
  });

  it("tira os pratos com a substância escolhida", () => {
    const semPeixe = menuWithoutAllergen(MENU, "peixe");
    expect(semPeixe.map((c) => c.id)).toEqual(["entradas", "pratos"]);
    expect(semPeixe[0].items.map((d) => d.name)).toEqual(["Pão"]);
    expect(semPeixe[1].items.map((d) => d.name)).toEqual(["Polvo"]);
  });

  it("não deixa categorias vazias", () => {
    // sem glúten sai o “Pão”; as “Ovas” ficam e a categoria continua
    const semGluten = menuWithoutAllergen(MENU, "glúten");
    expect(semGluten.map((c) => c.id)).toEqual(["entradas", "pratos"]);
    expect(semGluten[0].items.map((d) => d.name)).toEqual(["Ovas"]);

    // uma categoria inteira de peixe desaparece quando se evita peixe
    const soPeixe: MenuCategory[] = [
      { id: "mar", label: "Mar", kicker: "", blurb: "", items: [dish("Salmão", ["peixe"])] },
      ...MENU,
    ];
    expect(menuWithoutAllergen(soPeixe, "peixe").map((c) => c.id)).toEqual(["entradas", "pratos"]);
  });

  it("não filtra nada quando a substância não existe na carta", () => {
    expect(menuWithoutAllergen(MENU, "amendoim")).toEqual(MENU);
  });
});
