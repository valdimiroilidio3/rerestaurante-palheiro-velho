import { describe, expect, it } from "vitest";
import type { HoursEntry, ReservationDraft, ReservationSettings } from "@/content/types";
import {
  dayIdOf,
  firstOpenDay,
  fromMinutes,
  formatDay,
  newReservationCode,
  reservationWindow,
  slotsForDay,
  toMinutes,
  validEmail,
  validPhone,
  validateReservation,
  whatsappHref,
} from "@/lib/reservations";

/** O horário de referência do site: terça a domingo, 12:30 — 23:00. */
const HOURS: HoursEntry[] = [
  {
    id: "verao",
    label: "Terça a domingo",
    days: ["tue", "wed", "thu", "fri", "sat", "sun"],
    open: "12:30",
    close: "23:00",
  },
  { id: "descanso", label: "Segunda", days: ["mon"], open: "", close: "" },
];

const SETTINGS: ReservationSettings = {
  enabled: true,
  maxPeople: 12,
  slotMinutes: 30,
  lastSeatingBeforeClose: 90,
  minLeadHours: 2,
  horizonDays: 60,
  confirmation: "A casa confirma por telefone.",
};

const draft = (over: Partial<ReservationDraft> = {}): ReservationDraft => ({
  name: "Ana Costa",
  phone: "912345678",
  email: "",
  day: "2026-10-06", // terça-feira
  time: "20:00",
  people: 2,
  notes: "",
  ...over,
});

/** Terça-feira de manhã, para os testes de antecedência. */
const TUESDAY_MORNING = new Date(2026, 9, 6, 9, 0);

describe("horas", () => {
  it("converte HH:MM para minutos e volta", () => {
    expect(toMinutes("12:30")).toBe(750);
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("23:59")).toBe(1439);
    expect(toMinutes("não é hora")).toBe(-1);
    expect(toMinutes("25:00")).toBe(-1);
    expect(fromMinutes(750)).toBe("12:30");
  });

  it("sugere horas a partir do horário publicado", () => {
    const slots = slotsForDay(HOURS, "tue", SETTINGS);
    expect(slots[0]).toBe("12:30");
    expect(slots).toContain("20:00");
    // a última mesa é 90 minutos antes do fecho
    expect(slots.at(-1)).toBe("21:30");
    expect(slots).not.toContain("22:00");
  });

  it("não sugere nada no dia de descanso", () => {
    expect(slotsForDay(HOURS, "mon", SETTINGS)).toEqual([]);
  });

  it("junta as horas de duas linhas que cubram o mesmo dia", () => {
    const almoco: HoursEntry = {
      id: "almoco",
      label: "Almoço",
      days: ["tue"],
      open: "12:30",
      close: "15:00",
    };
    const jantar: HoursEntry = {
      id: "jantar",
      label: "Jantar",
      days: ["tue"],
      open: "19:30",
      close: "23:00",
    };
    const slots = slotsForDay([almoco, jantar], "tue", SETTINGS);
    expect(slots).toContain("12:30");
    expect(slots).toContain("19:30");
    // entre o fim do almoço e a abertura do jantar não há mesas
    expect(slots).not.toContain("17:00");
  });

  it("respeita o intervalo escolhido pela casa", () => {
    const slots = slotsForDay(HOURS, "tue", { ...SETTINGS, slotMinutes: 60 });
    expect(slots.slice(0, 4)).toEqual(["12:30", "13:30", "14:30", "15:30"]);
  });
});

