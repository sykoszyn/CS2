-- =============================================================================
-- SmokeAR -- diagrams for the original 24 lineups from 0008_lineups_content.sql
--
-- 0010_lineups_expansion.sql added a lineup_media diagram for every one of its
-- 48 new lineups but left the earlier 24 (from 0008) without one. This backfills
-- those so every real, verified lineup on the site has a diagram, not just the
-- newest batch. Same original SVG approach as 0010 -- no third-party images.
-- =============================================================================

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-palace-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Palace'
from lineups where slug = 'mirage-palace-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-stairs-smoke-apps.svg', 'Diagrama: B Apps -> Stairs'
from lineups where slug = 'mirage-stairs-smoke-apps'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-jungle-molotov-retake.svg', 'Diagrama: A Site -> Jungle'
from lineups where slug = 'mirage-jungle-molotov-retake'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-secondmid-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Second Mid'
from lineups where slug = 'inferno-secondmid-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-library-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Library'
from lineups where slug = 'inferno-library-smoke-ct-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-arch-flash-apartments.svg', 'Diagrama: Apartments -> Arch'
from lineups where slug = 'inferno-arch-flash-apartments'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-outside-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Secret'
from lineups where slug = 'nuke-outside-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-heaven-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Heaven'
from lineups where slug = 'nuke-heaven-smoke-ct-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-ramp-molotov-retake.svg', 'Diagrama: Ramp Room -> Ramp'
from lineups where slug = 'nuke-ramp-molotov-retake'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-mid-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Mid'
from lineups where slug = 'ancient-mid-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-donut-smoke-a-main.svg', 'Diagrama: A Main -> Donut'
from lineups where slug = 'ancient-donut-smoke-a-main'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-cave-flash-mid.svg', 'Diagrama: Mid -> Cave'
from lineups where slug = 'ancient-cave-flash-mid'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-mid-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Mid Canal'
from lineups where slug = 'anubis-mid-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-heaven-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Heaven'
from lineups where slug = 'anubis-heaven-smoke-ct-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-water-molotov-execute.svg', 'Diagrama: Mid -> Water'
from lineups where slug = 'anubis-water-molotov-execute'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-ramp-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Ramp Room'
from lineups where slug = 'vertigo-ramp-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-b-site-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> B Site'
from lineups where slug = 'vertigo-b-site-smoke-ct-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-ladder-flash-mid.svg', 'Diagrama: Mid -> Ladder Room'
from lineups where slug = 'vertigo-ladder-flash-mid'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-long-corner-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Long Corner'
from lineups where slug = 'dust2-long-corner-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-crossmid-molotov-t-spawn.svg', 'Diagrama: T Spawn -> Mid Doors'
from lineups where slug = 'dust2-crossmid-molotov-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-tunnels-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Tunnels'
from lineups where slug = 'dust2-tunnels-smoke-ct-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-bathrooms-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Bathrooms'
from lineups where slug = 'overpass-bathrooms-smoke-ct-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-longa-smoke-t-spawn.svg', 'Diagrama: T Spawn -> Fountain'
from lineups where slug = 'overpass-longa-smoke-t-spawn'
on conflict do nothing;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-monster-flash-bathrooms.svg', 'Diagrama: Bathrooms -> Monster'
from lineups where slug = 'overpass-monster-flash-bathrooms'
on conflict do nothing;
