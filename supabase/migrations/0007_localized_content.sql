-- Conteúdo traduzível
--
-- Com o site bilingue, um texto pode ser uma simples string (igual nas duas
-- línguas) ou um par { "pt": …, "en": … }. Dentro das colunas jsonb isso já
-- funciona — mas as listas (faixas, hashtags, vantagens) e os alergénios
-- estavam guardadas em `text[]`, que não aceita objectos. Passam a jsonb.

alter table public.site_settings
  alter column ticker type jsonb using to_jsonb(coalesce(ticker, '{}'::text[])),
  alter column ticker set default '[]'::jsonb,
  alter column hashtags type jsonb using to_jsonb(coalesce(hashtags, '{}'::text[])),
  alter column hashtags set default '[]'::jsonb,
  alter column event_perks type jsonb using to_jsonb(coalesce(event_perks, '{}'::text[])),
  alter column event_perks set default '[]'::jsonb;

alter table public.dishes
  alter column allergens type jsonb using to_jsonb(coalesce(allergens, '{}'::text[])),
  alter column allergens set default '[]'::jsonb;

comment on column public.site_settings.ticker is
  'Faixa do rodapé: ["texto"] ou [{"pt":"…","en":"…"}].';
comment on column public.dishes.allergens is
  'Alergénios: ["glúten"] ou [{"pt":"glúten","en":"gluten"}]. Vazio = informação por publicar.';
