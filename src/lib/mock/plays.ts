import type { Play } from "@/types/content";

export const plays: Play[] = [
  {
    id: "play_ace_mirage",
    slug: "ace-clutch-mirage-b-retake",
    title: "Ace en retake de B site",
    description: "Retake 1v4 convertido en ace gracias a una flash perfecta de Stairs.",
    mapSlug: "mirage",
    category: "clutch",
    authorUsername: "demo_player",
    video: {
      id: "vid_play_1",
      source: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationSeconds: 55,
    },
    likeCount: 512,
    commentCount: 34,
    createdAt: "2026-02-01T12:00:00Z",
    isDemo: true,
  },
  {
    id: "play_wallbang_inferno",
    slug: "wallbang-banana-inferno",
    title: "Wallbang doble kill en Banana",
    description: "Wallbang a través del contenedor que conecta dos kills en Banana.",
    mapSlug: "inferno",
    category: "wallbang",
    authorUsername: "demo_player",
    video: {
      id: "vid_play_2",
      source: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationSeconds: 20,
    },
    likeCount: 210,
    commentCount: 12,
    createdAt: "2026-02-03T12:00:00Z",
    isDemo: true,
  },
];

export function getPlaysByMap(mapSlug: string) {
  return plays.filter((p) => p.mapSlug === mapSlug);
}
