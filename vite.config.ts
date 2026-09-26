import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
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
