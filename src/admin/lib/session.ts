/**
 * Sessão do painel, guardada só neste separador.
 * Fechar o separador termina a sessão; não há "manter sessão" nem contas.
 */

const SESSION_KEY = "palheiro-velho:acesso";
/** Duração da sessão: 12 horas. */
const SESSION_TTL = 12 * 60 * 60 * 1000;

export type StoredSession = { token: string; at: number };

export function writeSession(token: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, at: Date.now() } satisfies StoredSession));
  } catch {
    /* modo privado sem armazenamento: a sessão dura enquanto a página estiver aberta */
  }
}

export function readSession(): StoredSession | null {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as StoredSession;
    if (!session?.token || Date.now() - session.at > SESSION_TTL) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* nada a fazer */
  }
}
