-- =============================================================================
-- SmokeAR — throw technique per step
--
-- `lineup_steps.jumpthrow` only captured one of the throw techniques CS2
-- lineups actually use. Replaced with an enum covering the ones players
-- are taught to execute: standing (normal), jumpthrow, walkthrow (throwing
-- while holding forward, shortens the arc) and crouch (throwing crouched,
-- also used to shorten/steady some arcs). `click_type` (left/right/hold,
-- from 0001_init.sql) is unrelated — that's mouse button, this is stance.
-- =============================================================================

create type throw_technique as enum ('normal', 'jumpthrow', 'walkthrow', 'crouch');

alter table lineup_steps add column throw_technique throw_technique not null default 'normal';
update lineup_steps set throw_technique = 'jumpthrow' where jumpthrow;
alter table lineup_steps drop column jumpthrow;

-- `create or replace` keeps the same signature/return type as 0012 — just
-- swaps the `jumpthrow` boolean payload key for `throw_technique`.
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
    insert into lineup_steps (lineup_id, step_order, title, instruction, throw_technique, click_type)
    values (
      new_lineup_id,
      (step->>'order')::int,
      step->>'title',
      step->>'instruction',
      coalesce((step->>'throwTechnique')::throw_technique, 'normal'),
      case when coalesce(step->>'clickType', '') = '' then null else (step->>'clickType')::click_type end
    );
  end loop;

  return new_lineup_id;
end;
$$;

grant execute on function create_lineup_with_steps(jsonb) to authenticated;
