import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { defaultContent } from "./src/content/defaults";

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

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `vite build --mode single` produz um único ficheiro (útil para enviar ou
  // abrir directamente). O build normal é o que vai para o ar.
  const single = mode === "single";

  return {
    plugins: [react(), tailwindcss(), preloadHero(), ...(single ? [viteSingleFile()] : [])],
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
            output: {
              manualChunks: splitChunks(),
            },
          },
    },
  };
});
