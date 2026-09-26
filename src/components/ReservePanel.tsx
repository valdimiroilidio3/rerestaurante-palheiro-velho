import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, Phone, Send, X } from "lucide-react";
import { CONTACT, MAPS_DIRECTIONS } from "@/data/site";
import { getLenis, reduced } from "@/lib/anim";
import { Btn, IgIcon } from "./primitives";

/**
 * Contact sheet rather than a booking engine.
 * The public pages found during research do not provide a confirmed booking flow,
 * so this only opens the published email address and never claims a reservation.
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
            aria-label="Fechar"
            onClick={onClose}
            className="absolute inset-0 bg-char/65 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Contactar o Palheiro Velho"
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
                <p className="label text-espresso/55">Canais de contacto públicos</p>
                <h3 className="mt-2 font-display text-[1.7rem] leading-none">Palheiro Velho</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar painel"
                className="flex h-11 w-11 items-center justify-center border border-espresso/20 transition-colors hover:bg-char hover:text-cream"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 px-6 py-7">
              <p className="max-w-[45ch] text-[0.98rem] leading-relaxed text-char/70">
                Para informações sobre carta, horário, eventos ou disponibilidade, use um dos canais
                publicados abaixo. Este conceito não processa reservas nem confirma pedidos.
              </p>
              {subject && (
                <p className="mt-6 border-l-2 border-sun bg-sand/60 px-4 py-3 text-[0.9rem] text-espresso/80">
                  Motivo de contacto: <strong className="font-semibold">{subject}</strong>
                </p>
              )}
              <div className="mt-8 grid gap-3">
                <Btn href={`tel:${CONTACT.phone}`} tone="dark" icon={<Phone size={15} />} className="w-full">
                  <span className="label">Ligar · {CONTACT.phoneLabel}</span>
                </Btn>
                <Btn
                  href={CONTACT.instagramUrl}
                  tone="dark"
                  variant="outline"
                  icon={<IgIcon size={15} />}
                  className="w-full"
                >
                  <span className="label">Abrir Instagram oficial</span>
                </Btn>
                <Btn
                  href={CONTACT.facebookUrl}
                  tone="dark"
                  variant="outline"
                  icon={<ExternalLink size={15} />}
                  className="w-full"
                >
                  <span className="label">Abrir Facebook oficial</span>
                </Btn>
                <Btn
                  href={MAPS_DIRECTIONS}
                  tone="dark"
                  variant="outline"
                  icon={<MapPin size={15} />}
                  className="w-full"
                >
                  <span className="label">Abrir direções</span>
                </Btn>
              </div>
              <div className="my-9 flex items-center gap-4">
                <span className="h-px flex-1 bg-espresso/15" />
                <span className="label text-espresso/40">ou preparar email</span>
                <span className="h-px flex-1 bg-espresso/15" />
              </div>
              <EmailDraft subject={subject} />
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

/**
 * Campos do rascunho de email.
 * Vive dentro do painel (montado apenas quando abre) para que o estado
 * recomece limpo em cada abertura — sem efeitos que escrevem estado.
 */
function EmailDraft({ subject }: { subject?: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => first.current?.focus({ preventScroll: true }), reduced() ? 0 : 420);
    return () => window.clearTimeout(t);
  }, []);

  const emailSubject = subject ? `Palheiro Velho — ${subject}` : "Palheiro Velho — contacto";
  const emailBody = `Olá Palheiro Velho,\n\n${name ? `O meu nome é ${name}.\n\n` : ""}${message || "Escreva a sua mensagem aqui."}\n\nEnviado a partir do conceito privado de website.`;
  const emailHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = emailHref;
      }}
      className="space-y-6"
    >
      <div>
        <label className="label text-espresso/55" htmlFor="ct-name">
          Nome (opcional)
        </label>
        <input
          id="ct-name"
          ref={first}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full border-0 border-b border-espresso/25 bg-transparent px-0 py-3 text-[1.05rem] outline-none transition-colors placeholder:text-espresso/35 focus:border-ocean"
          placeholder="O seu nome"
        />
      </div>
      <div>
        <label className="label text-espresso/55" htmlFor="ct-message">
          Mensagem
        </label>
        <textarea
          id="ct-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full resize-none border-0 border-b border-espresso/25 bg-transparent px-0 py-3 text-[1.02rem] outline-none transition-colors placeholder:text-espresso/35 focus:border-ocean"
          placeholder="Escreva a sua mensagem para a equipa."
        />
      </div>
      <button
        type="submit"
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden bg-char px-6 py-5 text-cream"
      >
        <span className="absolute inset-0 translate-y-[101%] bg-ocean transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
        <span className="label relative flex items-center gap-3">
          Abrir cliente de email <Send size={14} />
        </span>
      </button>
      <p className="text-center text-[0.76rem] leading-relaxed text-char/45">
        O botão abre o seu cliente de email com uma mensagem preparada para {CONTACT.email}; não envia dados
        para este site.
      </p>
    </form>
  );
}

function isBottom() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}
