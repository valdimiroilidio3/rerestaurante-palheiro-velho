/** Línguas do site. */
export type Locale = "pt" | "en";

/** Um texto com uma versão por língua (a que faltar cai no português). */
export type Localized = Partial<Record<Locale, string>>;

/**
 * Texto do site: simples (igual em todas as línguas) ou traduzido.
 * Vive aqui — e não no módulo de i18n — para o modelo de conteúdo o poder usar
 * sem dependências.
 */
export type Text = string | Localized;
