import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Phone, RefreshCw, Trash2, X } from "lucide-react";
import type { Reservation, ReservationSettings, ReservationStatus } from "@/content/types";
import { useAdminContent, useDraft, useSave, useToast } from "@/admin/lib/hooks";
import { saveSettings } from "@/admin/lib/api";
import { removeReservation, setReservationStatus, useReservations } from "@/admin/lib/reservations";
import { formatDay, telHref, whatsappHref } from "@/lib/reservations";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  SaveBar,
  SectionHeader,
  Textarea,
} from "@/admin/components/ui";

/** Como cada estado aparece na lista. */
const STATUS_STYLE: Record<ReservationStatus, { label: string; className: string }> = {
  novo: { label: "novo", className: "border-sun/50 text-sun" },
  confirmado: { label: "confirmado", className: "border-emerald-400/50 text-emerald-300" },
  recusado: { label: "recusado", className: "border-ember/50 text-ember" },
  concluido: { label: "concluído", className: "border-cream/25 text-cream/50" },
};

/**
 * Pedidos de mesa.
 *
 * Em cima, o que está pendente; em baixo, as regras com que o site sugere
 * horas e quantas pessoas aceita por pedido.
 */
export function ReservationsTab() {
  const { items, error, loading, updatedAt, refresh } = useReservations();
  const [filter, setFilter] = useState<ReservationStatus | "todos">("todos");
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();

  const counts = useMemo(() => {
    const base: Record<ReservationStatus, number> = {
      novo: 0,
      confirmado: 0,
      recusado: 0,
      concluido: 0,
    };
    (items ?? []).forEach((item) => {
      base[item.status] += 1;
    });
    return base;
  }, [items]);

  const list = useMemo(
    () => (items ?? []).filter((item) => filter === "todos" || item.status === filter),
    [items, filter],
  );

  // um pedido novo não passa despercebido: avisa-se uma vez, quando chega
  const freshKey = (items ?? [])
    .filter((item) => item.status === "novo")
    .map((item) => item.code)
    .join(",");
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (loading) return;
    const codes = freshKey ? freshKey.split(",") : [];
    // a primeira leitura não é novidade: só marca o que já estava na lista
    if (seen.current === null) {
      seen.current = new Set(codes);
      return;
    }
    const arrived = codes.filter((code) => !seen.current?.has(code));
    if (!arrived.length) return;
    arrived.forEach((code) => seen.current?.add(code));
    toast(
      arrived.length === 1
        ? `Novo pedido de mesa (${arrived[0]})`
        : `${arrived.length} novos pedidos de mesa`,
    );
    // só avisa quando a lista muda — `seen` é uma referência, não estado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshKey, loading]);

  const act = async (id: string, run: () => Promise<void>, message: string) => {
    setBusy(id);
    try {
      await run();
      await refresh();
      toast(message);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível alterar o pedido.", "erro");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Reservas"
        description="Pedidos de mesa enviados pelo site. A lista atualiza-se sozinha de 30 em 30 segundos; a confirmação ao cliente é feita pela casa, por telefone."
        action={
          <span className="flex items-center gap-3">
            {updatedAt && (
              <span className="label text-cream/35">
                {new Date(updatedAt).toLocaleTimeString("pt-PT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <Button variant="ghost" onClick={() => void refresh()}>
              <RefreshCw size={13} /> atualizar
            </Button>
          </span>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["todos", "novo", "confirmado", "recusado", "concluido"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            aria-pressed={filter === option}
            className={
              filter === option
                ? "label border border-sun bg-sun/10 px-3.5 py-2 text-sun"
                : "label border border-cream/15 px-3.5 py-2 text-cream/55 transition-colors hover:border-cream/40 hover:text-cream"
            }
          >
            {option}
            {option !== "todos" && ` · ${counts[option]}`}
          </button>
        ))}
      </div>

      {error && <p className="mb-6 text-[0.9rem] text-ember">{error}</p>}

      {loading ? (
        <EmptyState>A carregar pedidos…</EmptyState>
      ) : list.length === 0 ? (
        <EmptyState>
          {filter === "todos"
            ? "Ainda não há pedidos de mesa. Os pedidos feitos no site aparecem aqui."
            : "Nenhum pedido neste estado."}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <RequestRow
              key={item.id || item.code}
              reservation={item}
              busy={busy === item.id}
              onStatus={(status) =>
                void act(
                  item.id,
                  () => setReservationStatus(item.id, status),
                  `Pedido ${item.code}: ${STATUS_STYLE[status].label}.`,
                )
              }
              onRemove={() =>
                void act(item.id, () => removeReservation(item.id), `Pedido ${item.code} apagado.`)
              }
            />
          ))}
        </ul>
      )}

      <ReservationRules />
    </div>
  );
}

/* ————————————————————————————— um pedido ————————————————————————————— */

function RequestRow({
  reservation,
  busy,
  onStatus,
  onRemove,
}: {
  reservation: Reservation;
  busy: boolean;
  onStatus: (status: ReservationStatus) => void;
  onRemove: () => void;
}) {
  const style = STATUS_STYLE[reservation.status];
  const whatsapp = whatsappHref(reservation.phone);

  return (
    <li className={`border border-cream/12 bg-char/40 p-4 ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-[1.35rem] leading-none text-cream">{reservation.time}</span>
          <span className="text-[0.92rem] text-cream/70">{formatDay(reservation.day)}</span>
        </div>
        <span className={`label border px-2.5 py-1 ${style.className}`}>{style.label}</span>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-[0.9rem] sm:grid-cols-2">
        <Line label="Referência" value={reservation.code} />
        <Line label="Pessoas" value={String(reservation.people)} />
        <Line label="Nome" value={reservation.name} />
        <Line
          label="Telefone"
          value={
            <span className="flex flex-wrap items-center gap-2">
              <a className="underline underline-offset-4 hover:text-sun" href={telHref(reservation.phone)}>
                {reservation.phone}
              </a>
              {whatsapp && (
                <a
                  className="label text-sun hover:text-cream"
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  whatsapp
                </a>
              )}
            </span>
          }
        />
        {reservation.email && (
          <Line
            label="Email"
            value={
              <a className="underline underline-offset-4 hover:text-sun" href={`mailto:${reservation.email}`}>
                {reservation.email}
              </a>
            }
          />
        )}
        <Line
          label="Recebido"
          value={new Date(reservation.createdAt).toLocaleString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      </dl>

      {reservation.notes && (
        <p className="mt-4 border-l-2 border-cream/20 pl-3 text-[0.88rem] leading-relaxed text-cream/65">
          {reservation.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {reservation.status !== "confirmado" && (
          <Button variant="primary" onClick={() => onStatus("confirmado")} disabled={busy}>
            <Check size={13} /> confirmar
          </Button>
        )}
        {reservation.status !== "concluido" && (
          <Button variant="ghost" onClick={() => onStatus("concluido")} disabled={busy}>
            concluir
          </Button>
        )}
        {reservation.status !== "recusado" && (
          <Button variant="ghost" onClick={() => onStatus("recusado")} disabled={busy}>
            <X size={13} /> não temos mesa
          </Button>
        )}
        <Button variant="quiet" onClick={() => onStatus("novo")} disabled={busy}>
          voltar a novo
        </Button>
        <Button variant="danger" onClick={onRemove} disabled={busy}>
          <Trash2 size={13} /> apagar
        </Button>
        <span className="label ml-auto flex items-center gap-2 text-cream/35">
          <Phone size={12} /> a casa confirma por telefone
        </span>
      </div>
    </li>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="label shrink-0 text-cream/35">{label}</dt>
      <dd className="text-cream/85">{value}</dd>
    </div>
  );
}

/* ————————————————————————————— regras ————————————————————————————— */

/** As regras com que o site sugere horas e aceita pedidos. */
function ReservationRules() {
  const { content, loading } = useAdminContent();
  const { draft, update, commit, reset, dirty } = useDraft<ReservationSettings | null>(
    content?.reservations ?? null,
  );
  const { saving, save } = useSave(
    draft,
    commit,
    async (value) => {
      if (!value) return;
      await saveSettings({ reservations: value });
    },
    "Regras dos pedidos guardadas.",
  );

  const value = draft ?? content?.reservations ?? null;

  return (
    <Card className="mt-10">
      <h3 className="font-display text-[1.5rem] leading-none text-cream">Regras dos pedidos</h3>
      <p className="mt-3 max-w-[60ch] text-[0.9rem] leading-relaxed text-cream/55">
        As horas sugeridas no site saem sempre do horário publicado. Aqui define-se o resto: quantas pessoas
        se podem pedir de uma vez, de quanto em quanto tempo, e com que antecedência. A confirmação final é
        sempre da casa, por telefone.
      </p>

      {loading || !value ? (
        <p className="mt-6 text-[0.9rem] text-cream/40">A carregar regras…</p>
      ) : (
        <div className="mt-6 space-y-5">
          <label className="flex items-center gap-3 text-[0.92rem] text-cream/80">
            <input
              type="checkbox"
              checked={value.enabled}
              onChange={(event) => update({ ...value, enabled: event.target.checked })}
              className="h-4 w-4 accent-[#d8a24a]"
            />
            Aceitar pedidos de mesa pelo site
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Máximo de pessoas por pedido" hint="Acima disto, o site sugere telefone.">
              <Input
                type="number"
                value={String(value.maxPeople)}
                onChange={(next) => update({ ...value, maxPeople: Number(next) || 1 })}
              />
            </Field>
            <Field label="Intervalo entre horas (minutos)">
              <Input
                type="number"
                value={String(value.slotMinutes)}
                onChange={(next) => update({ ...value, slotMinutes: Number(next) || 30 })}
              />
            </Field>
            <Field
              label="Fechar pedidos antes do fecho (minutos)"
              hint="Conta a partir da hora de fecho publicada."
            >
              <Input
                type="number"
                value={String(value.lastSeatingBeforeClose)}
                onChange={(next) => update({ ...value, lastSeatingBeforeClose: Number(next) || 0 })}
              />
            </Field>
            <Field label="Antecedência mínima (horas)" hint="Para pedidos no próprio dia.">
              <Input
                type="number"
                value={String(value.minLeadHours)}
                onChange={(next) => update({ ...value, minLeadHours: Number(next) || 0 })}
              />
            </Field>
            <Field label="Dias à frente que se aceitam pedidos">
              <Input
                type="number"
                value={String(value.horizonDays)}
                onChange={(next) => update({ ...value, horizonDays: Number(next) || 1 })}
              />
            </Field>
          </div>

          <Field label="Frase depois de enviar" hint="Aparece ao cliente com a referência do pedido.">
            <Textarea
              rows={3}
              value={value.confirmation}
              onChange={(next) => update({ ...value, confirmation: next })}
            />
          </Field>
        </div>
      )}

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </Card>
  );
}
