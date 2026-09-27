import type { SiteContent } from "../content/types";

/**
 * Títulos, descrição e dados estruturados — tudo função pura do conteúdo.
 * Este ficheiro também é lido pelo vite (node) no build, por isso não toca
 * no `import.meta.env` nem no DOM.
 */

/**
 * Dados estruturados de restaurante, no formato schema.org.
 *
 * É o que permite ao Google (e ao Maps) perceber o que é a casa: morada,
 * telefone, redes sociais e, quando estiverem preenchidas, as coordenadas.
 * Só se escreve o que se sabe — nada de inventar horários ou cozinha.
 */
export function restaurantSchema(content: SiteContent, siteUrl = "") {
  const c = content.contact;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: c.name,
    description: pageDescription(content),
    telephone: c.phone,
    email: c.email,
    image: content.hero.poster,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address,
      addressLocality: c.locality,
      addressRegion: c.region,
      addressCountry: "PT",
    },
    sameAs: [c.instagramUrl, c.facebookUrl].filter(Boolean),
  };

  if (siteUrl) schema.url = siteUrl;

  // as coordenadas são opcionais: sem elas o Google fica só com a morada
  if (typeof c.lat === "number" && typeof c.lng === "number") {
    schema.geo = { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lng };
  }

  return schema;
}

/** Uma frase para o Google e para as partilhas. */
export function pageDescription(content: SiteContent) {
  const c = content.contact;
  const note = c.note.trim();
  if (!note) return `${c.kind} em ${c.locality}.`;
  // só se acrescenta a localidade quando a nota não a menciona
  return note.toLowerCase().includes(c.locality.split(",")[0].trim().toLowerCase())
    ? note
    : `${note} · ${c.locality}`;
}

export function pageTitle(content: SiteContent) {
  const c = content.contact;
  return `${c.name} · ${c.kind} em ${c.locality}`;
}
