/**
 * Copia para `public/fonts` as caras das letras que o site usa.
 *
 * As letras são nossas (alojadas no próprio domínio) por duas razões: o
 * pedido ao Google atrasava o primeiro desenho da página e mandava dados
 * para fora antes de haver consentimento. Os ficheiros vêm dos pacotes
 * `@fontsource-variable/*` (licença SIL Open Font) e ficam no repositório,
 * por isso só é preciso correr isto quando se quiser atualizá-los:
 *
 *   npm run fonts
 */
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destino = join(root, "public", "fonts");
const require = createRequire(import.meta.url);

const FONTES = [
  [
    "@fontsource-variable/fraunces",
    "files/fraunces-latin-opsz-normal.woff2",
    "fraunces-latin-opsz-normal.woff2",
  ],
  [
    "@fontsource-variable/fraunces",
    "files/fraunces-latin-opsz-italic.woff2",
    "fraunces-latin-opsz-italic.woff2",
  ],
  [
    "@fontsource-variable/archivo",
    "files/archivo-latin-wght-normal.woff2",
    "archivo-latin-wght-normal.woff2",
  ],
  [
    "@fontsource-variable/jetbrains-mono",
    "files/jetbrains-mono-latin-wght-normal.woff2",
    "jetbrains-mono-latin-wght-normal.woff2",
  ],
];

mkdirSync(destino, { recursive: true });

for (const [pacote, origem, nome] of FONTES) {
  let caminho;
  try {
    caminho = join(dirname(require.resolve(`${pacote}/package.json`)), origem);
  } catch {
    console.error(`✗ falta ${pacote} — corre "npm install" primeiro.`);
    process.exit(1);
  }
  if (!existsSync(caminho)) {
    console.error(`✗ ${pacote} não traz ${origem} (versão diferente?).`);
    process.exit(1);
  }
  copyFileSync(caminho, join(destino, nome));
  console.log(`✓ ${nome}`);
}

console.log(`\n${FONTES.length} letras em public/fonts (declaradas em src/index.css).`);
