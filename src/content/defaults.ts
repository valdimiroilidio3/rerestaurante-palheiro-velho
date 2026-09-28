import type {
  Contact,
  EventItem,
  ExperiencePanel,
  GalleryItem,
  IdentifiedImage,
  HoursEntry,
  ReservationSettings,
  LegalContent,
  InstagramItem,
  MenuCategory as SiteMenuCategory,
  SiteContent,
  Text,
} from "./types";

/*
  PALHEIRO VELHO · camada factual do conceito privado

  Fontes consultadas em 17/09/2026:
  - Perfil Instagram: instagram.com/palheiro_velho_beach_bar
  - Página Facebook: facebook.com/palheirovelho
  - Página pública Eatbu associada à marca (telefone +351 220 124 331)
  - Junta de Freguesia de Esmoriz e CM Ovar
  - Registo empresarial público Racius

  Há divergências entre fontes públicas sobre horário e código postal. Por isso
  estes dados não são publicados como factos operacionais sem confirmação direta.
  Fotografias Pexels abaixo são TEMPORÁRIAS: não retratam o negócio.
*/

/* ——————————————————————————————————————————————————————————————
   Imagens

   As fotografias são servidas pelo CDN da Pexels, que converte para
   AVIF/WebP e comprime no momento do pedido. Cada imagem é pedida no
   tamanho em que realmente é mostrada — via `srcset` + `sizes` — e
   nunca maior. É aqui que se ganha (ou se perde) o carregamento.
   —————————————————————————————————————————————————————————————— */

/** Qualidade de referência: o grão do tema disfarça a compressão. */
const QUALITY = 72;

/** Degraus do `srcset`, em fração da largura de referência. */
const STEPS = [0.5, 0.75, 1, 1.5, 2] as const;

/** Arredonda a larguras de 50 em 50 px: menos variantes, mais acertos na cache do CDN. */
const step = (n: number) => Math.max(50, Math.round(n / 50) * 50);

/** Fotografia editorial temporária. Substituir por imagem autorizada da marca. */
export const px = (id: number, w = 900, h?: number, ext: "jpeg" | "png" = "jpeg", q = QUALITY) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}` +
  `?auto=format%2Ccompress&cs=tinysrgb&fit=crop&q=${q}&w=${w}${h ? `&h=${h}` : ""}`;

/** Cinco larguras da mesma fotografia, para o browser escolher a certa. */
export function pxSrcSet(
  id: number,
  w: number,
  h?: number,
  ext: "jpeg" | "png" = "jpeg",
  q = QUALITY,
): string {
  const ratio = h && w ? h / w : 0;
  return STEPS.map((s) => {
    const cw = step(w * s);
    const ch = ratio ? step(cw * ratio) : undefined;
    return `${px(id, cw, ch, ext, q)} ${cw}w`;
  }).join(", ");
}

/** Uma fotografia completa: fonte, srcset, dimensões e texto alternativo. */
export type Photo = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * Constrói um objeto `Photo` pronto a espalhar no componente `<Img>`.
 * O texto alternativo pode ser omitido quando é definido no componente.
 */
export const photo = (id: number, w: number, h: number, alt = "", ext: "jpeg" | "png" = "jpeg"): Photo => ({
  src: px(id, w, h, ext),
  srcSet: pxSrcSet(id, w, h, ext),
  width: w,
  height: h,
  alt,
});

export const SOURCES = {
  instagram: "https://www.instagram.com/palheiro_velho_beach_bar/",
  facebook: "https://www.facebook.com/palheirovelho/",
  googleMaps:
    "https://www.google.com/maps/search/?api=1&query=Palheiro+Velho%2C+Travessa+da+Barrinha%2C+Esmoriz%2C+Portugal",
  publicSite: "https://palheirovelho.eatbu.com/?lang=pt",
  municipal: "https://www.cm-ovar.pt/pt/menu/2960/esmoriz.aspx",
  parish: "https://jf-esmoriz.pt/onde-comer/",
  directory: "https://www.racius.com/palheiro-velho-lda/",
};

export const CONTACT = {
  name: "Palheiro Velho",
  kind: "Bar de praia",
  address: "Travessa da Barrinha",
  locality: "Esmoriz, Ovar",
  region: "Aveiro, Portugal",
  phoneLabel: "+351 220 124 331",
  phone: "+351220124331",
  email: "palheirovelho@gmail.com",
  instagram: "palheiro_velho_beach_bar",
  instagramUrl: SOURCES.instagram,
  facebookUrl: SOURCES.facebook,
  mapsQuery: "Palheiro Velho, Travessa da Barrinha, Esmoriz, Portugal",
  note: "Bar de praia em Esmoriz, com vista para o mar e espaço exterior.",
};

/**
 * Cozinha tal como a casa é classificada nos diretórios públicos
 * (Restaurant Guru: sul-americana). Serve para os dados estruturados.
 */
export const CUISINE = "South American";

/** Logótipo público apresentado no diretório da Junta de Freguesia de Esmoriz. Uso limitado a este conceito privado. */
export const BRAND = {
  publicLogo: "https://jf-esmoriz.pt/wp-content/uploads/2021/12/Palheiro-velho.png",
  publicLogoSource: SOURCES.parish,
  assetStatus: "Logótipo público de referência",
  photoStatus:
    "Fotografias de referência temporárias — substituir por material autorizado da marca antes de publicar.",
};

export const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  CONTACT.mapsQuery,
)}`;
export const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapsQuery)}&output=embed`;

export const NAV = [
  { id: "menu", label: "Carta" },
  { id: "experiencia", label: "Espaço" },
  { id: "galeria", label: "Galeria" },
  { id: "eventos", label: "Momentos" },
  { id: "contacto", label: "Contacto" },
];

const HERO_VIDEO = 9259112;

/** Fotograma do vídeo, pedido já à largura certa. */
const heroFrame = (w: number) =>
  `https://images.pexels.com/videos/${HERO_VIDEO}/beach-cloud-dawn-dusk-${HERO_VIDEO}.jpeg` +
  `?auto=format%2Ccompress&cs=tinysrgb&w=${w}`;

