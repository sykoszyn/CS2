-- =============================================================================
-- SmokeAR -- lineup coverage expansion (all 8 maps)
--
-- 0008_lineups_content.sql brought each map from 0-1 up to 3 real lineups.
-- This migration adds 6 more per map (48 total, 9 per map overall), filling in
-- the other bombsite, more grenade types (flash/he/decoy, not just
-- smoke/molotov) and more situations (defense/retake/default), so every map
-- has a genuinely useful spread instead of just 3 spots.
--
-- Same rules as 0008: is_demo = false / verified = true (real, usable spots,
-- not placeholders), no video_id (generic community-standard positions, not
-- tied to a specific creator's video this migration can't verify).
--
-- Each lineup also gets one row in `lineup_media`: a small original SVG
-- diagram (throw position -> target, generated for this migration, not a
-- game screenshot) under public/lineup-diagrams/. See docs/lineup-diagrams.md
-- for why: real screenshots from other lineup sites are someone else's
-- copyrighted work and this project doesn't rehost third-party media (see
-- the `videos` table comment in 0001_init.sql -- same principle applied here).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Mirage
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-window-flash-top-mid', 'Mirage Window Flash desde Top Mid', m.id, 'flash', 't',
    'Top Mid', 'Window', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Top Mid, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Window usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre Window, cegando a cualquiera que esté mirando hacia Top Mid. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-window-flash-top-mid.svg', 'Diagrama: Top Mid -> Window'
from lineups where slug = 'mirage-window-flash-top-mid'
on conflict do nothing;

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-underpass-he-mid', 'Mirage Underpass HE desde Mid', m.id, 'he', 't',
    'Mid', 'Underpass', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Mid, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Underpass usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en Underpass, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-underpass-he-mid.svg', 'Diagrama: Mid -> Underpass'
from lineups where slug = 'mirage-underpass-he-mid'
on conflict do nothing;

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-ramp-smoke-ct-spawn', 'Mirage Ramp Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Ramp', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Ramp usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Ramp. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-ramp-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Ramp'
from lineups where slug = 'mirage-ramp-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-bathroom-molotov-b-apps', 'Mirage Bathroom Molotov desde B Apps', m.id, 'molotov', 't',
    'B Apps', 'Bathroom', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en B Apps, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Bathroom usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Bathroom por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-bathroom-molotov-b-apps.svg', 'Diagrama: B Apps -> Bathroom'
from lineups where slug = 'mirage-bathroom-molotov-b-apps'
on conflict do nothing;

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-ct-spawn-decoy-t-spawn', 'Mirage CT Spawn Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'CT Spawn', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia CT Spawn usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia CT Spawn, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-ct-spawn-decoy-t-spawn.svg', 'Diagrama: T Spawn -> CT Spawn'
from lineups where slug = 'mirage-ct-spawn-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-sandbags-smoke-ticket-booth', 'Mirage Sandbags Smoke desde Ticket Booth', m.id, 'smoke', 'ct',
    'Ticket Booth', 'Sandbags', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Ticket Booth, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Sandbags usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Ticket Booth y Sandbags. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/mirage-sandbags-smoke-ticket-booth.svg', 'Diagrama: Ticket Booth -> Sandbags'
from lineups where slug = 'mirage-sandbags-smoke-ticket-booth'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Inferno
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-ct-spawn-flash-banana', 'Inferno CT Spawn Flash desde Banana', m.id, 'flash', 't',
    'Banana', 'CT Spawn', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Banana, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia CT Spawn usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre CT Spawn, cegando a cualquiera que esté mirando hacia Banana. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-ct-spawn-flash-banana.svg', 'Diagrama: Banana -> CT Spawn'
from lineups where slug = 'inferno-ct-spawn-flash-banana'
on conflict do nothing;

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-library-he-second-mid', 'Inferno Library HE desde Second Mid', m.id, 'he', 't',
    'Second Mid', 'Library', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Second Mid, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Library usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en Library, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-library-he-second-mid.svg', 'Diagrama: Second Mid -> Library'
from lineups where slug = 'inferno-library-he-second-mid'
on conflict do nothing;

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-coffins-smoke-ct-spawn', 'Inferno Coffins Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Coffins', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Coffins usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Coffins. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-coffins-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Coffins'
from lineups where slug = 'inferno-coffins-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-arch-molotov-apartments', 'Inferno Arch Molotov desde Apartments', m.id, 'molotov', 't',
    'Apartments', 'Arch', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Apartments, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Arch usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Arch por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-arch-molotov-apartments.svg', 'Diagrama: Apartments -> Arch'
