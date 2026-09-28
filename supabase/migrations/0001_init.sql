-- Palheiro Velho · base de dados do conceito
--
-- Correr no editor SQL do Supabase (ou `supabase db push`).
-- Estrutura pensada para ser editada por um painel:
--   · `site_settings`  → uma linha com tudo o que é único (contactos, hero, oceano, listas)
--   · tabelas com `position` → listas ordenáveis pela equipa do restaurante

create extension if not exists pgcrypto;

-- ————————————————————————————————————————————————
-- conteúdo único
-- ————————————————————————————————————————————————
create table if not exists public.site_settings (
  id text primary key default 'main',
  contact jsonb not null default '{}'::jsonb,
  brand jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  ocean jsonb not null default '{}'::jsonb,
  nav jsonb not null default '[]'::jsonb,
  ticker text[] not null default '{}',
  hashtags text[] not null default '{}',
  event_perks text[] not null default '{}',
  concept_notice text not null default '',
  updated_at timestamptz not null default now()
);

-- ————————————————————————————————————————————————
-- listas
-- ————————————————————————————————————————————————
create table if not exists public.menu_categories (
  id text primary key,
  label text not null,
  kicker text not null default '',
  blurb text not null default '',
  position int not null default 0
);

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text not null default '',
  price text not null default '',
  image jsonb not null default '{}'::jsonb, -- { src, width, height, alt }
  flag text,
  position int not null default 0
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  width int,
  height int,
  cap text not null default '',
  loc text not null default '',
  position int not null default 0
);

create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  width int,
  height int,
  cap text not null default '',
  likes text not null default '',
  span text not null default '',
  position int not null default 0
);

create table if not exists public.intro_images (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  width int,
  height int,
  alt text not null default '',
  position int not null default 0
);

create table if not exists public.intro_facts (
  id uuid primary key default gen_random_uuid(),
  k text not null default '',
  title text not null default '',
  description text not null default '',
  position int not null default 0
);

create table if not exists public.experience_panels (
  id text primary key,
  label text not null default '',
  idx text not null default '',
  image jsonb not null default '{}'::jsonb,
  text text not null default '',
  meta text not null default '',
  position int not null default 0
);

create table if not exists public.events (
  id text primary key,
  n text not null default '',
  title text not null default '',
  description text not null default '',
  image jsonb not null default '{}'::jsonb,
  tag text not null default '',
  position int not null default 0
);

-- Biblioteca de ficheiros submetidos (para reutilizar sem voltar a enviar)
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null,
  url text not null,
  width int,
  height int,
  bytes int,
  alt text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists dishes_category_idx on public.dishes (category_id, position);
create index if not exists media_created_idx on public.media (created_at desc);

-- ————————————————————————————————————————————————
-- segurança: toda a gente lê, só quem tem sessão escreve
-- ————————————————————————————————————————————————
alter table public.site_settings enable row level security;
alter table public.menu_categories enable row level security;
alter table public.dishes enable row level security;
alter table public.gallery_images enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.intro_images enable row level security;
alter table public.intro_facts enable row level security;
alter table public.experience_panels enable row level security;
alter table public.events enable row level security;
alter table public.media enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings','menu_categories','dishes','gallery_images','instagram_posts',
    'intro_images','intro_facts','experience_panels','events','media'
  ]
  loop
    execute format('drop policy if exists "leitura publica" on public.%I', t);
    execute format('create policy "leitura publica" on public.%I for select using (true)', t);

    execute format('drop policy if exists "escrita autenticada" on public.%I', t);
    execute format(
      'create policy "escrita autenticada" on public.%I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ————————————————————————————————————————————————
-- armazenamento das fotografias
-- ————————————————————————————————————————————————
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media leitura publica" on storage.objects;
create policy "media leitura publica" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media upload autenticado" on storage.objects;
create policy "media upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media alteracao autenticada" on storage.objects;
create policy "media alteracao autenticada" on storage.objects
  for update to authenticated using (bucket_id = 'media');

drop policy if exists "media remocao autenticada" on storage.objects;
create policy "media remocao autenticada" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- ————————————————————————————————————————————————
-- tempo real: o site atualiza sozinho quando algo muda
-- ————————————————————————————————————————————————
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings','menu_categories','dishes','gallery_images','instagram_posts',
    'intro_images','intro_facts','experience_panels','events'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when others then
      -- já faz parte da publicação: segue em frente
      null;
    end;
    execute format('alter table public.%I replica identity full', t);
  end loop;
end $$;
