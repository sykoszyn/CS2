-- =============================================================================
-- SmokeAR — atomic lineup creation
-- Inserting a lineup + its video + its steps as separate client-side calls
-- risks leaving an orphaned lineup behind if a later insert fails. This RPC
-- does it all in one function call, which Postgres runs as a single
-- transaction — one failure rolls back everything.
--
-- `security invoker` (not definer): it runs as the calling user, so the
-- existing RLS policies (lineups_insert_own, etc.) still apply — this
-- function has no more power than the user already has.
-- =============================================================================

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
    situation, difficulty, distance, author_id, video_id
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
    new_video_id
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
