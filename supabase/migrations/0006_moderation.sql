-- =============================================================================
-- SmokeAR — moderation: bans, reports, and role/status-escalation fixes
--
-- Security fix found while building this: RLS's `USING (auth.uid() = id or
-- is_admin(auth.uid()))` on `profiles` only gates which ROW an update can
-- target — it does not gate which COLUMNS change. A plain user updating
-- their own row (auth.uid() = id) could set role = 'admin' or clear their
-- own banned_at, because RLS has no column-level concept. The fix is a
-- BEFORE UPDATE trigger: it fires regardless of which RLS branch let the
-- UPDATE through, and blocks any change to role/banned_at unless the
-- calling user is already a true admin. Verified locally: without this
-- trigger, a moderator could self-promote to admin by updating their own
-- row — see the migration history / session notes for the failing repro.
--
-- The exact same gap exists on lineups/boosts/plays/guides: their own
-- "author can update their own row" policies have no WITH CHECK either, so
-- an author could flip `status` back to 'approved' right after a moderator
-- removes their content, or (lineups only) set `verified = true` on their
-- own submission. Fixed the same way, further down in this file.
-- =============================================================================

alter table profiles add column banned_at timestamptz;

create or replace function is_banned(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p where p.id = uid and p.banned_at is not null
  );
$$;

create or replace function is_super_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p where p.id = uid and p.role = 'admin'
  );
$$;

create or replace function guard_profile_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null only for a context with no end-user JWT at all: the
  -- Supabase SQL Editor / postgres superuser, or our service-role admin
  -- client. Both already had to bypass or satisfy RLS to reach this row,
  -- so they're implicitly trusted — this is also how the very first admin
  -- gets bootstrapped. A real logged-in user always has a real auth.uid(),
  -- so this never opens a path for a regular session to self-promote.
  if (new.role is distinct from old.role or new.banned_at is distinct from old.banned_at)
     and auth.uid() is not null
     and not is_super_admin(auth.uid()) then
    raise exception 'Solo un admin puede cambiar el rol o banear/desbanear una cuenta';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_sensitive_columns
  before update on profiles
  for each row execute function guard_profile_sensitive_columns();

-- A banned user keeps read access to everything (browsing is never
-- blocked, per the "no login wall" principle) but can't create new
-- content, comment, or file reports.
drop policy "lineups_insert_own" on lineups;
create policy "lineups_insert_own" on lineups for insert
  with check (auth.uid() is not null and author_id = auth.uid() and not is_banned(auth.uid()));

drop policy "boosts_insert_own" on boosts;
create policy "boosts_insert_own" on boosts for insert
  with check (auth.uid() is not null and author_id = auth.uid() and not is_banned(auth.uid()));

drop policy "plays_insert_own" on plays;
create policy "plays_insert_own" on plays for insert
  with check (auth.uid() is not null and author_id = auth.uid() and not is_banned(auth.uid()));

drop policy "comments_insert_own" on comments;
create policy "comments_insert_own" on comments for insert
  with check (user_id = auth.uid() and not is_banned(auth.uid()));

drop policy "reports_insert_authenticated" on reports;
create policy "reports_insert_authenticated" on reports for insert
  with check (auth.uid() is not null and reporter_id = auth.uid() and not is_banned(auth.uid()));

drop policy "guides_insert_own" on guides;
create policy "guides_insert_own" on guides for insert
  with check (auth.uid() is not null and author_id = auth.uid() and not is_banned(auth.uid()));

-- =============================================================================
-- Same escalation shape, different table: lineups/boosts/plays/guides let an
-- author update their own row (`author_id = auth.uid()`), and that "own row"
-- policy has no WITH CHECK either — so an author can already `UPDATE` their
-- own content directly through the API. Without a column guard, that update
-- could just as easily flip `status` back to 'approved' right after a
-- moderator sets it to 'removed', or (on lineups) set `verified = true`
-- themselves. Moderation actions have to survive the content's own author
-- having full row-level UPDATE access — so, same fix as profiles: a trigger
-- that only admins/moderators (or a null auth.uid(), e.g. seed/service-role
-- context) can move.
-- =============================================================================

create or replace function guard_content_status_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and auth.uid() is not null
     and not is_admin(auth.uid()) then
    raise exception 'Solo un admin o moderador puede cambiar el estado del contenido';
  end if;
  return new;
end;
$$;

create trigger boosts_guard_status
  before update on boosts
  for each row execute function guard_content_status_column();

create trigger plays_guard_status
  before update on plays
  for each row execute function guard_content_status_column();

create trigger guides_guard_status
  before update on guides
  for each row execute function guard_content_status_column();

create or replace function guard_lineup_moderation_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.status is distinct from old.status or new.verified is distinct from old.verified)
     and auth.uid() is not null
     and not is_admin(auth.uid()) then
    raise exception 'Solo un admin o moderador puede cambiar el estado o la verificación del lineup';
  end if;
  return new;
end;
$$;

create trigger lineups_guard_moderation
  before update on lineups
  for each row execute function guard_lineup_moderation_columns();

-- =============================================================================
-- Found while testing the fix above: it wasn't enough on its own. Postgres
-- RLS enforces a SELECT policy's USING clause against the *resulting* row of
-- an UPDATE too, not only the row being targeted — so as long as
-- "*_select_public" hid `status = 'removed'` rows from everyone, no one
-- (not even an admin) could ever set that value: the UPDATE itself got
-- rejected with "new row violates row-level security policy", independent
-- of the update policy's own USING/WITH CHECK. Confirmed locally: dropping
-- the select policy made the same UPDATE affect 0 rows (couldn't even find
-- the row), and restoring it with `or is_admin(auth.uid())` is what let the
-- update through. The fix doubles as a feature admins need anyway: they can
-- now actually see removed content to review or restore it.
-- =============================================================================

drop policy "lineups_select_public" on lineups;
create policy "lineups_select_public" on lineups for select
  using ((deleted_at is null and status <> 'removed') or is_admin(auth.uid()));

drop policy "boosts_select_public" on boosts;
create policy "boosts_select_public" on boosts for select
  using ((deleted_at is null and status <> 'removed') or is_admin(auth.uid()));

drop policy "plays_select_public" on plays;
create policy "plays_select_public" on plays for select
  using ((deleted_at is null and status <> 'removed') or is_admin(auth.uid()));

drop policy "guides_select_public" on guides;
create policy "guides_select_public" on guides for select
  using ((deleted_at is null and status <> 'removed') or is_admin(auth.uid()));
