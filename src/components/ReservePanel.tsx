import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, ExternalLink, Mail, MapPin, Phone, Send, X } from "lucide-react";
import { useSite } from "@/content/context";
import { mapsUrls, type Reservation, type ReservationDraft } from "@/content/types";
import { getLenis, reduced } from "@/lib/anim";
import {
  dayIdOf,
  firstOpenDay,
  formatDay,
  isoDay,
  reservationWindow,
  slotsForDay,
  validateReservation,
  type ReservationErrors,
} from "@/lib/reservations";
import { reservationRequestsEnabled, submitReservation } from "@/lib/reservation-requests";
import { dayIdOfDate, rangesForDay } from "@/lib/hours-status";
import { cn } from "@/utils/cn";
import { Btn, IgIcon } from "./primitives";
import { useLocale, useUi } from "@/i18n/context";
import { fill } from "@/i18n/ui";

/**
 * Painel de contacto e pedidos de mesa.
 *
 * O pedido é gravado na base de dados e a casa confirma por telefone — por
 * isso o formulário diz sempre que a confirmação chega por telefone e nunca
 * dá a mesa por garantida.
 */
export function ReservePanel({
  open,
  subject,
  onClose,
}: {
  open: boolean;
  subject?: string;
  onClose: () => void;
}) {
  const { contact: CONTACT } = useSite().content;
  const ui = useUi();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced() ? 0 : 0.3 }}
        >
          <motion.button
            aria-label={ui["common.close"]}
            onClick={onClose}
            className="absolute inset-0 bg-char/65 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={ui["reserve.title"]}
            initial={
              reduced() ? { opacity: 0 } : { y: isBottom() ? "100%" : "0%", x: isBottom() ? 0 : "100%" }
            }
            animate={isBottom() ? { y: 0 } : { x: 0 }}
            exit={isBottom() ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative flex h-full w-full flex-col overflow-y-auto bg-cream text-char sm:max-w-[520px]"
            style={{ maxHeight: "100svh" }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-espresso/15 bg-cream/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="label text-espresso/55">{ui["reserve.eyebrow"]}</p>
                <h3 className="mt-2 font-display text-[1.7rem] leading-none">Palheiro Velho</h3>
              </div>
              <button
                onClick={onClose}
                aria-label={ui["common.close"]}
                className="flex h-11 w-11 items-center justify-center border border-espresso/20 transition-colors hover:bg-char hover:text-cream"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-6 py-7">
              <RequestForm subject={subject} />
            </div>

            <div className="border-t border-espresso/15 bg-sand/60 px-6 py-5">
              <p className="label flex flex-wrap items-center gap-x-4 gap-y-2 text-espresso/55">
                <span className="flex items-center gap-2">
                  <Mail size={12} /> {CONTACT.email}
                </span>
                <span>{CONTACT.locality}</span>
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ————————————————————————————— pedido de mesa ————————————————————————————— */

type Step = "form" | "a enviar" | "enviado" | "erro";

/**
 * Formulário de pedido.
 *
 * Vive dentro do painel (montado apenas quando abre) para que o estado
 * recomece limpo em cada abertura — sem efeitos que escrevem estado.
 */
function RequestForm({ subject }: { subject?: string }) {
  const { contact: CONTACT, hours, reservations } = useSite().content;
  const { locale } = useLocale();
  const ui = useUi();
  const online = reservationRequestsEnabled();
  const accepts = reservations.enabled && online;

  const now = useMemo(() => new Date(), []);
  const range = useMemo(() => reservationWindow(reservations, now), [reservations, now]);
  const suggested = useMemo(() => firstOpenDay(hours, reservations, now), [hours, reservations, now]);

  const [draft, setDraft] = useState<ReservationDraft>({
    name: "",
    phone: "",
    email: "",
    day: suggested,
    time: "",
    people: 2,
    notes: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [step, setStep] = useState<Step>("form");
  const [failure, setFailure] = useState("");
  const [sent, setSent] = useState<Reservation | null>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => first.current?.focus({ preventScroll: true }), reduced() ? 0 : 420);
    return () => window.clearTimeout(t);
  }, []);

  const slots = useMemo(() => {
    const dayId = dayIdOf(draft.day);
    return dayId ? slotsForDay(hours, dayId, reservations) : [];
  }, [hours, draft.day, reservations]);

  /**
   * Atalhos “hoje” e “amanhã”: só aparecem quando a casa abre nesse dia e o
   * pedido ainda vai a horas (dentro do horizonte que a casa definiu).
   */
  const quickDays = useMemo(() => {
    const shortcuts: { iso: string; label: string }[] = [];
    [0, 1].forEach((offset) => {
      const date = new Date(now);
      date.setDate(date.getDate() + offset);
      const iso = isoDay(date);
      const dayId = dayIdOf(iso);
      if (!dayId || iso < range.min || iso > range.max) return;
      if (slotsForDay(hours, dayId, reservations).length === 0) return;
      shortcuts.push({ iso, label: offset === 0 ? ui["reserve.today"] : ui["reserve.tomorrow"] });
    });
    return shortcuts;
  }, [hours, now, range.max, range.min, reservations, ui]);

  /** Os serviços de hoje, para quem está a escolher a hora. */
  const todayRanges = useMemo(() => rangesForDay(hours, dayIdOfDate(now)), [hours, now]);

  const set = <K extends keyof ReservationDraft>(key: K, value: ReservationDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, geral: undefined }));
  };

  /** Ao mudar o dia, a hora escolhida deixa de valer. */
  const setDay = (value: string) => {
    const dayId = dayIdOf(value);
    const next = dayId ? slotsForDay(hours, dayId, reservations) : [];
    setDraft((current) => ({
      ...current,
      day: value,
      time: next.includes(current.time) ? current.time : "",
    }));
    setErrors((current) => ({ ...current, day: undefined, time: undefined, geral: undefined }));
  };

  if (step === "enviado" && sent) return <Confirmation reservation={sent} />;

  if (!accepts) return <ContactOnly subject={subject} online={online} />;

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        // o campo "empresa" está escondido das pessoas: quem o preencher é robô
        if (honeypot) return;
        const found = validateReservation(draft, hours, reservations, now, locale);
        setErrors(found);
        if (Object.keys(found).length) return;

        setStep("a enviar");
        setFailure("");
        try {
          const saved = await submitReservation({
            ...draft,
            notes: subject ? `${ui["reserve.subject"]}: ${subject}\n${draft.notes}`.trim() : draft.notes,
          });
          setSent(saved);
          setStep("enviado");
        } catch (err) {
          setStep("erro");
          setFailure(err instanceof Error ? err.message : ui["error.send"]);
        }
      }}
      className="space-y-6"
    >
      <p className="max-w-[45ch] text-[0.98rem] leading-relaxed text-char/70">{ui["reserve.intro"]}</p>

      {subject && (
        <p className="border-l-2 border-sun bg-sand/60 px-4 py-3 text-[0.9rem] text-espresso/80">
          {ui["reserve.subject"]}: <strong className="font-semibold">{subject}</strong>
        </p>
      )}

      <Field label={ui["reserve.name"]} error={errors.name} htmlFor="rs-name">
        <input
          id="rs-name"
          ref={first}
          value={draft.name}
          onChange={(event) => set("name", event.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className={inputClass(Boolean(errors.name))}
          placeholder={ui["reserve.namePlaceholder"]}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={ui["reserve.phone"]} error={errors.phone} htmlFor="rs-phone">
          <input
            id="rs-phone"
            type="tel"
            inputMode="tel"
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            className={inputClass(Boolean(errors.phone))}
            placeholder={ui["reserve.phonePlaceholder"]}
          />
        </Field>

        <Field label={ui["reserve.email"]} error={errors.email} htmlFor="rs-email">
          <input
            id="rs-email"
            type="email"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={inputClass(Boolean(errors.email))}
            placeholder={ui["reserve.emailPlaceholder"]}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label={ui["reserve.day"]} error={errors.day} htmlFor="rs-day">
          <input
            id="rs-day"
            type="date"
            value={draft.day}
            min={range.min}
            max={range.max}
            onChange={(event) => setDay(event.target.value)}
            aria-invalid={Boolean(errors.day)}
            className={inputClass(Boolean(errors.day))}
          />
          {/* quem quer mesa hoje ou amanhã não precisa de abrir o calendário */}
          {quickDays.length > 0 && (
            <span className="mt-2 flex flex-wrap gap-2">
              {quickDays.map((shortcut) => (
                <button
                  key={shortcut.iso}
                  type="button"
                  onClick={() => setDay(shortcut.iso)}
                  aria-pressed={draft.day === shortcut.iso}
                  className={cn(
                    "label border px-3 py-1.5 transition-colors",
                    draft.day === shortcut.iso
                      ? "border-espresso/70 text-char"
                      : "border-espresso/20 text-espresso/60 hover:border-espresso/45 hover:text-char",
                  )}
                >
                  {shortcut.label}
                </button>
              ))}
            </span>
          )}
        </Field>

        <Field label={ui["reserve.time"]} error={errors.time} htmlFor="rs-time">
          <select
            id="rs-time"
            value={draft.time}
            onChange={(event) => set("time", event.target.value)}
            aria-invalid={Boolean(errors.time)}
            className={inputClass(Boolean(errors.time))}
          >
            <option value="">{slots.length ? ui["reserve.chooseTime"] : ui["reserve.noTime"]}</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </Field>

        <Field label={ui["reserve.people"]} error={errors.people} htmlFor="rs-people">
          <select
            id="rs-people"
            value={draft.people}
            onChange={(event) => set("people", Number(event.target.value))}
            aria-invalid={Boolean(errors.people)}
            className={inputClass(Boolean(errors.people))}
          >
            {Array.from({ length: Math.max(1, reservations.maxPeople) }, (_, index) => index + 1).map(
              (count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ),
            )}
          </select>
        </Field>
      </div>

      {/* os serviços de hoje, tal como a casa os publicou */}
      <p className="label -mt-2 text-espresso/50">
        {todayRanges.length > 0
          ? fill(ui["reserve.todayHours"], {
              ranges: todayRanges.map((range) => `${range.open}—${range.close}`).join(" · "),
            })
          : ui["reserve.todayClosed"]}
      </p>

      <Field label={ui["reserve.notes"]} error={errors.notes} htmlFor="rs-notes">
        <textarea
          id="rs-notes"
          rows={3}
          value={draft.notes}
          onChange={(event) => set("notes", event.target.value)}
          className={`${inputClass(Boolean(errors.notes))} resize-none`}
          placeholder={ui["reserve.notesPlaceholder"]}
        />
      </Field>

      {/* armadilha para robots: escondida das pessoas, irrelevante se preenchida */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="rs-company">{ui["reserve.company"]}</label>
        <input
          id="rs-company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {errors.geral && (
        <p role="alert" className="text-[0.85rem] text-ember">
          {errors.geral}
        </p>
      )}

      <button
        type="submit"
        disabled={step === "a enviar"}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden bg-char px-6 py-5 text-cream disabled:opacity-70"
      >
        <span className="absolute inset-0 translate-y-[101%] bg-ocean transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
        <span className="label relative flex items-center gap-3">
          {step === "a enviar" ? "A enviar…" : "Pedir mesa"} <Send size={14} />
        </span>
      </button>

      {step === "erro" && failure && (
        <div
          role="alert"
          className="border-l-2 border-ember bg-ember/5 px-4 py-3 text-[0.88rem] leading-relaxed text-espresso/80"
        >
          <p>{failure}</p>
          <p className="mt-2">
            {ui["error.callInstead"]}{" "}
            <a className="underline underline-offset-4" href={`tel:${CONTACT.phone}`}>
              {CONTACT.phoneLabel}
            </a>
            .
          </p>
        </div>
      )}

      <p className="text-center text-[0.76rem] leading-relaxed text-char/45">{ui["reserve.disclaimer"]}</p>
    </form>
  );
}

