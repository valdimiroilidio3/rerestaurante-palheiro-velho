/**
 * Textos da interface — os que não são conteúdo da casa.
 *
 * Estão todos aqui, nas duas línguas, para que traduzir o site não obrigue a
 * procurar frases espalhadas pelos componentes. O tipo garante o resto: se
 * faltar uma chave num dos idiomas, o TypeScript reclama.
 */
import type { Locale } from "./types";

/** Chaves e frases em português. O inglês tem de ter exatamente as mesmas. */
const pt = {
  /* idioma */
  "language.label": "Idioma",
  "language.pt": "Português",
  "language.en": "English",
  "language.switchTo": "Mudar para inglês",

  /* navegação */
  "nav.contact": "Contactar",
  "nav.instagram": "Instagram",
  "nav.directions": "Como chegar →",
  "nav.reserve": "Contactar a casa",
  "nav.call": "Ligar",
  "nav.home": "Início",
  "nav.close": "Fechar menu",
  "nav.place": "Esmoriz · Portugal",

  /* abertura */
  "hero.place": "Esmoriz · Aveiro · Portugal",
  "hero.intro": "Uma presença digital para um bar de praia com vista para o mar e espaço exterior.",
  "hero.structure": "Ver estrutura de carta",
  "hero.directions": "Como chegar",
  "hero.instagram": "Instagram oficial →",
  "hero.scroll": "Scroll",
  "hero.sources": "perfis públicos identificados",

  /* introdução */
  "intro.confirmed": "Informação confirmada",
  "intro.body":
    "O Palheiro Velho é identificado publicamente como um bar de praia em Esmoriz, na Travessa da Barrinha. As páginas públicas associadas ao espaço referem vista para o mar e mesas exteriores.",
  "intro.note":
    "A informação deste site foi recolhida dos canais públicos da casa. Carta, horário, imagens e condições devem ser confirmados diretamente antes da visita.",

  /* oceano */
  "ocean.title": "Oceano Atlântico · maré a baixar",
  "ocean.continue": "continuar a ver a casa",

  /* espaço */
  "experience.eyebrow": "A experiência",
  "experience.word1": "Elementos",
  "experience.word2": "publicados.",
  "experience.confirm": "confirmar com a casa →",
  "experience.note":
    "Informação recolhida nos canais públicos da marca. As fotografias desta secção são de referência e não representam o espaço.",
  "experience.services":
    "Os serviços publicados incluem vista para o mar, mesas exteriores, música ao vivo, brunch e estacionamento. Horários, carta e condições devem ser confirmados diretamente com a casa.",
  "experience.contact": "Contactar a casa",
  "experience.subject": "Contacto sobre: {label}",

  /* galeria */
  "gallery.eyebrow": "Atmosferas",
  "gallery.note": "A luz, a sombra da palha e o mar a dois passos: o espaço visto de perto.",
  "gallery.swipe": "swipe",

  /* instagram */
  "instagram.source": "perfil público oficial identificado na pesquisa",
  "instagram.note":
    "As publicações oficiais abrem no perfil da marca. Escolha uma peça para a ver em grande.",
  "instagram.follow": "Seguir no Instagram",
  "instagram.reel": "reel",
  "instagram.view": "ver",

  /* momentos */
  "events.eyebrow": "Momentos",
  "events.note":
    "O site público da marca refere música ao vivo e eventos culturais e desportivos. Não apresentamos datas, capacidades nem condições sem confirmação da casa.",
  "events.plan": "planear",
  "events.talk": "Fale com a casa",
  "events.direct": "contacto direto",
  "events.send": "enviar mensagem",

  /* carta */
  "menu.eyebrow": "A carta",
  "menu.title1": "Comer junto,",
  "menu.title2": "sem pressa.",
  "menu.intro":
    "Uma carta curta de cozinha sul-americana: para partilhar, para comer com as mãos e para beber devagar.",
  "menu.items": "itens",
  "menu.priceRange": "de {min} a {max}",
  "rail.label": "Secções da página",
  "menu.confirm": "confirmar com a casa",
  "menu.contains": "contém",
  "menu.avoid": "Evitar",
  "menu.all": "todos",
  "menu.without": "sem {item}",
  "menu.empty":
    "Nenhum prato desta carta está publicado sem {item}. Para dúvidas sobre alergénios, fale com a casa antes de escolher.",
  "menu.contact": "Contactar a casa",
  "menu.demo":
    "Esta é uma estrutura de demonstração. Use os canais oficiais abaixo para confirmar a carta e a disponibilidade atual.",

  /* contacto e localização */
  "location.eyebrow": "Contacto & localização",
  "location.address": "Morada publicada",
  "location.channels": "Canais publicados",
  "location.hours": "Horário",
  "location.hoursEmpty":
    "Horário ainda por publicar. Confirme sempre por telefone ou nos perfis oficiais antes da visita.",
  "location.call": "Ligar",
  "location.directions": "Como chegar",
  "location.instagram": "Instagram",
  "location.email": "Enviar email",
  "location.sources": "Fontes consultadas",
  "location.mapNote": "Esquema ilustrativo · localização via Google Maps",
  "location.openMaps": "abrir no Google Maps →",
  "location.source": "fonte",
  "location.title1": "Estamos em",
  "location.title2": "Esmoriz.",
  "location.mapLive": "mapa interativo",
  "location.mapStatic": "mapa ilustrativo",
  "location.mapTitle": "Mapa do Palheiro Velho",
  "location.logoAlt": "Logótipo público do Palheiro Velho",
  "location.srcSite": "Site público",
  "location.srcParish": "Junta de Freguesia",
  "location.srcRegistry": "Registo público",
  "location.logoSource": "fonte: Junta de Freguesia de Esmoriz",
  "notfound.title": "Esta página não existe.",
  "notfound.body":
    "O endereço pode estar errado ou a página ter mudado de sítio. O site continua aqui: volte à entrada, veja a carta ou ligue para a casa.",
  "notfound.home": "voltar ao site",
  "notfound.menu": "ver a carta",
  "status.openUntil": "Aberto até às {time}",
  "status.closingIn": "Encerra em {minutes} min",
  "status.opensIn": "Abre em {minutes} min",
  "status.opensToday": "Abre hoje às {time}",
  "status.opensDay": "Abre {day} às {time}",
  "status.closedToday": "Hoje encerrado",
  "status.unknown": "Horário a confirmar",
  "day.mon": "segunda",
  "day.tue": "terça",
  "day.wed": "quarta",
  "day.thu": "quinta",
  "day.fri": "sexta",
  "day.sat": "sábado",
  "day.sun": "domingo",
  "reserve.today": "hoje",
  "reserve.tomorrow": "amanhã",
  "reserve.todayHours": "Hoje: {ranges}",
  "reserve.todayClosed": "Hoje não abrimos — escolha outro dia.",
  "hours.closed": "encerrado",

  /* rodapé */
  "footer.navigate": "Navegar",
  "footer.house": "A casa",
  "footer.channels": "Canais públicos",
  "footer.instagram": "Instagram",
  "footer.facebook": "Facebook",
  "footer.phone": "Telefone",
  "footer.location": "Localização",
  "footer.legal": "Legal",
  "footer.privacy": "Privacidade",
  "footer.cookiesLink": "Cookies",
  "footer.terms": "Termos",
  "footer.cookies": "Preferências de cookies",
  "footer.top": "voltar ao topo",
  "footer.source": "consulta a fonte",
  "footer.disclaimer":
    "Contacto e serviços recolhidos em fontes públicas; confirmar sempre antes de visitar.",

  /* pedido de mesa */
  "reserve.eyebrow": "Pedido de mesa",
  "reserve.intro":
    "Deixe o pedido e a casa confirma por telefone em horário de funcionamento. Para grupos grandes ou no próprio dia, é mais rápido ligar.",
  "reserve.subject": "Motivo de contacto",
  "reserve.name": "Nome",
  "reserve.namePlaceholder": "Nome para a reserva",
  "reserve.phone": "Telefone",
  "reserve.phonePlaceholder": "912 345 678",
  "reserve.email": "Email (opcional)",
  "reserve.emailPlaceholder": "para receber a confirmação",
  "reserve.day": "Dia",
  "reserve.time": "Hora",
  "reserve.chooseTime": "escolher",
  "reserve.noTime": "sem horas",
  "reserve.people": "Pessoas",
  "reserve.notes": "Nota (opcional)",
  "reserve.notesPlaceholder": "Alergias, cadeira de bebé, aniversário…",
  "reserve.submit": "Pedir mesa",
  "reserve.sending": "A enviar…",
  "reserve.disclaimer":
    "O pedido é enviado para a casa e a confirmação chega por telefone — não se paga nada aqui nem ficam dados de pagamento.",
  "reserve.onlyContacts":
    "Para carta, horário, eventos ou disponibilidade, use um dos canais publicados abaixo.",
  "reserve.notLinked": " Os pedidos de mesa por este site ainda não estão ligados à casa.",
  "reserve.emailFallback": "Prefere escrever? Envie um email para",
  "reserve.emailDetails": "com o dia, a hora e o número de pessoas.",
  "reserve.company": "Empresa",
  "reserve.title": "Pedir mesa no Palheiro Velho",
  "common.close": "Fechar",
  "common.skip": "Saltar para a carta",
  "reserve.registered": "Pedido registado",
  "reserve.dayLabel": "Dia",
  "reserve.timeLabel": "Hora",
  "reserve.peopleLabel": "Pessoas",
  "reserve.nameLabel": "Em nome de",
  "reserve.callLabel": "Ligar · {phone}",
  "reserve.instagramCta": "Abrir Instagram oficial",
  "reserve.facebookCta": "Abrir Facebook oficial",
  "reserve.directionsCta": "Abrir direções",
  "reserve.keepCode": "Guarde a referência {code} — é o que identifica o pedido na casa.",

  /* erros do pedido */
  "error.name": "Precisamos de um nome para a mesa.",
  "error.phone": "Indique um telefone com 9 dígitos ou mais.",
  "error.email": "Este email parece incompleto.",
  "error.day.missing": "Escolha o dia.",
  "error.day.past": "Esse dia já passou.",
  "error.day.horizon": "Só aceitamos pedidos com alguma antecedência.",
  "error.day.closed": "Não abrimos nesse dia — escolha outro.",
  "error.time.missing": "Escolha a hora.",
  "error.time.outside": "Hora fora do horário publicado.",
  "error.time.lead": "Para hoje precisamos de {lead} hora{s} de antecedência.",
  "error.people.missing": "Quantas pessoas?",
  "error.people.max": "Para mais de {max} pessoas ligue-nos, combinamos melhor.",
  "error.send": "Não foi possível enviar o pedido.",
  "error.callInstead": "Pode sempre ligar para",

  /* cookies */
  "cookies.region": "Consentimento de cookies",
  "cookies.title": "Cookies",
  "cookies.intro": "Usamos apenas o necessário para o site funcionar.",
  "cookies.introAnalytics": " Com a sua autorização, medimos as visitas de forma agregada.",
  "cookies.outro": " Pode escolher agora e mudar de ideias quando quiser, no rodapé.",
  "cookies.link": "ler a política de cookies",
  "cookies.acceptAll": "aceitar todos",
  "cookies.necessaryOnly": "só necessários",
  "cookies.define": "definir",
  "cookies.save": "guardar escolha",
  "cookies.close": "Fechar preferências de cookies",
  "cookies.necessary": "Necessários",
  "cookies.necessaryHint": "Guardam a sua escolha de cookies e a sessão do painel. Não se podem desligar.",
  "cookies.measure": "Medição de audiência",
  "cookies.measureHint": "Estatísticas agregadas das visitas ao site.",
  "cookies.measureHintOff": "Disponível quando a casa configurar um serviço de medição.",
  "cookies.marketing": "Publicidade e redes",
  "cookies.marketingHint": "O site não usa este tipo de cookies.",

  /* página legal */
  "legal.back": "voltar ao site",
  "legal.title": "Privacidade, cookies e termos",
  "legal.updated": "Última revisão em {date}.",
  "legal.doubt": "Qualquer dúvida sobre os seus dados ou sobre este site:",
  "legal.privacy": "Privacidade",
  "legal.cookies": "Cookies",
  "legal.terms": "Termos de utilização",
  "legal.responsible": "Quem é responsável",
  "legal.entity": "Entidade",
  "legal.address": "Morada",
  "legal.email": "Email",
  "legal.phone": "Telefone",
  "legal.rights":
    "Pode exercer os seus direitos de acesso, retificação, apagamento, limitação e portabilidade dos dados, e apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), através dos contactos acima.",

  /* comum */
  "common.plural": "s",
  "common.person": "pessoa",
  "common.people": "pessoas",
} as const;

