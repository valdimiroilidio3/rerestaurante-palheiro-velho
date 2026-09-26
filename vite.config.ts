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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadHero(), viteSingleFile()],
  // O build é um único ficheiro: caminhos relativos permitem abrir dist/index.html
  // diretamente (file://) ou servir a partir de qualquer subdiretório.
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
    outDir: "dist",
    assetsInlineLimit: 1024 * 1024,
  },
});