describe("dias", () => {
  it("descobre o dia da semana de uma data", () => {
    expect(dayIdOf("2026-10-06")).toBe("tue");
    expect(dayIdOf("2026-10-05")).toBe("mon");
    expect(dayIdOf("2026-10-04")).toBe("sun");
    expect(dayIdOf("2026-13-40")).toBeNull();
    expect(dayIdOf("2026-02-30")).toBeNull();
    expect(dayIdOf("10-06")).toBeNull();
  });

  it("abre a janela de pedidos entre hoje e o horizonte", () => {
    const range = reservationWindow(SETTINGS, TUESDAY_MORNING);
    expect(range.min).toBe("2026-10-06");
    expect(range.max).toBe("2026-12-05");
  });

  it("sugere o primeiro dia com horas disponíveis", () => {
    // terça de manhã, com duas horas de antecedência: ainda dá para hoje
    expect(firstOpenDay(HOURS, SETTINGS, TUESDAY_MORNING)).toBe("2026-10-06");
    // segunda-feira está encerrado: salta para terça
    expect(firstOpenDay(HOURS, SETTINGS, new Date(2026, 9, 5, 9, 0))).toBe("2026-10-06");
    // terça às 22:00 já não há horas hoje (antecedência de 2 horas)
    expect(firstOpenDay(HOURS, SETTINGS, new Date(2026, 9, 6, 22, 0))).toBe("2026-10-07");
  });

  it("escreve a data em português", () => {
    expect(formatDay("2026-10-06")).toContain("6");
    expect(formatDay("2026-10-06")).toMatch(/terça/i);
  });
});

describe("contactos", () => {
  it("aceita telefones portugueses e estrangeiros", () => {
    expect(validPhone("912 345 678")).toBe(true);
    expect(validPhone("+351 912345678")).toBe(true);
    expect(validPhone("91234")).toBe(false);
  });

  it("só exige email se for escrito", () => {
    expect(validEmail("")).toBe(false);
    expect(validEmail("ana@example.com")).toBe(true);
    expect(validEmail("ana@example")).toBe(false);
  });

  it("monta o WhatsApp com o indicativo português", () => {
    expect(whatsappHref("912 345 678")).toBe("https://wa.me/351912345678");
    expect(whatsappHref("+351 912 345 678")).toBe("https://wa.me/351912345678");
    expect(whatsappHref("+44 7700 900000")).toBe("https://wa.me/447700900000");
    expect(whatsappHref("123")).toBeNull();
  });

  it("gera referências legíveis", () => {
    const code = newReservationCode();
    expect(code).toMatch(/^PV-[A-HJ-NP-Z2-9]{4}$/);
    expect(newReservationCode()).not.toBe("");
  });
});

describe("validação de um pedido", () => {
  it("aceita um pedido completo", () => {
    expect(validateReservation(draft(), HOURS, SETTINGS, TUESDAY_MORNING)).toEqual({});
  });

  it("recusa pedidos sem nome ou com telefone a menos", () => {
    const errors = validateReservation(draft({ name: "A", phone: "912" }), HOURS, SETTINGS, TUESDAY_MORNING);
    expect(errors.name).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it("não aceita mesa no dia de descanso", () => {
    const errors = validateReservation(draft({ day: "2026-10-05" }), HOURS, SETTINGS, TUESDAY_MORNING);
    expect(errors.day).toBeTruthy();
  });

  it("não aceita datas passadas nem fora do horizonte", () => {
    expect(
      validateReservation(draft({ day: "2020-01-01" }), HOURS, SETTINGS, TUESDAY_MORNING).day,
    ).toBeTruthy();
    expect(
      validateReservation(draft({ day: "2030-01-01" }), HOURS, SETTINGS, TUESDAY_MORNING).day,
    ).toBeTruthy();
  });

  it("não aceita horas fora do horário publicado", () => {
    const errors = validateReservation(draft({ time: "23:00" }), HOURS, SETTINGS, TUESDAY_MORNING);
    expect(errors.time).toBeTruthy();
  });

  it("exige antecedência no próprio dia", () => {
    // terça às 19:00, para as 20:00: falta uma hora para as duas exigidas
    const errors = validateReservation(
      draft({ time: "20:00" }),
      HOURS,
      SETTINGS,
      new Date(2026, 9, 6, 19, 0),
    );
    expect(errors.time).toBeTruthy();
  });

  it("manda ligar para grupos acima do máximo", () => {
    const errors = validateReservation(draft({ people: 20 }), HOURS, SETTINGS, TUESDAY_MORNING);
    expect(errors.people).toBeTruthy();
  });

  it("valida o email quando é escrito", () => {
    expect(
      validateReservation(draft({ email: "ana@exemplo" }), HOURS, SETTINGS, TUESDAY_MORNING).email,
    ).toBeTruthy();
    expect(
      validateReservation(draft({ email: "ana@exemplo.com" }), HOURS, SETTINGS, TUESDAY_MORNING),
    ).toEqual({});
  });
});
