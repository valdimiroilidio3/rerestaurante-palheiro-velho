/**
 * Envio do pedido de mesa para a base de dados.
 *
 * Quem escreve aqui é o visitante, sem sessão: a política da tabela deixa
 * qualquer pessoa inserir, mas ninguém ler. Por isso o identificador e a
 * referência são criados no browser — assim o cliente recebe a confirmação sem
 * precisar de ler o que acabou de escrever.
 */
import type { Reservation, ReservationDraft } from "@/content/types";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { newReservationCode, normalizePhone } from "@/lib/reservations";

export const RESERVATIONS_TABLE = "reservations";

/** Há base de dados para receber pedidos? */
export const reservationRequestsEnabled = () => supabaseEnabled;

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : newReservationCode();

const row = (draft: ReservationDraft, code: string, id: string) => ({
  id,
  code,
  name: draft.name.trim().slice(0, 120),
  phone: normalizePhone(draft.phone).slice(0, 20),
  email: draft.email.trim().slice(0, 160),
  day: draft.day,
  time: draft.time,
  people: Math.trunc(draft.people),
  notes: draft.notes.trim().slice(0, 600),
  status: "novo",
});

/** Código de erro do Postgres para "chave duplicada" (a referência já existe). */
const UNIQUE_VIOLATION = "23505";

/**
 * Guarda o pedido. Devolve a reserva já com a referência que o cliente recebe.
 * Falha com uma mensagem legível — o site mostra os contactos nesse caso.
 */
export async function submitReservation(draft: ReservationDraft): Promise<Reservation> {
  const client = supabase;
  if (!client) throw new Error("Pedidos online temporariamente indisponíveis.");

  let code = newReservationCode();
  const id = newId();
  let lastError: { code?: string; message: string } | null = null;

  // duas tentativas: se a referência já existir, gera-se outra
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { error } = await client.from(RESERVATIONS_TABLE).insert(row(draft, code, id));
    if (!error) {
      return {
        id,
        code,
        name: draft.name.trim(),
        phone: normalizePhone(draft.phone),
        email: draft.email.trim(),
        day: draft.day,
        time: draft.time,
        people: Math.trunc(draft.people),
        notes: draft.notes.trim(),
        status: "novo",
        createdAt: new Date().toISOString(),
      };
    }
    lastError = error;
    if (error.code !== UNIQUE_VIOLATION) break;
    code = newReservationCode();
  }

  throw new Error(
    lastError?.message
      ? `Não foi possível enviar o pedido (${lastError.message}).`
      : "Não foi possível enviar o pedido.",
  );
}
