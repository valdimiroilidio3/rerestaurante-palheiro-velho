import type { ImageAsset } from "@/content/types";

/** URLs servidas pelo Storage do Supabase aceitam transformações no próprio pedido. */
const STORAGE_URL = /\/storage\/v1\/object\/(?:public|sign)\//;

/** Larguras pedidas ao Storage (quem não tiver transformações ativas recebe o original). */
export const STORAGE_WIDTHS = [400, 640, 828, 1080, 1440, 1920];

/**
 * Gera as variantes de uma imagem alojada no Storage.
 * Devolve `undefined` para imagens externas (Pexels e afins), que já trazem os
 * seus próprios parâmetros.
 */
export function storageVariants(src?: string, widths: number[] = STORAGE_WIDTHS): string | undefined {
  if (!src || !STORAGE_URL.test(src)) return undefined;
  return widths.map((w) => `${src}${src.includes("?") ? "&" : "?"}width=${w} ${w}w`).join(", ");
}

/** Normaliza seja o que vier da base de dados num `ImageAsset` utilizável. */
export function toImageAsset(value: unknown, alt?: string, fallback: Partial<ImageAsset> = {}): ImageAsset {
  const raw =
    typeof value === "string"
      ? { src: value }
      : ((value ?? {}) as { src?: string; width?: number; height?: number; alt?: string; srcSet?: string });

  const src = raw.src ?? "";
  return {
    src,
    srcSet: raw.srcSet ?? storageVariants(src),
    width: raw.width ?? fallback.width,
    height: raw.height ?? fallback.height,
    alt: raw.alt ?? alt ?? fallback.alt,
  };
}
