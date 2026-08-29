-- ============================================================
-- AMIGO SECRETO — Configuración de la base de datos en Supabase
-- ------------------------------------------------------------
-- Cómo usar:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menú izquierdo → SQL Editor → New query
--   3. Pega TODO este contenido y presiona "Run"
-- Esto crea las tablas y las reglas que impiden héroes o cédulas duplicados.
-- ============================================================

-- Tabla de participantes
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  cedula text not null unique,          -- impide inscribir dos veces la misma cédula
  name text not null,
  cargo text not null,
  hero text not null unique,            -- impide que dos personas tengan el mismo héroe
  gifts jsonb not null default '[]'::jsonb,
  no_gift text default '',
  preferences jsonb not null default '[]'::jsonb,
  endulzada text not null,
  endulzada_otros text default '',
  alergias text default '',
  costume boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tabla del sorteo (una sola fila, id = 1)
create table if not exists public.draw_results (
  id int primary key,
  results jsonb not null,
  drawn_at timestamptz not null default now()
);

-- Seguridad a nivel de fila (RLS)
alter table public.participants enable row level security;
alter table public.draw_results enable row level security;

-- Políticas: permitir que la app (clave anónima "anon") lea y escriba.
-- Es una dinámica interna de oficina, con datos de baja sensibilidad.
drop policy if exists "anon_participants_all" on public.participants;
create policy "anon_participants_all" on public.participants
  for all to anon using (true) with check (true);

drop policy if exists "anon_draw_all" on public.draw_results;
create policy "anon_draw_all" on public.draw_results
  for all to anon using (true) with check (true);