export const HERO = {
  videoSources: [
    { src: `https://videos.pexels.com/video-files/${HERO_VIDEO}/${HERO_VIDEO}-hd_1920_1080_25fps.mp4` },
    { src: `https://videos.pexels.com/video-files/${HERO_VIDEO}/${HERO_VIDEO}-hd_1280_720_25fps.mp4` },
  ],
  /** Fotograma de abertura: LCP da página, por isso é pré-carregado. */
  poster: heroFrame(1280),
  posterSrcSet: [640, 960, 1280, 1440, 1920].map((w) => `${heroFrame(w)} ${w}w`).join(", "),
  posterWidth: 1920,
  posterHeight: 1080,
  /** Fundo do menu móvel (só é pedido quando o menu abre). */
  overlay: heroFrame(720),
  tagline: "Onde o mar encontra a mesa.",
};

export const INTRO_IMAGES = [
  photo(8528125, 1000, 1250, "Esplanada junto à praia"),
  photo(14808642, 900, 1200, "Praia e sombra de palha"),
  photo(9119697, 800, 800, "Construções de palha na praia"),
];

/** Serviços identificados na página pública associada à marca. */
export const INTRO_FACTS = [
  { k: "01", t: "Vista para o mar", d: "Indicada na página pública associada ao Palheiro Velho." },
  { k: "02", t: "Mesas exteriores", d: "Serviço indicado na página pública associada à marca." },
  { k: "03", t: "Música ao vivo", d: "Divulgada no site público e nas redes sociais da casa." },
  { k: "04", t: "Brunch", d: "Mencionado no site público associado ao espaço." },
  { k: "05", t: "Estacionamento", d: "Disponibilidade indicada na página pública associada ao espaço." },
];

export const TICKER = [
  "Bar de praia",
  "Vista para o mar",
  "Mesas exteriores",
  "Música ao vivo",
  "Brunch",
  "Estacionamento",
  "Esmoriz · Portugal",
];

/*
  ESTRUTURA DE CARTA DEMONSTRATIVA
  As categorias foram pedidas para o protótipo mas não representam a carta real.
  Não há preços nem nomes de pratos publicados nesta interface.
*/
type SeedDish = {
  name: Text;
  desc: Text;
  price: string;
  img: number;
  ext?: "jpeg" | "png";
  flag?: Text;
};
type SeedMenuCategory = {
  id: string;
  label: Text;
  kicker: Text;
  blurb: Text;
  items: SeedDish[];
};

