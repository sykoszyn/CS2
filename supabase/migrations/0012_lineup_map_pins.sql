-- =============================================================================
-- SmokeAR — lineup pins on the map radar
--
-- Adds an (x, y) position (percentage of the radar image, same convention
-- as `map_zones.x/y` from 0001_init.sql) so a lineup's effect can be shown
-- as a pin directly on the map radar, not just as free-text throw/target
-- zone names. Nullable: the 72 lineups added in 0008/0010/0011 don't have a
-- known precise position, so they simply render without a pin until an
-- admin (or the original author) places one — this migration never invents
-- coordinates for existing content.
--
-- `maps.radar_url_lower` covers Nuke, the only map with two vertical
-- levels and therefore two separate radar images; every other map only
-- ever uses `radar_url`.
-- =============================================================================

alter table lineups
  add column pin_x numeric(5, 2) check (pin_x is null or (pin_x >= 0 and pin_x <= 100)),
  add column pin_y numeric(5, 2) check (pin_y is null or (pin_y >= 0 and pin_y <= 100));

alter table maps
  add column radar_url_lower text;

-- `create or replace` keeps the same signature/return type as 0004, so no
-- drop is needed — just adds pin_x/pin_y as two more optional payload keys.
create or replace function create_lineup_with_steps(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_lineup_id uuid;
  new_video_id uuid;
  step jsonb;
begin
  if coalesce(payload->>'video_url', '') <> '' then
    insert into videos (source, url, uploader_id)
    values (
      coalesce((payload->>'video_source')::video_source, 'youtube'),
      payload->>'video_url',
      auth.uid()
    )
    returning id into new_video_id;
  end if;

  insert into lineups (
    slug, name, map_id, grenade_type, side, throw_zone, target_zone,
    situation, difficulty, distance, author_id, video_id, pin_x, pin_y
  )
  values (
    payload->>'slug',
    payload->>'name',
    (payload->>'map_id')::uuid,
    (payload->>'grenade_type')::grenade_type,
    (payload->>'side')::side_type,
    payload->>'throw_zone',
    payload->>'target_zone',
    coalesce((payload->>'situation')::lineup_situation, 'default'),
    coalesce((payload->>'difficulty')::smallint, 1),
    coalesce((payload->>'distance')::distance_type, 'medium'),
    auth.uid(),
    new_video_id,
    nullif(payload->>'pin_x', '')::numeric,
    nullif(payload->>'pin_y', '')::numeric
  )
  returning id into new_lineup_id;

  for step in select * from jsonb_array_elements(payload->'steps')
  loop
    insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
    values (
      new_lineup_id,
      (step->>'order')::int,
      step->>'title',
      step->>'instruction',
      coalesce((step->>'jumpthrow')::boolean, false),
      case when coalesce(step->>'clickType', '') = '' then null else (step->>'clickType')::click_type end
    );
  end loop;

  return new_lineup_id;
end;
$$;

grant execute on function create_lineup_with_steps(jsonb) to authenticated;
