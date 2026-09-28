import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { defaultContent } from "./src/content/defaults";
import { pageDescription, pageTitle, restaurantSchema } from "./src/lib/seo";
import { HTML_LANG, LOCALES } from "./src/i18n/locales";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Pré-carrega o fotograma de abertura (o maior elemento visível da primeira
 * dobra). A URL vem dos dados — nunca é repetida à mão no index.html.
 */
function preloadHero(): Plugin {
  return {
    name: "preload-hero",
    transformIndexHtml() {
      return [
        {
          tag: "link",
          injectTo: "head",
          attrs: {
            rel: "preload",
            as: "image",
            href: defaultContent.hero.poster,
            imagesrcset: defaultContent.hero.posterSrcSet,
            imagesizes: "100vw",
            fetchpriority: "high",
          },
        },
      ];
    },
  };
}

/**
 * Separa o que muda do que não muda: react, animação e base de dados seguem
 * em blocos diferentes, para o browser os descarregar em paralelo e os manter
 * em cache entre visitas.
 */
function splitChunks(): Record<string, string[]> | ((id: string) => string | undefined) {
  return (id: string) => {
    const file = id.replace(/\\/g, "/");
    if (!file.includes("/node_modules/")) return;
    if (/node_modules\/(react|react-dom|scheduler)\//.test(file)) return "react";
    if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(file)) return "motion";
    if (/node_modules\/(gsap|lenis)\//.test(file)) return "anim";
    if (/node_modules\/@supabase\//.test(file)) return "supabase";
    return "vendor";
  };
}

/**
 * O endereço de cada página em cada língua.
 * O português é o endereço limpo; o inglês leva `?lang=en`. É essa a parelha
 * que os `<link rel="alternate" hreflang=…>` anunciam aos motores de busca.
 */
const pageUrl = (siteUrl: string, file: string, locale: (typeof LOCALES)[number]): string => {
  const base = `${siteUrl}/${file === "index.html" ? "" : file}`;
  return locale === "pt" ? base : `${base}?lang=${locale}`;
};

/**
 * Partilhas e dados estruturados já no HTML.
 * Quem não corre JavaScript (a maioria dos robots de partilhas e alguns
 * motores de busca) lê isto. Depois, no browser, o applySeo() atualiza tudo
 * com o conteúdo real da base de dados.
 */
function seoTags(siteUrl: string): Plugin {
  return {
    name: "seo-tags",
    transformIndexHtml(html, ctx) {
      const file = ctx.filename?.split("/").pop() ?? "index.html";
      // só o site público leva os marcadores de partilha e o schema
      const home = file === "index.html";

      const content = defaultContent;
      const title = home ? pageTitle(content) : `Privacidade, cookies e termos · ${content.contact.name}`;
      const description = home ? pageDescription(content) : defaultLegalDescription;
      const image = content.hero.poster;

      const meta: Record<string, string> = {
        "og:type": "website",
        "og:site_name": content.contact.name,
        "og:locale": "pt_PT",
        "og:locale:alternate": "en_GB",
        "og:title": title,
        "og:description": description,
        "og:image": image,
        "og:image:alt": `${content.contact.name} — ${content.contact.kind}`,
      };
      if (content.hero.posterWidth) meta["og:image:width"] = String(content.hero.posterWidth);
      if (content.hero.posterHeight) meta["og:image:height"] = String(content.hero.posterHeight);
      if (siteUrl) meta["og:url"] = siteUrl;

      const named: Record<string, string> = {
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": image,
      };

      type Tag = { tag: string; injectTo: "head"; attrs: Record<string, string>; children?: string };

      const tags: Tag[] = [
        // as duas versões do mesmo endereço, uma por língua (e a de origem)
        ...(siteUrl
          ? [
              ...LOCALES.map((locale) => ({
                tag: "link",
                injectTo: "head" as const,
                attrs: {
                  rel: "alternate",
                  hreflang: HTML_LANG[locale],
                  href: pageUrl(siteUrl, file, locale),
                },
              })),
              {
                tag: "link",
                injectTo: "head" as const,
                attrs: { rel: "alternate", hreflang: "x-default", href: pageUrl(siteUrl, file, "pt") },
              },
            ]
          : []),
        ...Object.entries(meta).map(([property, value]) => ({
          tag: "meta",
          injectTo: "head" as const,
          attrs: { property, content: value },
        })),
        ...Object.entries(named).map(([name, value]) => ({
          tag: "meta",
          injectTo: "head" as const,
          attrs: { name, content: value },
        })),
        ...(home
          ? [
              {
                tag: "script",
                injectTo: "head" as const,
                attrs: { type: "application/ld+json", id: "site-schema" },
                children: JSON.stringify(restaurantSchema(content, siteUrl)),
              },
            ]
          : []),
      ];

      if (siteUrl) {
        tags.unshift({
          tag: "link",
          injectTo: "head" as const,
          attrs: { rel: "canonical", href: pageUrl(siteUrl, file, "pt") },
        });
      }

      // o título e a descrição estáticos passam a seguir o conteúdo
      const attr = (value: string) => value.replace(/"/g, "&quot;");
      const patched = html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
        .replace(
          /<meta\s+name="description"[\s\S]*?\/>/,
          `<meta name="description" content="${attr(description)}" />`,
        );

      return { html: patched, tags };
    },
  };
}

const robotsTxt = (siteUrl: string) => `# Palheiro Velho · Esmoriz
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const defaultLegalDescription =
  "Como o Palheiro Velho trata os dados dos pedidos de mesa, que cookies usa e os termos de utilização do site.";

/** Uma página do sitemap, com uma entrada por língua e as ligações entre elas. */
const sitemapEntry = (
  siteUrl: string,
  file: string,
  today: string,
  changefreq: string,
  priority: string,
) => `  <url>
    <loc>${pageUrl(siteUrl, file, "pt")}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${LOCALES.map(
  (locale) =>
    `    <xhtml:link rel="alternate" hreflang="${HTML_LANG[locale]}" href="${pageUrl(siteUrl, file, locale)}" />`,
).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(siteUrl, file, "pt")}" />
  </url>`;

const sitemapXml = (
  siteUrl: string,
  today = new Date().toISOString().slice(0, 10),
) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntry(siteUrl, "index.html", today, "weekly", "1.0")}
${sitemapEntry(siteUrl, "legal.html", today, "yearly", "0.3")}
</urlset>
`;

/**
 * robots.txt e sitemap.xml gerados a partir de VITE_SITE_URL: ninguém tem de
 * os manter à mão nem se esquece de lhes mudar o endereço.
 */
function seoFiles(siteUrl: string): Plugin {
  return {
    name: "seo-files",
    buildStart() {
      if (!siteUrl) {
        this.warn(
          "VITE_SITE_URL não está definido: robots.txt e sitemap.xml vão com um endereço de exemplo. Defina o endereço real antes de publicar.",
        );
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(robotsTxt(siteUrl));
          return;
        }
        if (req.url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(sitemapXml(siteUrl));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt(siteUrl) });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml(siteUrl) });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `vite build --mode single` produz um único ficheiro (útil para enviar ou
  // abrir directamente). O build normal é o que vai para o ar.
  const single = mode === "single";
  const env = loadEnv(mode, process.cwd(), "VITE_");
  // endereço público do site: sem ele não há canonical, og:url nem sitemap
  const siteUrl = (env.VITE_SITE_URL ?? "").trim().replace(/\/+$/, "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      preloadHero(),
      seoTags(siteUrl),
      seoFiles(siteUrl),
      ...(single ? [viteSingleFile()] : []),
    ],
    // Caminhos relativos: o site tanto serve na raiz como num subdiretório.
    base: "./",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      // 0.0.0.0 expõe o servidor dentro de contentores / pré-visualizações remotas.
      host: true,
      port: 5173,
      // `true` aceita qualquer Host — necessário apenas em ambientes de preview
      // (contentores, túneis). Em produção o site é servido como ficheiro estático.
      allowedHosts: true,
    },
    build: {
      outDir: single ? "dist-single" : "dist",
      // num único ficheiro tudo vai dentro; em separado, só o que é muito pequeno
      assetsInlineLimit: single ? 1024 * 1024 : 2048,
      cssCodeSplit: !single,
      rollupOptions: single
        ? {}
        : {
            // o site e a página legal partilham os mesmos blocos (cache do browser)
            input: {
              main: path.resolve(__dirname, "index.html"),
              legal: path.resolve(__dirname, "legal.html"),
              notfound: path.resolve(__dirname, "404.html"),
            },
            output: {
              manualChunks: splitChunks(),
            },
          },
    },
  };
});