/* ————————————————————————————— confirmação ————————————————————————————— */

function Confirmation({ reservation }: { reservation: Reservation }) {
  const { contact: CONTACT, reservations } = useSite().content;
  const { t, locale } = useLocale();
  const ui = useUi();

  return (
    <div role="status" className="space-y-7">
      <div className="border-l-2 border-sun bg-sand/60 px-5 py-4">
        <p className="label text-espresso/55">{ui["reserve.registered"]}</p>
        <p className="mt-2 font-display text-[2.1rem] leading-none">{reservation.code}</p>
      </div>

      <dl className="space-y-3 text-[0.95rem]">
        <Row label={ui["reserve.dayLabel"]} value={formatDay(reservation.day, locale)} />
        <Row label={ui["reserve.timeLabel"]} value={reservation.time} />
        <Row
          label={ui["reserve.peopleLabel"]}
          value={`${reservation.people} ${
            reservation.people === 1 ? ui["common.person"] : ui["common.people"]
          }`}
        />
        <Row label={ui["reserve.nameLabel"]} value={reservation.name} />
      </dl>

      <p className="text-[0.95rem] leading-relaxed text-char/70">{t(reservations.confirmation)}</p>

      <div className="grid gap-3">
        <Btn href={`tel:${CONTACT.phone}`} tone="dark" icon={<Phone size={15} />} className="w-full">
          <span className="label">{fill(ui["reserve.callLabel"], { phone: CONTACT.phoneLabel })}</span>
        </Btn>
      </div>

      <p className="text-center text-[0.76rem] leading-relaxed text-char/45">
        {fill(ui["reserve.keepCode"], { code: reservation.code })}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-espresso/15 pb-2">
      <dt className="label text-espresso/50">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

/* ————————————————————————————— só contactos ————————————————————————————— */

/**
 * Quando a casa não aceita pedidos pelo site (ou não há base de dados), o
 * painel não finge: mostra os canais publicados.
 */
function ContactOnly({ subject, online }: { subject?: string; online: boolean }) {
  const { contact: CONTACT } = useSite().content;
  const ui = useUi();
  const maps = mapsUrls(CONTACT.mapsQuery);

  return (
    <div className="space-y-6">
      <p className="max-w-[45ch] text-[0.98rem] leading-relaxed text-char/70">
        {ui["reserve.onlyContacts"]}
        {!online && ui["reserve.notLinked"]}
      </p>

      {subject && (
        <p className="border-l-2 border-sun bg-sand/60 px-4 py-3 text-[0.9rem] text-espresso/80">
          {ui["reserve.subject"]}: <strong className="font-semibold">{subject}</strong>
        </p>
      )}

      <div className="grid gap-3">
        <Btn href={`tel:${CONTACT.phone}`} tone="dark" icon={<Phone size={15} />} className="w-full">
          <span className="label">{fill(ui["reserve.callLabel"], { phone: CONTACT.phoneLabel })}</span>
        </Btn>
        <Btn
          href={CONTACT.instagramUrl}
          tone="dark"
          variant="outline"
          icon={<IgIcon size={15} />}
          className="w-full"
        >
          <span className="label">{ui["reserve.instagramCta"]}</span>
        </Btn>
        <Btn
          href={CONTACT.facebookUrl}
          tone="dark"
          variant="outline"
          icon={<ExternalLink size={15} />}
          className="w-full"
        >
          <span className="label">{ui["reserve.facebookCta"]}</span>
        </Btn>
        <Btn
          href={maps.directions}
          tone="dark"
          variant="outline"
          icon={<MapPin size={15} />}
          className="w-full"
        >
          <span className="label">{ui["reserve.directionsCta"]}</span>
        </Btn>
      </div>

      <p className="flex items-start gap-2 text-[0.85rem] leading-relaxed text-char/60">
        <CalendarCheck size={16} className="mt-0.5 shrink-0" />
        {ui["reserve.emailFallback"]}{" "}
        <a className="underline underline-offset-4" href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>{" "}
        {ui["reserve.emailDetails"]}
      </p>
    </div>
  );
}

/* ————————————————————————————— pequenas peças ————————————————————————————— */

const inputClass = (invalid: boolean) =>
  [
    "mt-2 w-full border-0 border-b bg-transparent px-0 py-3 text-[1.05rem] outline-none transition-colors",
    "placeholder:text-espresso/35 focus:border-ocean",
    invalid ? "border-ember" : "border-espresso/25",
  ].join(" ");

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="label text-espresso/55" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 text-[0.8rem] text-ember">
          {error}
        </p>
      )}
    </div>
  );
}

function isBottom() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}
