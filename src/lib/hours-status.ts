/**
 * Estado da casa agora: aberto, fecha em breve, abre hoje ou encerrado.
 *
 * Só usa o **horário que a casa publicou** — não inventa nada. Se a casa ainda
 * não publicou horas, o estado é "a confirmar" e o site diz isso, em vez de
 * dar uma hora falsa.
 *
 * É puro (recebe a data, devolve dados): é o que permite testar "abre daqui a
 * 20 minutos" sem esperar pelas 12:30.
 */
import { WEEK_DAYS, type DayId, type HoursEntry } from "@/content/types";
import { closeMinutes, toMinutes } from "./reservations";

export type DayRange = { open: string; close: string };

export type OpenState = "open" | "closing" | "opens-today" | "closed" | "unknown";

export type StatusNow = {
  state: OpenState;
  /** Minutos até fechar (se estiver aberto) ou até abrir (se estiver fechado). */
  minutes: number;
  /** Hora de fecho do serviço que está a decorrer. */
  until?: string;
  /** Próxima abertura: dia, data e hora. */
  next?: { dayId: DayId; iso: string; open: string; inDays: number };
  /** Os serviços de hoje (pode haver mais do que um: almoço e jantar). */
  today: DayRange[];
};

/** O dia da semana de uma data. `getDay()` começa no domingo; a nossa lista no segunda. */
export const dayIdOfDate = (date: Date): DayId => WEEK_DAYS[(date.getDay() + 6) % 7].id;

/** "YYYY-MM-DD" de uma data (sem fusos pelo meio). */
export const isoOfDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Os serviços válidos de um dia: o que não tiver horas conta como encerrado. */
export function rangesForDay(hours: HoursEntry[], day: DayId): DayRange[] {
  const ranges: DayRange[] = [];
  for (const entry of hours) {
    if (!entry.days.includes(day)) continue;
    const open = toMinutes(entry.open);
    const close = closeMinutes(entry.close);
    if (open < 0 || close < 0 || close <= open) continue;
    ranges.push({ open: entry.open, close: entry.close });
  }
  return ranges.sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
}

/** O dia seguinte ao dia dado, dentro da semana publicada. */
const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * A próxima vez que a casa abre, a contar de agora (hoje incluído).
 * Procura até sete dias à frente: uma semana cobre qualquer dia de descanso.
 */
export function nextOpening(hours: HoursEntry[], now: Date): StatusNow["next"] {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let ahead = 0; ahead < 7; ahead += 1) {
    const date = addDays(now, ahead);
    const dayId = dayIdOfDate(date);
    for (const range of rangesForDay(hours, dayId)) {
      const open = toMinutes(range.open);
      if (ahead > 0 || open > nowMinutes) {
        return { dayId, iso: isoOfDate(date), open: range.open, inDays: ahead };
      }
    }
  }

  return undefined;
}

/**
 * O estado da casa neste momento.
 *
 * Ordem: está dentro de um serviço → abre ainda hoje → abre noutro dia.
 * "closing" é só um aviso das últimas horas, para ninguém chegar a casa fechada.
 */
export function statusNow(hours: HoursEntry[], now: Date = new Date()): StatusNow {
  const dayId = dayIdOfDate(now);
  const today = rangesForDay(hours, dayId);
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (today.length === 0 && hours.length === 0) {
    return { state: "unknown", minutes: -1, today: [] };
  }

  for (const range of today) {
    const open = toMinutes(range.open);
    const close = closeMinutes(range.close);
    if (minutes >= open && minutes < close) {
      const left = close - minutes;
      return {
        // “fecha em breve” é a última hora de serviço
        state: left <= 60 ? "closing" : "open",
        minutes: left,
        until: range.close,
        today,
      };
    }
  }

  for (const range of today) {
    const open = toMinutes(range.open);
    if (open > minutes) {
      return {
        state: "opens-today",
        minutes: open - minutes,
        next: { dayId, iso: isoOfDate(now), open: range.open, inDays: 0 },
        today,
      };
    }
  }

  return { state: "closed", minutes: -1, next: nextOpening(hours, now), today };
}
