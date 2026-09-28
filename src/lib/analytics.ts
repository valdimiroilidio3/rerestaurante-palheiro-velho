/**
 * Medição de audiência — só depois de a pessoa aceitar.
 *
 * O site não traz analytics por omissão. Quem o publicar define
 * `VITE_ANALYTICS_SRC` e `VITE_ANALYTICS_DOMAIN` (por exemplo um Plausible);
 * sem eles nada é carregado, mesmo que a pessoa aceite cookies.
 */
const SRC = import.meta.env.VITE_ANALYTICS_SRC?.trim();
const DOMAIN = import.meta.env.VITE_ANALYTICS_DOMAIN?.trim();

const ID = "palheiro-velho-analytics";

/** Há analytics configurado? */
export const analyticsEnabled = () => Boolean(SRC && DOMAIN);

/** Carrega a medição, se estiver configurada e ainda não estiver no documento. */
export function mountAnalytics(): void {
  if (!analyticsEnabled() || typeof document === "undefined") return;
  if (document.getElementById(ID)) return;

  const script = document.createElement("script");
  script.id = ID;
  script.defer = true;
  script.src = SRC as string;
  script.dataset.domain = DOMAIN as string;
  document.head.appendChild(script);
}

/** Retira a medição do documento (quando a pessoa retira o consentimento). */
export function unmountAnalytics(): void {
  if (typeof document === "undefined") return;
  document.getElementById(ID)?.remove();
}
