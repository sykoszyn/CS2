/**
 * Domain types for SmokeAR.
 * These mirror the Supabase schema (see supabase/migrations/0001_init.sql)
 * but are hand-written so the app compiles before the DB is provisioned.
 * Once Supabase codegen is wired up, `types/database.ts` becomes the
 * source of truth and these can be derived from it.
 */

export type Side = "ct" | "t" | "both";

export type GrenadeType = "smoke" | "flash" | "molotov" | "he" | "decoy";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type VideoSource = "youtube" | "twitch" | "mp4" | "external";

export interface GameMap {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  radarUrl: string;
  version: string;
  active: boolean;
  bombsites: ("A" | "B")[];
}

export interface MapZone {
  id: string;
  mapId: string;
  name: string;
  aliases: string[];
  description: string;
  x: number;
  y: number;
  imageUrl?: string;
}

export interface Video {
  id: string;
  source: VideoSource;
  url: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
}

export interface LineupStep {
  order: number;
  title: string;
  instruction: string;
  imageUrl: string;
  jumpthrow?: boolean;
  clickType?: "left" | "right" | "hold";
}

export interface Lineup {
  id: string;
  slug: string;
  name: string;
  mapSlug: string;
  grenadeType: GrenadeType;
  side: Side;
  targetZone: string;
  throwZone: string;
  situation: "attack" | "defense" | "retake" | "execute" | "anti-eco" | "default";
  difficulty: Difficulty;
  distance: "close" | "medium" | "long";
  authorUsername: string;
  video?: Video;
  steps: LineupStep[];
  tags: string[];
  createdAt: string;
  usageCount: number;
  likeCount: number;
  ratingAvg: number;
  ratingCount: number;
  workedPercent: number;
  verified: boolean;
  isDemo?: boolean;
}

export interface Boost {
  id: string;
  slug: string;
  name: string;
  mapSlug: string;
  location: string;
  playersRequired: 2 | 3;
  category: "common" | "competitive" | "exotic" | "secret";
  side: Side;
  difficulty: Difficulty;
  description: string;
  video?: Video;
  imageUrl: string;
  isDemo?: boolean;
}

export interface Play {
  id: string;
  slug: string;
  title: string;
  description: string;
  mapSlug: string;
  category: "clutch" | "ace" | "entry" | "retake" | "ninja-defuse" | "wallbang" | "outplay" | "pro";
  authorUsername: string;
  video: Video;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isDemo?: boolean;
}

export interface GuideSection {
  order: number;
  title: string;
  content: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  summary: string;
  mapSlug?: string;
  level: "beginner" | "intermediate" | "advanced";
  authorUsername: string;
  coverImageUrl: string;
  sections: GuideSection[];
  createdAt: string;
  isDemo?: boolean;
}

export interface FeedItem {
  id: string;
  type: "lineup" | "play" | "guide" | "boost";
  username: string;
  userAvatarUrl?: string;
  title: string;
  targetSlug: string;
  mapSlug?: string;
  createdAt: string;
}

export interface PublicProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  stats: {
    lineupsCreated: number;
    playsCreated: number;
    guidesCreated: number;
    likesReceived: number;
    verifiedContent: number;
  };
}
