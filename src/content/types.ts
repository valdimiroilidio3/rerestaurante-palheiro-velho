/**
 * Modelo de conteúdo do site.
 *
 * É a única forma que os componentes conhecem: tanto faz que os dados venham
 * da base de dados (Supabase) ou do ficheiro de origem (`defaults.ts`), o site
 * recebe sempre um objeto `SiteContent`.
 */

/** Uma imagem já com as variantes e dimensões que o browser precisa. */
export type ImageAsset = {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
  alt?: string;
};

/** Imagem dentro de uma lista editável: precisa de `id` para ser reordenada. */
export type IdentifiedImage = ImageAsset & { id: string };

export type Contact = {
  name: string;
  kind: string;
  address: string;
  locality: string;
  region: string;
  phoneLabel: string;
  phone: string;
  email: string;
  instagram: string;
  instagramUrl: string;
  facebookUrl: string;
  mapsQuery: string;
  note: string;
};

export type Brand = {
  /** Logótipo de referência. Substituir por ficheiro autorizado da marca. */
  publicLogo: string;
  publicLogoSource: string;
  assetStatus: string;
  photoStatus: string;
};

export type Hero = {
  /** Dois ficheiros: o pesado só é servido em ecrãs grandes. */
  videoSources: string[];
  poster: string;
  /** Objeto da imagem de abertura — é o que o painel edita e submete. */
  posterImage?: ImageAsset;
  posterSrcSet: string;
  posterWidth: number;
  posterHeight: number;
  /** Fundo do menu móvel (mais pequeno). */
  overlay: string;
  tagline: string;
};

export type NavItem = { id: string; label: string };

export type IntroFact = { id: string; k: string; t: string; d: string };

/** Cada categoria mostra o primeiro prato em destaque. */
export type Dish = {
  id: string;
  name: string;
  desc: string;
  price: string;
  image: ImageAsset;
  flag?: string;
};

export type MenuCategory = {
  id: string;
  label: string;
  kicker: string;
  blurb: string;
  items: Dish[];
};

export type Ocean = {
  wide: ImageAsset;
  mid: ImageAsset;
  /** Palavras da frase gigante — uma por palavra. */
  line: string[];
  sub: string;
};

export type ExperiencePanel = {
  id: string;
  label: string;
  idx: string;
  image: ImageAsset;
  text: string;
  meta: string;
};

export type GalleryItem = {
  id: string;
  image: ImageAsset;
  cap: string;
  loc: string;
};

export type InstagramItem = {
  id: string;
  image: ImageAsset;
  cap: string;
  likes: string;
  /** Classes Tailwind do mosaico (ex.: "sm:col-span-2 sm:row-span-2"). */
  span: string;
};

export type EventItem = {
  id: string;
  n: string;
  title: string;
  desc: string;
  image: ImageAsset;
  tag: string;
};

export type SiteContent = {
  contact: Contact;
  brand: Brand;
  nav: NavItem[];
  hero: Hero;
  intro: { images: IdentifiedImage[]; facts: IntroFact[] };
  ticker: string[];
  hashtags: string[];
  menu: MenuCategory[];
  ocean: Ocean;
  experience: ExperiencePanel[];
  gallery: GalleryItem[];
  instagram: InstagramItem[];
  events: EventItem[];
  eventPerks: string[];
  conceptNotice: string;
};

/** URLs derivadas da morada — nunca são editadas à mão. */
export const mapsUrls = (query: string) => ({
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
  embed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
});
