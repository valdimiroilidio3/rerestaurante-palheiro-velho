import { storageVariants, toImageAsset } from "@/lib/images";
import { defaultContent } from "@/content/defaults";
import type {
  Brand,
  IdentifiedImage,
  Contact,
  Dish,
  EventItem,
  ExperiencePanel,
  GalleryItem,
  Hero,
  HoursEntry,
  InstagramItem,
  IntroFact,
  MenuCategory,
  NavItem,
  Ocean,
  SiteContent,
} from "@/content/types";
import { WEEK_DAYS, type DayId } from "@/content/types";

/** Uma linha da base de dados, sem tipo à partida. */
type Row = Record<string, unknown>;

const str = (r: Row, k: string, fallback = "") => (typeof r[k] === "string" ? (r[k] as string) : fallback);
const num = (r: Row, k: string) => (typeof r[k] === "number" ? (r[k] as number) : undefined);
const list = (r: Row, k: string) => (Array.isArray(r[k]) ? (r[k] as string[]) : undefined);
const json = <T>(r: Row, k: string) => (r[k] && typeof r[k] === "object" ? (r[k] as Partial<T>) : undefined);

const merge = <T>(base: T, patch?: Partial<T>): T => (patch ? { ...base, ...patch } : base);

/** Imagem guardada numa coluna jsonb (`{ src, width, height }`). */
const jsonImage = (r: Row, k: string, alt?: string) => toImageAsset(r[k], alt);

/**
 * O cliente da base de dados só é descarregado quando é preciso: sem
 * variáveis de ambiente ninguém paga o peso do SDK.
 */
const importSupabase = () => import("@/lib/supabase");
type SupabaseModule = Awaited<ReturnType<typeof importSupabase>>;

let dbModule: SupabaseModule | null = null;
const loadSupabase = async (): Promise<SupabaseModule> => (dbModule ??= await importSupabase());

/** As variáveis estão definidas? (sem carregar o cliente.) */
export const isSupabaseConfigured = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL?.trim() && import.meta.env.VITE_SUPABASE_ANON_KEY?.trim());

/* ——————————————————————————— leitura ——————————————————————————— */

/**
 * Lê todo o conteúdo do site. Corre no browser (chave anon), por isso as
 * políticas RLS têm de permitir leitura pública.
 */