from lineups where slug = 'inferno-arch-molotov-apartments'
on conflict do nothing;

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-banana-decoy-t-spawn', 'Inferno Banana Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'Banana', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Banana usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia Banana, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-banana-decoy-t-spawn.svg', 'Diagrama: T Spawn -> Banana'
from lineups where slug = 'inferno-banana-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-graveyard-smoke-pit', 'Inferno Graveyard Smoke desde Pit', m.id, 'smoke', 'ct',
    'Pit', 'Graveyard', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Pit, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Graveyard usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Pit y Graveyard. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/inferno-graveyard-smoke-pit.svg', 'Diagrama: Pit -> Graveyard'
from lineups where slug = 'inferno-graveyard-smoke-pit'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Nuke
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-secret-flash-outside', 'Nuke Secret Flash desde Outside', m.id, 'flash', 't',
    'Outside', 'Secret', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Outside, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Secret usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre Secret, cegando a cualquiera que esté mirando hacia Outside. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-secret-flash-outside.svg', 'Diagrama: Outside -> Secret'
from lineups where slug = 'nuke-secret-flash-outside'
on conflict do nothing;

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-heaven-he-ramp', 'Nuke Heaven HE desde Ramp', m.id, 'he', 't',
    'Ramp', 'Heaven', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Ramp, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Heaven usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en Heaven, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-heaven-he-ramp.svg', 'Diagrama: Ramp -> Heaven'
from lineups where slug = 'nuke-heaven-he-ramp'
on conflict do nothing;

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-hut-smoke-ct-spawn', 'Nuke Hut Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Hut', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Hut usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Hut. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-hut-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Hut'
from lineups where slug = 'nuke-hut-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-squeaky-molotov-silo', 'Nuke Squeaky Molotov desde Silo', m.id, 'molotov', 't',
    'Silo', 'Squeaky', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Silo, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Squeaky usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Squeaky por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-squeaky-molotov-silo.svg', 'Diagrama: Silo -> Squeaky'
from lineups where slug = 'nuke-squeaky-molotov-silo'
on conflict do nothing;

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-outside-decoy-t-spawn', 'Nuke Outside Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'Outside', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Outside usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia Outside, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-outside-decoy-t-spawn.svg', 'Diagrama: T Spawn -> Outside'
from lineups where slug = 'nuke-outside-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-rafters-smoke-vents', 'Nuke Rafters Smoke desde Vents', m.id, 'smoke', 'ct',
    'Vents', 'Rafters', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Vents, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Rafters usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Vents y Rafters. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/nuke-rafters-smoke-vents.svg', 'Diagrama: Vents -> Rafters'
from lineups where slug = 'nuke-rafters-smoke-vents'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Ancient
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-temple-flash-mid', 'Ancient Temple Flash desde Mid', m.id, 'flash', 't',
    'Mid', 'Temple', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Mid, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Temple usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre Temple, cegando a cualquiera que esté mirando hacia Mid. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-temple-flash-mid.svg', 'Diagrama: Mid -> Temple'
from lineups where slug = 'ancient-temple-flash-mid'
on conflict do nothing;

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-a-main-he-donut', 'Ancient A Main HE desde Donut', m.id, 'he', 't',
    'Donut', 'A Main', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Donut, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia A Main usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en A Main, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-a-main-he-donut.svg', 'Diagrama: Donut -> A Main'
from lineups where slug = 'ancient-a-main-he-donut'
on conflict do nothing;

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-ramp-smoke-ct-spawn', 'Ancient Ramp Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Ramp', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Ramp usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Ramp. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-ramp-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Ramp'
from lineups where slug = 'ancient-ramp-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-alley-molotov-b-main', 'Ancient Alley Molotov desde B Main', m.id, 'molotov', 't',
    'B Main', 'Alley', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en B Main, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Alley usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Alley por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-alley-molotov-b-main.svg', 'Diagrama: B Main -> Alley'
from lineups where slug = 'ancient-alley-molotov-b-main'
on conflict do nothing;

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-mid-decoy-t-spawn', 'Ancient Mid Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'Mid', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Mid usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia Mid, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-mid-decoy-t-spawn.svg', 'Diagrama: T Spawn -> Mid'
from lineups where slug = 'ancient-mid-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-cave-smoke-elbow', 'Ancient Cave Smoke desde Elbow', m.id, 'smoke', 'ct',
    'Elbow', 'Cave', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Elbow, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Cave usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Elbow y Cave. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/ancient-cave-smoke-elbow.svg', 'Diagrama: Elbow -> Cave'
from lineups where slug = 'ancient-cave-smoke-elbow'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Anubis
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-connector-flash-mid', 'Anubis Connector Flash desde Mid', m.id, 'flash', 't',
    'Mid', 'Connector', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Mid, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Connector usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre Connector, cegando a cualquiera que esté mirando hacia Mid. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-connector-flash-mid.svg', 'Diagrama: Mid -> Connector'