/*
  CARTA
  Os pratos são os que as fontes públicas da casa confirmam: empanadas, arepa,
  ceviche, tacos, empadas, sandes (incluindo o lobster roll), hambúrguer,
  rolinhos, mojitos e caipirinhas. As descrições dizem o que o prato é —
  não inventam receitas, preços nem alergénios: isso é a casa que publica
  no painel (e enquanto não publicar, o site não mostra nada).
*/
export const MENU: SeedMenuCategory[] = [
  {
    id: "partilhar",
    label: { pt: "Para partilhar", en: "To share" },
    kicker: { pt: "sul-americano", en: "South American" },
    blurb: {
      pt: "Chega ao meio da mesa e desaparece.",
      en: "It lands in the middle of the table and disappears.",
    },
    items: [
      {
        name: { pt: "Empanadas", en: "Empanadas" },
        desc: {
          pt: "Massa recheada, frita ou de forno. Feitas para partir ao meio.",
          en: "Filled pastry, fried or baked. Meant to be split.",
        },
        price: "—",
        img: 13677427,
      },
      {
        name: { pt: "Arepa", en: "Arepa" },
        desc: {
          pt: "Pão de milho grelhado, aberto e recheado.",
          en: "Grilled corn bread, split and filled.",
        },
        price: "—",
        img: 36183164,
      },
      {
        name: { pt: "Ceviche", en: "Ceviche" },
        desc: {
          pt: "Peixe cru curtido em citrinos.",
          en: "Raw fish cured in citrus.",
        },
        price: "—",
        img: 28559509,
      },
      {
        name: { pt: "Rolinhos", en: "Spring rolls" },
        desc: {
          pt: "Rolinhos fritos: estaladiços por fora, quentes por dentro.",
          en: "Fried rolls: crisp outside, hot inside.",
        },
        price: "—",
        img: 33991134,
      },
    ],
  },
  {
    id: "maos",
    label: { pt: "Com as mãos", en: "By hand" },
    kicker: { pt: "tacos e sandes", en: "tacos and sandwiches" },
    blurb: {
      pt: "Sem talheres, com o mar à frente.",
      en: "No cutlery, the sea in front of you.",
    },
    items: [
      {
        name: { pt: "Tacos", en: "Tacos" },
        desc: {
          pt: "Tortilha de milho, recheio e mãos a acompanhar.",
          en: "Corn tortilla, filling, and your hands.",
        },
        price: "—",
        img: 19897851,
      },
      {
        name: { pt: "Lobster roll", en: "Lobster roll" },
        desc: {
          pt: "Sande de lagosta, servida fria.",
          en: "Lobster sandwich, served cold.",
        },
        price: "—",
        img: 33144661,
      },
      {
        name: { pt: "Hambúrguer", en: "Burger" },
        desc: {
          pt: "Hambúrguer de carne, com acompanhamento.",
          en: "Beef burger, with a side.",
        },
        price: "—",
        img: 19260799,
      },
      {
        name: { pt: "Empadas", en: "Pies" },
        desc: {
          pt: "Empadas de forno, massa estaladiça.",
          en: "Baked pies in crisp pastry.",
        },
        price: "—",
        img: 16845663,
      },
    ],
  },
  {
    id: "cocktails",
    label: { pt: "Cocktails", en: "Cocktails" },
    kicker: { pt: "mojitos e caipirinhas", en: "mojitos and caipirinhas" },
    blurb: {
      pt: "O motivo pelo qual se fica mais uma hora.",
      en: "The reason you stay another hour.",
    },
    items: [
      {
        name: { pt: "Mojito", en: "Mojito" },
        desc: {
          pt: "Rum branco, hortelã, lima e açúcar.",
          en: "White rum, mint, lime and sugar.",
        },
        price: "—",
        img: 2227773,
      },
      {
        name: { pt: "Caipirinha", en: "Caipirinha" },
        desc: {
          pt: "Cachaça, lima e açúcar.",
          en: "Cachaça, lime and sugar.",
        },
        price: "—",
        img: 28962386,
      },
    ],
  },
  {
    id: "bebidas",
    label: { pt: "Bebidas", en: "Drinks" },
    kicker: { pt: "todo o dia", en: "all day" },
    blurb: {
      pt: "Do primeiro café ao último copo.",
      en: "From the first coffee to the last glass.",
    },
    items: [
      {
        name: { pt: "Cerveja", en: "Beer" },
        desc: {
          pt: "Cerveja bem fria, em copo ou garrafa.",
          en: "Ice-cold beer, by the glass or bottle.",
        },
        price: "—",
        img: 38895542,
      },
      {
        name: { pt: "Água, sumos e refrigerantes", en: "Water, juices and soft drinks" },
        desc: {
          pt: "O básico, sem cerimónia.",
          en: "The basics, no ceremony.",
        },
        price: "—",
        img: 28525158,
      },
    ],
  },
];

