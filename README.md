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
- **Ler é público, escrever exige o acesso único.** As políticas RLS deixam toda a gente ler e só
  deixam escrever a quem apresentar o token do painel.
- **Pedidos de mesa a sério.** O visitante escolhe dia, hora e pessoas; o pedido fica gravado na
  base de dados e a casa vê-o no separador **Reservas** do painel (os detalhes em
  [Pedidos de mesa](#pedidos-de-mesa)).

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
├── index.html · legal.html · 404.html · admin.html   # entradas do site
├── public/favicon.svg
├── src/
│   ├── main.tsx                     # entrada do site
│   ├── admin/
│   │   ├── main.tsx · AdminApp.tsx  # painel: login por magic link + navegação
│   │   ├── sections/                # um editor por secção (carta, galeria, …)
│   │   ├── components/              # campos, botões, campo de imagem, toasts
│   │   └── lib/                     # api (CRUD), reservas, uploads, acesso e sessão
│   ├── content/
│   │   ├── types.ts                 # modelo de conteúdo (SiteContent)
│   │   ├── defaults.ts              # conteúdo de origem (sem base de dados)
│   │   ├── store.ts                 # leitura da base de dados + tempo real
│   │   └── SiteContentProvider.tsx  # mantém o conteúdo em memória
│   ├── components/                  # secções do site
│   ├── i18n/                        # idiomas: dicionário da interface e Text
│   ├── legal/                       # página legal (privacidade, cookies, termos)
│   ├── notfound/                    # página 404 (com saídas para a carta e o contacto)
│   ├── lib/                         # supabase, imagens, animação, reservas
│   └── utils/cn.ts
├── supabase/
│   ├── migrations/0001_init.sql     # tabelas, políticas RLS, bucket, realtime
│   ├── migrations/0002_admin_access.sql  # acesso único por token (is_admin)
│   ├── migrations/0003–0004 … sql   # campos do Instagram · horário de funcionamento
│   ├── migrations/0005_reservations.sql  # pedidos de mesa (tabela + políticas)
│   ├── migrations/0006_dish_allergens.sql # alergénios por prato
│   ├── migrations/0007_localized_content.sql # listas e alergénios em jsonb (bilingue)
│   └── seed.sql                     # conteúdo atual (gerado)
├── scripts/
│   ├── generate-seed.mjs            # defaults.ts → supabase/seed.sql
│   ├── set-admin-password.mjs       # define o acesso único (só guarda o resumo)
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

| Script                 | O que faz                                                    |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | servidor do site (HMR)                                       |
| `npm run dev:admin`    | servidor do painel                                           |
| `npm run build`        | `build:site` + `build:admin`                                 |
| `npm run build:site`   | verifica tipos e gera `dist/` com o site em blocos separados |
| `npm run build:single` | gera `dist-single/index.html`: tudo num só ficheiro          |
| `npm run build:admin`  | gera `dist/admin.html` + `dist/admin-assets/`                |
| `npm run preview`      | serve `dist/` como em produção                               |
| `npm run typecheck`    | `tsc --build --noEmit` (strict)                              |
| `npm test`             | testes (Vitest) da lógica de horários e pedidos de mesa      |
| `npm run lint`         | ESLint em todo o projeto                                     |
| `npm run format`       | Prettier                                                     |
| `npm run verify`       | formato + lint + tipos + testes + build (o mesmo que a CI)   |
| `npm run db:check`     | diagnóstico da base de dados (inclui teste de envio)         |

### Ligar a base de dados (Supabase)

Sem base de dados o painel abre na mesma: mostra o conteúdo que já está no código, deixa navegar e
editar, e avisa numa faixa no topo que **nada fica guardado** até o projeto estar ligado. Os passos
seguem abaixo.

1. Criar um projeto em [supabase.com](https://supabase.com) e copiar a **URL** e a chave **anon**
   (_Project Settings → API_).
2. Correr as migrações no editor SQL, **por esta ordem**:
   `supabase/migrations/0001_init.sql` (tabelas, políticas, bucket `media`, Realtime),
   `0002_admin_access.sql` (acesso único por token) e
   `0003_instagram_posts_fields.sql` (ligação e tipo das publicações) e
   `0004_opening_hours.sql` (horário de funcionamento) e `0005_reservations.sql`
   (pedidos de mesa) e `0006_dish_allergens.sql` (alergénios na carta).
3. Correr `supabase/seed.sql` para carregar o conteúdo atual do site.
4. Definir o acesso ao painel (ver abaixo).
5. Reiniciar `npm run dev` e **conferir tudo**:

```bash
npm run db:check                                                # verificação sem palavra-passe
npm run db:check -- --utilizador <user> --palavra-passe <senha>  # inclui teste de envio de fotografia
```

O `db:check` diz o que está bem e o que falta: variáveis, as 10 tabelas, o conteúdo carregado, o
bucket `media`, a função `is_admin()`, se o token é aceite e — com as credenciais — **envia uma
imagem de teste ao Storage e apaga-a a seguir**. É a prova de que as fotografias da casa entram
mesmo. O painel tem o mesmo diagnóstico no botão **diagnóstico** do cabeçalho.

### Acesso ao painel

**Um único utilizador, uma única palavra-passe — não há criação de contas nem recuperação por
email.** A palavra-passe nunca é guardada nem enviada:

```bash
node scripts/set-admin-password.mjs utilizador palavra-passe --write
```

O que fica gravado no `.env.local` (e nas variáveis de ambiente do alojamento) é apenas:

| Variável                | Conteúdo                                                     |
| ----------------------- | ------------------------------------------------------------ |
| `VITE_ADMIN_SALT`       | sal aleatório (não é segredo)                                |
| `VITE_ADMIN_TOKEN_HASH` | resumo SHA-256 do token derivado — **não** é a palavra-passe |

Como funciona:

1. a palavra-passe é esticada com **PBKDF2-SHA256 (200 000 iterações)**, com o utilizador a entrar
   no sal, produzindo o token de acesso;
2. o painel compara o resumo desse token com `VITE_ADMIN_TOKEN_HASH` — sem falar com a base de dados;
3. o **token** (nunca a palavra-passe) segue em cada pedido de escrita no cabeçalho `x-admin-token`
   e é validado no servidor pela função `public.is_admin()` (`supabase/migrations/0002_admin_access.sql`);
4. a sessão dura 12 horas e vive só nesse separador — fechar o separador termina a sessão.

Quem abrir o repositório vê um sal e um resumo: a palavra-passe não está lá, e um utilizador errado
produz um token diferente. Para mudar o acesso, correr outra vez o script (gera sal e resumo novos).

### Painel

Abrir `/admin.html`, meter o utilizador e a palavra-passe definidos com
`scripts/set-admin-password.mjs` e entrar. Não existe criação de contas. Depois de entrar:

| Separador | O que edita                                                                         |
| --------- | ----------------------------------------------------------------------------------- |
| Ficheiros | biblioteca de fotografias: enviar várias de uma vez, copiar, remover                |
| Contactos | morada, telefone, email, Instagram, Facebook, coordenadas e consulta do Google Maps |
| Horário   | períodos de funcionamento: dias, abertura, fecho e observações                      |
| Reservas  | pedidos de mesa: confirmar, recusar, concluir e as regras dos pedidos               |
| Abertura  | vídeo, fotograma, frase e panorâmica do oceano                                      |
| Carta     | categorias, pratos, descrições, preços, etiquetas e fotografias                     |
| O espaço  | painéis do espaço (vista, exterior, música, brunch, chegar)                         |
| Galeria   | carrossel de fotografias                                                            |
| Instagram | mosaico de publicações (imagem, legenda, gostos, ligação, foto/reel)                |
| Hashtags  | faixa em movimento no fim da secção do Instagram                                    |
| Momentos  | tipos de evento                                                                     |
| Serviços  | fotografias de abertura e lista de serviços                                         |
| Textos    | separadores e faixas do rodapé                                                      |
| Legal     | privacidade, cookies, termos e o responsável pelos dados                            |

Cada secção tem **arrastar e largar** (ou clique) para fotografias, **biblioteca** com os ficheiros
já enviados, **ordenar** com setas, **adicionar/remover** e uma barra de **Guardar alterações** que
só aparece quando há algo por gravar. As imagens são reduzidas no browser (máx. 1800 px, WebP) antes
de seguirem para o Storage.

**Por onde começar:** separador **Ficheiros** → largar as fotografias da casa (pode ser um lote
inteiro) → ir aos separadores da carta, galeria, Instagram e espaço e escolhê-las na **biblioteca**.

Se alguma coisa não entrar, o botão **diagnóstico** (cabeçalho do painel) ou `npm run db:check`
dizem exatamente onde está o problema.

## Pedidos de mesa

O site não promete uma mesa: regista um **pedido** e a casa confirma por telefone. É essa a frase que
o visitante lê em todo o lado, do formulário ao ecrã de confirmação.

```text
visitante escolhe dia/hora/pessoas ──▶ public.reservations (insert, sem sessão)
                                              │
                                              ▼
                            painel · separador Reservas (a cada 30 s)
                                              │
                                              ▼
                          casa liga ao cliente ─▶ confirmar / não temos mesa
```

- **As horas sugeridas saem do horário publicado.** Nada de grelhas inventadas: se a casa abre às
  12:30 e fecha às 23:00, as horas são as desse intervalo, com o passo definido nas regras.
- **Regras no painel** (separador **Reservas**): aceitar pedidos ou não, máximo de pessoas por
  pedido, intervalo entre horas, quantos minutos antes do fecho se deixa de aceitar mesas,
  antecedência mínima no próprio dia, quantos dias à frente se aceitam pedidos e a frase de
  confirmação.
- **Validação antes de enviar:** nome, telefone com 9 dígitos ou mais, dia dentro do prazo e com
  serviço, hora dentro do horário e número de pessoas até ao máximo. Os erros aparecem debaixo do
  campo respetivo.
- **Sem base de dados o painel de reservas não finge:** em vez do formulário mostra os canais de
  contacto publicados (telefone, Instagram, Facebook, direções).
- **Privacidade desde o início.** A política de inserção é pública, mas ninguém lê a tabela sem o
  token do painel — nem por API. A cópia nocturna (`content/snapshot.json`) e o `seed.sql`
  **não** incluem pedidos: são dados de clientes.

### Avisar a casa quando entra um pedido

O painel já mostra os pedidos novos (a lista atualiza-se de 30 em 30 segundos e há um aviso quando
chega um). Para receber **email ou SMS** é preciso um serviço externo, o que depende da casa — a
migração `0005_reservations.sql` traz as duas formas documentadas no fim: um _Database Webhook_ no
painel do Supabase (sem código) ou um trigger com `pg_net`.

### Testes

```bash
npm test           # 30 testes: pedidos de mesa, alergénios e texto legal
```

A lógica dos pedidos está isolada em `src/lib/reservations.ts` (funções puras, sem base de dados) —
é o que torna possível testar exactly o que pode correr mal: uma mesa sugerida fora de horas, um
pedido no dia de descanso, um grupo acima do máximo.

## Página legal e cookies

O site tem uma **página legal própria** (`/legal.html`) com privacidade, cookies e termos, escrita a
partir do conteúdo (editável no separador **Legal** do painel). Está ligada no rodapé e no aviso de
cookies, que é o que a lei espera: informação acessível antes de qualquer escolha.

- **Aviso de cookies:** aparece enquanto não houver decisão, e volta a abrir-se com as escolhas
  assinaladas a partir de “preferências de cookies” no rodapé. A escolha fica guardada no navegador
  (nada mais).
- **Medição só com consentimento.** O site não carrega analytics por omissão. Quem publicar define
  `VITE_ANALYTICS_SRC` e `VITE_ANALYTICS_DOMAIN` (ver `.env.example`); sem consentimento de
  “medição” nada é carregado, e o script é retirado se a pessoa mudar de ideias.
- **Textos para rever.** Os textos de origem são neutros e servem de base, mas a entidade
  responsável, os prazos de conservação e os contactos são da casa — vale uma leitura com quem trata
  da contabilidade antes de publicar.

## Alergénios na carta

Cada prato pode declarar **alergénios** (no painel, separados por vírgula: `glúten, ovo, leite`). O
site mostra-os por prato e ganha um filtro “evitar → sem glúten” que esconde os pratos com essa
substância.

Duas regras deliberadas:

- **nada inventado:** enquanto a casa não publicar alergénios, não aparece etiqueta nem filtro
  nenhum — informação de saúde falsa é pior do que ausência de informação;
- **ausência não é garantia:** o filtro só esconde o que está declarado. Por isso a carta continua a
  dizer que os dados são provisórios e que as dúvidas se resolvem com a casa.

## Imagens

Todas as fotografias são servidas por CDN e pedidas **no tamanho em que são mostradas**
(`srcSet` + `sizes`):

| Helper (em `src/data` e `src/content`) | Para que serve                                               |
| -------------------------------------- | ------------------------------------------------------------ |
| `px(id, w, h?)`                        | URL de uma fotografia Pexels (AVIF/WebP, `q=72`)             |
| `pxSrcSet(id, w, h?)`                  | as 5 variantes (`0,5×` → `2×`) da mesma fotografia           |
| `photo(id, w, h, alt?)`                | objeto `{ src, srcSet, width, height, alt }` pronto a usar   |
| `storageVariants(url)`                 | variantes para imagens submetidas para o Storage do Supabase |

As fotografias enviadas pelo painel já vão comprimidas (máx. 1800 px, WebP), por isso servem-se bem
como estão. Quem tiver **transformações de imagem** ativas no projeto pode servir reduções por
largura com `VITE_SUPABASE_TRANSFORM=1` — o `srcSet` passa a apontar ao endpoint de transformação do
Storage.

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
| Regras dos pedidos      | Valores de referência (máx. 12 pessoas, até 60 dias) — a confirmar      |

Para publicar:

1. substituir os dados e as imagens no painel — **incluindo o horário**, que
   vem de referência e tem de ser confirmado com a casa;
2. rever os textos legais no separador **Legal** (entidade, contactos, prazos) e
   publicar os **alergénios** de cada prato, que são informação de saúde;
3. definir `VITE_SITE_URL` com o endereço real (canonical, sitemap e robots).

Já feito: o `noindex` e a nota de conceito saíram do site — ele passou a poder ser indexado, por isso
os pontos acima contam mesmo.

## Publicação

`npm run build` gera `dist/` com o site em blocos separados (ver abaixo) e o painel em
`admin.html` + `admin-assets/`. Basta enviar `dist/` para qualquer alojamento estático (Netlify, Vercel, GitHub
Pages, Cloudflare Pages). Lembre-se de configurar as variáveis `VITE_SUPABASE_*` no alojamento —
são lidas no build, não em tempo de execução.

## Idiomas (português e inglês)

O site é bilingue. Quem visita escolhe a língua no topo ou no rodapé (PT / EN) e
a escolha fica guardada **e** visível no endereço:

| O quê             | Como funciona                                                               |
| ----------------- | --------------------------------------------------------------------------- |
| primeira visita   | segue o idioma do navegador; sem pista, entra em português                  |
| escolha da pessoa | `localStorage` (`palheiro-velho:locale`) + `?lang=en` na barra de endereços |
| link partilhado   | `?lang=en` abre logo em inglês, sem ninguém ter de escolher outra vez       |
| `<html lang>`     | acompanha a escolha (`pt-PT` / `en-GB`)                                     |

Há dois tipos de texto, e a diferença interessa:

- **textos da interface** (botões, títulos, erros) — estão no dicionário
  `src/i18n/ui.ts`, com uma entrada por língua. Se uma chave faltar numa
  língua, o TypeScript não deixa o build passar: ou se traduz tudo, ou não se
  publica meia interface;
- **textos da casa** (nomes de pratos, secções, horários, textos legais…) — são
  `Text`: ou uma simples `string` (igual nas duas línguas) ou um par
  `{ "pt": …, "en": … }`. **O que não estiver traduzido cai no português —
  nunca aparece um buraco.** Assim a casa traduz ao seu ritmo, uma secção de
  cada vez.

No painel, cada texto traduzível tem **duas caixas** (PT e EN); a da direita
pode ficar vazia. Nas listas (faixa do rodapé, hashtags, vantagens) escreve-se
uma entrada por linha, na mesma ordem nas duas línguas.

Os motores de busca também ficam a saber das duas versões: cada página anuncia
`canonical` + `hreflang` (`pt-PT`, `en-GB` e `x-default`) no HTML e no
`sitemap.xml`, e os erros de validação do pedido de mesa já falam a língua
escolhida.

## “Aberto agora”

O site mostra o estado da casa **a partir do horário que a casa publicou no
painel** — nada de horas inventadas:

| Estado                 | O que se lê                                                 |
| ---------------------- | ----------------------------------------------------------- |
| dentro de um serviço   | “Aberto até às 15:00”                                       |
| última hora de serviço | “Encerra em 40 min” (o aviso para quem ainda vai a caminho) |
| entre serviços         | “Abre hoje às 19:30” (ou “Abre em 25 min”)                  |
| dia de descanso        | “Abre terça às 12:30”                                       |
| sem horário publicado  | “Horário a confirmar”                                       |

- aparece no topo (hero), na barra de navegação em ecrãs grandes e por cima do
  horário na secção de contacto (aí com os serviços de hoje por extenso);
- tem relógio próprio: actualiza a cada minuto, sem recarregar a página;
- é uma função pura (`src/lib/hours-status.ts`) com testes que simulam horas do
  dia — incluindo dias de descanso e serviços partidos (almoço e jantar).

No pedido de mesa, o mesmo horário dá os atalhos **“hoje”** e **“amanhã”**
(só quando a casa abre nesse dia e ainda vai a horas) e a nota com os serviços
de hoje por baixo da escolha da hora.

## Página 404

Endereço errado? A casa responde na mesma: `404.html` diz que a página não
existe, mostra o estado atual e abre três portas — voltar ao site, ver a carta
e ligar para a casa. Saí no build como `noindex` (não entra nos motores de
busca) e fala as duas línguas.

## SEO e partilhas

Tudo o que o Google e as redes sociais lêm vem do conteúdo — nada está escrito
à mão no `index.html`:

| O quê                                      | Como                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| título e descrição                         | gerados do conteúdo (`src/lib/seo.ts`), no build e a cada alteração                                                                          |
| `og:` e `twitter:` (partilhas)             | título, descrição e **imagem de partilha** — acabaram-se os quadrados vazios                                                                 |
| `robots.txt` e `sitemap.xml`               | gerados no build a partir de `VITE_SITE_URL` (ninguém os mantém à mão)                                                                       |
| `canonical` e `og:url`                     | só aparecem quando `VITE_SITE_URL` está definida                                                                                             |
| dados estruturados (`application/ld+json`) | esquema `Restaurant`: nome, morada, telefone, email, redes sociais, coordenadas e `acceptsReservations` (segue o que a casa ligou no painel) |

Notas:

- o **horário** entra nos dados estruturados como `openingHoursSpecification`
  (dias, abertura e fecho de cada linha); as linhas sem horas contam como
  encerradas e não são publicadas;
- os dados estruturados só escrevem **o que se sabe**: sem coordenadas
  preenchidas no separador Contactos, o bloco `geo` não aparece (e não se
  inventa o tipo de cozinha);
- as etiquetas também vão no HTML gerado (`vite.config.ts`), para os robots de
  partilhas que não correm JavaScript;
- **sem `VITE_SITE_URL`** o build avisa e os ficheiros saem com um endereço de
  exemplo;
- acessibilidade que também é SEO: a página tem **um só `h1`** e o menu marca
  a secção ativa com `aria-current`.

## Desempenho

O site abre primeiro e só depois afina os detalhes:

| Bloco                                 | Quando carrega                                                          |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `index.html` + CSS                    | primeiro — é o que pinta a página                                       |
| `react`, `motion` e o código do site  | a seguir, em paralelo e com `modulepreload`                             |
| `anim` (gsap + ScrollTrigger + Lenis) | **depois da primeira pintura**; no telemóvel o scroll suave nem carrega |
| `supabase`                            | só se existir `VITE_SUPABASE_URL` — sem base de dados, nunca é pedido   |

Consequências práticas:

- **primeira pintura mais leve**: ~156 kB gzip em vez de ~262 kB de um ficheiro único;
- **cache a sério**: mudar um texto não invalida o React nem o gsap;
- **telemóvel**: sem scroll suave a consumir processamento e o vídeo de abertura só entra em ecrãs com largura ≥ 900 px, sem `save-data` e fora de 2G;
- **segurança**: se o gsap falhar (ou a rede cair), a classe `anim-ready` é posta na mesma e o conteúdo aparece — há um prazo de segurança de 2,5 s no `main.tsx`.

Para enviar o site como **um só ficheiro** (útil para abrir em `file://` ou mandar por email):
`npm run build:single` gera `dist-single/index.html`.

## Licença e direitos

`private: true` e `UNLICENSED`: código fechado, sem licença concedida. O nome e a identidade
**Palheiro Velho** pertencem aos respetivos proprietários e são usados aqui apenas como referência
de um conceito de design.
