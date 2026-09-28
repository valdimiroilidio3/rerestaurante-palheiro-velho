import { WEEK_DAYS, type SiteContent } from "../content/types";
import { CUISINE, PRICE_RANGE } from "../content/defaults";
import type { Locale } from "../i18n/types";
import { resolve } from "../i18n/resolve";

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
export function restaurantSchema(content: SiteContent, siteUrl = "", locale: Locale = "pt") {
  const c = content.contact;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: c.name,
    description: pageDescription(content, locale),
    inLanguage: locale === "en" ? "en-GB" : "pt-PT",
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
    // sul-americana: a classificação publicada nos diretórios da casa
    servesCuisine: CUISINE,
    priceRange: PRICE_RANGE,
    sameAs: [c.instagramUrl, c.facebookUrl].filter(Boolean),
    // vem do painel: se a casa desligou os pedidos, o Google também fica a saber
    acceptsReservations: content.reservations.enabled ? "True" : "False",
  };

  if (siteUrl) schema.url = siteUrl;

  // horário: uma especificação por linha, no formato que o Google lê
  const openingHours = content.hours
    .filter((h) => h.open && h.close && h.days.length)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => WEEK_DAYS.find((w) => w.id === d)?.schema).filter(Boolean),
      opens: h.open,
      closes: h.close,
    }));
  if (openingHours.length) schema.openingHoursSpecification = openingHours;

  // as coordenadas são opcionais: sem elas o Google fica só com a morada
  if (typeof c.lat === "number" && typeof c.lng === "number") {
    schema.geo = { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lng };
  }

  return schema;
}

/** Uma frase para o Google e para as partilhas. */
export function pageDescription(content: SiteContent, locale: Locale = "pt") {
  const c = content.contact;
  const note = resolve(c.note, locale).trim();
  const kind = resolve(c.kind, locale);
  if (!note) return `${kind} em ${c.locality}.`;
  // só se acrescenta a localidade quando a nota não a menciona
  return note.toLowerCase().includes(c.locality.split(",")[0].trim().toLowerCase())
    ? note
    : `${note} · ${c.locality}`;
}

export function pageTitle(content: SiteContent, locale: Locale = "pt") {
  const c = content.contact;
  return `${c.name} · ${resolve(c.kind, locale)} em ${c.locality}`;
}
