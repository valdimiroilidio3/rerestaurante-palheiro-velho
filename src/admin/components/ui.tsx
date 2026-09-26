import { useMemo, useState, type ReactNode } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { ToastContext } from "@/admin/lib/hooks";
import { cn } from "@/utils/cn";

type Toast = { id: number; text: string; tone: "ok" | "erro" };

/** Recipiente das notificações do painel. */
export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useMemo(
    () =>
      (text: string, tone: Toast["tone"] = "ok") => {
        const id = Date.now() + Math.random();
        setItems((prev) => [...prev, { id, text, tone }]);
        window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
      },
    [],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[200] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 border px-4 py-3 text-[0.9rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur",
              t.tone === "ok"
                ? "border-cream/20 bg-char/95 text-cream"
                : "border-ember/60 bg-char/95 text-sand",
            )}
          >
            {t.tone === "ok" ? (
              <Check size={16} className="mt-0.5 shrink-0 text-sun" />
            ) : (
              <X size={16} className="mt-0.5 shrink-0 text-ember" />
            )}
            <span className="leading-snug">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ————————————————————————————— blocos ————————————————————————————— */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border border-cream/12 bg-white/[0.03] p-5 sm:p-6", className)}>{children}</div>;
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-cream/12 pb-5">
      <div>
        <h2 className="font-display text-[1.9rem] leading-none text-cream">{title}</h2>
        {description && (
          <p className="mt-2 max-w-[60ch] text-[0.92rem] leading-relaxed text-cream/55">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label block text-cream/45">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint && <span className="mt-1.5 block text-[0.78rem] leading-snug text-cream/35">{hint}</span>}
    </label>
  );
}

const control =
  "w-full border border-cream/15 bg-char/60 px-3.5 py-2.5 text-[0.95rem] text-cream outline-none transition-colors placeholder:text-cream/25 focus:border-sun";

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={control}
    />
  );
}

export function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(control, "resize-y leading-relaxed")}
    />
  );
}

/* ————————————————————————————— botões ————————————————————————————— */

export function Button({
  children,
  onClick,
  type = "button",
  variant = "ghost",
  disabled,
  loading,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger" | "quiet";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const skin =
    variant === "primary"
      ? "bg-sun text-ink hover:bg-cream"
      : variant === "danger"
        ? "border border-ember/50 text-sand hover:bg-ember hover:text-cream"
        : variant === "quiet"
          ? "text-cream/55 hover:text-cream"
          : "border border-cream/20 text-cream/85 hover:border-cream/50";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "label inline-flex items-center justify-center gap-2 px-4 py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        skin,
        className,
      )}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function IconButton({
  onClick,
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center border border-cream/15 text-cream/60 transition-colors hover:border-cream/40 hover:text-cream disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/* ————————————————————————————— listas ————————————————————————————— */

export function ListRow({
  index,
  children,
  onUp,
  onDown,
  onRemove,
  canUp,
  canDown,
}: {
  index: number;
  children: ReactNode;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <div className="border border-cream/12 bg-char/40">
      <div className="flex items-center justify-between gap-3 border-b border-cream/10 px-4 py-2.5">
        <span className="label text-cream/35">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex items-center gap-1.5">
          <IconButton label="Subir" onClick={onUp} disabled={!canUp}>
            <span className="text-[0.9rem]">↑</span>
          </IconButton>
          <IconButton label="Descer" onClick={onDown} disabled={!canDown}>
            <span className="text-[0.9rem]">↓</span>
          </IconButton>
          <IconButton label="Remover" onClick={onRemove}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </IconButton>
        </span>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="label flex w-full items-center justify-center gap-2 border border-dashed border-cream/25 py-3.5 text-cream/60 transition-colors hover:border-sun hover:text-sun"
    >
      <Plus size={14} /> {label}
    </button>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="border border-dashed border-cream/15 px-4 py-8 text-center text-[0.9rem] text-cream/40">
      {children}
    </p>
  );
}

/* ————————————————————————————— barra de gravação ————————————————————————————— */

/**
 * Barra fixe com o estado das alterações. Só aparece quando há algo por
 * guardar (ou enquanto grava), para não roubar espaço ao conteúdo.
 */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-cream/12 bg-char/95 px-1 py-4 backdrop-blur transition-opacity",
        dirty || saving ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <p className="label text-cream/45">
        {saving ? "A gravar…" : dirty ? "Alterações por guardar" : "Tudo guardado"}
      </p>
      <span className="flex items-center gap-2">
        <Button variant="quiet" onClick={onReset} disabled={saving || !dirty}>
          Desfazer
        </Button>
        <Button variant="primary" onClick={onSave} loading={saving} disabled={!dirty}>
          Guardar alterações
        </Button>
      </span>
    </div>
  );
}

/** Indicador de ligação à base de dados. */
export function LiveDot({ live }: { live: boolean }) {
  return (
    <span className="label inline-flex items-center gap-2 text-cream/50">
      <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-sun" : "bg-cream/30")} />
      {live ? "ligado à base de dados" : "sem base de dados"}
    </span>
  );
}
