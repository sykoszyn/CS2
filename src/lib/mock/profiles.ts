import type { PublicProfile } from "@/types/content";

export const profiles: Record<string, PublicProfile> = {
  demo_coach: {
    username: "demo_coach",
    displayName: "Demo Coach",
    bio: "Cuenta de demostración usada para poblar contenido de ejemplo en CS2 Academy.",
    level: 12,
    xp: 4200,
    stats: {
      lineupsCreated: 2,
      playsCreated: 0,
      guidesCreated: 1,
      likesReceived: 438,
      verifiedContent: 1,
    },
  },
  demo_player: {
    username: "demo_player",
    displayName: "Demo Player",
    bio: "Cuenta de demostración usada para poblar contenido de ejemplo en CS2 Academy.",
    level: 8,
    xp: 2100,
    stats: {
      lineupsCreated: 0,
      playsCreated: 2,
      guidesCreated: 0,
      likesReceived: 722,
      verifiedContent: 0,
    },
  },
};

export function getProfileByUsername(username: string) {
  return profiles[username];
}
