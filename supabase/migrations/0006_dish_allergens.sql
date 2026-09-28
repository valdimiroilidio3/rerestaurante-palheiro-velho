-- Alergénios na carta
--
-- Uma lista de texto por prato. Fica vazia até a casa a preencher no painel:
-- o site só mostra etiquetas e filtros quando há informação publicada, porque
-- inventar alergénios seria pior do que não dizer nada.

alter table public.dishes
  add column if not exists allergens text[] not null default '{}'::text[];

comment on column public.dishes.allergens is
  'Alergénios declarados pela casa, por exemplo {glúten,ovo}. Vazio = informação por publicar.';
