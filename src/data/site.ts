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

/** Fotografia editorial temporária com tamanho otimizado. Substituir por imagem autorizada da marca. */
export const px = (id: number, w = 900, h?: number, ext: "jpeg" | "png" = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&w=${w}${
    h ? `&h=${h}` : ""
  }`;

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

export const HERO = {
  videoSources: [
    { src: "https://videos.pexels.com/video-files/9259112/9259112-hd_1920_1080_25fps.mp4" },
    { src: "https://videos.pexels.com/video-files/9259112/9259112-hd_1280_720_25fps.mp4" },
  ],
  poster:
    "https://images.pexels.com/videos/9259112/beach-cloud-dawn-dusk-9259112.jpeg?auto=compress&cs=tinysrgb&w=1600",
  tagline: "Onde o mar encontra a mesa.",
};

export const INTRO_IMAGES = [
  { src: px(8528125, 1000, 1250), alt: "Fotografia de referência temporária: esplanada junto à praia" },
  { src: px(14808642, 1000, 700), alt: "Fotografia de referência temporária: praia e sombra de palha" },
  { src: px(9119697, 900, 1150), alt: "Fotografia de referência temporária: construções de palha na praia" },
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
export type Dish = {
  name: string;
  desc: string;
  price: string;
  img: number;
  ext?: "jpeg" | "png";
  flag?: string;
};
export type MenuCategory = {
  id: string;
  label: string;
  kicker: string;
  blurb: string;
  items: Dish[];
};

const placeholder = (img: number): Dish => ({
  name: "Item a confirmar",
  desc: "Substituir por nome, descrição, alergénios e preço validados pela equipa do Palheiro Velho.",
  price: "—",
  img,
  flag: "placeholder",
});

export const MENU: MenuCategory[] = [
  {
    id: "entradas",
    label: "Entradas",
    kicker: "estrutura demonstrativa",
    blurb: "Categoria a validar pela marca.",
    items: [placeholder(13677427), placeholder(36183164), placeholder(28559509)],
  },
  {
    id: "pratos",
    label: "Pratos",
    kicker: "estrutura demonstrativa",
    blurb: "Categoria a validar pela marca.",
    items: [placeholder(33991134), placeholder(19897851), placeholder(33144661)],
  },
  {
    id: "snacks",
    label: "Snacks",
    kicker: "estrutura demonstrativa",
    blurb: "Categoria a validar pela marca.",
    items: [placeholder(19260799), placeholder(16845663), placeholder(29481861)],
  },
  {
    id: "brunch",
    label: "Brunch",
    kicker: "serviço mencionado publicamente",
    blurb: "Itens e horários a validar pela marca.",
    items: [placeholder(2227773), placeholder(28962386), placeholder(15043917)],
  },
  {
    id: "bebidas",
    label: "Bebidas",
    kicker: "estrutura demonstrativa",
    blurb: "Categoria a validar pela marca.",
    items: [placeholder(38895542), placeholder(28525158), placeholder(3937673)],
  },
  {
    id: "cocktails",
    label: "Cocktails",
    kicker: "estrutura demonstrativa",
    blurb: "Categoria a validar pela marca.",
    items: [placeholder(3320497), placeholder(2531184), placeholder(31460176)],
  },
  {
    id: "sobremesas",
    label: "Sobremesas",
    kicker: "estrutura demonstrativa",
    blurb: "Categoria a validar pela marca.",
    items: [placeholder(17779122), placeholder(20352400), placeholder(19582734)],
  },
];

export const OCEAN = {
  wide: px(16427691, 2000, 1000),
  mid: px(16427691, 1200, 900),
  line: ["TAKE", "YOUR", "TIME."],
  sub: "Um intervalo visual neste conceito, inspirado na relação do espaço com o mar.",
};

/** Elementos do espaço e serviços publicados. Imagens são referências temporárias. */
export const EXPERIENCE = [
  {
    id: "view",
    label: "Vista",
    idx: "01",
    img: px(5851469, 1100, 1500),
    text: "A página pública da marca indica vista para o mar.",
    meta: "serviço publicado",
  },
  {
    id: "outside",
    label: "Exterior",
    idx: "02",
    img: px(33991146, 1100, 1500),
    text: "A marca indica mesas no espaço exterior.",
    meta: "serviço publicado",
  },
  {
    id: "music",
    label: "Música",
    idx: "03",
    img: px(7502581, 1100, 1500),
    text: "Música ao vivo é mencionada no site público e na atividade recente do Facebook.",
    meta: "serviço publicado",
  },
  {
    id: "brunch",
    label: "Brunch",
    idx: "04",
    img: px(3838633, 1100, 1500),
    text: "O brunch surge referido na página pública associada ao espaço.",
    meta: "serviço publicado",
  },
  {
    id: "parking",
    label: "Chegar",
    idx: "05",
    img: px(7938813, 1100, 1500),
    text: "O site público indica estacionamento para clientes.",
    meta: "informação a confirmar",
  },
];

export const GALLERY = [
  { id: 14661239, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
  { id: 10757734, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
  { id: 36055325, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
  { id: 12645171, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
  { id: 10066114, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
  { id: 36231216, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
  { id: 12941652, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
  { id: 9685877, cap: "Referência de atmosfera", loc: "substituir por fotografia autorizada" },
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

export const INSTAGRAM = [
  3320497, 2531184, 38942913, 17779122, 6073595, 9685877, 14808642, 28843593, 10099363, 5840411, 7938813,
  6529722,
].map((id, i) => ({
  id,
  cap: "Imagem editorial temporária",
  likes: "conceito privado",
  span: IG_SPAN[i % IG_SPAN.length],
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

export const CONCEPT_NOTICE =
  "Conceito privado de design. Dados públicos conferidos em 17/09/2026; validar com a marca antes de qualquer publicação ou campanha.";