export type UiKey = keyof typeof pt;
export type UiStrings = Record<UiKey, string>;

const en: UiStrings = {
  /* idioma */
  "language.label": "Language",
  "language.pt": "Português",
  "language.en": "English",
  "language.switchTo": "Switch to Portuguese",

  /* navegação */
  "nav.contact": "Get in touch",
  "nav.instagram": "Instagram",
  "nav.directions": "Get directions →",
  "nav.reserve": "Contact the house",
  "nav.call": "Call",
  "nav.home": "Home",
  "nav.close": "Close menu",
  "nav.place": "Esmoriz · Portugal",

  /* abertura */
  "hero.place": "Esmoriz · Aveiro · Portugal",
  "hero.intro": "A digital home for a beach bar with sea views and outdoor tables.",
  "hero.structure": "See the menu structure",
  "hero.directions": "Get directions",
  "hero.instagram": "Official Instagram →",
  "hero.scroll": "Scroll",
  "hero.sources": "public profiles found",

  /* introdução */
  "intro.confirmed": "Confirmed information",
  "intro.body":
    "Palheiro Velho is publicly listed as a beach bar in Esmoriz, at Travessa da Barrinha. Public pages about the space mention sea views and outdoor tables.",
  "intro.note":
    "The information on this site was gathered from the venue’s public channels. Menu, opening hours, images and terms should be confirmed directly before your visit.",

  /* oceano */
  "ocean.title": "Atlantic Ocean · tide going out",
  "ocean.continue": "keep looking around",

  /* espaço */
  "experience.eyebrow": "The experience",
  "experience.word1": "Published",
  "experience.word2": "elements.",
  "experience.confirm": "confirm with the house →",
  "experience.note":
    "Information gathered from the venue’s public channels. The photographs in this section are references and do not show the actual space.",
  "experience.services":
    "Published services include sea views, outdoor tables, live music, brunch and parking. Opening hours, menu and terms should be confirmed directly with the house.",
  "experience.contact": "Contact the house",
  "experience.subject": "Enquiry about: {label}",

  /* galeria */
  "gallery.eyebrow": "Atmospheres",
  "gallery.note": "The light, the shade of the straw and the sea two steps away: the space up close.",
  "gallery.swipe": "swipe",

  /* instagram */
  "instagram.source": "official public profile found while researching",
  "instagram.note": "Official posts open on the venue’s profile. Pick one to see it larger.",
  "instagram.follow": "Follow on Instagram",
  "instagram.reel": "reel",
  "instagram.view": "view",

  /* momentos */
  "events.eyebrow": "Moments",
  "events.note":
    "The venue’s public pages mention live music and cultural and sports events. We list no dates, capacities or terms without confirmation from the house.",
  "events.plan": "plan",
  "events.talk": "Talk to us",
  "events.direct": "get in touch",
  "events.send": "send a message",

  /* carta */
  "menu.eyebrow": "The menu",
  "menu.title1": "Eating together,",
  "menu.title2": "no rush.",
  "menu.intro":
    "A short menu of South American cooking: to share, to eat with your hands, and to drink slowly.",
  "menu.items": "items",
  "menu.priceRange": "from {min} to {max}",
  "rail.label": "Page sections",
  "menu.confirm": "confirm with the house",
  "menu.contains": "contains",
  "menu.avoid": "Avoid",
  "menu.all": "all",
  "menu.without": "without {item}",
  "menu.empty":
    "No dish on this menu is published without {item}. If you have questions about allergens, speak to the house before ordering.",
  "menu.contact": "Contact the house",
  "menu.demo":
    "This is a demonstration structure. Use the official channels below to confirm the menu and today's availability.",

  /* contacto e localização */
  "location.eyebrow": "Contact & location",
  "location.address": "Published address",
  "location.channels": "Published channels",
  "location.hours": "Opening hours",
  "location.hoursEmpty":
    "Opening hours not published yet. Please confirm by phone or on the official profiles before your visit.",
  "location.call": "Call",
  "location.directions": "Get directions",
  "location.instagram": "Instagram",
  "location.email": "Send an email",
  "location.sources": "Sources",
  "location.mapNote": "Illustrative diagram · location via Google Maps",
  "location.openMaps": "open in Google Maps →",
  "location.source": "source",
  "location.title1": "We are in",
  "location.title2": "Esmoriz.",
  "location.mapLive": "interactive map",
  "location.mapStatic": "illustrative map",
  "location.mapTitle": "Map of Palheiro Velho",
  "location.logoAlt": "Public logo of Palheiro Velho",
  "location.srcSite": "Public website",
  "location.srcParish": "Parish council",
  "location.srcRegistry": "Public record",
  "location.logoSource": "source: Esmoriz parish council",
  "notfound.title": "This page does not exist.",
  "notfound.body":
    "The address may be wrong or the page may have moved. The site is still here: go back to the entrance, see the menu or call the house.",
  "notfound.home": "back to the site",
  "notfound.menu": "see the menu",
  "status.openUntil": "Open until {time}",
  "status.closingIn": "Closing in {minutes} min",
  "status.opensIn": "Opens in {minutes} min",
  "status.opensToday": "Opens today at {time}",
  "status.opensDay": "Opens {day} at {time}",
  "status.closedToday": "Closed today",
  "status.unknown": "Hours to be confirmed",
  "day.mon": "Monday",
  "day.tue": "Tuesday",
  "day.wed": "Wednesday",
  "day.thu": "Thursday",
  "day.fri": "Friday",
  "day.sat": "Saturday",
  "day.sun": "Sunday",
  "reserve.today": "today",
  "reserve.tomorrow": "tomorrow",
  "reserve.todayHours": "Today: {ranges}",
  "reserve.todayClosed": "We are closed today — please pick another day.",
  "hours.closed": "closed",

  /* rodapé */
  "footer.navigate": "Navigate",
  "footer.house": "The house",
  "footer.channels": "Public channels",
  "footer.instagram": "Instagram",
  "footer.facebook": "Facebook",
  "footer.phone": "Phone",
  "footer.location": "Location",
  "footer.legal": "Legal",
  "footer.privacy": "Privacy",
  "footer.cookiesLink": "Cookies",
  "footer.terms": "Terms",
  "footer.cookies": "Cookie preferences",
  "footer.top": "back to top",
  "footer.source": "check the source",
  "footer.disclaimer":
    "Contact details and services collected from public sources; always confirm before visiting.",

  /* pedido de mesa */
  "reserve.eyebrow": "Table request",
  "reserve.intro":
    "Send your request and the house will confirm by phone during opening hours. For large groups or same-day bookings, calling is faster.",
  "reserve.subject": "Reason for contact",
  "reserve.name": "Name",
  "reserve.namePlaceholder": "Name for the booking",
  "reserve.phone": "Phone",
  "reserve.phonePlaceholder": "912 345 678",
  "reserve.email": "Email (optional)",
  "reserve.emailPlaceholder": "to receive the confirmation",
  "reserve.day": "Date",
  "reserve.time": "Time",
  "reserve.chooseTime": "choose",
  "reserve.noTime": "no times",
  "reserve.people": "Guests",
  "reserve.notes": "Note (optional)",
  "reserve.notesPlaceholder": "Allergies, high chair, birthday…",
  "reserve.submit": "Request a table",
  "reserve.sending": "Sending…",
  "reserve.disclaimer":
    "Your request goes to the house and the confirmation comes by phone — no payment is taken here and no card details are stored.",
  "reserve.onlyContacts":
    "For the menu, opening hours, events or availability, use one of the channels below.",
  "reserve.notLinked": " Table requests through this site are not connected to the house yet.",
  "reserve.emailFallback": "Prefer to write? Send an email to",
  "reserve.emailDetails": "with the date, time and number of guests.",
  "reserve.company": "Company",
  "reserve.title": "Request a table at Palheiro Velho",
  "common.close": "Close",
  "common.skip": "Skip to the menu",
  "reserve.registered": "Request received",
  "reserve.dayLabel": "Date",
  "reserve.timeLabel": "Time",
  "reserve.peopleLabel": "Guests",
  "reserve.nameLabel": "Under the name of",
  "reserve.callLabel": "Call · {phone}",
  "reserve.instagramCta": "Open the official Instagram",
  "reserve.facebookCta": "Open the official Facebook",
  "reserve.directionsCta": "Open directions",
  "reserve.keepCode": "Keep the reference {code} — that is how the house identifies your request.",

  /* erros do pedido */
  "error.name": "We need a name for the table.",
  "error.phone": "Please give a phone number with at least 9 digits.",
  "error.email": "This email looks incomplete.",
  "error.day.missing": "Choose a date.",
  "error.day.past": "That date has passed.",
  "error.day.horizon": "We only take requests a little in advance.",
  "error.day.closed": "We are closed that day — please choose another.",
  "error.time.missing": "Choose a time.",
  "error.time.outside": "That time is outside our opening hours.",
  "error.time.lead": "For today we need {lead} hour{s} in advance.",
  "error.people.missing": "How many guests?",
  "error.people.max": "For more than {max} guests, please call us — easier to arrange.",
  "error.send": "We could not send your request.",
  "error.callInstead": "You can always call",

  /* cookies */
  "cookies.region": "Cookie consent",
  "cookies.title": "Cookies",
  "cookies.intro": "We only use what is needed to make the site work.",
  "cookies.introAnalytics": " With your permission, we measure visits in aggregate.",
  "cookies.outro": " You can choose now and change your mind any time, in the footer.",
  "cookies.link": "read the cookie policy",
  "cookies.acceptAll": "accept all",
  "cookies.necessaryOnly": "necessary only",
  "cookies.define": "settings",
  "cookies.save": "save choice",
  "cookies.close": "Close cookie preferences",
  "cookies.necessary": "Necessary",
  "cookies.necessaryHint":
    "They store your cookie choice and the panel session. They cannot be switched off.",
  "cookies.measure": "Audience measurement",
  "cookies.measureHint": "Aggregate statistics of visits to the site.",
  "cookies.measureHintOff": "Available once the house sets up a measurement service.",
  "cookies.marketing": "Advertising and social",
  "cookies.marketingHint": "This site does not use these cookies.",

  /* página legal */
  "legal.back": "back to the site",
  "legal.title": "Privacy, cookies and terms",
  "legal.updated": "Last reviewed on {date}.",
  "legal.doubt": "Any question about your data or about this site:",
  "legal.privacy": "Privacy",
  "legal.cookies": "Cookies",
  "legal.terms": "Terms of use",
  "legal.responsible": "Who is responsible",
  "legal.entity": "Entity",
  "legal.address": "Address",
  "legal.email": "Email",
  "legal.phone": "Phone",
  "legal.rights":
    "You may exercise your rights of access, rectification, erasure, restriction and portability of your data, and lodge a complaint with the Portuguese data protection authority (CNPD), using the contacts above.",

  /* comum */
  "common.plural": "s",
  "common.person": "guest",
  "common.people": "guests",
};

const DICTIONARY: Record<Locale, UiStrings> = { pt, en };

/** Os textos da interface numa língua. */
export const uiStrings = (locale: Locale): UiStrings => DICTIONARY[locale] ?? DICTIONARY.pt;

/**
 * Uma frase com valores lá dentro: "Guarde a referência {code}" → "… PV-4K7Q".
 * As chaves continuam visíveis se faltar o valor — melhor do que esconder.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
