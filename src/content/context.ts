import { createContext, useContext } from "react";
import type { SiteContent } from "@/content/types";
import { defaultContent } from "@/content/defaults";

export type SiteContentValue = {
  content: SiteContent;
  /** `true` quando o conteúdo vem da base de dados (e não do ficheiro de origem). */
  live: boolean;
  /** Último erro de leitura, se houver. O site continua a funcionar na mesma. */
  error: string | null;
};

export const SiteContentContext = createContext<SiteContentValue>({
  content: defaultContent,
  live: false,
  error: null,
});

/** Conteúdo atual do site (da base de dados quando estiver configurada). */
export function useSite(): SiteContentValue {
  return useContext(SiteContentContext);
}
