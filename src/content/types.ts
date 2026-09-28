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
  /** Liga à publicação; sem valor abre o perfil. */
  url?: string;
  /** Foto ou vídeo — só muda o selo da peça. */
  kind?: "foto" | "reel";
};

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
  label: string;
  days: DayId[];
  /** Abertura, formato "HH:MM". */
  open: string;
  /** Fecho, formato "HH:MM". */
  close: string;
  /** Observação opcional, por exemplo "cozinha até às 22:00". */
  note?: string;
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
  confirmation: string;
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
  /** Horário de funcionamento. Vazio = ainda por confirmar. */
  hours: HoursEntry[];
  events: EventItem[];
  eventPerks: string[];
  /** Regras dos pedidos de mesa. */
  reservations: ReservationSettings;
  conceptNotice: string;
};

/** URLs derivadas da morada — nunca são editadas à mão. */
export const mapsUrls = (query: string) => ({
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
  embed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
});
