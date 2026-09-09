-- =============================================================================
-- SmokeAR — real full-text search
--
-- Replaces the in-memory search that ran over mock data. Each searchable
-- table gets a generated `tsvector` column (Postgres keeps it in sync on
-- every insert/update, no application code has to remember to) plus a GIN
-- index, and `search_content()` unions across all of them ranked by
-- relevance.
--
-- `security invoker`: it runs as the calling role, so the existing RLS
-- policies on maps/lineups/boosts/plays/guides still decide what's visible
-- — a banned/removed piece of content stays invisible in search results
-- for the same reason it's invisible everywhere else, with no separate
-- logic to keep in sync. The explicit `status <> 'removed'` / `active`
-- checks below are redundant with RLS on purpose (defense in depth, same
-- reasoning as the app-layer filters added when the admin "see removed
-- content" policy shipped) — cheap, and they keep search results correct
-- even if a future RLS change ever gets it wrong.
-- =============================================================================

alter table maps add column search_vector tsvector
  generated always as (to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(description, ''))) stored;
create index maps_search_idx on maps using gin (search_vector);

alter table lineups add column search_vector tsvector
  generated always as (
    to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(target_zone, '') || ' ' || coalesce(throw_zone, ''))
  ) stored;
create index lineups_search_idx on lineups using gin (search_vector);

alter table boosts add column search_vector tsvector
  generated always as (
    to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(location, '') || ' ' || coalesce(description, ''))
  ) stored;
create index boosts_search_idx on boosts using gin (search_vector);

alter table plays add column search_vector tsvector
  generated always as (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, ''))) stored;
create index plays_search_idx on plays using gin (search_vector);

alter table guides add column search_vector tsvector
  generated always as (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(summary, ''))) stored;
create index guides_search_idx on guides using gin (search_vector);

create or replace function search_content(query text, result_limit int default 20)
returns table (
  content_type text,
  title text,
  subtitle text,
  slug text
)
language sql
stable
security invoker
set search_path = public
as $$
  with q as (select websearch_to_tsquery('spanish', query) as tsq),
  matches as (
    select 'map' as content_type, m.name as title, 'Mapa' as subtitle, m.slug,
      ts_rank(m.search_vector, q.tsq) as rank
    from maps m, q
    where m.search_vector @@ q.tsq and m.active
    union all
    select 'lineup', l.name, 'Lineup · ' || mp.slug, l.slug, ts_rank(l.search_vector, q.tsq)
    from lineups l join maps mp on mp.id = l.map_id, q
    where l.search_vector @@ q.tsq and l.deleted_at is null and l.status <> 'removed'
    union all
    select 'boost', b.name, 'Boost · ' || mp.slug, b.slug, ts_rank(b.search_vector, q.tsq)
    from boosts b join maps mp on mp.id = b.map_id, q
    where b.search_vector @@ q.tsq and b.deleted_at is null and b.status <> 'removed'
    union all
    select 'play', p.title, 'Jugada · ' || mp.slug, p.slug, ts_rank(p.search_vector, q.tsq)
    from plays p join maps mp on mp.id = p.map_id, q
    where p.search_vector @@ q.tsq and p.deleted_at is null and p.status <> 'removed'
    union all
    select 'guide', g.title, 'Guía', g.slug, ts_rank(g.search_vector, q.tsq)
    from guides g, q
    where g.search_vector @@ q.tsq and g.deleted_at is null and g.status <> 'removed'
  )
  select content_type, title, subtitle, slug
  from matches
  order by rank desc
  limit result_limit;
$$;

grant execute on function search_content(text, int) to anon, authenticated;
