-- =============================================================================
-- SmokeAR — reference data seed
--
-- Only real, static reference data: the 8 actual CS2 maps and Mirage's call
-- callouts. No demo lineups/boosts/plays/guides here — that kind of content
-- is community-uploaded, and shipping fabricated rows made the app look
-- populated when it wasn't. Everything content-related starts at zero and
-- is meant to be uploaded for real through the app.
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
