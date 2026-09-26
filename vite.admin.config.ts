import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build do painel (`admin.html`).
 *
 * É separado do site porque o site é publicado como um único ficheiro e o
 * painel não precisa disso: aqui os recursos ficam em ficheiros próprios, o
 * que mantém o HTML do site leve e deixa o browser fazer cache do painel.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    // o site já escreveu o seu HTML: não limpar
    emptyOutDir: false,
    rollupOptions: {
      input: { admin: path.resolve(__dirname, "admin.html") },
      output: {
        entryFileNames: "admin-assets/[name]-[hash].js",
        chunkFileNames: "admin-assets/[name]-[hash].js",
        assetFileNames: "admin-assets/[name]-[hash][extname]",
      },
    },
  },
});
