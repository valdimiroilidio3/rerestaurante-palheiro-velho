import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { chooseConsent, closeConsent, useConsent } from "@/lib/consent";
import { reduced } from "@/lib/anim";
import { analyticsEnabled } from "@/lib/analytics";

/**
 * Aviso de cookies.
 *
 * Aparece enquanto não houver uma escolha — e volta a aparecer, com as
 * escolhas atuais assinaladas, sempre que alguém abrir as preferências no
 * rodapé. Nada de medição é carregado antes de a pessoa aceitar.
 */
export function CookieBanner() {
  const { consent, open } = useConsent();
  const [choice, setChoice] = useState({ analytics: false, marketing: false });
  const [details, setDetails] = useState(false);

  const visible = consent === null || open;
  const current = consent ?? { analytics: false, marketing: false, at: "" };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Consentimento de cookies"
          initial={reduced() ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced() ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ duration: reduced() ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-[95] border border-espresso/20 bg-cream p-5 text-char shadow-[0_30px_80px_-40px_rgba(23,23,23,0.6)] sm:inset-x-auto sm:left-6 sm:max-w-[430px]"
        >
          <div className="flex items-start gap-3">
            <Cookie size={16} className="mt-0.5 shrink-0 text-espresso/60" aria-hidden />
            <div>
              <p className="label text-espresso/55">Cookies</p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-char/75">
                Usamos apenas o necessário para o site funcionar.
                {analyticsEnabled() && " Com a sua autorização, medimos as visitas de forma agregada."} Pode
                escolher agora e mudar de ideias quando quiser, no rodapé.
              </p>
              <a
                href="./legal.html#cookies"
                className="label mt-3 inline-block text-espresso/70 underline underline-offset-4 transition-colors hover:text-char"
              >
                ler a política de cookies
              </a>
            </div>
            {open && (
              <button
                onClick={closeConsent}
                aria-label="Fechar preferências de cookies"
                className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center border border-espresso/15 transition-colors hover:bg-char hover:text-cream"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {details && (
            <div className="mt-4 space-y-3 border-t border-espresso/15 pt-4">
              <Toggle
                label="Necessários"
                hint="Guardam a sua escolha de cookies e a sessão do painel. Não se podem desligar."
                checked
                disabled
                onChange={() => {}}
              />
              <Toggle
                label="Medição de audiência"
                hint={
                  analyticsEnabled()
                    ? "Estatísticas agregadas das visitas ao site."
                    : "Disponível quando a casa configurar um serviço de medição."
                }
                checked={choice.analytics}
                onChange={(next) => setChoice((state) => ({ ...state, analytics: next }))}
              />
              <Toggle
                label="Publicidade e redes"
                hint="O site não usa este tipo de cookies."
                checked={choice.marketing}
                onChange={(next) => setChoice((state) => ({ ...state, marketing: next }))}
              />
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => chooseConsent({ analytics: true, marketing: true })}
              className="label bg-char px-4 py-3 text-cream transition-colors hover:bg-espresso"
            >
              aceitar todos
            </button>
            <button
              type="button"
              onClick={() => chooseConsent({ analytics: false, marketing: false })}
              className="label border border-espresso/25 px-4 py-3 transition-colors hover:border-char"
            >
              só necessários
            </button>
            {details ? (
              <button
                type="button"
                onClick={() => chooseConsent({ analytics: choice.analytics, marketing: choice.marketing })}
                className="label px-4 py-3 text-espresso/70 underline underline-offset-4 transition-colors hover:text-char"
              >
                guardar escolha
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setChoice({ analytics: current.analytics, marketing: current.marketing });
                  setDetails(true);
                }}
                className="label px-4 py-3 text-espresso/70 underline underline-offset-4 transition-colors hover:text-char"
              >
                definir
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 text-[0.86rem]">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#171717]"
      />
      <span>
        <span className="label block text-espresso/70">{label}</span>
        <span className="mt-1 block leading-relaxed text-char/60">{hint}</span>
      </span>
    </label>
  );
}
