import {
  ADMIN_HEADER,
  MEDIA_BUCKET,
  getAdminToken,
  supabase,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase";
import type { ImageAsset } from "@/content/types";

/** Lado maior das imagens submetidas: chega para ecrãs grandes e mantém o peso baixo. */
const MAX_EDGE = 1800;
const QUALITY = 0.82;

export type UploadedImage = ImageAsset & { bytes: number };

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "imagem";

/**
 * Reduz a fotografia no browser antes de a enviar.
 * Um telemóvel envia ficheiros de 5 a 10 MB; assim vão sempre abaixo de 1 MB.
 */
async function compress(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  const blob =
    webp ?? (await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY)));
  if (!blob) throw new Error("Não foi possível converter a imagem.");

  return { blob, width, height };
}

/** Envia uma fotografia para o Storage e regista-a na biblioteca. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const db = supabase;
  if (!db) throw new Error("Base de dados não configurada.");

  const { blob, width, height } = await compress(file);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const now = new Date();
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${slug(
    file.name.replace(/\.[^.]+$/, ""),
  )}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  // o envio passa pela API do Storage com o token de acesso no cabeçalho:
  // é ele que a política RLS valida (ver public.is_admin() na migração)
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": blob.type,
      "cache-control": "31536000",
      ...(getAdminToken() ? { [ADMIN_HEADER]: getAdminToken() as string } : {}),
    },
    body: blob,
  });
  if (!response.ok) {
    throw new Error(`Não foi possível enviar a imagem (${response.status}).`);
  }

  const { data } = db.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  const url = data.publicUrl;

  await db.from("media").insert({
    bucket: MEDIA_BUCKET,
    path,
    url,
    width,
    height,
    bytes: blob.size,
  });

  return { src: url, width, height, bytes: blob.size, alt: file.name.replace(/\.[^.]+$/, "") };
}

/** Remove o ficheiro do Storage e da biblioteca. */
export async function deleteUploadedImage(url: string): Promise<void> {
  const db = supabase;
  if (!db) return;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
  await fetch(`${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${path}`, {
    method: "DELETE",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...(getAdminToken() ? { [ADMIN_HEADER]: getAdminToken() as string } : {}),
    },
  });
  await db.from("media").delete().eq("path", path);
}

export type MediaItem = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  createdAt: string;
};

/** Biblioteca de ficheiros, do mais recente para o mais antigo. */
export async function listMedia(limit = 60): Promise<MediaItem[]> {
  const db = supabase;
  if (!db) return [];
  const { data } = await db
    .from("media")
    .select("id, url, width, height, bytes, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    url: String(row.url ?? ""),
    width: typeof row.width === "number" ? row.width : null,
    height: typeof row.height === "number" ? row.height : null,
    bytes: typeof row.bytes === "number" ? row.bytes : null,
    createdAt: String(row.created_at ?? ""),
  }));
}