from lineups where slug = 'anubis-connector-flash-mid'
on conflict do nothing;

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-palace-he-water', 'Anubis Palace HE desde Water', m.id, 'he', 't',
    'Water', 'Palace', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Water, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Palace usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en Palace, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-palace-he-water.svg', 'Diagrama: Water -> Palace'
from lineups where slug = 'anubis-palace-he-water'
on conflict do nothing;

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-alley-smoke-ct-spawn', 'Anubis Alley Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Alley', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Alley usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Alley. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-alley-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Alley'
from lineups where slug = 'anubis-alley-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-wall-molotov-temple', 'Anubis Wall Molotov desde Temple', m.id, 'molotov', 't',
    'Temple', 'Wall', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Temple, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Wall usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Wall por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-wall-molotov-temple.svg', 'Diagrama: Temple -> Wall'
from lineups where slug = 'anubis-wall-molotov-temple'
on conflict do nothing;

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-mid-decoy-t-spawn', 'Anubis Mid Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'Mid', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Mid usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia Mid, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-mid-decoy-t-spawn.svg', 'Diagrama: T Spawn -> Mid'
from lineups where slug = 'anubis-mid-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-walkway-smoke-heaven', 'Anubis Walkway Smoke desde Heaven', m.id, 'smoke', 'ct',
    'Heaven', 'Walkway', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Heaven, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Walkway usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Heaven y Walkway. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/anubis-walkway-smoke-heaven.svg', 'Diagrama: Heaven -> Walkway'
from lineups where slug = 'anubis-walkway-smoke-heaven'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Vertigo
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-a-site-flash-mid', 'Vertigo A Site Flash desde Mid', m.id, 'flash', 't',
    'Mid', 'A Site', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Mid, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia A Site usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre A Site, cegando a cualquiera que esté mirando hacia Mid. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-a-site-flash-mid.svg', 'Diagrama: Mid -> A Site'
from lineups where slug = 'vertigo-a-site-flash-mid'
on conflict do nothing;

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-ladder-room-he-ramp-room', 'Vertigo Ladder Room HE desde Ramp Room', m.id, 'he', 't',
    'Ramp Room', 'Ladder Room', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Ramp Room, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Ladder Room usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en Ladder Room, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-ladder-room-he-ramp-room.svg', 'Diagrama: Ramp Room -> Ladder Room'
from lineups where slug = 'vertigo-ladder-room-he-ramp-room'
on conflict do nothing;

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-elevator-smoke-ct-spawn', 'Vertigo Elevator Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Elevator', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Elevator usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Elevator. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-elevator-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Elevator'
from lineups where slug = 'vertigo-elevator-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-bathroom-molotov-stairs', 'Vertigo Bathroom Molotov desde Stairs', m.id, 'molotov', 't',
    'Stairs', 'Bathroom', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Stairs, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Bathroom usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Bathroom por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-bathroom-molotov-stairs.svg', 'Diagrama: Stairs -> Bathroom'
from lineups where slug = 'vertigo-bathroom-molotov-stairs'
on conflict do nothing;

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-mid-decoy-t-spawn', 'Vertigo Mid Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'Mid', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Mid usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia Mid, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-mid-decoy-t-spawn.svg', 'Diagrama: T Spawn -> Mid'
from lineups where slug = 'vertigo-mid-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-ramp-smoke-generator', 'Vertigo Ramp Smoke desde Generator', m.id, 'smoke', 'ct',
    'Generator', 'Ramp', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Generator, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Ramp usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Generator y Ramp. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/vertigo-ramp-smoke-generator.svg', 'Diagrama: Generator -> Ramp'
from lineups where slug = 'vertigo-ramp-smoke-generator'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Dust II
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-short-flash-catwalk', 'Dust II Short Flash desde Catwalk', m.id, 'flash', 't',
    'Catwalk', 'Short', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Catwalk, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Short usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre Short, cegando a cualquiera que esté mirando hacia Catwalk. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-short-flash-catwalk.svg', 'Diagrama: Catwalk -> Short'
from lineups where slug = 'dust2-short-flash-catwalk'
on conflict do nothing;

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-pit-he-upper-tunnels', 'Dust II Pit HE desde Upper Tunnels', m.id, 'he', 't',
    'Upper Tunnels', 'Pit', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Upper Tunnels, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Pit usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en Pit, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-pit-he-upper-tunnels.svg', 'Diagrama: Upper Tunnels -> Pit'
