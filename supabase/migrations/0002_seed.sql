-- =============================================================================
-- SmokeAR — demo seed data
-- Everything here is marked is_demo = true and verified = false: it exists so
-- the app has something to render on day one, not as an authoritative source.
-- Run this AFTER 0001_init.sql. Safe to re-run (guarded by slug lookups).
-- =============================================================================

insert into maps (slug, name, description, version, bombsites)
values
  ('mirage', 'Mirage', 'Mapa de mid-control clasico. Dos bombsites conectados por Mid, con Window y Connector como puntos clave.', 'CS2', array['A','B']),
  ('inferno', 'Inferno', 'Mapa angosto y vertical con Banana como eje central de rotaciones hacia B site.', 'CS2', array['A','B']),
  ('nuke', 'Nuke', 'Mapa vertical de dos plantas, con Rafters y Ramp como zonas criticas de A site.', 'CS2', array['A','B']),
  ('ancient', 'Ancient', 'Mapa de jungla con lineas de vista cortas y mucho juego de utility en Mid.', 'CS2', array['A','B']),
  ('anubis', 'Anubis', 'Mapa con canales de agua y Mid dividido, favorece ejecuciones coordinadas.', 'CS2', array['A','B']),
  ('vertigo', 'Vertigo', 'Mapa vertical en altura, con B site abierto y A site denso en cobertura.', 'CS2', array['A','B']),
  ('dust2', 'Dust II', 'El mapa mas iconico de la serie. Long A y Tunnels B definen el ritmo del juego.', 'CS2', array['A','B']),
  ('overpass', 'Overpass', 'Mapa tecnico con Bathrooms y Monster como zonas de alto trafico de utility.', 'CS2', array['A','B'])
on conflict (slug) do nothing;

insert into map_zones (map_id, name, aliases, description, x, y)
select m.id, z.name, z.aliases, z.description, z.x, z.y
from maps m
join (
  values
    ('Window', array['Ventana'], 'Ventana que conecta Mid con A site, punto clave de informacion y utility.', 42, 38),
    ('Jungle', array['Palm','Palmeras'], 'Zona de vegetacion en A site usada para flancos y retakes.', 58, 30),
    ('Connector', array['Con'], 'Pasillo que conecta Mid con B Apps.', 35, 55),
    ('Ticket Booth', array['Ticket','TB'], 'Estructura en Mid usada como cover durante peeks.', 40, 60),
    ('Stairs', array['Escaleras'], 'Escaleras de acceso a B site desde Apps.', 25, 45)
) as z(name, aliases, description, x, y) on true
where m.slug = 'mirage'
on conflict (map_id, name) do nothing;

