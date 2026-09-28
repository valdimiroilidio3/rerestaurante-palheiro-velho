import { supabase } from "@/lib/supabase";
import type {
  Brand,
  IdentifiedImage,
  Contact,
  EventItem,
  ExperiencePanel,
  GalleryItem,
  Hero,
  HoursEntry,
  LegalContent,
  InstagramItem,
  IntroFact,
  MenuCategory,
  NavItem,
  Ocean,
  ReservationSettings,
} from "@/content/types";

type Row = Record<string, unknown>;

const db = () => {
  if (!supabase) throw new Error("Base de dados não configurada.");
  return supabase;
};

/* ——————————————————————————————————————————————————————————
   Definições (uma linha única)
   —————————————————————————————————————————————————————————— */

export type SettingsPatch = {
  contact?: Contact;
  brand?: Brand;
  hero?: Hero;
  ocean?: Ocean;
  nav?: NavItem[];
  ticker?: string[];
  hashtags?: string[];
  eventPerks?: string[];
  hours?: HoursEntry[];
  reservations?: ReservationSettings;
  legal?: LegalContent;
};

/** O horário vive na linha única de definições. */
export async function saveHours(items: HoursEntry[]): Promise<void> {
  await saveSettings({ hours: items });
}

export async function saveSettings(patch: SettingsPatch): Promise<void> {
  const client = db();
  const row: Row = { id: "main", updated_at: new Date().toISOString() };
  if (patch.contact) row.contact = patch.contact;
  if (patch.brand) row.brand = patch.brand;
  if (patch.hero) row.hero = patch.hero;
  if (patch.ocean) row.ocean = patch.ocean;
  if (patch.nav) row.nav = patch.nav;
  if (patch.ticker) row.ticker = patch.ticker;
  if (patch.hashtags) row.hashtags = patch.hashtags;
  if (patch.eventPerks) row.event_perks = patch.eventPerks;
  if (patch.hours) row.hours = patch.hours;
  if (patch.reservations) row.reservations = patch.reservations;
  if (patch.legal) row.legal = patch.legal;

  const { error } = await client.from("site_settings").upsert(row);
  if (error) throw error;
}

/* ——————————————————————————————————————————————————————————
   Listas
   —————————————————————————————————————————————————————————— */

/**
 * Substitui o conteúdo de uma tabela pelo que está no painel:
 * apaga o que saiu, guarda o que ficou (as linhas novas ainda sem `id`
 * recebem um da base de dados).
 */
async function syncRows(table: string, rows: Row[]): Promise<void> {
  const client = db();
  const { data: existing, error: readError } = await client.from(table).select("id");
  if (readError) throw readError;

  const keep = new Set(rows.map((r) => String(r.id)).filter((id) => id && id !== "undefined"));
  const stale = ((existing ?? []) as Row[]).map((r) => String(r.id)).filter((id) => !keep.has(id));

  if (stale.length) {
    const { error } = await client.from(table).delete().in("id", stale);
    if (error) throw error;
  }

  const payload = rows.map(({ id, ...rest }) => (id && id !== "undefined" ? { id, ...rest } : rest));
  if (payload.length) {
    const { error } = await client.from(table).upsert(payload);
    if (error) throw error;
  }
}

const imageJson = (image: { src: string; width?: number; height?: number; alt?: string }) => ({
  src: image.src,
  width: image.width ?? null,
  height: image.height ?? null,
  alt: image.alt ?? "",
});

export async function saveMenu(menu: MenuCategory[]): Promise<void> {
  const client = db();
  const categories: Row[] = menu.map((c, i) => ({
    id: c.id,
    label: c.label,
    kicker: c.kicker,
    blurb: c.blurb,
    position: i,
  }));

  const staleCategories = categories.map((c) => String(c.id));
  const { data: existingCategories } = await client.from("menu_categories").select("id");
  const orphanCategories = ((existingCategories ?? []) as Row[])
    .map((r) => String(r.id))
    .filter((id) => !staleCategories.includes(id));
  if (orphanCategories.length) {
    await client.from("dishes").delete().in("category_id", orphanCategories);
  }

  await syncRows("menu_categories", categories);

  const dishes: Row[] = menu.flatMap((c) =>
    c.items.map((d, i) => ({
      id: d.id,
      category_id: c.id,
      name: d.name,
      description: d.desc,
      price: d.price,
      image: imageJson(d.image),
      flag: d.flag ?? null,
      allergens: d.allergens ?? [],
      position: i,
    })),
  );
  await syncRows("dishes", dishes);
}

export async function saveGallery(items: GalleryItem[]): Promise<void> {
  await syncRows(
    "gallery_images",
    items.map((g, i) => ({
      id: g.id,
      src: g.image.src,
      width: g.image.width ?? null,
      height: g.image.height ?? null,
      cap: g.cap,
      loc: g.loc,
      position: i,
    })),
  );
}

export async function saveInstagram(items: InstagramItem[]): Promise<void> {
  await syncRows(
    "instagram_posts",
    items.map((p, i) => ({
      id: p.id,
      src: p.image.src,
      width: p.image.width ?? null,
      height: p.image.height ?? null,
      cap: p.cap,
      likes: p.likes,
      span: p.span,
      url: p.url?.trim() || null,
      kind: p.kind ?? "foto",
      position: i,
    })),
  );
}

export async function saveExperience(items: ExperiencePanel[]): Promise<void> {
  await syncRows(
    "experience_panels",
    items.map((p, i) => ({
      id: p.id,
      label: p.label,
      idx: p.idx,
      image: imageJson(p.image),
      text: p.text,
      meta: p.meta,
      position: i,
    })),
  );
}

export async function saveEvents(items: EventItem[]): Promise<void> {
  await syncRows(
    "events",
    items.map((e, i) => ({
      id: e.id,
      n: e.n,
      title: e.title,
      description: e.desc,
      image: imageJson(e.image),
      tag: e.tag,
      position: i,
    })),
  );
}

export async function saveIntro(images: IdentifiedImage[], facts: IntroFact[]): Promise<void> {
  await syncRows(
    "intro_images",
    images.map((im, i) => ({
      id: im.id,
      src: im.src,
      width: im.width ?? null,
      height: im.height ?? null,
      alt: im.alt,
      position: i,
    })),
  );
  await syncRows(
    "intro_facts",
    facts.map((f, i) => ({
      id: f.id,
      k: f.k,
      title: f.t,
      description: f.d,
      position: i,
    })),
  );
}
