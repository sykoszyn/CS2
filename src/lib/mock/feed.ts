import type { FeedItem } from "@/types/content";

export const feedItems: FeedItem[] = [
  {
    id: "feed_1",
    type: "lineup",
    username: "demo_coach",
    title: "subió un nuevo lineup: Mirage Window Smoke desde T Spawn",
    targetSlug: "mirage-window-smoke-t-spawn",
    mapSlug: "mirage",
    createdAt: "2026-02-05T09:00:00Z",
  },
  {
    id: "feed_2",
    type: "play",
    username: "demo_player",
    title: "publicó una jugada: Ace en retake de B site",
    targetSlug: "ace-clutch-mirage-b-retake",
    mapSlug: "mirage",
    createdAt: "2026-02-04T18:30:00Z",
  },
  {
    id: "feed_3",
    type: "guide",
    username: "demo_coach",
    title: "creó una guía: Mirage desde cero",
    targetSlug: "mirage-desde-cero",
    mapSlug: "mirage",
    createdAt: "2026-02-03T15:00:00Z",
  },
  {
    id: "feed_4",
    type: "boost",
    username: "demo_player",
    title: "agregó un boost: Nuke Vent Boost (2 jugadores)",
    targetSlug: "nuke-vent-boost-2-players",
    mapSlug: "nuke",
    createdAt: "2026-02-02T11:00:00Z",
  },
];
