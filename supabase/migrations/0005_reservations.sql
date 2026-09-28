-- Pedidos de mesa
--
-- O visitante deixa o pedido sem sessão nenhuma: a política de inserção é
-- pública, mas ninguém consegue ler a tabela sem o token do painel. Assim os
-- dados dos clientes não ficam expostos por API e, ao mesmo tempo, não é
-- preciso criar contas para pedir uma mesa.
--
-- Regras dos pedidos (máximo de pessoas, intervalo de horas, antecedência)
-- ficam nas definições do site — a casa muda-as no painel, sem mexer no código.

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  -- referência curta que o cliente recebe, por exemplo "PV-4K7Q"
  code text not null unique,
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 9 and 20),
  email text check (email is null or char_length(email) <= 160),
  day date not null,
  time time not null,
  people int not null check (people between 1 and 60),
  notes text check (notes is null or char_length(notes) <= 600),
  status text not null default 'novo'
    check (status in ('novo', 'confirmado', 'recusado', 'concluido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.reservations is
  'Pedidos de mesa enviados pelo site. Ler e alterar exige o token do painel.';

create index if not exists reservations_day_idx on public.reservations (day, time);
create index if not exists reservations_status_idx on public.reservations (status, created_at desc);

-- ————————————————————————————————————————————————
-- regras dos pedidos nas definições do site
-- ————————————————————————————————————————————————
alter table public.site_settings
  add column if not exists reservations jsonb not null default '{}'::jsonb;

comment on column public.site_settings.reservations is
  'Pedidos de mesa: { enabled, maxPeople, slotMinutes, lastSeatingBeforeClose, minLeadHours, horizonDays, confirmation }.';

-- ————————————————————————————————————————————————
-- políticas: qualquer pessoa pede, só a casa lê
-- ————————————————————————————————————————————————
alter table public.reservations enable row level security;

drop policy if exists "pedido de mesa de qualquer pessoa" on public.reservations;
create policy "pedido de mesa de qualquer pessoa" on public.reservations
  for insert to anon, authenticated
  with check (
    -- um pedido entra sempre como novo: ninguém confirma a própria mesa
    status = 'novo'
    and char_length(name) between 2 and 120
    and char_length(phone) between 9 and 20
    and people between 1 and 60
    -- nada de pedidos para o passado (um dia de tolerância para fusos)
    and day >= (current_date - interval '1 day')
  );

drop policy if exists "reservas com token" on public.reservations;
create policy "reservas com token" on public.reservations
  for all using (public.is_admin()) with check (public.is_admin());

-- ————————————————————————————————————————————————
-- updated_at sempre certo
-- ————————————————————————————————————————————————
create or replace function public.touch_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_touch on public.reservations;
create trigger reservations_touch
  before update on public.reservations
  for each row execute function public.touch_updated_at();

-- ————————————————————————————————————————————————
-- avisar a casa (opcional)
-- ————————————————————————————————————————————————
-- Este ficheiro não liga notificações automáticas: isso depende de um serviço
-- de email ou SMS que só a casa pode contratar. Duas formas simples:
--
-- 1. Database Webhook (sem código): no painel do Supabase, em
--    Database → Webhooks, criar um webhook na tabela `public.reservations`
--    para eventos de INSERT e apontar para o serviço escolhido.
--
-- 2. Trigger com pg_net (avisa logo a seguir ao pedido):
--
--    create extension if not exists pg_net;
--
--    create or replace function public.notify_new_reservation() returns trigger
--    language plpgsql security definer as $$
--    begin
--      perform net.http_post(
--        url := '<URL DO SEU WEBHOOK>',
--        headers := '{"content-type": "application/json"}'::jsonb,
--        body := jsonb_build_object(
--          'code', new.code, 'name', new.name, 'phone', new.phone,
--          'day', new.day, 'time', new.time, 'people', new.people
--        )
--      );
--      return new;
--    end;
--    $$;
--
--    create trigger reservations_notify after insert on public.reservations
--      for each row execute function public.notify_new_reservation();
