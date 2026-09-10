export const siteConfig = {
  name: "SmokeAR",
  shortName: "SmokeAR",
  description:
    "El hub de aprendizaje de Counter-Strike 2 en español: lineups, calls, boosts, jugadas y estrategias creadas por la comunidad.",
  url: "https://smokear.vercel.app",
  locale: "es",
  twitterHandle: "@smokear",
} as const;

export type NavItem = {
  /** Key into the "nav" message namespace — see messages/*.json. */
  key: "home" | "maps" | "lineups" | "guides" | "boosts" | "plays" | "feed" | "search" | "profile";
  href: string;
  icon: "home" | "map" | "target" | "shield" | "swords" | "rss" | "search" | "user";
};

/** Primary navigation, shared by the desktop sidebar and the mobile bottom nav (subset). */
export const primaryNav: NavItem[] = [
  { key: "home", href: "/", icon: "home" },
  { key: "maps", href: "/maps", icon: "map" },
  { key: "lineups", href: "/lineups", icon: "target" },
  { key: "guides", href: "/guides", icon: "shield" },
  { key: "boosts", href: "/boosts", icon: "shield" },
  { key: "plays", href: "/plays", icon: "swords" },
  { key: "feed", href: "/feed", icon: "rss" },
];

/** Mobile bottom navigation is intentionally limited to 5 items (section 15). */
export const mobileNav: NavItem[] = [
  { key: "home", href: "/", icon: "home" },
  { key: "maps", href: "/maps", icon: "map" },
  { key: "search", href: "/search", icon: "search" },
  { key: "feed", href: "/feed", icon: "rss" },
  { key: "profile", href: "/profile/me", icon: "user" },
];
