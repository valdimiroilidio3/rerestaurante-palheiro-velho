# Palheiro Velho — conceito de website

Conceito privado de website para o **Palheiro Velho**, bar de praia em Esmoriz (Ovar, Portugal).
Interface construída em React + Vite + Tailwind CSS, com animação GSAP/ScrollTrigger, scroll suave
(Lenis) e transições Framer Motion.

> ⚠️ **Conceito não aprovado para publicação.**
> Os dados (horários, contactos, carta) foram recolhidos de fontes públicas e **têm de ser validados
> com a marca** antes de qualquer publicação ou campanha. As fotografias são **temporárias**
> (Pexels) e não retratam o espaço — ver [Conteúdo e imagem](#conteúdo-e-imagem).

## Stack

| Camada    | Tecnologia                                        |
| --------- | ------------------------------------------------- |
| UI        | React 19 · TypeScript (strict) · Tailwind CSS 4   |
| Build     | Vite 7 · `vite-plugin-singlefile`                 |
| Animação  | GSAP + ScrollTrigger · Framer Motion · Lenis      |
| Ícones    | lucide-react                                      |
| Qualidade | ESLint 10 (flat config) · Prettier · `tsc` strict |

## Estrutura

```text
.
├── index.html                 # documento raiz (meta tags, fontes, favicon)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx               # ponto de entrada React
│   ├── App.tsx                # composição da página + cortina de abertura + barra móvel
│   ├── index.css              # tema Tailwind 4 (cores, tipografia, eases, utilitários)
│   ├── components/            # secções e primitivos de UI
│   │   ├── primitives.tsx     # Btn, Eyebrow, Img, MaskWords, Marquee, IgIcon, Grain…
│   │   ├── Nav.tsx  Hero.tsx  Intro.tsx  MenuSection.tsx
│   │   ├── Ocean.tsx  Experience.tsx  Gallery.tsx  InstagramGrid.tsx
│   │   └── Events.tsx  LocationSection.tsx  Footer.tsx  ReservePanel.tsx  Cursor.tsx
│   ├── data/
│   │   └── site.ts            # camada de conteúdo (textos, contactos, imagens, carta)
│   ├── lib/
│   │   └── anim.ts            # hooks de animação: reveals, parallax, scroll suave, cursor
│   └── utils/
│       └── cn.ts              # helper clsx + tailwind-merge
├── .github/workflows/ci.yml   # qualidade automática em push/PR
├── eslint.config.js  .prettierrc.json  .editorconfig  .nvmrc
└── tsconfig.json  →  tsconfig.app.json + tsconfig.node.json
```

## Como começar

Requisitos: **Node.js ≥ 20.19** (ver `.nvmrc`) e npm.

```bash
nvm use            # ou: node --version
npm ci             # instala as dependências do package-lock.json
npm run dev        # http://localhost:5173
```

### Scripts

| Script              | O que faz                                                 |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | servidor de desenvolvimento com HMR                       |
| `npm run build`     | verifica tipos e gera `dist/index.html` (ficheiro único)  |
| `npm run preview`   | serve localmente o resultado do build                     |
| `npm run typecheck` | `tsc --build --noEmit` (strict)                           |
| `npm run lint`      | ESLint em todo o projeto                                  |
| `npm run format`    | Prettier — reescreve os ficheiros com o estilo do projeto |
| `npm run verify`    | formato + lint + tipos + build (o mesmo que a CI executa) |

## Convenções do projeto

- **Path alias:** importações entre diretórios usam `@/` (`@/data/site`, `@/lib/anim`,
  `@/utils/cn`); dentro do mesmo diretório mantêm-se relativas (`./primitives`).
- **Conteúdo separado da interface:** todo o texto, contactos e referências de imagem vivem em
  `src/data/site.ts`. Alterar copy ou fotografias não exige tocar em componentes.
- **Primitivos primeiro:** botões, eyebrows, máscaras de texto e imagens vêm de
  `src/components/primitives.tsx` — evita duplicar estilos entre secções.
- **Animação centralizada:** `src/lib/anim.ts` expõe os hooks (`useReveals`, `useParallax`,
  `useMagnetic`, `useSmoothScroll`) e respeita `prefers-reduced-motion` em todos eles.
- **Tema:** as cores (`cream`, `sand`, `char`, `ocean`, `sun`…), as famílias tipográficas e os
  eases são tokens Tailwind definidos em `src/index.css` — usar tokens, não valores soltos.
- **Qualidade:** `npm run verify` antes de abrir um PR; a CI (`main` e PRs) corre o mesmo conjunto.

## Imagens

Todas as fotografias vêm do CDN da Pexels, que converte para **AVIF/WebP** e comprime no momento do
pedido (`auto=format,compress`, `q=72`). Cada imagem é pedida **no tamanho em que é mostrada**:

| Helper (em `src/data/site.ts`) | Para que serve                                                             |
| ------------------------------ | -------------------------------------------------------------------------- |
| `px(id, w, h?)`                | URL de uma fotografia com a largura/altura certas                          |
| `pxSrcSet(id, w, h?)`          | as 5 variantes (`0.5×` → `2×`) da mesma fotografia                         |
| `photo(id, w, h, alt?)`        | objeto `{ src, srcSet, width, height, alt }`, pronto a espalhar no `<Img>` |

Regras do `<Img>` (`src/components/primitives.tsx`):

- passar sempre `width`/`height` — reservam o espaço e evitam saltos de layout (CLS);
- passar `sizes` sempre que há `srcSet`, senão o browser assume `100vw` e descarrega demais;
- `eager` só para o que está na primeira dobra; todo o resto é `loading="lazy"`;
- o fotograma de abertura tem `fetchPriority="high"` e um `<link rel="preload">` gerado no build
  pelo plugin `preloadHero` (em `vite.config.ts`) — a URL sai dos dados, nunca é repetida à mão.

O vídeo do hero só é montado em ecrãs ≥ 900 px e quando a ligação não está em modo de poupança.

## Conteúdo e imagem

| Item                    | Estado                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| Fotografias             | **Temporárias** (Pexels) — substituir por material autorizado da marca |
| Vídeo do hero           | **Temporário** (Pexels) — substituir ou remover                        |
| Logótipo                | Imagem pública de referência (Junta de Freguesia de Esmoriz)           |
| Carta / preços          | Estrutura demonstrativa — sem nomes de pratos nem preços reais         |
| Horários, morada, email | Recolhidos de fontes públicas — **a confirmar com a marca**            |

Para publicar:

1. substituir as entradas em `src/data/site.ts` pelos dados confirmados;
2. trocar as imagens temporárias (`px(...)`, `HERO.videoSources`, `GALLERY`, `INSTAGRAM`);
3. remover `CONCEPT_NOTICE` e as notas de conceito das secções;
4. **remover `<meta name="robots" content="noindex, nofollow">`** de `index.html`.

## Build e publicação

O build usa `vite-plugin-singlefile`: HTML, CSS e JS são embutidos num único `dist/index.html`
(cerca de 645 kB, ~199 kB gzip). Pode ser aberto diretamente no browser ou servido por qualquer
host estático (Netlify, Vercel, GitHub Pages, Cloudflare Pages) sem configuração extra.

## Licença e direitos

`private: true` e `UNLICENSED`: código fechado, sem licença concedida. O nome e a identidade
**Palheiro Velho** pertencem aos respetivos proprietários e são usados aqui apenas como referência
de um conceito de design.