export async function fetchSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured()) return defaultContent;
  const { supabase } = await loadSupabase();
  if (!supabase) return defaultContent;
  const db = supabase;

  const [settings, categories, dishes, gallery, instagram, introImages, facts, panels, events] =
    await Promise.all([
      db.from("site_settings").select("*").eq("id", "main").maybeSingle(),
      db.from("menu_categories").select("*").order("position", { ascending: true }),
      db.from("dishes").select("*").order("position", { ascending: true }),
      db.from("gallery_images").select("*").order("position", { ascending: true }),
      db.from("instagram_posts").select("*").order("position", { ascending: true }),
      db.from("intro_images").select("*").order("position", { ascending: true }),
      db.from("intro_facts").select("*").order("position", { ascending: true }),
      db.from("experience_panels").select("*").order("position", { ascending: true }),
      db.from("events").select("*").order("position", { ascending: true }),
    ]);

  const failed = [settings, categories, dishes, gallery, instagram, introImages, facts, panels, events].find(
    (r) => r.error,
  );
  if (failed?.error) throw failed.error;

  const s = (settings.data ?? {}) as Row;

  // o horário vem inteiro da base de dados; sem linhas, fica o de origem
  const hours: HoursEntry[] = (Array.isArray(s.hours) ? (s.hours as Row[]) : [])
    .map((h) => ({
      id: str(h, "id"),
      label: str(h, "label"),
      days: (Array.isArray(h.days) ? (h.days as string[]) : []).filter((d): d is DayId =>
        WEEK_DAYS.some((w) => w.id === d),
      ),
      open: str(h, "open"),
      close: str(h, "close"),
      note: str(h, "note") || undefined,
    }))
    .filter((h) => h.label);

  const contact = merge<Contact>(defaultContent.contact, json<Contact>(s, "contact"));
  const brand = merge<Brand>(defaultContent.brand, json<Brand>(s, "brand"));

  const heroPatch = json<Hero>(s, "hero");
  const heroBase = merge<Hero>(defaultContent.hero, heroPatch);
  const hero: Hero = {
    ...heroBase,
    posterImage: toImageAsset(heroBase.posterImage ?? heroBase.poster, ""),
    // o srcset acompanha sempre a URL guardada (Pexels ou Storage)
    posterSrcSet:
      storageVariants(heroBase.poster) ??
      (heroBase.poster === defaultContent.hero.poster ? defaultContent.hero.posterSrcSet : ""),
  };

  const oceanPatch = json<Ocean>(s, "ocean");
  const ocean: Ocean = oceanPatch
    ? {
        wide: toImageAsset(oceanPatch.wide, defaultContent.ocean.wide.alt),
        mid: toImageAsset(oceanPatch.mid, defaultContent.ocean.mid.alt),
        line: oceanPatch.line?.length ? oceanPatch.line : defaultContent.ocean.line,
        sub: oceanPatch.sub ?? defaultContent.ocean.sub,
      }
    : defaultContent.ocean;

  const dishRows = (dishes.data ?? []) as Row[];
  const menu: MenuCategory[] = ((categories.data ?? []) as Row[]).map((c) => {
    const id = str(c, "id");
    return {
      id,
      label: str(c, "label", id),
      kicker: str(c, "kicker"),
      blurb: str(c, "blurb"),
      items: dishRows
        .filter((d) => str(d, "category_id") === id)
        .map((d): Dish => ({
          id: str(d, "id"),
          name: str(d, "name", "Sem nome"),
          desc: str(d, "description"),
          price: str(d, "price"),
          image: jsonImage(d, "image", str(d, "name")),
          flag: str(d, "flag") || undefined,
        })),
    };
  });

  const galleryItems: GalleryItem[] = ((gallery.data ?? []) as Row[]).map((g) => ({
    id: str(g, "id"),
    cap: str(g, "cap"),
    loc: str(g, "loc"),
    image: {
      src: str(g, "src"),
      srcSet: toImageAsset({ src: str(g, "src") }).srcSet,
      width: num(g, "width"),
      height: num(g, "height"),
      alt: `${str(g, "cap")} — ${str(g, "loc")}`,
    },
  }));

  const instagramItems: InstagramItem[] = ((instagram.data ?? []) as Row[]).map((p) => ({
    id: str(p, "id"),
    cap: str(p, "cap"),
    likes: str(p, "likes"),
    span: str(p, "span"),
    url: str(p, "url") || undefined,
    kind: str(p, "kind") === "reel" ? "reel" : "foto",
    image: {
      src: str(p, "src"),
      srcSet: toImageAsset({ src: str(p, "src") }).srcSet,
      width: num(p, "width"),
      height: num(p, "height"),
      alt: str(p, "cap"),
    },
  }));

  const introImgs: IdentifiedImage[] = ((introImages.data ?? []) as Row[]).map((i) => ({
    id: str(i, "id"),
    src: str(i, "src"),
    srcSet: toImageAsset({ src: str(i, "src") }).srcSet,
    width: num(i, "width"),
    height: num(i, "height"),
    alt: str(i, "alt"),
  }));

  const introFactItems: IntroFact[] = ((facts.data ?? []) as Row[]).map((f) => ({
    id: str(f, "id"),
    k: str(f, "k"),
    t: str(f, "title"),
    d: str(f, "description"),
  }));

  const experienceItems: ExperiencePanel[] = ((panels.data ?? []) as Row[]).map((p) => ({
    id: str(p, "id"),
    label: str(p, "label"),
    idx: str(p, "idx"),
    text: str(p, "text"),
    meta: str(p, "meta"),
    image: jsonImage(p, "image", str(p, "label")),
  }));

  const eventItems: EventItem[] = ((events.data ?? []) as Row[]).map((e) => ({
    id: str(e, "id"),
    n: str(e, "n"),
    title: str(e, "title"),
    desc: str(e, "description"),
    tag: str(e, "tag"),
    image: jsonImage(e, "image", str(e, "title")),
  }));

  const nav = (list(s, "nav") as unknown as NavItem[] | undefined)?.length
    ? (list(s, "nav") as unknown as NavItem[])
    : defaultContent.nav;

  return {
    contact,
    brand,
    nav,
    hero,
    hours: hours.length ? hours : defaultContent.hours,
    intro: {
      images: introImgs.length ? introImgs : defaultContent.intro.images,
      facts: introFactItems.length ? introFactItems : defaultContent.intro.facts,
    },
    ticker: list(s, "ticker")?.length ? (list(s, "ticker") as string[]) : defaultContent.ticker,
    hashtags: list(s, "hashtags")?.length ? (list(s, "hashtags") as string[]) : defaultContent.hashtags,
    menu: menu.length ? menu : defaultContent.menu,
    ocean,
    experience: experienceItems.length ? experienceItems : defaultContent.experience,
    gallery: galleryItems.length ? galleryItems : defaultContent.gallery,
    instagram: instagramItems.length ? instagramItems : defaultContent.instagram,
    events: eventItems.length ? eventItems : defaultContent.events,
    eventPerks: list(s, "event_perks")?.length
      ? (list(s, "event_perks") as string[])
      : defaultContent.eventPerks,
    conceptNotice: str(s, "concept_notice") || defaultContent.conceptNotice,
  };
}

/* ——————————————————————————— tempo real ——————————————————————————— */

/**
 * Avisa sempre que algo muda na base de dados, para que qualquer pessoa com o
 * site aberto veja a alteração sem recarregar.
 */
export async function subscribeToContent(onChange: () => void): Promise<() => void> {
  if (!isSupabaseConfigured()) return () => {};
  const { supabase } = await loadSupabase();
  if (!supabase) return () => {};
  const db = supabase;
  const channel = db
    .channel("site-content")
    .on("postgres_changes", { event: "*", schema: "public" }, onChange);
  channel.subscribe();
  return () => {
    void db.removeChannel(channel);
  };
}
