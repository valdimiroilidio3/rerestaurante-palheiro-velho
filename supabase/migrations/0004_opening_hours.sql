-- Horário de funcionamento
--
-- Uma coluna jsonb nas definições: uma linha por período (por exemplo
-- "Terça a domingo" e "Segunda"). Sem horas de abertura/fecho, a linha conta
-- como encerrada nesses dias.

alter table public.site_settings
  add column if not exists hours jsonb not null default '[]'::jsonb;

comment on column public.site_settings.hours is
  'Horário: [{ id, label, days: ["tue",…], open: "12:30", close: "23:00", note }]. Sem open/close = encerrado nesses dias.';