-- Lineups (author_id left null: seed content has no synthetic user attached)
with v as (
  insert into videos (source, url, duration_seconds)
  values ('youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 42)
  returning id
), m as (
  select id from maps where slug = 'mirage'
), l as (
  insert into lineups (
    slug, name, map_id, grenade_type, side, throw_zone, target_zone,
    situation, difficulty, distance, video_id, usage_count, verified, is_demo
  )
  select
    'mirage-window-smoke-t-spawn', 'Mirage Window Smoke desde T Spawn', m.id, 'smoke', 't',
    'T Spawn', 'Window', 'execute', 2, 'medium', v.id, 1820, false, true
  from m, v
  on conflict (slug) do nothing
  returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow, click_type)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow, s.click_type
from l
join (
  values
    (1, 'Posicion', 'Parate en la salida de T Spawn, alineado con el borde izquierdo del cartel.', false, null::click_type),
    (2, 'Mira', 'Apunta al borde superior del marco de la ventana.', false, null::click_type),
    (3, 'Lanzamiento', 'Click izquierdo normal, sin jumpthrow.', false, 'left'::click_type),
    (4, 'Resultado', 'La smoke cubre Window por completo durante ~18 segundos.', false, null::click_type)
) as s(step_order, title, instruction, jumpthrow, click_type) on true;

with m as (
  select id from maps where slug = 'mirage'
), l as (
  insert into lineups (
    slug, name, map_id, grenade_type, side, throw_zone, target_zone,
    situation, difficulty, distance, usage_count, verified, is_demo
  )
  select 'mirage-ctspawn-flash-a-site', 'Mirage Flash CT Spawn hacia A Site', m.id, 'flash', 'ct',
    'CT Spawn', 'A Site', 'defense', 1, 'close', 640, false, true
  from m
  on conflict (slug) do nothing
  returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, click_type)
select l.id, s.step_order, s.title, s.instruction, s.click_type
from l
join (
  values
    (1, 'Posicion', 'Parate en CT Spawn mirando hacia Ramp.', null::click_type),
    (2, 'Lanzamiento', 'Lanza por arriba de Ramp con click derecho para popflash.', 'right'::click_type)
) as s(step_order, title, instruction, click_type) on true;

with m as (
  select id from maps where slug = 'inferno'
), l as (
  insert into lineups (
    slug, name, map_id, grenade_type, side, throw_zone, target_zone,
    situation, difficulty, distance, usage_count, verified, is_demo
  )
  select 'inferno-banana-molotov-default', 'Inferno Molotov Banana Default', m.id, 'molotov', 't',
    'T Spawn', 'Banana', 'default', 3, 'long', 410, false, true
  from m
  on conflict (slug) do nothing
  returning id
)
insert into lineup_steps (lineup_id, step_order, title, instruction, jumpthrow)
select l.id, s.step_order, s.title, s.instruction, s.jumpthrow
from l
join (
  values
    (1, 'Posicion', 'Desde T Spawn, alineado con la segunda ventana del edificio.', false),
    (2, 'Lanzamiento', 'Jumpthrow apuntando al cielo sobre el arbol de Banana.', true)
) as s(step_order, title, instruction, jumpthrow) on true;

-- Boosts
insert into boosts (slug, name, map_id, location, players_required, category, side, difficulty, description, is_demo)
select 'nuke-vent-boost-2-players', 'Nuke Vent Boost (2 jugadores)', m.id, 'Outside Vent', 2, 'competitive', 't', 3,
  'Boost clasico para ver por el vent exterior y sorprender a los CT que rotan por Garage.', true
from maps m where m.slug = 'nuke'
on conflict (slug) do nothing;

insert into boosts (slug, name, map_id, location, players_required, category, side, difficulty, description, is_demo)
select 'vertigo-ramp-boost-3-players', 'Vertigo Ramp Boost (3 jugadores)', m.id, 'A Ramp', 3, 'exotic', 't', 5,
  'Boost exotico para tomar un angulo elevado sobre A site durante un execute.', true
from maps m where m.slug = 'vertigo'
on conflict (slug) do nothing;

-- Plays
with v as (
  insert into videos (source, url, duration_seconds) values ('youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 55) returning id
)
insert into plays (slug, title, description, map_id, category, video_id, like_count, comment_count, is_demo)
select 'ace-clutch-mirage-b-retake', 'Ace en retake de B site', 'Retake 1v4 convertido en ace gracias a una flash perfecta de Stairs.',
  m.id, 'clutch', v.id, 512, 34, true
from maps m, v where m.slug = 'mirage'
on conflict (slug) do nothing;

with v as (
  insert into videos (source, url, duration_seconds) values ('youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 20) returning id
)
insert into plays (slug, title, description, map_id, category, video_id, like_count, comment_count, is_demo)
select 'wallbang-banana-inferno', 'Wallbang doble kill en Banana', 'Wallbang a traves del contenedor que conecta dos kills en Banana.',
  m.id, 'wallbang', v.id, 210, 12, true
from maps m, v where m.slug = 'inferno'
on conflict (slug) do nothing;

-- Guides
with g as (
  insert into guides (slug, title, summary, map_id, level, is_demo)
  select 'mirage-desde-cero', 'Mirage desde cero', 'Todo lo que necesitas saber para jugar Mirage por primera vez a nivel competitivo.',
    m.id, 'beginner', true
  from maps m where m.slug = 'mirage'
  on conflict (slug) do nothing
  returning id
)
insert into guide_sections (guide_id, section_order, title, content)
select g.id, s.section_order, s.title, s.content
from g
join (
  values
    (1, 'Callouts basicos', 'Aprende los callouts esenciales: Window, Jungle, Connector, Ticket, Stairs...'),
    (2, 'Economia de ronda', 'Como administrar tu utility en las primeras rondas.'),
    (3, 'Ejecuciones basicas de A y B', 'Introduccion a los executes mas simples de ejecutar en equipo.')
) as s(section_order, title, content) on true;
