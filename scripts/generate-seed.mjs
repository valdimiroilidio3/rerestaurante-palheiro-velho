/**
 * Gera `supabase/seed.sql` a partir do conteúdo de origem (`src/content/defaults.ts`).
 *
 *   node scripts/generate-seed.mjs
 *
 * Correr sempre que o conteúdo de origem mudar, para que uma base de dados nova
 * arranque com os mesmos dados que o site mostra sem configuração.
 */
import { writeFile } from "node:fs/promises";
import { createServer } from "vite";

const q = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const arr = (list) => (list.length ? `array[${list.map(q).join(", ")}]::text[]` : `'{}'::text[]`);
const jsonb = (value) => `${q(JSON.stringify(value))}::jsonb`;

const asset = ({ src, width, height, alt } = {}) =>
  jsonb({ src: src ?? "", width: width ?? null, height: height ?? null, alt: alt ?? "" });

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });

try {
  const { defaultContent } = await vite.ssrLoadModule("/src/content/defaults.ts");
  const c = defaultContent;
  const lines = [];

  lines.push("-- gerado por scripts/generate-seed.mjs — não editar à mão");
  lines.push("-- carrega o conteúdo de origem do site para uma base de dados nova");
  lines.push("begin;");
  lines.push("");
  lines.push("delete from public.dishes;");
  lines.push("delete from public.menu_categories;");
  lines.push("delete from public.gallery_images;");
  lines.push("delete from public.instagram_posts;");
  lines.push("delete from public.intro_images;");
  lines.push("delete from public.intro_facts;");
  lines.push("delete from public.experience_panels;");
  lines.push("delete from public.events;");
  lines.push("delete from public.site_settings;");
  lines.push("");

  lines.push(
    "insert into public.site_settings (id, contact, brand, hero, ocean, nav, ticker, hashtags, event_perks, hours, reservations, concept_notice) values (",
  );
  lines.push("  'main',");
  lines.push(`  ${jsonb(c.contact)},`);
  lines.push(`  ${jsonb(c.brand)},`);
  lines.push(`  ${jsonb(c.hero)},`);
  lines.push(`  ${jsonb({ wide: c.ocean.wide, mid: c.ocean.mid, line: c.ocean.line, sub: c.ocean.sub })},`);
  lines.push(`  ${jsonb(c.nav)},`);
  lines.push(`  ${arr(c.ticker)},`);
  lines.push(`  ${arr(c.hashtags)},`);
  lines.push(`  ${arr(c.eventPerks)},`);
  lines.push(`  ${jsonb(c.hours)},`);
  lines.push(`  ${jsonb(c.reservations)},`);
  lines.push(`  ${q(c.conceptNotice)}`);
  lines.push(");");
  lines.push("");

  c.menu.forEach((cat, ci) => {
    lines.push(
      `insert into public.menu_categories (id, label, kicker, blurb, position) values (${q(cat.id)}, ${q(
        cat.label,
      )}, ${q(cat.kicker)}, ${q(cat.blurb)}, ${ci});`,
    );
    cat.items.forEach((d, di) => {
      lines.push(
        `insert into public.dishes (category_id, name, description, price, image, flag, allergens, position) values (${q(
          cat.id,
        )}, ${q(d.name)}, ${q(d.desc)}, ${q(d.price)}, ${asset(d.image)}, ${
          d.flag ? q(d.flag) : "null"
        }, ${arr(d.allergens ?? [])}, ${di});`,
      );
    });
  });
  lines.push("");

  c.gallery.forEach((g, i) =>
    lines.push(
      `insert into public.gallery_images (src, width, height, cap, loc, position) values (${q(
        g.image.src,
      )}, ${g.image.width ?? "null"}, ${g.image.height ?? "null"}, ${q(g.cap)}, ${q(g.loc)}, ${i});`,
    ),
  );
  lines.push("");

  c.instagram.forEach((p, i) =>
    lines.push(
      `insert into public.instagram_posts (src, width, height, cap, likes, span, url, kind, position) values (${q(
        p.image.src,
      )}, ${p.image.width ?? "null"}, ${p.image.height ?? "null"}, ${q(p.cap)}, ${q(p.likes)}, ${q(
        p.span,
      )}, ${p.url ? q(p.url) : "null"}, ${q(p.kind ?? "foto")}, ${i});`,
    ),
  );
  lines.push("");

  c.intro.images.forEach((im, i) =>
    lines.push(
      `insert into public.intro_images (src, width, height, alt, position) values (${q(im.src)}, ${
        im.width ?? "null"
      }, ${im.height ?? "null"}, ${q(im.alt)}, ${i});`,
    ),
  );
  lines.push("");

  c.intro.facts.forEach((f, i) =>
    lines.push(
      `insert into public.intro_facts (k, title, description, position) values (${q(f.k)}, ${q(f.t)}, ${q(
        f.d,
      )}, ${i});`,
    ),
  );
  lines.push("");

  c.experience.forEach((p, i) =>
    lines.push(
      `insert into public.experience_panels (id, label, idx, image, text, meta, position) values (${q(
        p.id,
      )}, ${q(p.label)}, ${q(p.idx)}, ${asset(p.image)}, ${q(p.text)}, ${q(p.meta)}, ${i});`,
    ),
  );
  lines.push("");

  c.events.forEach((e, i) =>
    lines.push(
      `insert into public.events (id, n, title, description, image, tag, position) values (${q(e.id)}, ${q(
        e.n,
      )}, ${q(e.title)}, ${q(e.desc)}, ${asset(e.image)}, ${q(e.tag)}, ${i});`,
    ),
  );
  lines.push("");
  lines.push("commit;");

  await writeFile(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n") + "\n", "utf8");
  console.log("supabase/seed.sql gerado ·", lines.length, "linhas");
} finally {
  await vite.close();
  process.exit(0);
}
