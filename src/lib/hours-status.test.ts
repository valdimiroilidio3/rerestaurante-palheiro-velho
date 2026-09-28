import { describe, expect, it } from "vitest";
import type { HoursEntry } from "@/content/types";
import { dayIdOfDate, nextOpening, rangesForDay, statusNow } from "@/lib/hours-status";

/** Terça a domingo, 12:30 — 15:00 e 19:30 — 23:00; segunda encerrada. */
const HOURS: HoursEntry[] = [
  {
    id: "almoco",
    label: "Almoço",
    days: ["tue", "wed", "thu", "fri", "sat", "sun"],
    open: "12:30",
    close: "15:00",
  },
  {
    id: "jantar",
    label: "Jantar",
    days: ["tue", "wed", "thu", "fri", "sat", "sun"],
    open: "19:30",
    close: "23:00",
  },
  { id: "descanso", label: "Segunda", days: ["mon"], open: "", close: "" },
];

/** 2026-09-29 é terça-feira. O mês entra como índice do `Date` (8 = setembro). */
const at = (day: number, hour: number, minute = 0, month = 8) =>
  new Date(2026, month, day, hour, minute, 0, 0);

describe("os dias da semana", () => {
  it("a nossa semana começa na segunda, a do Date no domingo", () => {
    expect(dayIdOfDate(at(28, 12))).toBe("mon"); // 28/09/2026
    expect(dayIdOfDate(at(29, 12))).toBe("tue");
    expect(dayIdOfDate(at(30, 12))).toBe("wed");
    expect(dayIdOfDate(at(1, 12, 0, 9))).toBe("thu"); // 01/10/2026
    expect(dayIdOfDate(at(4, 12, 0, 9))).toBe("sun"); // 04/10/2026
    expect(dayIdOfDate(at(5, 12, 0, 9))).toBe("mon"); // 05/10/2026
  });
});

describe("os serviços de um dia", () => {
  it("junta e ordena as linhas que se aplicam ao dia", () => {
    expect(rangesForDay(HOURS, "tue")).toEqual([
      { open: "12:30", close: "15:00" },
      { open: "19:30", close: "23:00" },
    ]);
  });

  it("um dia sem horas é um dia encerrado", () => {
    expect(rangesForDay(HOURS, "mon")).toEqual([]);
  });

  it("horas trocadas ou a meio não contam", () => {
    const trocadas: HoursEntry[] = [{ id: "x", label: "x", days: ["tue"], open: "23:00", close: "12:00" }];
    expect(rangesForDay(trocadas, "tue")).toEqual([]);
  });
});

describe("o estado da casa agora", () => {
  it("durante o almoço está aberta e sabe quando fecha", () => {
    const status = statusNow(HOURS, at(29, 13, 30));
    expect(status.state).toBe("open");
    expect(status.until).toBe("15:00");
    expect(status.minutes).toBe(90);
  });

  it("nas últimas horas avisa que vai fechar", () => {
    expect(statusNow(HOURS, at(29, 14, 15)).state).toBe("closing");
    expect(statusNow(HOURS, at(29, 22, 30)).state).toBe("closing");
    // a 90 minutos do fecho ainda é “aberto”
    expect(statusNow(HOURS, at(29, 13, 30)).state).toBe("open");
  });

  it("entre serviços diz a que horas abre outra vez", () => {
    const status = statusNow(HOURS, at(29, 17));
    expect(status.state).toBe("opens-today");
    expect(status.next?.open).toBe("19:30");
    expect(status.minutes).toBe(150);
  });

  it("de manhã ainda vai abrir nesse dia", () => {
    const status = statusNow(HOURS, at(29, 9));
    expect(status.state).toBe("opens-today");
    expect(status.minutes).toBe(210);
  });

  it("no dia de descanso aponta para o dia seguinte", () => {
    const status = statusNow(HOURS, at(28, 20)); // segunda à noite
    expect(status.state).toBe("closed");
    expect(status.next?.dayId).toBe("tue");
    expect(status.next?.iso).toBe("2026-09-29");
    expect(status.next?.open).toBe("12:30");
    expect(status.next?.inDays).toBe(1);
  });

  it("depois do último serviço salta logo para o dia seguinte", () => {
    const status = statusNow(HOURS, at(29, 23, 30));
    expect(status.state).toBe("closed");
    expect(status.next?.dayId).toBe("wed");
    expect(status.next?.iso).toBe("2026-09-30");
  });

  it("da sexta para o sábado a volta é curta", () => {
    const status = statusNow(HOURS, at(2, 23, 30, 9)); // sexta, depois de fechar
    expect(status.next?.dayId).toBe("sat");
    expect(status.next?.inDays).toBe(1);
  });

  it("sem horário publicado não se inventa nada", () => {
    const status = statusNow([], at(29, 13));
    expect(status.state).toBe("unknown");
    expect(status.next).toBeUndefined();
    expect(status.today).toEqual([]);
  });

  it("horário publicado mas sem horas válidas também é “a confirmar”", () => {
    const vazio: HoursEntry[] = [{ id: "x", label: "A confirmar", days: ["tue"], open: "", close: "" }];
    expect(statusNow(vazio, at(29, 13)).state).toBe("closed");
    expect(statusNow(vazio, at(29, 13)).next).toBeUndefined();
  });

  it("traz sempre os serviços de hoje, para o site os poder mostrar", () => {
    expect(statusNow(HOURS, at(29, 8)).today).toHaveLength(2);
    expect(statusNow(HOURS, at(28, 8)).today).toHaveLength(0);
  });
});

describe("a próxima abertura", () => {
  it("hoje, quando ainda há um serviço por começar", () => {
    expect(nextOpening(HOURS, at(29, 10))).toMatchObject({ dayId: "tue", open: "12:30", inDays: 0 });
  });

  it("amanhã, quando hoje já fechou", () => {
    expect(nextOpening(HOURS, at(29, 23, 30))).toMatchObject({ dayId: "wed", open: "12:30", inDays: 1 });
  });

  it("hoje à tarde, quando ainda há jantar", () => {
    expect(nextOpening(HOURS, at(29, 16))).toMatchObject({ dayId: "tue", open: "19:30", inDays: 0 });
  });

  it("nunca desiste antes de uma semana", () => {
    // segunda de manhã: abre terça
    expect(nextOpening(HOURS, at(28, 8))).toMatchObject({ dayId: "tue", inDays: 1 });
  });
});
