/**
 * Regras dos pedidos de mesa — tudo o que se pode decidir sem falar com a base
 * de dados.
 *
 * Este ficheiro é puro de propósito: o site e o painel usam as mesmas funções
 * (as horas sugeridas, por exemplo, saem sempre do horário publicado) e é aqui
 * que os testes incidem.
 */
import {
  WEEK_DAYS,
  type DayId,
  type HoursEntry,
  type ReservationDraft,
  type ReservationSettings,
  type ReservationStatus,
} from "@/content/types";

/** "HH:MM" → minutos desde a meia-noite. Inválido devolve -1. */
export const toMinutes = (value: string): number => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return -1;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return -1;
  return hours * 60 + minutes;
};

/** Minutos desde a meia-noite → "HH:MM". */
export const fromMinutes = (total: number): string => {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

/** Dia no formato que o input de data e a base de dados percebem ("YYYY-MM-DD"). */
export const isoDay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** "YYYY-MM-DD" → dia da semana. Devolve `null` se a data não for válida. */
export const dayIdOf = (value: string): DayId | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  // o Date aceita dias a mais (2026-02-30 passa para março): só vale se o dia
  // continuar a ser o mesmo depois de construído
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  // em JavaScript o domingo é 0; na nossa lista é o último
  const index = (date.getDay() + 6) % 7;
  return WEEK_DAYS[index]?.id ?? null;
};

/** As linhas do horário que cobrem um dia da semana. */
export const hoursForDay = (hours: HoursEntry[], day: DayId): HoursEntry[] =>
  hours.filter((entry) => entry.days.includes(day));

/**
 * Horas que se podem pedir num dia: saem do horário publicado, com o
 * intervalo definido e sempre antes do fim do serviço.
 */
export function slotsForDay(hours: HoursEntry[], day: DayId, settings: ReservationSettings): string[] {
  const step = Math.max(5, Math.trunc(settings.slotMinutes) || 30);
  const last = Math.max(0, Math.trunc(settings.lastSeatingBeforeClose) || 0);
  const found = new Set<string>();

  for (const entry of hoursForDay(hours, day)) {
    const open = toMinutes(entry.open);
    const close = toMinutes(entry.close);
    if (open < 0 || close < 0 || close <= open) continue;
    const until = close - last;
    for (let slot = open; slot <= until; slot += step) found.add(fromMinutes(slot));
  }

  return [...found].sort();
}

/** O dia abre (tem pelo menos uma hora disponível) para reservas? */
export const isOpenForReservations = (
  hours: HoursEntry[],
  day: DayId | null,
  settings: ReservationSettings,
): boolean => (day ? slotsForDay(hours, day, settings).length > 0 : false);

/** Intervalo de dias que o site aceita: hoje até ao horizonte definido. */
export function reservationWindow(settings: ReservationSettings, now: Date) {
  const horizon = Math.max(1, Math.trunc(settings.horizonDays) || 60);
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate() + horizon);
  return { min: isoDay(now), max: isoDay(max) };
}

/** Fica só com os dígitos — o que interessa para ligar e para guardar. */
export const normalizePhone = (value: string): string => value.replace(/[^\d]/g, "");

/**
 * Telefone aceitável: 9 dígitos (Portugal) ou até 15 com indicativo.
 * Não se exige o "+351": a casa conhece os próprios clientes.
 */
export const validPhone = (value: string): boolean => {
  const digits = normalizePhone(value);
  return digits.length >= 9 && digits.length <= 15;
};

/** Email opcional, mas se for escrito tem de parecer um email. */
export const validEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Número de telefone pronto a ligar (sem espaços nem parênteses). */
export const telHref = (value: string): string => `tel:${normalizePhone(value)}`;

/**
 * WhatsApp a partir do número publicado. Só se percebermos que é português
 * (9 dígitos) — caso contrário não se inventa um indicativo.
 */
