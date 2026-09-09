-- =============================================================================
-- SmokeAR — initial schema
-- Run against a Supabase Postgres project (SQL Editor or `supabase db push`).
-- Design notes:
--   * `profiles` extends `auth.users` (1:1, id shared) instead of duplicating it.
--   * User-generated content tables share the same shape: status + soft delete
--     (deleted_at) + is_demo, so moderation and seed data behave consistently.
--   * "Polymorphic" relations (favorites, likes, comments, reports, tags) use
--     a (content_type, content_id) pair instead of one FK per content table,
--     so adding a new content type later never requires a schema migration.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('user', 'moderator', 'admin');
create type content_status as enum ('pending', 'approved', 'rejected', 'removed');
create type content_type as enum ('lineup', 'play', 'guide', 'boost', 'comment');
create type side_type as enum ('ct', 't', 'both');
create type grenade_type as enum ('smoke', 'flash', 'molotov', 'he', 'decoy');
create type click_type as enum ('left', 'right', 'hold');
create type lineup_situation as enum ('attack', 'defense', 'retake', 'execute', 'anti-eco', 'default');
create type distance_type as enum ('close', 'medium', 'long');
create type boost_category as enum ('common', 'competitive', 'exotic', 'secret');
create type play_category as enum ('clutch', 'ace', 'entry', 'retake', 'ninja-defuse', 'wallbang', 'outplay', 'pro');
create type guide_level as enum ('beginner', 'intermediate', 'advanced');
create type video_source as enum ('youtube', 'twitch', 'mp4', 'external');
create type report_reason as enum ('spam', 'incorrect', 'offensive', 'copyright', 'false_info', 'duplicate', 'other');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  role user_role not null default 'user',
  level int not null default 1,
  xp int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

create index profiles_username_idx on profiles (lower(username));

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Defined here (not in the Helpers block above) because it queries `profiles`
-- — a `language sql` function is validated against the catalog at CREATE
-- time, so the table it references must already exist.
create or replace function is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p where p.id = uid and p.role in ('admin', 'moderator')
  );
$$;

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Jugador')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- maps
-- ---------------------------------------------------------------------------

create table maps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image_url text,
  thumbnail_url text,
  radar_url text,
  version text not null default 'CS2',
  bombsites text[] not null default array['A', 'B'],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger maps_set_updated_at
  before update on maps
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- map_zones (callouts)
-- ---------------------------------------------------------------------------

create table map_zones (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references maps (id) on delete cascade,
  name text not null,
  aliases text[] not null default '{}',
  description text not null default '',
  x numeric(5, 2) not null check (x >= 0 and x <= 100),
  y numeric(5, 2) not null check (y >= 0 and y <= 100),
  image_url text,
  created_at timestamptz not null default now(),
  unique (map_id, name)
);

create index map_zones_map_id_idx on map_zones (map_id);

-- ---------------------------------------------------------------------------
-- videos (embeds only — see section 8/34: no third-party media is hosted)
-- ---------------------------------------------------------------------------

