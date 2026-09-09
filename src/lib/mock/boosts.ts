import type { Boost } from "@/types/content";

export const boosts: Boost[] = [
  {
    id: "boost_nuke_vent",
    slug: "nuke-vent-boost-2-players",
    name: "Nuke Vent Boost (2 jugadores)",
    mapSlug: "nuke",
    location: "Outside Vent",
    playersRequired: 2,
    category: "competitive",
    side: "t",
    difficulty: 3,
    description:
      "Boost clásico para ver por el vent exterior y sorprender a los CT que rotan por Garage.",
    imageUrl: "/boosts/nuke-vent/cover.jpg",
    isDemo: true,
  },
  {
    id: "boost_vertigo_ramp",
    slug: "vertigo-ramp-boost-3-players",
    name: "Vertigo Ramp Boost (3 jugadores)",
    mapSlug: "vertigo",
    location: "A Ramp",
    playersRequired: 3,
    category: "exotic",
    side: "t",
    difficulty: 5,
    description: "Boost exótico para tomar un ángulo elevado sobre A site durante un execute.",
    imageUrl: "/boosts/vertigo-ramp/cover.jpg",
    isDemo: true,
  },
];

export function getBoostsByMap(mapSlug: string) {
  return boosts.filter((b) => b.mapSlug === mapSlug);
}
