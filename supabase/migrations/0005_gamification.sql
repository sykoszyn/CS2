-- =============================================================================
-- SmokeAR — gamification: XP, levels, achievements
--
-- Security note: XP and achievements are awarded from AFTER INSERT triggers
-- on lineups/plays/boosts, never from a standalone RPC. A standalone
-- "award_xp(user_id, amount)" function would be callable directly by any
-- authenticated client via PostgREST with an arbitrary amount — there would
-- be no way to stop someone from calling it on themselves in a loop. Tying
-- the award to the trigger means it only ever fires as a side effect of an
-- insert that RLS already gated (author_id = auth.uid()), so there's no
-- separate attack surface.
-- =============================================================================

insert into achievements (slug, name, description, icon) values
  ('first_smoke', 'First Smoke', 'Subiste tu primer lineup.', '💨'),
  ('first_play', 'Primera Jugada', 'Publicaste tu primera jugada.', '🎬'),
  ('first_boost', 'Primer Boost', 'Subiste tu primer boost.', '🤝'),
  ('smoke_master', 'Smoke Master', 'Subiste 10 lineups.', '🔥'),
  ('community_contributor', 'Community Contributor', 'Subiste 10 contenidos en total.', '🏆')
on conflict (slug) do nothing;

-- Internal only — never granted to `authenticated`, only called from the
-- trigger below (which is itself security definer).
create or replace function check_and_award_achievements(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  lineup_count int;
  play_count int;
  boost_count int;
begin
  select count(*) into lineup_count from lineups where author_id = target_user_id;
  select count(*) into play_count from plays where author_id = target_user_id;
  select count(*) into boost_count from boosts where author_id = target_user_id;

  if lineup_count >= 1 then
    insert into user_achievements (user_id, achievement_id)
    select target_user_id, id from achievements where slug = 'first_smoke'
    on conflict do nothing;
  end if;

  if play_count >= 1 then
    insert into user_achievements (user_id, achievement_id)
    select target_user_id, id from achievements where slug = 'first_play'
    on conflict do nothing;
  end if;

  if boost_count >= 1 then
    insert into user_achievements (user_id, achievement_id)
    select target_user_id, id from achievements where slug = 'first_boost'
    on conflict do nothing;
  end if;

  if lineup_count >= 10 then
    insert into user_achievements (user_id, achievement_id)
    select target_user_id, id from achievements where slug = 'smoke_master'
    on conflict do nothing;
  end if;

  if (lineup_count + play_count + boost_count) >= 10 then
    insert into user_achievements (user_id, achievement_id)
    select target_user_id, id from achievements where slug = 'community_contributor'
    on conflict do nothing;
  end if;
end;
$$;

-- 15 XP per lineup, 10 per play/boost — arbitrary but consistent; level is
-- derived (100 xp per level) so it never drifts out of sync with xp.
create or replace function award_content_xp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  xp_amount int;
begin
  if new.author_id is null then
    return new;
  end if;

  xp_amount := case tg_table_name
    when 'lineups' then 15
    when 'plays' then 10
    when 'boosts' then 10
    else 0
  end;

  update profiles
  set xp = xp + xp_amount,
      level = floor((xp + xp_amount) / 100.0)::int + 1
  where id = new.author_id;

  perform check_and_award_achievements(new.author_id);

  return new;
end;
$$;

create trigger lineups_award_xp
  after insert on lineups
  for each row execute function award_content_xp();

create trigger plays_award_xp
  after insert on plays
  for each row execute function award_content_xp();

create trigger boosts_award_xp
  after insert on boosts
  for each row execute function award_content_xp();
