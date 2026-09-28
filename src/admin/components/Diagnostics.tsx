import { useState } from "react";
import { Check, Loader2, RefreshCw, Stethoscope, TriangleAlert, X } from "lucide-react";
import { runDiagnostics, type Check as CheckResult, type CheckStatus } from "@/admin/lib/diagnostics";
import { Button } from "@/admin/components/ui";
import { cn } from "@/utils/cn";

const tone: Record<CheckStatus, string> = {
  ok: "text-foam",
  aviso: "text-sun",
  falha: "text-ember",
};

const icon = (status: CheckStatus) =>
  status === "ok" ? <Check size={13} /> : status === "aviso" ? <TriangleAlert size={13} /> : <X size={13} />;

/**
 * Verifica a ligação à base de dados e diz exatamente o que falta:
 * tabelas, bucket das fotografias, token para escrever e tempo real.
 */
export function DiagnosticsButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [checks, setChecks] = useState<CheckResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setChecks(null);
    try {
      setChecks(await runDiagnostics());
    } finally {
      setRunning(false);
    }
  };

  const openAndRun = () => {
    setOpen(true);
    void run();
  };

  return (
    <>
      <button
        type="button"
        onClick={openAndRun}
        className={cn(
          "label inline-flex items-center gap-2 text-cream/50 transition-colors hover:text-sun",
          className,
        )}
      >
        <Stethoscope size={13} /> diagnóstico
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[160] flex items-start justify-center overflow-y-auto bg-ink/85 p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl border border-cream/15 bg-char p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-[1.5rem] text-cream">Diagnóstico</h3>
              <Button variant="quiet" onClick={() => setOpen(false)}>
                fechar
              </Button>
            </div>

            {running || !checks ? (
              <p className="flex items-center gap-3 py-10 text-[0.92rem] text-cream/50">
                <Loader2 size={15} className="animate-spin" /> a verificar a ligação…
              </p>
            ) : (
              <>
                <ul className="mt-5 divide-y divide-cream/10">
                  {checks.map((check) => (
                    <li key={check.id} className="flex items-start gap-3 py-3">
                      <span className={cn("mt-0.5 shrink-0", tone[check.status])}>{icon(check.status)}</span>
                      <span className="min-w-0">
                        <span className="block text-[0.95rem] text-cream">{check.label}</span>
                        <span className="mt-0.5 block text-[0.85rem] leading-snug text-cream/50">
                          {check.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-cream/10 pt-4 text-[0.85rem] leading-relaxed text-cream/45">
                  Se algum ponto falhar: corra as migrações em{" "}
                  <span className="text-sand">supabase/migrations/</span> (0001, 0002 e 0003) e depois o{" "}
                  <span className="text-sand">supabase/seed.sql</span> no editor SQL do projeto.
                </p>

                <Button variant="ghost" className="mt-5" onClick={() => void run()} loading={running}>
                  <RefreshCw size={13} /> verificar outra vez
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
