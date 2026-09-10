-- =============================================================================
-- SmokeAR — last radar image (Overpass)
--
-- Completes the set started in 0013_radar_images.sql: all 8 maps now have
-- a real radar image for the map lineup viewer. Same sourcing note as
-- 0013 — supplied by the user directly, not scraped.
-- =============================================================================

update maps set radar_url = '/radars/overpass.webp' where slug = 'overpass';