export const OCEAN = {
  wide: photo(16427691, 2000, 1000),
  mid: photo(16427691, 1200, 900),
  line: ["TAKE", "YOUR", "TIME."],
  sub: "Um intervalo visual neste conceito, inspirado na relação do espaço com o mar.",
};

/** Formato (retrato) dos painéis do espaço: partilhado por desktop e mobile. */
export const PANEL_PHOTO = { w: 1100, h: 1500 } as const;

/** Elementos do espaço e serviços publicados. Imagens são referências temporárias. */
export const EXPERIENCE = [
  {
    id: "view",
    label: "Vista",
    idx: "01",
    imgId: 5851469,
    text: "A página pública da marca indica vista para o mar.",
    meta: "serviço publicado",
  },
  {
    id: "outside",
    label: "Exterior",
    idx: "02",
    imgId: 33991146,
    text: "A marca indica mesas no espaço exterior.",
    meta: "serviço publicado",
  },
  {
    id: "music",
    label: "Música",
    idx: "03",
    imgId: 7502581,
    text: "Música ao vivo é mencionada no site público e na atividade recente do Facebook.",
    meta: "serviço publicado",
  },
  {
    id: "brunch",
    label: "Brunch",
    idx: "04",
    imgId: 3838633,
    text: "O brunch surge referido na página pública associada ao espaço.",
    meta: "serviço publicado",
  },
  {
    id: "parking",
    label: "Chegar",
    idx: "05",
    imgId: 7938813,
    text: "O site público indica estacionamento para clientes.",
    meta: "informação a confirmar",
  },
];

export const GALLERY = [
  { id: 14661239, cap: "Luz de fim de tarde", loc: "Esmoriz" },
  { id: 10757734, cap: "Sombra de palha", loc: "Esplanada" },
  { id: 36055325, cap: "Mesa de praia", loc: "Areal" },
  { id: 12645171, cap: "Mar aberto", loc: "Barrinha" },
  { id: 10066114, cap: "Balcão ao ar livre", loc: "Esplanada" },
  { id: 36231216, cap: "Areal ao amanhecer", loc: "Esmoriz" },
  { id: 12941652, cap: "Noite dentro", loc: "Balcão" },
  { id: 9685877, cap: "Maré baixa", loc: "Barrinha" },
];

export const IG_SPAN = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "",
  "sm:row-span-2",
  "",
  "sm:col-span-2",
  "",
  "",
  "sm:row-span-2",
  "",
  "sm:col-span-2",
  "",
];

export const INSTAGRAM_IDS = [
  3320497, 2531184, 38942913, 17779122, 6073595, 9685877, 14808642, 28843593, 10099363, 5840411, 7938813,
  6529722,
];

/** Demonstração do selo de vídeo: duas peças marcadas como reel (editável no painel). */
const IG_REELS = new Set([2, 7]);

/* Legendas editoriais; os gostos ficam vazios — não se inventam números. */
const IG_CAPS = [
  "Fim de tarde",
  "Mojito",
  "Ceviche",
  "Esplanada",
  "Arepa",
  "Música ao vivo",
  "Pôr do sol",
  "Balcão",
  "Tacos",
  "Maré baixa",
  "Amigos",
  "Noite",
];

