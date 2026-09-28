/**
 * Pedidos de mesa no painel.
 *
 * Ao contrário do conteúdo, a lista não segue as alterações em tempo real: a
 * tabela só é legível com o token do painel, e o Realtime não o conhece. Por
 * isso a lista é lida de tempos a tempos (e a pedido, com "atualizar").
 */
import { useCallback, useEffect, useState } from "react";
import { RESERVATION_STATUSES, type Reservation, type ReservationStatus } from "@/content/types";
import { supabase, supabaseEnabled } from "@/lib/supabase";

type Row = Record<string, unknown>;

const str = (row: Row, key: string) => (typeof row[key] === "string" ? (row[key] as string) : "");
const num = (row: Row, key: string) => (typeof row[key] === "number" ? (row[key] as number) : 0);

/** Há base de dados para guardar pedidos? */
export const reservationsEnabled = () => supabaseEnabled;

/** Uma linha da base de dados → o tipo que o painel e o site usam. */
export function parseReservation(row: Row): Reservation {
  const status = str(row, "status");
  return {
    id: str(row, "id"),
    code: str(row, "code"),
    name: str(row, "name"),
    phone: str(row, "phone"),
    email: str(row, "email"),
    // `date` e `time` chegam como "2026-10-03" e "19:30:00"
    day: str(row, "day").slice(0, 10),
    time: str(row, "time").slice(0, 5),
    people: num(row, "people"),
    notes: str(row, "notes"),
    status: (RESERVATION_STATUSES as readonly string[]).includes(status)
      ? (status as ReservationStatus)
      : "novo",
    createdAt: str(row, "created_at") || new Date().toISOString(),
  };
}

const db = () => {
  if (!supabase) throw new Error("Base de dados não configurada.");
  return supabase;
};

/** Todos os pedidos, os próximos primeiro. */
export async function listReservations(): Promise<Reservation[]> {
  const client = db();
  const { data, error } = await client
    .from("reservations")
    .select("*")
    .order("day", { ascending: true })
    .order("time", { ascending: true })
    .limit(500);
  if (error) throw error;
  return ((data ?? []) as Row[]).map(parseReservation);
}

/** Confirma, recusa, conclui ou devolve um pedido a novo. */
export async function setReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  const client = db();
  const { error } = await client
    .from("reservations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Apaga um pedido (por exemplo, quando é claramente spam). */
export async function removeReservation(id: string): Promise<void> {
  const client = db();
  const { error } = await client.from("reservations").delete().eq("id", id);
  if (error) throw error;
}

/** De quanto em quanto tempo se voltam a ler os pedidos. */
const POLL_MS = 30_000;

/**
 * Lista de pedidos com leitura periódica.
 * `loading` só é verdadeiro na primeira leitura — depois disso a lista
 * atualiza-se em silêncio, sem piscar.
 */
export function useReservations() {
  const [items, setItems] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabaseEnabled) {
      setItems([]);
      setError("Sem base de dados: os pedidos não são guardados.");
      setLoading(false);
      return;
    }
    try {
      const list = await listReservations();
      setItems(list);
      setError(null);
      setUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível ler os pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      // nenhum setState no corpo do efeito: só depois de a leitura acabar
      if (alive) await load();
    };
    void tick();
    const timer = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [load]);

  return { items, error, loading, updatedAt, refresh: load };
}
