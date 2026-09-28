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
  kind: Text;
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
  note: Text;
  /** Coordenadas, só para os dados estruturados e o mapa. Opcionais. */
  lat?: number;
  lng?: number;
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
  tagline: Text;
};

export type NavItem = { id: string; label: Text };

export type IntroFact = { id: string; k: string; t: Text; d: Text };

/** Cada categoria mostra o primeiro prato em destaque. */
export type Dish = {
  id: string;
  name: Text;
  desc: Text;
  price: string;
  image: ImageAsset;
  flag?: Text;
  /**
   * Alergénios declarados pela casa, por exemplo ["glúten", "ovo"].
   * Vazio = a casa ainda não publicou a informação deste prato.
   */
  allergens: Text[];
};

export type MenuCategory = {
  id: string;
  label: Text;
  kicker: Text;
  blurb: Text;
  items: Dish[];
};

export type Ocean = {
  wide: ImageAsset;
  mid: ImageAsset;
  /** Palavras da frase gigante — uma por palavra. */
  line: Text[];
  sub: Text;
};

export type ExperiencePanel = {
  id: string;
  label: Text;
  idx: string;
  image: ImageAsset;
  text: Text;
  meta: Text;
};

export type GalleryItem = {
  id: string;
  image: ImageAsset;
  cap: Text;
  loc: Text;
};

export type InstagramItem = {
  id: string;
  image: ImageAsset;
  cap: Text;
  likes: string;
  /** Classes Tailwind do mosaico (ex.: "sm:col-span-2 sm:row-span-2"). */
  span: string;
  /** Liga à publicação; sem valor abre o perfil. */
  url?: string;
  /** Foto ou vídeo — só muda o selo da peça. */
  kind?: "foto" | "reel";
};

/** Texto que a casa pode traduzir: simples (igual em todas as línguas) ou por língua. */
import type { Text } from "../i18n/types";

export type { Text };

/** Dias da semana: o `schema` é o nome que o Google espera (schema.org). */
export const WEEK_DAYS = [
  { id: "mon", label: "Segunda", short: "Seg", schema: "Monday" },
  { id: "tue", label: "Terça", short: "Ter", schema: "Tuesday" },
  { id: "wed", label: "Quarta", short: "Qua", schema: "Wednesday" },
  { id: "thu", label: "Quinta", short: "Qui", schema: "Thursday" },
  { id: "fri", label: "Sexta", short: "Sex", schema: "Friday" },
  { id: "sat", label: "Sábado", short: "Sáb", schema: "Saturday" },
  { id: "sun", label: "Domingo", short: "Dom", schema: "Sunday" },
] as const;

export type DayId = (typeof WEEK_DAYS)[number]["id"];

/**
 * Uma linha do horário. Sem horas de abertura e fecho, a linha conta como
 * encerrada nesses dias — assim também se publica o dia de descanso.
 */
export type HoursEntry = {
  id: string;
  /** Rótulo que aparece no site, por exemplo "Terça a domingo". */
  label: Text;
  days: DayId[];
  /** Abertura, formato "HH:MM". */
  open: string;
  /** Fecho, formato "HH:MM". */
  close: string;
  /** Observação opcional, por exemplo "cozinha até às 22:00". */
  note?: Text;
};

/** Estados de um pedido de mesa. */
export const RESERVATION_STATUSES = ["novo", "confirmado", "recusado", "concluido"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

/**
 * Regras dos pedidos de mesa. Vivem nas definições do site (tal como o
 * horário), para a casa as poder mudar sem mexer no código.
 */
export type ReservationSettings = {
  /** Aceitar pedidos pelo site. Desligado, o painel mostra só os contactos. */
  enabled: boolean;
  /** Máximo de pessoas por pedido online; acima disso o site sugere telefone. */
  maxPeople: number;
  /** Intervalo entre as horas sugeridas, em minutos. */
  slotMinutes: number;
  /** Quantos minutos antes do fecho deixa de se aceitar mesas. */
  lastSeatingBeforeClose: number;
  /** Antecedência mínima, em horas. */
  minLeadHours: number;
  /** Quantos dias à frente se aceitam pedidos. */
  horizonDays: number;
  /** Frase mostrada ao cliente depois de enviar o pedido. */
  confirmation: Text;
};

/** Um pedido de mesa, tal como a base de dados o devolve. */
export type Reservation = {
  id: string;
  /** Referência curta que o cliente recebe, por exemplo "PV-4K7Q". */
  code: string;
  name: string;
  phone: string;
  email: string;
  /** Dia, formato "YYYY-MM-DD". */
  day: string;
  /** Hora, formato "HH:MM". */
  time: string;
  people: number;
  notes: string;
  status: ReservationStatus;
  /** ISO com o momento do pedido. */
  createdAt: string;
};

/** O que o cliente preenche no site. */
export type ReservationDraft = Pick<
  Reservation,
  "name" | "phone" | "email" | "day" | "time" | "people" | "notes"
>;

/**
 * Textos legais. São editáveis porque a entidade responsável, a morada e o
 * contacto para exercer direitos mudam com a casa — não com o site.
 */
export type LegalContent = {
  /** Última revisão, no formato "2026-09-28". */
  updatedAt: string;
  /** Entidade responsável pelo tratamento dos dados. */
  entity: Text;
  /** Morada para o exercício de direitos. */
  address: Text;
  /** Contacto de privacidade (email). */
  email: string;
  /** Contacto de privacidade (telefone, opcional). */
  phone: string;
  /** Corpo da política de privacidade: parágrafos separados por linha em branco. */
  privacy: Text;
  /** Corpo da política de cookies. */
  cookies: Text;
  /** Termos de utilização do site. */
  terms: Text;
};

export type EventItem = {
  id: string;
  n: string;
  title: Text;
  desc: Text;
  image: ImageAsset;
  tag: Text;
};

export type SiteContent = {
  contact: Contact;
  brand: Brand;
  nav: NavItem[];
  hero: Hero;
  intro: { images: IdentifiedImage[]; facts: IntroFact[] };
  ticker: Text[];
  hashtags: Text[];
  menu: MenuCategory[];
  ocean: Ocean;
  experience: ExperiencePanel[];
  gallery: GalleryItem[];
  instagram: InstagramItem[];
  /** Horário de funcionamento. Vazio = ainda por confirmar. */
  hours: HoursEntry[];
  events: EventItem[];
  eventPerks: Text[];
  /** Regras dos pedidos de mesa. */
  reservations: ReservationSettings;
  /** Privacidade, cookies e termos — página legal e aviso de consentimento. */
  legal: LegalContent;
};

/** URLs derivadas da morada — nunca são editadas à mão. */
export const mapsUrls = (query: string) => ({
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
  embed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
});
