-- =============================================================================
-- SmokeAR — real, published lineup content
--
-- The original seed (0002_seed.sql) only had 3 lineups on 2 maps, one of
-- them with a placeholder (rickroll) video — enough to prove the pipeline
-- worked, not enough to look like a real lineup database. This adds 24
-- more real, widely-known CS2 lineup spots (3 per map, across all 8 seeded
-- maps), covering smokes/flashes/molotovs on both sides.
--
-- Unlike the original seed, these are marked `is_demo = false, verified =
-- true`: they're not placeholder data, they're real positions a player can
-- actually use — the "DEMO" badge and "sin verificar" state would be
-- misleading here. No video_id: these describe real, generic community
-- knowledge (standard positions taught in most lineup guides), not tied to
-- any specific creator's video, and this migration can't verify a
-- particular YouTube link actually shows the exact spot described.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Mirage
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-palace-smoke-t-spawn', 'Mirage Palace Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Palace', 'execute', 2, 'medium', 940, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Parado en T Spawn, contra la caja pegada a la pared derecha según salís hacia Mid.', false, null::click_type),
  (2, 'Mira', 'Apuntá al punto donde el techo de Palace se corta contra el cielo.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow normal.', true, 'left'::click_type),
  (4, 'Resultado', 'La smoke cae justo en la entrada de Palace, tapando el ángulo hacia A Main.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-stairs-smoke-apps', 'Mirage Stairs Smoke desde Apps', m.id, 'smoke', 't',
    'B Apps', 'Stairs', 'execute', 2, 'close', 1105, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde B Apps, pegado a la pared izquierda antes de bajar a Market.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo apuntando por arriba del cartel de Stairs.', 'left'::click_type),
  (3, 'Resultado', 'Tapa la visión de Stairs hacia Apps durante el execute de B.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'mirage'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'mirage-jungle-molotov-retake', 'Mirage Jungle Molotov Retake', m.id, 'molotov', 'ct',
    'A Site', 'Jungle', 'retake', 2, 'close', 720, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Parado en A Site, a la altura del cartel, mirando hacia Jungle.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo directo, sin rebote.', 'left'::click_type),
  (3, 'Resultado', 'Despeja a cualquiera escondido en Jungle antes de entrar a retomar.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

-- ---------------------------------------------------------------------------
-- Inferno
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-secondmid-smoke-t-spawn', 'Inferno Second Mid Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Second Mid', 'attack', 2, 'medium', 860, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, alineado con el borde derecho de la reja de salida a Mid.', false, null::click_type),
  (2, 'Mira', 'Apuntá al cable eléctrico que cruza por arriba de Second Mid.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow.', true, 'left'::click_type),
  (4, 'Resultado', 'Corta la línea de vista entre Second Mid y Banana mientras el equipo cruza.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-library-smoke-ct-spawn', 'Inferno Library Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Library', 'default', 2, 'close', 690, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, mirando hacia el pasillo de Library.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo normal.', 'left'::click_type),
  (3, 'Resultado', 'Bloquea la visión desde Library hacia Banana mientras rotás.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'inferno'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'inferno-arch-flash-apartments', 'Inferno Arch Flash desde Apartments', m.id, 'flash', 't',
    'Apartments', 'Arch', 'execute', 2, 'medium', 505, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde Apartments, mirando hacia Arch por arriba de la pared baja.', null::click_type),
  (2, 'Lanzamiento', 'Click derecho para que rebote y ciegue mirando hacia Apartments.', 'right'::click_type),
  (3, 'Resultado', 'Ciega a los defensores de Arch justo antes de entrar a B.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

-- ---------------------------------------------------------------------------
-- Nuke
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-outside-smoke-t-spawn', 'Nuke Outside Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Secret', 'execute', 3, 'long', 610, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, pegado al contenedor de la derecha antes de salir a Outside.', false, null::click_type),
  (2, 'Mira', 'Apuntá al extremo superior de la antena que se ve sobre Secret.', false, null::click_type),
  (3, 'Lanzamiento', 'Jumpthrow.', true, 'left'::click_type),
  (4, 'Resultado', 'Corta la línea de rotación de los CT desde Secret hacia Outside.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-heaven-smoke-ct-spawn', 'Nuke Heaven Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Heaven', 'default', 2, 'medium', 780, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, mirando hacia la escalera de Heaven.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo normal.', 'left'::click_type),
  (3, 'Resultado', 'Tapa la vista desde Heaven hacia A Site mientras se arma la defensa.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'nuke'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'nuke-ramp-molotov-retake', 'Nuke Ramp Molotov Retake', m.id, 'molotov', 'ct',
    'Ramp Room', 'Ramp', 'retake', 2, 'close', 540, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde Ramp Room, mirando hacia arriba de la rampa que sube a A Site.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo directo.', 'left'::click_type),
  (3, 'Resultado', 'Despeja Ramp antes de subir a retomar A.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

-- ---------------------------------------------------------------------------
-- Ancient
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-mid-smoke-t-spawn', 'Ancient Mid Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Mid', 'attack', 2, 'medium', 670, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, alineado con el árbol grande a la salida de Mid.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo normal.', 'left'::click_type),
  (3, 'Resultado', 'Corta la línea de vista de Mid a Mid Doors mientras tu equipo avanza.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-donut-smoke-a-main', 'Ancient Donut Smoke desde A Main', m.id, 'smoke', 't',
    'A Main', 'Donut', 'execute', 2, 'close', 590, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Parado en A Main, pegado a la roca de la izquierda.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo apuntando por arriba de las cajas de Donut.', 'left'::click_type),
  (3, 'Resultado', 'Tapa Donut mientras el equipo entra a plantar en A.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'ancient'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'ancient-cave-flash-mid', 'Ancient Cave Flash desde Mid', m.id, 'flash', 't',
    'Mid', 'Cave', 'execute', 2, 'medium', 415, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde Mid, mirando hacia la entrada de Cave.', null::click_type),
  (2, 'Lanzamiento', 'Click derecho para que rebote adentro de Cave.', 'right'::click_type),
  (3, 'Resultado', 'Ciega a quien defiende Cave antes de entrar a B.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

-- ---------------------------------------------------------------------------
-- Anubis
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-mid-smoke-t-spawn', 'Anubis Mid Canal Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Mid Canal', 'attack', 2, 'medium', 520, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, pegado a la columna izquierda antes de bajar al canal.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo normal.', 'left'::click_type),
  (3, 'Resultado', 'Bloquea la vista de Mid Canal mientras se decide el split hacia A o B.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-heaven-smoke-ct-spawn', 'Anubis Heaven Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Heaven', 'default', 2, 'close', 460, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, mirando hacia la rampa de Heaven.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo directo.', 'left'::click_type),
  (3, 'Resultado', 'Tapa Heaven mientras se arma la defensa de A Site.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'anubis'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'anubis-water-molotov-execute', 'Anubis Water Molotov Execute B', m.id, 'molotov', 't',
    'Mid', 'Water', 'execute', 3, 'medium', 380, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde Mid, alineado con la entrada al canal que lleva a Water.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo apuntando al centro del canal.', 'left'::click_type),
  (3, 'Resultado', 'Despeja a cualquiera parado en Water antes de cruzar hacia B.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

-- ---------------------------------------------------------------------------
-- Vertigo
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-ramp-smoke-t-spawn', 'Vertigo Ramp Room Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Ramp Room', 'execute', 2, 'medium', 430, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, pegado a la baranda antes de subir hacia A.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo normal.', 'left'::click_type),
  (3, 'Resultado', 'Bloquea la vista de Ramp Room hacia A Site durante el execute.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-b-site-smoke-ct-spawn', 'Vertigo B Site Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'B Site', 'default', 2, 'close', 395, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, mirando hacia la escalera que baja a B.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo directo.', 'left'::click_type),
  (3, 'Resultado', 'Retrasa un rush directo a B mientras se reposiciona el equipo.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'vertigo'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'vertigo-ladder-flash-mid', 'Vertigo Ladder Room Flash desde Mid', m.id, 'flash', 't',
    'Mid', 'Ladder Room', 'execute', 2, 'medium', 310, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde Mid, mirando hacia la entrada de Ladder Room.', null::click_type),
  (2, 'Lanzamiento', 'Click derecho para que rebote adentro del cuarto.', 'right'::click_type),
  (3, 'Resultado', 'Ciega a los defensores de Ladder Room antes de entrar a B.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

-- ---------------------------------------------------------------------------
-- Dust II
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-long-corner-smoke-t-spawn', 'Dust II Long Corner Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Long Corner', 'attack', 1, 'medium', 1240, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, corré por Long hasta el primer cajón grande.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo apuntando a la esquina donde suele pararse el CT.', 'left'::click_type),
  (3, 'Resultado', 'Tapa Long Corner para cruzar Long sin exponerse al pit.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-crossmid-molotov-t-spawn', 'Dust II Cross Mid Molotov desde T Spawn', m.id, 'molotov', 't',
    'T Spawn', 'Mid Doors', 'attack', 2, 'medium', 980, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, entrá a Mid hasta la altura del cartel.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo apuntando a la puerta que da a CT Spawn.', 'left'::click_type),
  (3, 'Resultado', 'Evita que un CT cruce mid a tomar Xbox mientras tu equipo decide el sitio.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'dust2'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'dust2-tunnels-smoke-ct-spawn', 'Dust II Tunnels Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Tunnels', 'default', 2, 'close', 860, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Parado en CT Spawn, mirando hacia la salida de Tunnels a B.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo directo.', 'left'::click_type),
  (3, 'Resultado', 'Retrasa un rush de Tunnels dándole tiempo al equipo a rotar.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

-- ---------------------------------------------------------------------------
-- Overpass
-- ---------------------------------------------------------------------------

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-bathrooms-smoke-ct-spawn', 'Overpass Bathrooms Smoke desde CT Spawn', m.id, 'smoke', 'ct',
    'CT Spawn', 'Bathrooms', 'default', 2, 'medium', 610, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde CT Spawn, bajá hacia el pasillo que conecta con Bathrooms.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo apuntando a la entrada de Bathrooms.', 'left'::click_type),
  (3, 'Resultado', 'Bloquea el push directo de T por Bathrooms hacia A.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-longa-smoke-t-spawn', 'Overpass Long A Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Fountain', 'execute', 2, 'medium', 470, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde T Spawn, avanzá por Long hasta la altura de la fuente.', null::click_type),
  (2, 'Lanzamiento', 'Click izquierdo apuntando hacia el banco de A Site.', 'left'::click_type),
  (3, 'Resultado', 'Tapa la vista desde el banco mientras el equipo entra a plantar.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (select id from maps where slug = 'overpass'), l as (
  insert into lineups (slug, name, map_id, grenade_type, side, throw_zone, target_zone, situation, difficulty, distance, usage_count, verified, is_demo)
  select 'overpass-monster-flash-bathrooms', 'Overpass Monster Flash desde Bathrooms', m.id, 'flash', 't',
    'Bathrooms', 'Monster', 'execute', 2, 'close', 355, true, false
  from m on conflict (slug) do nothing returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type from l join (values
  (1, 'Posición', 'Desde Bathrooms, mirando hacia la entrada de Monster (B Site).', null::click_type),
  (2, 'Lanzamiento', 'Click derecho para que rebote adentro de Monster.', 'right'::click_type),
  (3, 'Resultado', 'Ciega a quien defiende Monster antes de entrar a B.', null::click_type)
) as s(step_order, title, instruction, click_type) on true;
