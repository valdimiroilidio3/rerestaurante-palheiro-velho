import { useEffect, useRef, useState } from "react";
import { Check, Copy, ImageUp, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { deleteUploadedImage, listMedia, uploadImages, type MediaItem } from "@/admin/lib/uploads";
import { useToast } from "@/admin/lib/hooks";
import { Button, SectionHeader } from "@/admin/components/ui";
import { cn } from "@/utils/cn";

const size = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Biblioteca de fotografias.
 * É aqui que as fotos da casa entram no site: envia-se de uma vez, ficam
 * guardadas no Storage e depois escolhem-se nos separadores da carta, da
 * galeria, do Instagram e do espaço.
 */
export function FilesTab() {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = async () => {
    try {
      setItems(await listMedia(120));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível ler a biblioteca.", "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const list = await listMedia(120);
        if (alive) setItems(list);
      } catch {
        if (alive) toast("Não foi possível ler a biblioteca.", "erro");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [toast]);

  const send = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      toast("Escolha fotografias (jpg, png, webp, heic…).", "erro");
      return;
    }
    for (let i = 0; i < list.length; i += 1) {
      setBusy(`a enviar ${i + 1} de ${list.length}…`);
      try {
        await uploadImages([list[i]]);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Não foi possível enviar.", "erro");
        break;
      }
    }
    setBusy(null);
    await load();
    toast(list.length === 1 ? "Fotografia enviada." : `${list.length} fotografias enviadas.`);
  };

  const remove = async (item: MediaItem) => {
    setRemoving(item.id);
    try {
      await deleteUploadedImage(item.url);
      setItems((current) => current.filter((i) => i.id !== item.id));
      toast("Fotografia removida.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível remover.", "erro");
    } finally {
      setRemoving(null);
    }
  };

  const copy = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      toast("Não foi possível copiar o endereço.", "erro");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Ficheiros"
        description="Envie as fotografias da casa para o Storage do Supabase. Ficam todas aqui e depois é só escolhê-las nos separadores da carta, da galeria, do Instagram e do espaço."
        action={
          <span className="label flex items-center gap-3 text-cream/40">
            {items.length} ficheiros
            <Button variant="quiet" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={13} className={loading || busy ? "animate-spin" : ""} /> atualizar
            </Button>
          </span>
        }
      />

      {/* zona de envio: largar várias fotografias de uma vez */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void send(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center transition-colors",
          over ? "border-sun bg-sun/5" : "border-cream/20 bg-char/40",
        )}
      >
        {busy ? (
          <>
            <Loader2 size={22} className="animate-spin text-sun" />
            <p className="label text-cream/70">{busy}</p>
          </>
        ) : (
          <>
            <ImageUp size={22} className="text-cream/40" />
            <p className="text-[0.95rem] text-cream/70">
              arraste as fotografias para aqui — pode ser mais do que uma
            </p>
            <Button variant="primary" onClick={() => input.current?.click()}>
              escolher fotografias
            </Button>
            <p className="label text-cream/30">
              são reduzidas e convertidas para webp antes de serem enviadas
            </p>
          </>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void send(e.target.files);
          e.target.value = "";
        }}
      />

      {loading ? (
        <p className="py-12 text-center text-[0.9rem] text-cream/40">a ler a biblioteca…</p>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-[0.9rem] text-cream/40">Ainda não há fotografias enviadas.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <figure
              key={item.id}
              className="group relative overflow-hidden border border-cream/10 bg-char/60"
            >
              <div className="overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <figcaption className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span className="label truncate text-cream/40">
                  {item.width && item.height ? `${item.width}×${item.height}` : ""} {size(item.bytes)}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void copy(item)}
                    aria-label="Copiar endereço"
                    className="flex h-7 w-7 items-center justify-center text-cream/45 transition-colors hover:text-sun"
                  >
                    {copied === item.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    disabled={removing === item.id}
                    aria-label="Remover fotografia"
                    className="flex h-7 w-7 items-center justify-center text-cream/45 transition-colors hover:text-ember disabled:opacity-40"
                  >
                    {removing === item.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
