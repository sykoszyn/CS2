/**
 * Hand-written Supabase database types, matching supabase/migrations/0001_init.sql.
 *
 * This file is a stand-in for real codegen. Once a Supabase project exists, replace
 * it by running:
 *   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 *
 * `Insert`/`Update` are intentionally loose (`Partial<Row>`) here — the SQL migration
 * is the source of truth for what's actually required/nullable/defaulted; codegen
 * will tighten this automatically.
 */

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type UserRole = "user" | "moderator" | "admin";
export type ContentStatus = "pending" | "approved" | "rejected" | "removed";
export type ContentTypeEnum = "lineup" | "play" | "guide" | "boost" | "comment";
export type SideType = "ct" | "t" | "both";
export type GrenadeTypeEnum = "smoke" | "flash" | "molotov" | "he" | "decoy";
export type ClickTypeEnum = "left" | "right" | "hold";
export type LineupSituation = "attack" | "defense" | "retake" | "execute" | "anti-eco" | "default";
export type DistanceType = "close" | "medium" | "long";
export type BoostCategory = "common" | "competitive" | "exotic" | "secret";
export type PlayCategory =
  | "clutch"
  | "ace"
  | "entry"
  | "retake"
  | "ninja-defuse"
  | "wallbang"
  | "outplay"
  | "pro";
export type GuideLevel = "beginner" | "intermediate" | "advanced";
export type VideoSourceEnum = "youtube" | "twitch" | "mp4" | "external";
export type ReportReason =
  | "spam"
  | "incorrect"
  | "offensive"
  | "copyright"
  | "false_info"
  | "duplicate"
  | "other";

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  level: number;
  xp: number;
  steam_id: string | null;
  banned_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MapRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  thumbnail_url: string | null;
  radar_url: string | null;
  version: string;
  bombsites: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type MapZoneRow = {
  id: string;
  map_id: string;
  name: string;
  aliases: string[];
  description: string;
  x: number;
  y: number;
  image_url: string | null;
  created_at: string;
};

export type VideoRow = {
  id: string;
  source: VideoSourceEnum;
  url: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  uploader_id: string | null;
  created_at: string;
};

export type LineupRow = {
  id: string;
  slug: string;
  name: string;
  map_id: string;
  grenade_type: GrenadeTypeEnum;
  side: SideType;
  throw_zone: string;
  target_zone: string;
  situation: LineupSituation;
  difficulty: number;
  distance: DistanceType;
  author_id: string | null;
  video_id: string | null;
  usage_count: number;
  status: ContentStatus;
  verified: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LineupStepRow = {
  id: string;
  lineup_id: string;
  step_order: number;
  title: string;
  instruction: string;
  image_url: string | null;
  jumpthrow: boolean;
  click_type: ClickTypeEnum | null;
  created_at: string;
};

export type LineupMediaRow = {
  id: string;
  lineup_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export type GuideRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  map_id: string | null;
  level: GuideLevel;
  author_id: string | null;
  cover_image_url: string | null;
  status: ContentStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type GuideSectionRow = {
  id: string;
  guide_id: string;
  section_order: number;
  title: string;
  content: string;
  created_at: string;
};

export type BoostRow = {
  id: string;
  slug: string;
  name: string;
  map_id: string;
  location: string;
  players_required: 2 | 3;
  category: BoostCategory;
  side: SideType;
  difficulty: number;
  description: string;
  image_url: string | null;
  video_id: string | null;
  author_id: string | null;
  status: ContentStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PlayRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  map_id: string;
  category: PlayCategory;
  author_id: string | null;
  video_id: string;
  like_count: number;
  comment_count: number;
  status: ContentStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type TagRow = {
  id: string;
  slug: string;
  name: string;
};

export type ContentTagRow = {
  content_type: ContentTypeEnum;
  content_id: string;
  tag_id: string;
};

export type FavoriteRow = {
  id: string;
  user_id: string;
  content_type: ContentTypeEnum;
  content_id: string;
  created_at: string;
};

export type CollectionRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type CollectionItemRow = {
  id: string;
  collection_id: string;
  content_type: ContentTypeEnum;
  content_id: string;
  created_at: string;
};

export type LikeRow = {
  id: string;
  user_id: string;
  content_type: ContentTypeEnum;
  content_id: string;
  created_at: string;
};

export type CommentRow = {
  id: string;
  user_id: string;
  content_type: ContentTypeEnum;
  content_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type FollowRow = {
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type ReportRow = {
  id: string;
  reporter_id: string | null;
  content_type: ContentTypeEnum;
  content_id: string;
  reason: ReportReason;
  description: string | null;
  status: ContentStatus;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type RatingRow = {
  id: string;
  user_id: string;
  lineup_id: string;
  stars: number;
  worked: boolean;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type AchievementRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
};

export type UserAchievementRow = {
  user_id: string;
  achievement_id: string;
  earned_at: string;
};

export type UserProgressRow = {
  user_id: string;
  map_id: string;
  calls_quiz_score: number;
  lineups_viewed: number;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      maps: Table<MapRow>;
      map_zones: Table<MapZoneRow>;
      videos: Table<VideoRow>;
      lineups: Table<LineupRow>;
      lineup_steps: Table<LineupStepRow>;
      lineup_media: Table<LineupMediaRow>;
      guides: Table<GuideRow>;
      guide_sections: Table<GuideSectionRow>;
      boosts: Table<BoostRow>;
      plays: Table<PlayRow>;
      tags: Table<TagRow>;
      content_tags: Table<ContentTagRow>;
      favorites: Table<FavoriteRow>;
      collections: Table<CollectionRow>;
      collection_items: Table<CollectionItemRow>;
      likes: Table<LikeRow>;
      comments: Table<CommentRow>;
      follows: Table<FollowRow>;
      reports: Table<ReportRow>;
      ratings: Table<RatingRow>;
      notifications: Table<NotificationRow>;
      achievements: Table<AchievementRow>;
      user_achievements: Table<UserAchievementRow>;
      user_progress: Table<UserProgressRow>;
    };
    Views: Record<string, never>;
    Functions: {
      create_lineup_with_steps: {
        Args: { payload: Record<string, unknown> };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
