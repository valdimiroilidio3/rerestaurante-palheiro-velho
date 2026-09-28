import { describe, expect, it } from "vitest";
import type { Dish, MenuCategory } from "@/content/types";
import {
  allergensIn,
  allergenLine,
  dishAllergens,
  formatPrice,
  hasAllergen,
  hasPrice,
  menuWithoutAllergen,
  mergeAllergens,
  parsePrice,
  priceStats,
  splitAllergens,
} from "@/lib/menu";
import type { Text } from "@/i18n";

const dish = (name: string, allergens: Text[]): Dish => ({
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
    expect(hasAllergen(dish("x", ["Glúten"]), "glúten", "pt")).toBe(true);
    expect(hasAllergen(dish("x", []), "glúten", "pt")).toBe(false);
  });

  it("junta e ordena o que a carta declara", () => {
    expect(allergensIn(MENU, "pt")).toEqual(["glúten", "leite", "ovo", "peixe"]);
    expect(allergensIn([{ ...MENU[0], items: [dish("Pão", [])] }], "pt")).toEqual([]);
  });

  it("tira os pratos com a substância escolhida", () => {
    const semPeixe = menuWithoutAllergen(MENU, "peixe", "pt");
    expect(semPeixe.map((c) => c.id)).toEqual(["entradas", "pratos"]);
    expect(semPeixe[0].items.map((d) => d.name)).toEqual(["Pão"]);
    expect(semPeixe[1].items.map((d) => d.name)).toEqual(["Polvo"]);
  });

  it("não deixa categorias vazias", () => {
    // sem glúten sai o “Pão”; as “Ovas” ficam e a categoria continua
    const semGluten = menuWithoutAllergen(MENU, "glúten", "pt");
    expect(semGluten.map((c) => c.id)).toEqual(["entradas", "pratos"]);
    expect(semGluten[0].items.map((d) => d.name)).toEqual(["Ovas"]);

    // uma categoria inteira de peixe desaparece quando se evita peixe
    const soPeixe: MenuCategory[] = [
      { id: "mar", label: "Mar", kicker: "", blurb: "", items: [dish("Salmão", ["peixe"])] },
      ...MENU,
    ];
    expect(menuWithoutAllergen(soPeixe, "peixe", "pt").map((c) => c.id)).toEqual(["entradas", "pratos"]);
  });

  it("não filtra nada quando a substância não existe na carta", () => {
    expect(menuWithoutAllergen(MENU, "amendoim", "pt")).toEqual(MENU);
  });

  it("lê o alergénio na língua escolhida e cai no português", () => {
    const traduzido = dish("Pão", [{ pt: "glúten", en: "gluten" }]);
    expect(dishAllergens(traduzido, "pt")).toEqual(["glúten"]);
    expect(dishAllergens(traduzido, "en")).toEqual(["gluten"]);

    // sem tradução, o inglês continua a ver o português — nunca um buraco
    const porTraduzir = dish("Pão", ["glúten"]);
    expect(dishAllergens(porTraduzir, "en")).toEqual(["glúten"]);
    expect(allergensIn([{ ...MENU[0], items: [porTraduzir] }], "en")).toEqual(["glúten"]);
  });

  it("filtra em inglês pelo nome inglês", () => {
    const carta: MenuCategory[] = [
      {
        id: "mar",
        label: "Mar",
        kicker: "",
        blurb: "",
        items: [dish("Salmão", [{ pt: "peixe", en: "fish" }]), dish("Polvo", [])],
      },
    ];
    // em inglês evita-se "fish": sai o salmão, fica o polvo
    const semFish = menuWithoutAllergen(carta, "fish", "en");
    expect(semFish.map((c) => c.id)).toEqual(["mar"]);
    expect(semFish[0].items.map((d) => d.name)).toEqual(["Polvo"]);

    // em português o filtro fala de "peixe" e faz o mesmo
    expect(menuWithoutAllergen(carta, "peixe", "pt")[0].items.map((d) => d.name)).toEqual(["Polvo"]);

    // pedir "peixe" em inglês não filtra nada: em inglês o alergénio chama-se "fish"
    expect(menuWithoutAllergen(carta, "peixe", "en")[0].items.map((d) => d.name)).toEqual([
      "Salmão",
      "Polvo",
    ]);
  });

  it("emparelha as duas línguas escritas no painel", () => {
    expect(mergeAllergens("glúten, ovo", "gluten, egg")).toEqual([
      { pt: "glúten", en: "gluten" },
      { pt: "ovo", en: "egg" },
    ]);
    // sem par, fica o que há
    expect(mergeAllergens("glúten, ovo", "")).toEqual(["glúten", "ovo"]);
    expect(mergeAllergens("", "gluten")).toEqual(["gluten"]);
    expect(allergenLine(mergeAllergens("glúten", "gluten"), "en")).toBe("gluten");
  });
});

describe("preços", () => {
  it("lê o que a casa escreveu", () => {
    expect(parsePrice("14 €")).toEqual({ amount: 14, currency: "€" });
    expect(parsePrice("14,50€")).toEqual({ amount: 14.5, currency: "€" });
    expect(parsePrice("9.50 EUR")).toEqual({ amount: 9.5, currency: "EUR" });
    expect(parsePrice("1 234")).toEqual({ amount: 1234, currency: "" });
  });

  it("não inventa preços onde não há número", () => {
    expect(parsePrice("—")).toBeNull();
    expect(parsePrice("sob consulta")).toBeNull();
    expect(parsePrice("")).toBeNull();
  });

  it("resume o intervalo de uma lista", () => {
    const carta = (prices: string[]): MenuCategory[] => [
      {
        id: "c",
        label: "C",
        kicker: "",
        blurb: "",
        items: prices.map((price, i) => ({ ...dish(`p${i}`, []), price })),
      },
    ];
    expect(priceStats(carta(["9 €", "34 €", "14,50 €"])[0].items)).toEqual({
      min: 9,
      max: 34,
      currency: "€",
    });
    // sem preços publicados não há intervalo nenhum
    expect(priceStats(carta(["—", "sob consulta"])[0].items)).toBeNull();
    expect(priceStats([])).toBeNull();
  });

  it("só conta como preço o que tem número", () => {
    expect(hasPrice("9 €")).toBe(true);
    expect(hasPrice("14,50€")).toBe(true);
    expect(hasPrice("—")).toBe(false);
    expect(hasPrice("")).toBe(false);
    expect(hasPrice(undefined)).toBe(false);
    expect(hasPrice("sob consulta")).toBe(false);
  });

  it("escreve os números na língua certa", () => {
    // dinheiro escreve-se sempre com duas casas
    expect(formatPrice(14.5, "pt")).toBe("14,50");
    expect(formatPrice(14.5, "en")).toBe("14.50");
    // menos de um euro também
    expect(formatPrice(0.8, "pt")).toBe("0,80");
    expect(formatPrice(9, "pt")).toBe("9");
  });
});