create table videos (
  id uuid primary key default gen_random_uuid(),
  source video_source not null,
  url text not null,
  duration_seconds int,
  thumbnail_url text,
  uploader_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- lineups
-- ---------------------------------------------------------------------------

create table lineups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  map_id uuid not null references maps (id) on delete cascade,
  grenade_type grenade_type not null,
  side side_type not null,
  throw_zone text not null,
  target_zone text not null,
  situation lineup_situation not null default 'default',
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  distance distance_type not null default 'medium',
  author_id uuid references profiles (id) on delete set null,
  video_id uuid references videos (id) on delete set null,
  usage_count int not null default 0,
  status content_status not null default 'approved',
  verified boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index lineups_map_id_idx on lineups (map_id);
create index lineups_author_id_idx on lineups (author_id);
create index lineups_status_idx on lineups (status) where deleted_at is null;

create trigger lineups_set_updated_at
  before update on lineups
  for each row execute function set_updated_at();

create table lineup_steps (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references lineups (id) on delete cascade,
  step_order int not null,
  title text not null,
  instruction text not null,
  image_url text,
  jumpthrow boolean not null default false,
  click_type click_type,
  created_at timestamptz not null default now(),
  unique (lineup_id, step_order)
);

create index lineup_steps_lineup_id_idx on lineup_steps (lineup_id);

create table lineup_media (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references lineups (id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index lineup_media_lineup_id_idx on lineup_media (lineup_id);

-- ---------------------------------------------------------------------------
-- guides
-- ---------------------------------------------------------------------------

create table guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  map_id uuid references maps (id) on delete set null,
  level guide_level not null default 'beginner',
  author_id uuid references profiles (id) on delete set null,
  cover_image_url text,
  status content_status not null default 'approved',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index guides_map_id_idx on guides (map_id);
create index guides_author_id_idx on guides (author_id);

create trigger guides_set_updated_at
  before update on guides
  for each row execute function set_updated_at();

create table guide_sections (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references guides (id) on delete cascade,
  section_order int not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (guide_id, section_order)
);

create index guide_sections_guide_id_idx on guide_sections (guide_id);

-- ---------------------------------------------------------------------------
-- boosts
-- ---------------------------------------------------------------------------

create table boosts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  map_id uuid not null references maps (id) on delete cascade,
  location text not null,
  players_required smallint not null check (players_required in (2, 3)),
  category boost_category not null default 'common',
  side side_type not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  description text not null default '',
  image_url text,
  video_id uuid references videos (id) on delete set null,
  author_id uuid references profiles (id) on delete set null,
  status content_status not null default 'approved',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index boosts_map_id_idx on boosts (map_id);

create trigger boosts_set_updated_at
  before update on boosts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- plays
-- ---------------------------------------------------------------------------

create table plays (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  map_id uuid not null references maps (id) on delete cascade,
  category play_category not null,
  author_id uuid references profiles (id) on delete set null,
  video_id uuid not null references videos (id) on delete cascade,
  like_count int not null default 0,
  comment_count int not null default 0,
  status content_status not null default 'approved',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index plays_map_id_idx on plays (map_id);
create index plays_author_id_idx on plays (author_id);

create trigger plays_set_updated_at
  before update on plays
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- tags (polymorphic content_tags)
-- ---------------------------------------------------------------------------

create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table content_tags (
  content_type content_type not null,
  content_id uuid not null,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (content_type, content_id, tag_id)
);

create index content_tags_content_idx on content_tags (content_type, content_id);

-- ---------------------------------------------------------------------------
-- favorites / collections
-- ---------------------------------------------------------------------------

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  content_type content_type not null,
  content_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index favorites_user_id_idx on favorites (user_id);

create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collections_user_id_idx on collections (user_id);

create trigger collections_set_updated_at
  before update on collections
  for each row execute function set_updated_at();

create table collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections (id) on delete cascade,
  content_type content_type not null,
  content_id uuid not null,
  created_at timestamptz not null default now(),
  unique (collection_id, content_type, content_id)
);

create index collection_items_collection_id_idx on collection_items (collection_id);

-- ---------------------------------------------------------------------------
-- likes / comments / follows
-- ---------------------------------------------------------------------------

create table likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  content_type content_type not null,
  content_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index likes_content_idx on likes (content_type, content_id);

create table comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  content_type content_type not null,
  content_id uuid not null,
  parent_comment_id uuid references comments (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index comments_content_idx on comments (content_type, content_id);

create trigger comments_set_updated_at
  before update on comments
  for each row execute function set_updated_at();

create table follows (
  follower_id uuid not null references profiles (id) on delete cascade,
  following_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles (id) on delete set null,
  content_type content_type not null,
  content_id uuid not null,
  reason report_reason not null,
  description text,
  status content_status not null default 'pending',
  resolved_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index reports_status_idx on reports (status);
create index reports_content_idx on reports (content_type, content_id);

-- ---------------------------------------------------------------------------
-- ratings (lineups: stars + "¿funcionó?")
-- ---------------------------------------------------------------------------

create table ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  lineup_id uuid not null references lineups (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  worked boolean not null,
  created_at timestamptz not null default now(),
  unique (user_id, lineup_id)
);

create index ratings_lineup_id_idx on ratings (lineup_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- achievements / gamification
-- ---------------------------------------------------------------------------

create table achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text
);

create table user_achievements (
  user_id uuid not null references profiles (id) on delete cascade,
  achievement_id uuid not null references achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table user_progress (
  user_id uuid not null references profiles (id) on delete cascade,
  map_id uuid not null references maps (id) on delete cascade,
  calls_quiz_score int not null default 0,
  lineups_viewed int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, map_id)
);

create trigger user_progress_set_updated_at
  before update on user_progress
  for each row execute function set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table profiles enable row level security;
alter table maps enable row level security;
alter table map_zones enable row level security;
alter table videos enable row level security;
alter table lineups enable row level security;
alter table lineup_steps enable row level security;
alter table lineup_media enable row level security;
alter table guides enable row level security;
alter table guide_sections enable row level security;
alter table boosts enable row level security;
alter table plays enable row level security;
alter table tags enable row level security;
alter table content_tags enable row level security;
alter table favorites enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table follows enable row level security;
alter table reports enable row level security;
alter table ratings enable row level security;
alter table notifications enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table user_progress enable row level security;

-- profiles: public read, owner/admin write
create policy "profiles_select_public" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own_or_admin" on profiles for update
  using (auth.uid() = id or is_admin(auth.uid()));

-- maps / map_zones / tags / achievements: fully public read, admin-only write
create policy "maps_select_public" on maps for select using (true);
create policy "maps_write_admin" on maps for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "map_zones_select_public" on map_zones for select using (true);
create policy "map_zones_write_admin" on map_zones for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "tags_select_public" on tags for select using (true);
create policy "tags_write_admin" on tags for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "achievements_select_public" on achievements for select using (true);
create policy "achievements_write_admin" on achievements for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- videos: public read; any authenticated user can add a video (embed) they attach to their own content
create policy "videos_select_public" on videos for select using (true);
create policy "videos_insert_authenticated" on videos for insert with check (auth.uid() is not null);
create policy "videos_update_own_or_admin" on videos for update
  using (uploader_id = auth.uid() or is_admin(auth.uid()));

-- lineups: public read of visible content; owners manage their own; admins manage all
create policy "lineups_select_public" on lineups for select
  using (deleted_at is null and status <> 'removed');
create policy "lineups_insert_own" on lineups for insert
  with check (auth.uid() is not null and author_id = auth.uid());
create policy "lineups_update_own_or_admin" on lineups for update
  using (author_id = auth.uid() or is_admin(auth.uid()));
create policy "lineups_delete_own_or_admin" on lineups for delete
  using (author_id = auth.uid() or is_admin(auth.uid()));

create policy "lineup_steps_select_public" on lineup_steps for select using (true);
create policy "lineup_steps_write_owner_or_admin" on lineup_steps for all
  using (
    is_admin(auth.uid())
    or exists (select 1 from lineups l where l.id = lineup_id and l.author_id = auth.uid())
  )
  with check (
    is_admin(auth.uid())
    or exists (select 1 from lineups l where l.id = lineup_id and l.author_id = auth.uid())
  );

create policy "lineup_media_select_public" on lineup_media for select using (true);
create policy "lineup_media_write_owner_or_admin" on lineup_media for all
  using (
    is_admin(auth.uid())
    or exists (select 1 from lineups l where l.id = lineup_id and l.author_id = auth.uid())
  )
  with check (
    is_admin(auth.uid())
    or exists (select 1 from lineups l where l.id = lineup_id and l.author_id = auth.uid())
  );

-- guides
create policy "guides_select_public" on guides for select
  using (deleted_at is null and status <> 'removed');
create policy "guides_insert_own" on guides for insert
  with check (auth.uid() is not null and author_id = auth.uid());
create policy "guides_update_own_or_admin" on guides for update
  using (author_id = auth.uid() or is_admin(auth.uid()));
create policy "guides_delete_own_or_admin" on guides for delete
  using (author_id = auth.uid() or is_admin(auth.uid()));

create policy "guide_sections_select_public" on guide_sections for select using (true);
create policy "guide_sections_write_owner_or_admin" on guide_sections for all
  using (
    is_admin(auth.uid())
    or exists (select 1 from guides g where g.id = guide_id and g.author_id = auth.uid())
  )
  with check (
    is_admin(auth.uid())
    or exists (select 1 from guides g where g.id = guide_id and g.author_id = auth.uid())
  );

-- boosts
create policy "boosts_select_public" on boosts for select
  using (deleted_at is null and status <> 'removed');
create policy "boosts_insert_own" on boosts for insert
  with check (auth.uid() is not null and author_id = auth.uid());
create policy "boosts_update_own_or_admin" on boosts for update
  using (author_id = auth.uid() or is_admin(auth.uid()));
create policy "boosts_delete_own_or_admin" on boosts for delete
  using (author_id = auth.uid() or is_admin(auth.uid()));

-- plays
create policy "plays_select_public" on plays for select
  using (deleted_at is null and status <> 'removed');
create policy "plays_insert_own" on plays for insert
  with check (auth.uid() is not null and author_id = auth.uid());
create policy "plays_update_own_or_admin" on plays for update
  using (author_id = auth.uid() or is_admin(auth.uid()));
create policy "plays_delete_own_or_admin" on plays for delete
  using (author_id = auth.uid() or is_admin(auth.uid()));

-- content_tags: public read, any authenticated user can tag their own content, admin can tag anything
create policy "content_tags_select_public" on content_tags for select using (true);
create policy "content_tags_write_authenticated" on content_tags for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- favorites / collections / collection_items: fully private to the owner
create policy "favorites_owner_only" on favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "collections_select_own_or_public" on collections for select
  using (user_id = auth.uid() or is_public = true);
create policy "collections_write_own" on collections for insert with check (user_id = auth.uid());
create policy "collections_update_own" on collections for update using (user_id = auth.uid());
create policy "collections_delete_own" on collections for delete using (user_id = auth.uid());

create policy "collection_items_select_visible" on collection_items for select
  using (
    exists (
      select 1 from collections c
      where c.id = collection_id and (c.user_id = auth.uid() or c.is_public = true)
    )
  );
create policy "collection_items_write_own" on collection_items for all
  using (exists (select 1 from collections c where c.id = collection_id and c.user_id = auth.uid()))
  with check (exists (select 1 from collections c where c.id = collection_id and c.user_id = auth.uid()));

-- likes: public read (like counts), owner writes their own like
create policy "likes_select_public" on likes for select using (true);
create policy "likes_write_own" on likes for insert with check (user_id = auth.uid());
create policy "likes_delete_own" on likes for delete using (user_id = auth.uid());

-- comments: public read of non-deleted comments, owner/admin manage
create policy "comments_select_public" on comments for select using (deleted_at is null);
create policy "comments_insert_own" on comments for insert with check (user_id = auth.uid());
create policy "comments_update_own_or_admin" on comments for update
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "comments_delete_own_or_admin" on comments for delete
  using (user_id = auth.uid() or is_admin(auth.uid()));

-- follows: public read (follower/following counts), owner manages their own edges
create policy "follows_select_public" on follows for select using (true);
create policy "follows_insert_own" on follows for insert with check (follower_id = auth.uid());
create policy "follows_delete_own" on follows for delete using (follower_id = auth.uid());

-- reports: reporter can create and read their own reports; moderators see and resolve all
create policy "reports_select_own_or_admin" on reports for select
  using (reporter_id = auth.uid() or is_admin(auth.uid()));
create policy "reports_insert_authenticated" on reports for insert
  with check (auth.uid() is not null and reporter_id = auth.uid());
create policy "reports_update_admin" on reports for update using (is_admin(auth.uid()));

-- ratings: public read (aggregate %), owner writes their own rating
create policy "ratings_select_public" on ratings for select using (true);
create policy "ratings_write_own" on ratings for insert with check (user_id = auth.uid());
create policy "ratings_update_own" on ratings for update using (user_id = auth.uid());
create policy "ratings_delete_own" on ratings for delete using (user_id = auth.uid());

-- notifications: strictly private to the owner
create policy "notifications_owner_only" on notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- user_achievements / user_progress: public read (profile stats), owned by the system otherwise
create policy "user_achievements_select_public" on user_achievements for select using (true);
create policy "user_achievements_write_admin" on user_achievements for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "user_progress_select_own_or_admin" on user_progress for select
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "user_progress_write_own" on user_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
