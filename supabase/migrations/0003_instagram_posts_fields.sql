-- Instagram: ligação própria e tipo de publicação
--
-- Cada peça do mosaico passa a poder apontar à publicação de origem (em vez
-- de abrir sempre o perfil) e a ser marcada como vídeo/reel, o que mostra um
-- selo na grelha e no visualizador.

alter table public.instagram_posts add column if not exists url text;
alter table public.instagram_posts add column if not exists kind text not null default 'foto';

-- só estes dois valores
alter table public.instagram_posts drop constraint if exists instagram_posts_kind_check;
alter table public.instagram_posts
  add constraint instagram_posts_kind_check check (kind in ('foto', 'reel'));

comment on column public.instagram_posts.url is
  'Ligação para a publicação no Instagram; sem valor, a peça abre o perfil.';
comment on column public.instagram_posts.kind is
  'foto ou reel — muda apenas o selo mostrado na grelha e no visualizador.';