export function whatsappHref(value: string): string | null {
  const digits = normalizePhone(value);
  if (digits.length === 9) return `https://wa.me/351${digits}`;
  if (digits.length > 9 && digits.length <= 15) return `https://wa.me/${digits}`;
  return null;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I, O, 0, 1

/** Referência curta para o cliente acompanhar o pedido, por exemplo "PV-4K7Q". */
export function newReservationCode(): string {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  const tail = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
  return `PV-${tail}`;
}

const dayFormatter = new Intl.DateTimeFormat("pt-PT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "2026-10-03" → "sábado, 3 de outubro". */
export function formatDay(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dayFormatter.format(date);
}

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  novo: "novo",
  confirmado: "confirmado",
  recusado: "recusado",
  concluido: "concluído",
};

/**
 * Primeiro dia com horas disponíveis a partir de hoje (já com a antecedência
 * mínima aplicada a hoje). É o dia que fica sugerido ao abrir o formulário.
 */
export function firstOpenDay(hours: HoursEntry[], settings: ReservationSettings, now: Date): string {
  const window = reservationWindow(settings, now);
  const lead = Math.max(0, Math.trunc(settings.minLeadHours) || 0);
  const soonest = now.getHours() * 60 + now.getMinutes() + lead * 60;

  for (let offset = 0; offset <= 60; offset += 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const iso = isoDay(cursor);
    if (iso > window.max) break;
    const dayId = dayIdOf(iso);
    if (!dayId) continue;
    const slots = slotsForDay(hours, dayId, settings).filter(
      (slot) => offset > 0 || toMinutes(slot) >= soonest,
    );
    if (slots.length) return iso;
  }

  return "";
}

/** Erros por campo, prontos a mostrar por baixo de cada input. */
export type ReservationErrors = Partial<Record<keyof ReservationDraft | "geral", string>>;

/**
 * Valida um pedido. Devolve um dicionário de erros; vazio quer dizer que o
 * pedido pode seguir para a base de dados.
 */
export function validateReservation(
  draft: ReservationDraft,
  hours: HoursEntry[],
  settings: ReservationSettings,
  now: Date,
): ReservationErrors {
  const errors: ReservationErrors = {};

  if (draft.name.trim().length < 2) errors.name = "Precisamos de um nome para a mesa.";
  if (!validPhone(draft.phone)) errors.phone = "Indique um telefone com 9 dígitos ou mais.";
  if (draft.email.trim() && !validEmail(draft.email)) errors.email = "Este email parece incompleto.";

  const day = draft.day;
  const window = reservationWindow(settings, now);
  const dayId = dayIdOf(day);
  const slots = dayId ? slotsForDay(hours, dayId, settings) : [];

  if (!day || !dayId) {
    errors.day = "Escolha o dia.";
  } else if (day < window.min) {
    errors.day = "Esse dia já passou.";
  } else if (day > window.max) {
    errors.day = "Só aceitamos pedidos com alguma antecedência.";
  } else if (!slots.length) {
    errors.day = "Não abrimos nesse dia — escolha outro.";
  }

  if (!draft.time) {
    errors.time = "Escolha a hora.";
  } else if (!slots.includes(draft.time)) {
    errors.time = "Hora fora do horário publicado.";
  } else if (day === window.min) {
    // no próprio dia ainda é preciso tempo para preparar a mesa
    const lead = Math.max(0, Math.trunc(settings.minLeadHours) || 0);
    const soonest = now.getHours() * 60 + now.getMinutes() + lead * 60;
    if (toMinutes(draft.time) < soonest) {
      errors.time = `Para hoje precisamos de ${lead} hora${lead === 1 ? "" : "s"} de antecedência.`;
    }
  }

  if (!Number.isFinite(draft.people) || draft.people < 1) {
    errors.people = "Quantas pessoas?";
  } else if (draft.people > settings.maxPeople) {
    errors.people = `Para mais de ${settings.maxPeople} pessoas ligue-nos, combinamos melhor.`;
  }

  return errors;
}
