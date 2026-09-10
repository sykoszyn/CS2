-- =============================================================================
-- SmokeAR — real radar images for the map lineup viewer
--
-- Sets `maps.radar_url` (and `radar_url_lower` for the two maps with a
-- second vertical level) to the actual radar images, supplied by the user
-- and committed to `public/radars/` — not sourced by this migration, just
-- wired up here. Overpass isn't included yet; its radar hasn't been
-- provided, so it keeps falling back to the generic placeholder in
-- MapLineupViewer until it is.
-- =============================================================================

update maps set radar_url = '/radars/dust2.png' where slug = 'dust2';
update maps set radar_url = '/radars/inferno.png' where slug = 'inferno';
update maps set radar_url = '/radars/mirage.png' where slug = 'mirage';
update maps set radar_url = '/radars/ancient.png' where slug = 'ancient';
update maps set radar_url = '/radars/anubis.png' where slug = 'anubis';
update maps set radar_url = '/radars/nuke-upper.png', radar_url_lower = '/radars/nuke-lower.png' where slug = 'nuke';
update maps set radar_url = '/radars/vertigo-upper.png', radar_url_lower = '/radars/vertigo-lower.png' where slug = 'vertigo';
