-- =============================================================================
-- SmokeAR — make search results translatable
--
-- search_content() previously baked Spanish text straight into the result
-- ("Lineup · mirage", "Mapa") via SQL string concatenation — that can't be
-- translated once the UI supports multiple languages. This returns the
-- map's slug instead of a formatted subtitle, so the app layer builds the
-- label in whatever language the visitor is using.
--
-- The return shape changes (subtitle -> map_slug), so the function has to
-- be dropped and recreated rather than replaced in place.
-- =============================================================================

drop function if exists search_content(text, int);

create or replace function search_content(query text, result_limit int default 20)
returns table (
  content_type text,
  title text,
  slug text,
  map_slug text
)
language sql
stable
security invoker
set search_path = public
as $$
  with q as (select websearch_to_tsquery('spanish', query) as tsq),
  matches as (
    select 'map' as content_type, m.name as title, m.slug, m.slug as map_slug,
      ts_rank(m.search_vector, q.tsq) as rank
    from maps m, q
    where m.search_vector @@ q.tsq and m.active
    union all
    select 'lineup', l.name, l.slug, mp.slug, ts_rank(l.search_vector, q.tsq)
    from lineups l join maps mp on mp.id = l.map_id, q
    where l.search_vector @@ q.tsq and l.deleted_at is null and l.status <> 'removed'
    union all
    select 'boost', b.name, b.slug, mp.slug, ts_rank(b.search_vector, q.tsq)
    from boosts b join maps mp on mp.id = b.map_id, q
    where b.search_vector @@ q.tsq and b.deleted_at is null and b.status <> 'removed'
    union all
    select 'play', p.title, p.slug, mp.slug, ts_rank(p.search_vector, q.tsq)
    from plays p join maps mp on mp.id = p.map_id, q
    where p.search_vector @@ q.tsq and p.deleted_at is null and p.status <> 'removed'
    union all
    select 'guide', g.title, g.slug, mp.slug, ts_rank(g.search_vector, q.tsq)
    from guides g left join maps mp on mp.id = g.map_id, q
    where g.search_vector @@ q.tsq and g.deleted_at is null and g.status <> 'removed'
  )
  select content_type, title, slug, map_slug
  from matches
  order by rank desc
  limit result_limit;
$$;

grant execute on function search_content(text, int) to anon, authenticated;
