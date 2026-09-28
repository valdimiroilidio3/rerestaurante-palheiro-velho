-- Acesso único ao painel
--
-- Substitui as políticas "escrita autenticada" da migração 0001: a escrita
-- passa a exigir o token derivado das credenciais, enviado no cabeçalho
-- `x-admin-token`. Não há utilizadores, nem criação de contas, nem magic link.
--
-- Depois de correr isto, definir o acesso com:
--   node scripts/set-admin-password.mjs <utilizador> <palavra-passe>
-- e gravar apenas o resumo (VITE_ADMIN_TOKEN_HASH) — nunca a palavra-passe.

-- Guarda só o resumo do token. Sem políticas de leitura: ninguém lê por API.
create table if not exists public.admin_access (
  id text primary key,
  token_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_access enable row level security;

-- Nenhuma política de select/update/delete: só quem tem acesso direto à base
-- de dados (o dono do projeto) pode ver ou alterar esta linha.

-- Valida o cabeçalho `x-admin-token` de cada pedido.
create or replace function public.is_admin() returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  headers text;
  supplied text;
  expected text;
begin
  -- os cabeçalhos do pedido, tal como o PostgREST/os Storage os expõem
  headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}');
  supplied := coalesce(headers::json ->> 'x-admin-token', '');

  select token_hash into expected from public.admin_access where id = 'main';

  if supplied = '' or expected is null then
    return false;
  end if;

  -- compara o resumo do token recebido com o resumo guardado
  return encode(digest(supplied, 'sha256'), 'hex') = expected;
end;
$$;

-- as políticas são avaliadas com os privilégios do dono da tabela; o grant
-- seguinte só permite que a função também seja chamada por RPC, o que não
-- revela nada (devolve apenas verdadeiro/falso).
grant execute on function public.is_admin() to anon, authenticated;

-- ————————————————————————————————————————————————
-- conteúdo: toda a gente lê, só com o token se escreve
-- ————————————————————————————————————————————————
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings','menu_categories','dishes','gallery_images','instagram_posts',
    'intro_images','intro_facts','experience_panels','events','media'
  ]
  loop
    execute format('drop policy if exists "escrita autenticada" on public.%I', t);
    execute format(
      'create policy "escrita com token" on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end $$;

-- ————————————————————————————————————————————————
-- armazenamento: ler é público, escrever exige o token
-- ————————————————————————————————————————————————
drop policy if exists "media upload autenticado" on storage.objects;
drop policy if exists "media alteracao autenticada" on storage.objects;
drop policy if exists "media remocao autenticada" on storage.objects;

drop policy if exists "media upload com token" on storage.objects;
create policy "media upload com token" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media alteracao com token" on storage.objects;
create policy "media alteracao com token" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media remocao com token" on storage.objects;
create policy "media remocao com token" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
