import { useEffect, useRef, useState } from "react";
import { ImageUp, Link2, Loader2, Trash2 } from "lucide-react";
import type { ImageAsset } from "@/content/types";
import { uploadImage, listMedia, type MediaItem } from "@/admin/lib/uploads";
import { useToast } from "@/admin/lib/hooks";
import { cn } from "@/utils/cn";

const empty: ImageAsset = { src: "", width: undefined, height: undefined, alt: "" };

/**
 * Campo de imagem: arrastar e largar, escolher da biblioteca ou colar um URL.
 * A fotografia é reduzida no browser antes de ser enviada.
 */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  aspect = "16 / 10",
}: {
  label: string;
  hint?: string;
  value: ImageAsset;
  onChange: (value: ImageAsset) => void;
  aspect?: string;
}) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [library, setLibrary] = useState<MediaItem[] | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const asset = value ?? empty;

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("O ficheiro tem de ser uma imagem.", "erro");
      return;
    }
    setBusy(true);
    try {
      const uploaded = await uploadImage(file);
      onChange({
        src: uploaded.src,
        width: uploaded.width,
        height: uploaded.height,
        alt: asset.alt || uploaded.alt,
      });
      toast("Imagem enviada.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível enviar a imagem.", "erro");
    } finally {
      setBusy(false);
    }
  };

  const openLibrary = async () => {
    setLibrary([]);
    try {
      setLibrary(await listMedia());
    } catch {
      toast("Não foi possível abrir a biblioteca.", "erro");
      setLibrary(null);
    }
  };

  return (
    <div>
      <span className="label block text-cream/45">{label}</span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative mt-2 flex items-center justify-center overflow-hidden border bg-shell/10 transition-colors",
          over ? "border-sun" : "border-cream/20",
        )}
        style={{ aspectRatio: aspect }}
      >
        {asset.src ? (
          <img src={asset.src} alt={asset.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <p className="label px-4 text-center text-cream/30">arrastar fotografia ou clicar para escolher</p>
        )}

        <button
          type="button"
          onClick={() => input.current?.click()}
          className="absolute inset-0 cursor-pointer"
          aria-label={`Escolher imagem: ${label}`}
        />

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70">
            <Loader2 size={20} className="animate-spin text-sun" />
          </div>
        )}

        {asset.src && !busy && (
          <button
            type="button"
            onClick={() => onChange({ ...empty, alt: asset.alt })}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center bg-ink/80 text-cream/70 transition-colors hover:bg-ember hover:text-cream"
            aria-label="Remover imagem"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="label inline-flex items-center gap-2 text-cream/55 transition-colors hover:text-sun"
        >
          <ImageUp size={13} /> {asset.src ? "substituir" : "enviar"}
        </button>
        <button
          type="button"
          onClick={() => void openLibrary()}
          className="label inline-flex items-center gap-2 text-cream/55 transition-colors hover:text-sun"
        >
          biblioteca
        </button>
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="label inline-flex items-center gap-2 text-cream/55 transition-colors hover:text-sun"
        >
          <Link2 size={13} /> url
        </button>
        {asset.width && asset.height && (
          <span className="label text-cream/25">
            {asset.width}×{asset.height}
          </span>
        )}
      </div>

      {showUrl && (
        <input
          value={asset.src}
          onChange={(e) => onChange({ ...asset, src: e.target.value.trim() })}
          placeholder="https://…"
          className="mt-2 w-full border border-cream/15 bg-char/60 px-3 py-2 text-[0.85rem] text-cream outline-none focus:border-sun"
        />
      )}

      {hint && <p className="mt-1.5 text-[0.78rem] leading-snug text-cream/35">{hint}</p>}

      {library !== null && (
        <LibraryModal
          items={library}
          onClose={() => setLibrary(null)}
          onPick={(item) => {
            onChange({
              src: item.url,
              width: item.width ?? undefined,
              height: item.height ?? undefined,
              alt: asset.alt,
            });
            setLibrary(null);
          }}
        />
      )}
    </div>
  );
}

function LibraryModal({
  items,
  onPick,
  onClose,
}: {
  items: MediaItem[];
  onPick: (item: MediaItem) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/85 p-4" onClick={onClose}>
      <div
        className="max-h-[80svh] w-full max-w-4xl overflow-y-auto border border-cream/15 bg-char p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[1.4rem] text-cream">Biblioteca</h3>
          <button type="button" onClick={onClose} className="label text-cream/50 hover:text-cream">
            fechar
          </button>
        </div>
        {items.length === 0 ? (
          <p className="py-10 text-center text-[0.9rem] text-cream/40">Ainda não há ficheiros enviados.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPick(item)}
                className="group relative overflow-hidden border border-cream/10"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 bg-ink/80 px-2 py-1 text-left text-[0.7rem] text-cream/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {item.width && item.height ? `${item.width}×${item.height}` : "imagem"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
