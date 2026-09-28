/**
 * O contexto de idioma e os ganchos que o leem.
 *
 * Fica fora do componente (e do mesmo ficheiro) porque o react-refresh só
 * funciona bem quando um ficheiro exporta componentes ou funções — nunca as
 * duas coisas.
 */
import { createContext, useContext } from "react";
import type { Locale } from "./types";
import type { Text } from "./types";
import type { UiStrings } from "./ui";

export type LocaleValue = {
  locale: Locale;
  /** Muda de idioma: guarda a escolha e põe-na no endereço. */
  setLocale: (next: Locale) => void;
  /** O outro idioma, para o botão de troca. */
  other: Locale;
  ui: UiStrings;
  /** Um texto do conteúdo na língua atual (com quebra para o português). */
  t: (text: Text | undefined) => string;
};

export const LocaleContext = createContext<LocaleValue | null>(null);

/** Idioma, textos da interface e tradução de conteúdo. */
export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale tem de ser usado dentro de <LocaleProvider>.");
  return value;
}

/** Só o necessário para traduzir conteúdo da casa. */
export function useText(): (text: Text | undefined) => string {
  return useLocale().t;
}

/** Só os textos da interface. */
export function useUi(): UiStrings {
  return useLocale().ui;
}
