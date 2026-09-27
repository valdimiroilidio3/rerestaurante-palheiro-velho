import type { ImageAsset } from "@/content/types";

/** Endereço público de um ficheiro no Storage do Supabase. */
const STORAGE_OBJECT = /\/storage\/v1\/object\/public\//;

/** Larguras pedidas ao Storage quando as transformações estão ativas. */
export const STORAGE_WIDTHS = [400, 640, 828, 1080, 1440, 1920];

/** Qualidade das variantes geradas pelo Storage. */
const VARIANT_QUALITY = 75;

/**
 * As fotografias enviadas pelo painel já vão comprimidas (máx. 1800 px, webp),
 * por isso servem-se bem como estão. As reduções do Storage são um extra:
 * ativam-se com `VITE_SUPABASE_TRANSFORM=1` e exigem as transformações de
 * imagem do projeto (não existem em todos os planos).
 */
const transformEnabled = import.meta.env.VITE_SUPABASE_TRANSFORM === "1";

/**
 * Gera as variantes de uma imagem alojada no Storage.
 * Devolve `undefined` para imagens externas (Pexels e afins), que já trazem os
 * seus próprios parâmetros, e quando as transformações não estão ativas.
 */
export function storageVariants(src?: string, widths: number[] = STORAGE_WIDTHS): string | undefined {
  if (!src || !STORAGE_OBJECT.test(src) || !transformEnabled) return undefined;
  const base = src.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  return widths.map((w) => `${base}?width=${w}&quality=${VARIANT_QUALITY} ${w}w`).join(", ");
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