const INSTAGRAM = INSTAGRAM_IDS.map((id, i) => ({
  id,
  cap: IG_CAPS[i % IG_CAPS.length],
  likes: "",
  span: IG_SPAN[i % IG_SPAN.length],
  url: "",
  kind: (IG_REELS.has(i) ? "reel" : "foto") as "foto" | "reel",
}));

export const EVENTS = [
  {
    id: "live",
    n: "01",
    title: "Música ao vivo",
    desc: "Serviço referido na página pública associada à casa e em atividade divulgada nas redes sociais.",
    img: 7502581,
    tag: "publicado",
  },
  {
    id: "cultural",
    n: "02",
    title: "Eventos culturais",
    desc: "A organização de eventos culturais consta da atividade empresarial publicada em diretório público.",
    img: 1649693,
    tag: "diretório público",
  },
  {
    id: "sports",
    n: "03",
    title: "Eventos desportivos",
    desc: "A organização de eventos desportivos consta da atividade empresarial publicada em diretório público.",
    img: 7938813,
    tag: "diretório público",
  },
  {
    id: "private",
    n: "04",
    title: "Pedido personalizado",
    desc: "Contacte a casa para confirmar qualquer formato, disponibilidade e condições antes de planear.",
    img: 12645180,
    tag: "a confirmar",
  },
];

export const EVENT_PERKS = [
  "Música ao vivo indicada publicamente",
  "Eventos culturais em registo empresarial",
  "Eventos desportivos em registo empresarial",
  "Disponibilidade a confirmar diretamente",
];

/**
 * Horário de referência, como todo o resto do conceito: **a confirmar com a
 * casa** (as fontes públicas divergem). É editável no separador Horário.
 */
export const HOURS: HoursEntry[] = [
  {
    id: "verao",
    label: "Terça a domingo",
    days: ["tue", "wed", "thu", "fri", "sat", "sun"],
    open: "12:30",
    close: "23:00",
    note: "Horário de referência, a confirmar com a casa antes de publicar.",
  },
  {
    id: "descanso",
    label: "Segunda",
    days: ["mon"],
    open: "",
    close: "",
    note: "Encerrado (a confirmar).",
  },
];

/**
 * Textos legais de referência.
 *
 * Estão escritos de forma neutra e **têm de ser revistos pela casa** (e, se
 * possível, pelo seu contabilista ou advogado) antes de publicar: quem é a
 * entidade responsável, que dados se tratam e durante quanto tempo são
 * variáveis que só a casa conhece.
 */
export const LEGAL: LegalContent = {
  updatedAt: "2026-09-28",
  entity: "Palheiro Velho — a confirmar com a casa (nome, NIF e sede)",
  address: "Travessa da Barrinha, Esmoriz, Ovar, Portugal",
  email: "palheirovelho@gmail.com",
  phone: "+351 220 124 331",
  privacy: `Tratamos apenas os dados que nos entrega quando faz um pedido de mesa pelo site: nome, telefone, email (se o indicar), dia, hora, número de pessoas e a nota que escrever. Nada mais.

Usamos esses dados para uma única coisa: gerir o seu pedido e contactá-lo para confirmar ou recusar a mesa. Não os usamos para publicidade, não os vendemos e não os cedemos a terceiros.

Guardamos os pedidos enquanto forem úteis à gestão da casa e, no máximo, durante um ano. Os pedidos recusados ou concluídos deixam de estar acessíveis no painel passado esse prazo.

Pode pedir, a qualquer momento, o acesso, a correção ou o apagamento dos seus dados, apresentar reclamação à CNPD ou retirar o consentimento. Basta escrever para o contacto abaixo.`,
  cookies: `Este site usa o mínimo de cookies possível.

Cookies necessários: guardam a sua escolha sobre cookies e a sessão do painel da casa. Não podem ser desligados — sem eles o aviso aparecia sempre.

Cookies de medição: só existem se os aceitar. Servem para perceber quantas pessoas visitam o site e que páginas veem, de forma agregada.

Pode mudar de ideias quando quiser, no rodapé, em “preferências de cookies”.`,
  terms: `Este site é informativo: mostra a carta, o horário e os contactos da casa, e permite pedir uma mesa.

Um pedido de mesa não é uma reserva confirmada. A confirmação é feita pela casa, por telefone, em horário de funcionamento.

Os conteúdos — carta, preços, horários e fotografias — podem mudar sem aviso prévio. Em caso de diferença, vale sempre o que a casa comunicar diretamente.`,
};