from lineups where slug = 'dust2-pit-he-upper-tunnels'
on conflict do nothing;

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-goose-smoke-ct-spawn', 'Dust II Goose Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Goose', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Goose usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Goose. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-goose-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Goose'
from lineups where slug = 'dust2-goose-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-car-molotov-tunnels', 'Dust II Car Molotov desde Tunnels', m.id, 'molotov', 't',
    'Tunnels', 'Car', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Tunnels, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Car usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Car por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-car-molotov-tunnels.svg', 'Diagrama: Tunnels -> Car'
from lineups where slug = 'dust2-car-molotov-tunnels'
on conflict do nothing;

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-long-a-decoy-t-spawn', 'Dust II Long A Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'Long A', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Long A usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia Long A, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-long-a-decoy-t-spawn.svg', 'Diagrama: T Spawn -> Long A'
from lineups where slug = 'dust2-long-a-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-suicide-smoke-xbox', 'Dust II Suicide Smoke desde Xbox', m.id, 'smoke', 'ct',
    'Xbox', 'Suicide', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Xbox, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Suicide usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Xbox y Suicide. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/dust2-suicide-smoke-xbox.svg', 'Diagrama: Xbox -> Suicide'
from lineups where slug = 'dust2-suicide-smoke-xbox'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Overpass
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-bank-flash-long-a', 'Overpass Bank Flash desde Long A', m.id, 'flash', 't',
    'Long A', 'Bank', 'execute', 2, 'medium', 300, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Long A, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Bank usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click right, sin moverte del spot.', false, 'right'::click_type),
  (4, 'Resultado', 'La flash pop-ea justo sobre Bank, cegando a cualquiera que esté mirando hacia Long A. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-bank-flash-long-a.svg', 'Diagrama: Long A -> Bank'
from lineups where slug = 'overpass-bank-flash-long-a'
on conflict do nothing;

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-party-he-sewers', 'Overpass Party HE desde Sewers', m.id, 'he', 't',
    'Sewers', 'Party', 'execute', 3, 'medium', 263, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Sewers, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Party usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'La HE golpea a cualquiera parado en Party, quitando entre 30 y 50 de vida según la distancia. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-party-he-sewers.svg', 'Diagrama: Sewers -> Party'
from lineups where slug = 'overpass-party-he-sewers'
on conflict do nothing;

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-pillar-smoke-ct-spawn', 'Overpass Pillar Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Pillar', 'defense', 2, 'medium', 226, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Pillar usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre CT Spawn y Pillar. Útil para reforzar la defensa.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-pillar-smoke-ct-spawn.svg', 'Diagrama: CT Spawn -> Pillar'
from lineups where slug = 'overpass-pillar-smoke-ct-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-bathrooms-molotov-monster', 'Overpass Bathrooms Molotov desde Monster', m.id, 'molotov', 't',
    'Monster', 'Bathrooms', 'execute', 2, 'close', 189, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Monster, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Bathrooms usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El fuego cubre Bathrooms por varios segundos, negando esa posición sin exponerte. Útil durante una ejecución coordinada.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-bathrooms-molotov-monster.svg', 'Diagrama: Monster -> Bathrooms'
from lineups where slug = 'overpass-bathrooms-molotov-monster'
on conflict do nothing;

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-long-a-decoy-t-spawn', 'Overpass Long A Decoy desde T Spawn', m.id, 'decoy', 't',
    'T Spawn', 'Long A', 'default', 1, 'long', 152, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Long A usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Lanzamiento con click left, sin moverte del spot.', false, 'left'::click_type),
  (4, 'Resultado', 'El sonido de disparos simula una ejecución hacia Long A, atrayendo rotaciones equivocadas. Útil en una ronda default.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-long-a-decoy-t-spawn.svg', 'Diagrama: T Spawn -> Long A'
from lineups where slug = 'overpass-long-a-decoy-t-spawn'
on conflict do nothing;

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-fountain-smoke-heaven', 'Overpass Fountain Smoke desde Heaven', m.id, 'smoke', 'ct',
    'Heaven', 'Fountain', 'retake', 3, 'close', 115, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en Heaven, buscá una referencia fija en el suelo o una pared cercana para repetir el spot siempre igual.', false, null::click_type),
  (2, 'Mira', 'Apuntá hacia Fountain usando algún punto de referencia del escenario (borde de techo, textura o esquina) como mira.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow para que salga siempre igual, sin depender del timing del salto.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke tapa por completo la línea de visión entre Heaven y Fountain. Útil durante un retake.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

insert into lineup_media (lineup_id, image_url, caption)
select id, '/lineup-diagrams/overpass-fountain-smoke-heaven.svg', 'Diagrama: Heaven -> Fountain'
from lineups where slug = 'overpass-fountain-smoke-heaven'
on conflict do nothing;
