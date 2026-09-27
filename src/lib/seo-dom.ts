import { pageDescription, pageTitle, restaurantSchema } from "./seo";
import type { SiteContent } from "../content/types";

/**
 * Endereço público do site. Acesso estático: é assim que o vite substitui o
 * valor no build (acesso dinâmico não funciona).
 */
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").trim().replace(/\/+$/, "");

const setMeta = (attr: "name" | "property", key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/**
 * Escreve no documento o título, a descrição, as etiquetas de partilha e os
 * dados estruturados. Corre sempre que o conteúdo muda, por isso o que o
 * Google lê é o conteúdo real da base de dados — não o de origem.
 */
export function applySeo(content: SiteContent): void {
  if (typeof document === "undefined") return;

  const title = pageTitle(content);
  const description = pageDescription(content);
  const image = content.hero.poster;

  document.title = title;
  setMeta("name", "description", description);

  setMeta("property", "og:type", "website");
  setMeta("property", "og:site_name", content.contact.name);
  setMeta("property", "og:locale", "pt_PT");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:image", image);
  setMeta("property", "og:image:alt", `${content.contact.name} — ${content.contact.kind}`);
  if (content.hero.posterWidth) setMeta("property", "og:image:width", String(content.hero.posterWidth));
  if (content.hero.posterHeight) setMeta("property", "og:image:height", String(content.hero.posterHeight));

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  if (SITE_URL) {
    setLink("canonical", SITE_URL);
    setMeta("property", "og:url", SITE_URL);
  }

  // os dados estruturados seguem o conteúdo: sai o bloco antigo, entra o novo
  const id = "site-schema";
  document.getElementById(id)?.remove();
  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.id = id;
  schema.textContent = JSON.stringify(restaurantSchema(content, SITE_URL));
  document.head.appendChild(schema);
}
