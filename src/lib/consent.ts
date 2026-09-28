/**
 * Consentimento de cookies.
 *
 * Guarda-se apenas a escolha da pessoa — nunca dados de navegação. O que fica
 * no navegador é a decisão (e a data), o que chega para cumprir o RGPD sem
 * levantar dúvidas: quem não escolher, não leva cookies de medição.
 */
import { useSyncExternalStore } from "react";

export type Consent = {
  /** Medição de audiência: quantas pessoas visitam e que páginas veem. */
  analytics: boolean;
  /** Publicidade e redes sociais. Hoje o site não usa nada disto. */
  marketing: boolean;
  /** Quando a escolha foi feita. */
  at: string;
};

export type ConsentState = { consent: Consent | null; open: boolean };

/** Chave no navegador. Mudar a versão volta a perguntar a toda a gente. */
const KEY = "palheiro-velho:consent";
const VERSION = 1;

type Stored = Consent & { version: number };

const read = (): Consent | null => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    // uma versão antiga (ou alterada à mão) não conta como escolha
    if (parsed?.version !== VERSION) return null;
    return {
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      at: typeof parsed.at === "string" ? parsed.at : new Date().toISOString(),
    };
  } catch {
    // modo privado, armazenamento cheio ou JSON estragado
    return null;
  }
};

const write = (consent: Consent) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...consent, version: VERSION }));
  } catch {
    // não se consegue guardar: a escolha vale para esta visita
  }
};

/** Estado antes de se ler o navegador (usado só fora do browser). */
const INITIAL: ConsentState = { consent: null, open: false };

let state: ConsentState | null = null;
const listeners = new Set<() => void>();

/** O estado é lido uma vez e fica em memória: a referência só muda quando muda a escolha. */
const current = (): ConsentState => {
  if (!state) state = { consent: typeof window === "undefined" ? null : read(), open: false };
  return state;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const snapshot = () => current();
const serverSnapshot = () => INITIAL;

/** Estado atual do consentimento, pronto a usar em qualquer componente. */
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** Guarda a escolha da pessoa. */
export function chooseConsent(choice: Pick<Consent, "analytics" | "marketing">): void {
  const consent: Consent = { ...choice, at: new Date().toISOString() };
  write(consent);
  state = { consent, open: false };
  listeners.forEach((listener) => listener());
}

/** Abre o painel de preferências (rodapé: “preferências de cookies”). */
export function openConsent(): void {
  state = { ...current(), open: true };
  listeners.forEach((listener) => listener());
}

/** Fecha o aviso sem mudar a escolha. */
export function closeConsent(): void {
  state = { ...current(), open: false };
  listeners.forEach((listener) => listener());
}

/** Já foi tomada alguma decisão? */
export const hasConsent = (value: ConsentState) => value.consent !== null;