/* ——————————————————————————————————————————————————————————————
   Conteúdo de origem

   É o que o site mostra quando a base de dados ainda não está
   configurada (e o que a migração `supabase/seed.sql` carrega).
   —————————————————————————————————————————————————————————————— */

export const HASHTAGS = [
  "@palheiro_velho_beach_bar",
  "facebook.com/palheirovelho",
  "Esmoriz",
  "Bar de praia",
  "Vista para o mar",
  "Música ao vivo",
  "Brunch",
];

const contact: Contact = { ...CONTACT };

/**
 * Regras dos pedidos de mesa (de referência, a confirmar com a casa).
 * O horário é que manda: as horas sugeridas saem sempre do horário publicado.
 */
export const RESERVATIONS: ReservationSettings = {
  enabled: true,
  maxPeople: 12,
  slotMinutes: 30,
  lastSeatingBeforeClose: 90,
  minLeadHours: 2,
  horizonDays: 60,
  confirmation:
    "Recebemos o seu pedido. A casa confirma por telefone em horário de funcionamento — guarde a referência acima.",
};

export const defaultContent: SiteContent = {
  contact,
  brand: { ...BRAND },
  nav: NAV.map((n) => ({ ...n })),

  hero: {
    videoSources: HERO.videoSources.map((v) => v.src),
    poster: HERO.poster,
    posterImage: { src: HERO.poster, width: HERO.posterWidth, height: HERO.posterHeight },
    posterSrcSet: HERO.posterSrcSet,
    posterWidth: HERO.posterWidth,
    posterHeight: HERO.posterHeight,
    overlay: HERO.overlay,
    tagline: HERO.tagline,
  },

  intro: {
    images: INTRO_IMAGES.map((img, i): IdentifiedImage => ({ ...img, id: `intro-${i}` })),
    facts: INTRO_FACTS.map((f) => ({ id: f.k, ...f })),
  },

  ticker: [...TICKER],
  hashtags: [...HASHTAGS],

  menu: MENU.map((c): SiteMenuCategory => ({
    id: c.id,
    label: c.label,
    kicker: c.kicker,
    blurb: c.blurb,
    items: c.items.map((d, i) => ({
      id: `${c.id}-${i + 1}`,
      name: d.name,
      desc: d.desc,
      price: d.price,
      image: photo(d.img, 240, 240, typeof d.name === "string" ? d.name : d.name.pt, d.ext),
      flag: d.flag,
      // os alergénios são declarados pela casa no painel: inventá-los aqui
      // seria publicar informação de saúde falsa
      allergens: [],
    })),
  })),

  ocean: { wide: OCEAN.wide, mid: OCEAN.mid, line: [...OCEAN.line], sub: OCEAN.sub },

  experience: EXPERIENCE.map((x): ExperiencePanel => ({
    id: x.id,
    label: x.label,
    idx: x.idx,
    image: photo(x.imgId, PANEL_PHOTO.w, PANEL_PHOTO.h, x.label),
    text: x.text,
    meta: x.meta,
  })),

  gallery: GALLERY.map((g): GalleryItem => ({
    id: String(g.id),
    image: photo(g.id, 1100, 850, `${g.cap} — ${g.loc}`),
    cap: g.cap,
    loc: g.loc,
  })),

  hours: HOURS.map((h): HoursEntry => ({ ...h, days: [...h.days] })),

  instagram: INSTAGRAM.map((p): InstagramItem => ({
    id: `ig-${p.id}`,
    image: photo(p.id, 600, 600, p.cap),
    cap: p.cap,
    likes: p.likes,
    span: p.span,
    url: p.url,
    kind: p.kind,
  })),

  events: EVENTS.map((e): EventItem => ({
    id: e.id,
    n: e.n,
    title: e.title,
    desc: e.desc,
    image: photo(e.img, 400, 533, e.title),
    tag: e.tag,
  })),

  eventPerks: [...EVENT_PERKS],
  reservations: { ...RESERVATIONS },
  legal: { ...LEGAL },
};
