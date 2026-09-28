import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fill } from "@/i18n/ui";
import { uiStrings } from "@/i18n/ui";
import { mergeLines } from "@/i18n/list";
import type { Text } from "@/i18n";
import {
  DEFAULT_LOCALE,
  LOCALES,
  detectLocale,
  isLocale,
  isTranslated,
  localeFromLanguage,
  localeHref,
  resolve,
  resolveList,
  storedLocale,
  translatedCount,
} from "@/i18n";

/**
 * Os testes correm em node, por isso o browser é simulado à mão: basta um
 * `window` com o endereço e um `localStorage` que guarde o que lhe derem.
 */
const store = new Map<string, string>();

const storage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
};

/** Põe o endereço que queremos simular. */
function setLocation(search: string, pathname = "/") {
  (globalThis as Record<string, unknown>).window = {
    location: { search, pathname, href: `https://exemplo.pt${pathname}${search}` },
    localStorage: storage,
    history: { replaceState: () => {} },
  };
  (globalThis as Record<string, unknown>).localStorage = storage;
}

describe("escolher a língua", () => {
  it("só há dois idiomas e o português é o de origem", () => {
    expect(LOCALES).toEqual(["pt", "en"]);
    expect(DEFAULT_LOCALE).toBe("pt");
  });

  it("lê a língua do navegador e cai no português", () => {
    expect(localeFromLanguage("en-GB")).toBe("en");
    expect(localeFromLanguage("EN")).toBe("en");
    expect(localeFromLanguage("pt-PT")).toBe("pt");
    expect(localeFromLanguage("fr-FR")).toBe("pt");
    expect(localeFromLanguage("")).toBe("pt");
  });

  it("só aceita os idiomas do site", () => {
    expect(isLocale("pt")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("detetar a língua", () => {
  beforeEach(() => {
    store.clear();
    setLocation("");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("o endereço manda sobre tudo", () => {
    setLocation("?lang=en");
    store.set("palheiro-velho:locale", "pt");
    expect(detectLocale()).toBe("en");
  });

  it("aceita também o primeiro segmento do caminho", () => {
    setLocation("", "/en/");
    expect(detectLocale()).toBe("en");
  });

  it("sem endereço, vale o que ficou guardado da visita anterior", () => {
    store.set("palheiro-velho:locale", "en");
    expect(storedLocale()).toBe("en");
    expect(detectLocale()).toBe("en");
  });

  it("um valor guardado a direito não derruba o site", () => {
    store.set("palheiro-velho:locale", "banana");
    expect(storedLocale()).toBeNull();
  });

  it("por fim pergunta ao navegador", () => {
    vi.stubGlobal("navigator", { language: "en-US" });
    expect(detectLocale()).toBe("en");
    vi.stubGlobal("navigator", { language: "pt-PT" });
    expect(detectLocale()).toBe("pt");
  });

  it("sem pista nenhuma, fica em português", () => {
    vi.stubGlobal("navigator", { language: "de-DE" });
    expect(detectLocale()).toBe("pt");
  });
});

describe("o endereço por língua", () => {
  beforeEach(() => {
    setLocation("");
  });

  it("o português é o endereço limpo, o inglês leva ?lang=en", () => {
    expect(localeHref("pt", "/")).toBe("/");
    expect(localeHref("en", "/")).toBe("/?lang=en");
    expect(localeHref("en", "./legal.html#cookies")).toBe("/legal.html?lang=en#cookies");
  });

  it("não acumula o parâmetro nem perde o que já lá estava", () => {
    setLocation("?lang=en&utm=x");
    expect(localeHref("pt")).toBe("/?utm=x");
    expect(localeHref("en")).toBe("/?lang=en&utm=x");
  });
});

describe("resolver textos", () => {
  const pair: Text = { pt: "Polvo à lagareiro", en: "Octopus" };

  it("um texto simples serve para as duas línguas", () => {
    expect(resolve("Polvo", "pt")).toBe("Polvo");
    expect(resolve("Polvo", "en")).toBe("Polvo");
  });

  it("cada língua lê a sua versão", () => {
    expect(resolve(pair, "pt")).toBe("Polvo à lagareiro");
    expect(resolve(pair, "en")).toBe("Octopus");
  });

  it("o que falta traduzir cai no português — nunca num buraco", () => {
    expect(resolve({ pt: "Só em português" }, "en")).toBe("Só em português");
    // e se só houver inglês, o português mostra esse
    expect(resolve({ en: "Only in English" }, "pt")).toBe("Only in English");
  });

  it("texto vazio devolve vazio, sem rebentar", () => {
    expect(resolve(undefined, "pt")).toBe("");
    expect(resolve({}, "en")).toBe("");
    expect(resolve("", "en")).toBe("");
    expect(resolveList(undefined, "pt")).toEqual([]);
  });

  it("resolve listas de uma vez", () => {
    expect(resolveList(["Pão", { pt: "Ovas", en: "Roe" }], "en")).toEqual(["Pão", "Roe"]);
  });

  it("sabe dizer o que está por traduzir", () => {
    expect(isTranslated(pair, "en")).toBe(true);
    expect(isTranslated({ pt: "Só pt" }, "en")).toBe(false);
    // um texto simples não está “por traduzir”: é igual nas duas línguas
    expect(isTranslated("Polvo", "en")).toBe(true);
    expect(translatedCount(["a", { pt: "b" }, { pt: "c", en: "c" }], "en")).toBe(2);
  });
});

describe("o dicionário da interface", () => {
  it("as duas línguas têm exatamente as mesmas chaves", () => {
    const pt = Object.keys(uiStrings("pt")).sort();
    const en = Object.keys(uiStrings("en")).sort();
    expect(en).toEqual(pt);
  });

  it("nenhum texto da interface ficou vazio", () => {
    for (const locale of LOCALES) {
      const strings = uiStrings(locale);
      for (const [key, value] of Object.entries(strings)) {
        expect(value.trim(), `${locale}.${key}`).not.toBe("");
      }
    }
  });

  it("preenche os marcadores e deixa ver os que não conhece", () => {
    expect(fill("sem {item}", { item: "glúten" })).toBe("sem glúten");
    expect(fill("{lead} hora{s}", { lead: 2, s: "s" })).toBe("2 horas");
    expect(fill("sem {item}", {})).toBe("sem {item}");
  });
});

describe("listas traduzidas no painel", () => {
  it("emparelha as linhas pela ordem", () => {
    expect(mergeLines(["Sabores", "Vista"], [], "pt")).toEqual(["Sabores", "Vista"]);
    expect(mergeLines(["Flavours", "View"], ["Sabores", "Vista"], "en")).toEqual([
      { pt: "Sabores", en: "Flavours" },
      { pt: "Vista", en: "View" },
    ]);
  });

  it("não perde a tradução que já existia na outra língua", () => {
    const current: Text[] = [{ pt: "Sabores", en: "Flavours" }, "Vista"];
    expect(mergeLines(["Sabores", "Vista", "Mar"], current, "pt")).toEqual([
      { pt: "Sabores", en: "Flavours" },
      "Vista",
      "Mar",
    ]);
  });

  it("linhas a mais na outra língua criam entradas só nessa língua", () => {
    expect(mergeLines(["Sea"], [], "en")).toEqual(["Sea"]);
  });

  it("apagar tudo deixa a lista vazia", () => {
    expect(mergeLines([], ["Sabores"], "pt")).toEqual([]);
    // apagar só o português deixa a entrada em inglês, como texto simples
    expect(mergeLines([""], [{ pt: "Sabores", en: "Flavours" }], "pt")).toEqual(["Flavours"]);
  });
});
