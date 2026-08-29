-- ============================================================
-- AMIGO SECRETO — MIGRACIÓN desde versión anterior
-- ============================================================
-- Usa este script si YA tenías la base de datos con la versión
-- anterior (con el campo "cedula" y políticas abiertas).
-- Este script:
--   1. Renombra la columna "cedula" a "celular"
--   2. Reemplaza las políticas RLS abiertas por las nuevas restrictivas
--   3. Crea las funciones RPC de admin
--
-- Cómo usar:
--   1. Entra a tu proyecto en https://supabase.com
--   2. SQL Editor → New query
--   3. Pega TODO este contenido y presiona "Run"
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. RENOMBRAR COLUMNA cedula → celular
-- ──────────────────────────────────────────────────────────────
alter table public.participants rename column cedula to celular;

-- ──────────────────────────────────────────────────────────────
-- 2. REEMPLAZAR POLÍTICAS RLS (de abiertas a restrictivas)
-- ──────────────────────────────────────────────────────────────

-- Eliminar políticas anteriores
drop policy if exists "anon_participants_all" on public.participants;
drop policy if exists "anon_draw_all" on public.draw_results;
drop policy if exists "anon_participants_insert" on public.participants;
drop policy if exists "anon_participants_select_hero" on public.participants;
drop policy if exists "anon_participants_count" on public.participants;
drop policy if exists "anon_draw_select" on public.draw_results;

-- Nuevas políticas restrictivas
create policy "anon_participants_insert" on public.participants
  for insert to anon
  with check (true);

create policy "anon_participants_select_hero" on public.participants
  for select to anon
  using (true);

create policy "anon_draw_select" on public.draw_results
  for select to anon
  using (true);

-- ──────────────────────────────────────────────────────────────
-- 3. FUNCIONES RPC DE ADMIN (crear o reemplazar)
-- ──────────────────────────────────────────────────────────────

create or replace function admin_check_password(pwd text)
returns boolean
language plpgsql security definer
as $$
begin
  return pwd = 'superhero2026';
end;
$$;

create or replace function admin_login(pwd text)
returns boolean
language plpgsql security definer
as $$
begin
  return admin_check_password(pwd);
end;
$$;

create or replace function admin_list_participants(pwd text)
returns setof public.participants
language plpgsql security definer
as $$
begin
  if not admin_check_password(pwd) then
    raise exception 'Contraseña incorrecta';
  end if;
  return query select * from public.participants order by created_at asc;
end;
$$;

create or replace function admin_delete_participant(pwd text, participant_id uuid)
returns void
language plpgsql security definer
as $$
begin
  if not admin_check_password(pwd) then
    raise exception 'Contraseña incorrecta';
  end if;
  delete from public.participants where id = participant_id;
end;
$$;

create or replace function admin_save_draw(pwd text, draw_results jsonb, draw_time timestamptz)
returns void
language plpgsql security definer
as $$
begin
  if not admin_check_password(pwd) then
    raise exception 'Contraseña incorrecta';
  end if;
  delete from public.draw_results where id = 1;
  insert into public.draw_results (id, results, drawn_at) values (1, draw_results, draw_time);
end;
$$;

create or replace function admin_clear_draw(pwd text)
returns void
language plpgsql security definer
as $$
begin
  if not admin_check_password(pwd) then
    raise exception 'Contraseña incorrecta';
  end if;
  delete from public.draw_results where id = 1;
end;
$$;

create or replace function admin_reset_all(pwd text)
returns void
language plpgsql security definer
as $$
begin
  if not admin_check_password(pwd) then
    raise exception 'Contraseña incorrecta';
  end if;
  delete from public.participants;
  delete from public.draw_results;
end;
$$;

create or replace function public_participant_count()
returns integer
language plpgsql security definer
as $$
begin
  return (select count(*)::integer from public.participants);
end;
$$;

create or replace function public_taken_heroes()
returns jsonb
language plpgsql security definer
as $$
begin
  return (select coalesce(jsonb_agg(hero), '[]'::jsonb) from public.participants);
end;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. PERMISOS PARA LAS FUNCIONES RPC
-- ──────────────────────────────────────────────────────────────
grant execute on function admin_login(text) to anon;
grant execute on function admin_list_participants(text) to anon;
grant execute on function admin_delete_participant(text, uuid) to anon;
grant execute on function admin_save_draw(text, jsonb, timestamptz) to anon;
grant execute on function admin_clear_draw(text) to anon;
grant execute on function admin_reset_all(text) to anon;
grant execute on function public_participant_count() to anon;
grant execute on function public_taken_heroes() to anon;
