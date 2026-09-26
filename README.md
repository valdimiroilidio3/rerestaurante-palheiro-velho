# Palheiro Velho — site + painel de conteúdo

Site para o **Palheiro Velho**, bar de praia em Esmoriz (Ovar, Portugal), com um **painel privado**
onde a equipa do restaurante edita carta, preços e fotografias — e as alterações aparecem no site
**de imediato, para toda a gente**, sem publicar nada à mão.

> ⚠️ **Conceito não aprovado para publicação.**
> Os dados (horários, contactos, carta) foram recolhidos de fontes públicas e **têm de ser validados
> com a marca** antes de qualquer publicação ou campanha. As fotografias são **temporárias**
> (Pexels) e não retratam o espaço — ver [Conteúdo e imagem](#conteúdo-e-imagem).

## Como funciona

```text
painel (/admin.html)  ──grava──▶  Supabase (Postgres + Storage)
                                        │
                                        │ Realtime (postgres_changes)
                                        ▼
                              SiteContentProvider (src/content)
                                        │
                                        ▼
                     secções do site leem useSite().content
```

- **Base de dados como fonte de verdade.** O site lê o conteúdo da base de dados ao carregar.
- **Atualização instantânea.** Cada gravação no painel emite um evento e todos os browsers abertos
  voltam a ler o conteúdo (~250 ms). Ninguém precisa de recarregar a página.
- **Funciona sem base de dados.** Sem variáveis de ambiente o site usa o conteúdo de origem
  (`src/content/defaults.ts`) — é o que permite abrir o repositório e ver o site a correr.
- **O conteúdo também fica no Git.** A acção `content-backup` exporta as tabelas para
  `content/snapshot.json` todas as noites (e pode ser corrida à mão).

## Stack

| Camada    | Tecnologia                                                     |
| --------- | -------------------------------------------------------------- |
| UI        | React 19 · TypeScript (strict) · Tailwind CSS 4                |
| Build     | Vite 7 — site em ficheiro único, painel em ficheiros separados |
| Animação  | GSAP + ScrollTrigger · Framer Motion · Lenis                   |
| Dados     | Supabase — Postgres, Storage, Auth, Realtime                   |
| Ícones    | lucide-react                                                   |
| Qualidade | ESLint 10 (flat config) · Prettier · `tsc` strict              |

## Estrutura

```text
.
├── index.html · admin.html          # duas entradas: site público e painel
├── public/favicon.svg
├── src/
│   ├── main.tsx                     # entrada do site
│   ├── admin/
│   │   ├── main.tsx · AdminApp.tsx  # painel: login por magic link + navegação
│   │   ├── sections/                # um editor por secção (carta, galeria, …)
│   │   ├── components/              # campos, botões, campo de imagem, toasts
│   │   └── lib/                     # api (CRUD), uploads, hooks
│   ├── content/
│   │   ├── types.ts                 # modelo de conteúdo (SiteContent)
│   │   ├── defaults.ts              # conteúdo de origem (sem base de dados)
│   │   ├── store.ts                 # leitura da base de dados + tempo real
│   │   └── SiteContentProvider.tsx  # mantém o conteúdo em memória
│   ├── components/                  # secções do site
│   ├── lib/                         # supabase, imagens, animação
│   └── utils/cn.ts
├── supabase/
│   ├── migrations/0001_init.sql     # tabelas, políticas RLS, bucket, realtime
│   └── seed.sql                     # conteúdo atual (gerado)
├── scripts/
│   ├── generate-seed.mjs            # defaults.ts → supabase/seed.sql
│   └── backup-content.mjs           # base de dados → content/snapshot.json
└── .github/workflows/               # CI (qualidade) · content-backup (cópia)
```

## Começar

```bash
nvm use          # Node ≥ 20.19
npm ci
npm run dev      # site em http://localhost:5173
npm run dev:admin  # painel em http://localhost:5173/admin.html
```

### Scripts

| Script                | O que faz                                                |
| --------------------- | -------------------------------------------------------- |
| `npm run dev`         | servidor do site (HMR)                                   |
| `npm run dev:admin`   | servidor do painel                                       |
| `npm run build`       | `build:site` + `build:admin`                             |
| `npm run build:site`  | verifica tipos e gera `dist/index.html` (ficheiro único) |
| `npm run build:admin` | gera `dist/admin.html` + `dist/admin-assets/`            |
| `npm run preview`     | serve `dist/` como em produção                           |
| `npm run typecheck`   | `tsc --build --noEmit` (strict)                          |
| `npm run lint`        | ESLint em todo o projeto                                 |
| `npm run format`      | Prettier                                                 |
| `npm run verify`      | formato + lint + tipos + build (o mesmo que a CI)        |

### Ligar a base de dados (Supabase)

1. Criar um projeto em [supabase.com](https://supabase.com) e copiar a **URL** e a chave **anon**
   (_Project Settings → API_).
2. Correr `supabase/migrations/0001_init.sql` no editor SQL — cria as tabelas, as políticas de
   segurança, o bucket `media` e oRealtime.
3. Correr `supabase/seed.sql` para carregar o conteúdo atual do site.
4. `cp .env.example .env.local` e preencher `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Reiniciar `npm run dev`. O painel passa a mostrar o ecrã de entrada.

**Segurança:** a chave `anon` é pública — quem a tem só **lê**. Escrever exige sessão iniciada
(políticas RLS `to authenticated`). Para limitar quem pode entrar, use _Allow list_ em
_Authentication → Sign In / Providers → Email_ com os emails da equipa.

### Painel

Abrir `/admin.html` → introduzir o email → abrir a ligação recebida (magic link, sem palavra-passe).
Depois de entrar:

| Separador | O que edita                                                           |
| --------- | --------------------------------------------------------------------- |
| Contactos | morada, telefone, email, Instagram, Facebook, consulta do Google Maps |
| Abertura  | vídeo, fotograma, frase e panorâmica do oceano                        |
| Carta     | categorias, pratos, descrições, preços, etiquetas e fotografias       |
| O espaço  | painéis do espaço (vista, exterior, música, brunch, chegar)           |
| Galeria   | carrossel de fotografias                                              |
| Instagram | mosaico de publicações e hashtags                                     |
| Momentos  | tipos de evento                                                       |
| Serviços  | fotografias de abertura e lista de serviços                           |
| Textos    | separadores, faixas do rodapé e nota de conceito                      |

Cada secção tem **arrastar e largar** (ou clique) para fotografias, **biblioteca** com os ficheiros
já enviados, **ordenar** com setas, **adicionar/remover** e uma barra de **Guardar alterações** que
só aparece quando há algo por gravar. As imagens são reduzidas no browser (máx. 1800 px, WebP) antes
de seguirem para o Storage.

## Imagens

Todas as fotografias são servidas por CDN e pedidas **no tamanho em que são mostradas**
(`srcSet` + `sizes`):

| Helper (em `src/data` e `src/content`) | Para que serve                                               |
| -------------------------------------- | ------------------------------------------------------------ |
| `px(id, w, h?)`                        | URL de uma fotografia Pexels (AVIF/WebP, `q=72`)             |
| `pxSrcSet(id, w, h?)`                  | as 5 variantes (`0,5×` → `2×`) da mesma fotografia           |
| `photo(id, w, h, alt?)`                | objeto `{ src, srcSet, width, height, alt }` pronto a usar   |
| `storageVariants(url)`                 | variantes para imagens submetidas para o Storage do Supabase |

Regras do `<Img>` (`src/components/primitives.tsx`): declarar `width`/`height` (evita saltos de
layout), passar `sizes` sempre que há `srcSet`, `eager` só na primeira dobra e `loading="lazy"` no
resto. O fotograma de abertura tem `fetchPriority="high"` e um `<link rel="preload">` gerado no
build pelo plugin `preloadHero`, com a URL a sair dos dados.

## Convenções

- **Conteúdo separado da interface.** Os componentes leem tudo de `useSite().content`. Nenhum texto,
  preço ou URL vive dentro de um componente.
- **Path alias:** importações entre diretórios usam `@/`; dentro do mesmo diretório, relativas.
- **Primitivos primeiro:** botões, eyebrows, imagens e máscaras vêm de `src/components/primitives.tsx`.
- **Animação centralizada** em `src/lib/anim.ts`, sempre a respeitar `prefers-reduced-motion`.
- **Tema:** cores, tipografias e eases são tokens Tailwind em `src/index.css`.
- **Qualidade:** `npm run verify` antes de abrir um PR; a CI corre o mesmo conjunto.

## Conteúdo e imagem

| Item                    | Estado                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| Fotografias             | **Temporárias** (Pexels) — substituir no painel por material autorizado |
| Vídeo do hero           | **Temporário** (Pexels) — substituir ou remover                         |
| Logótipo                | Imagem pública de referência (Junta de Freguesia de Esmoriz)            |
| Carta / preços          | Estrutura demonstrativa — sem nomes de pratos nem preços reais          |
| Horários, morada, email | Recolhidos de fontes públicas — **a confirmar com a marca**             |

Para publicar:

1. substituir os dados e as imagens no painel;
2. remover `conceptNotice` (nota de conceito) no separador Textos;
3. remover `<meta name="robots" content="noindex, nofollow">` de `index.html`.

## Publicação

`npm run build` gera `dist/` com o site num único `index.html` e o painel em `admin.html` +
`admin-assets/`. Basta enviar `dist/` para qualquer alojamento estático (Netlify, Vercel, GitHub
Pages, Cloudflare Pages). Lembre-se de configurar as variáveis `VITE_SUPABASE_*` no alojamento —
são lidas no build, não em tempo de execução.

## Licença e direitos

`private: true` e `UNLICENSED`: código fechado, sem licença concedida. O nome e a identidade
**Palheiro Velho** pertencem aos respetivos proprietários e são usados aqui apenas como referência
de um conceito de design.
