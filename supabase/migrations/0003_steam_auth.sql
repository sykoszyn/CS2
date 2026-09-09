-- =============================================================================
-- CS2 Academy — Steam identity bridging
-- Steam accounts have no email, so sign-in is bridged into Supabase Auth via
-- a synthetic email + magic-link token (see src/app/auth/steam/callback).
-- This column is how we recognize a returning Steam player.
-- =============================================================================

alter table profiles add column steam_id text unique;

create index profiles_steam_id_idx on profiles (steam_id) where steam_id is not null;
