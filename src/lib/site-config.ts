export const siteConfig = {
  name: "CS2 Academy",
  shortName: "CS2 Academy",
  description:
    "El hub de aprendizaje de Counter-Strike 2 en español: lineups, calls, boosts, jugadas y estrategias creadas por la comunidad.",
  url: "https://smokear.vercel.app",
  locale: "es",
  ogImage: "/og-image.png",
  twitterHandle: "@cs2academy",
} as const;

export type NavItem = {
  label: string;
  href: string;
  icon: "home" | "map" | "target" | "shield" | "swords" | "rss" | "search" | "user";
};

/** Primary navigation, shared by the desktop sidebar and the mobile bottom nav (subset). */
export const primaryNav: NavItem[] = [
  { label: "Inicio", href: "/", icon: "home" },
  { label: "Mapas", href: "/maps", icon: "map" },
  { label: "Lineups", href: "/lineups", icon: "target" },
  { label: "Guías", href: "/guides", icon: "shield" },
  { label: "Boosts", href: "/boosts", icon: "shield" },
  { label: "Jugadas", href: "/plays", icon: "swords" },
  { label: "Feed", href: "/feed", icon: "rss" },
];

/** Mobile bottom navigation is intentionally limited to 5 items (section 15). */
export const mobileNav: NavItem[] = [
  { label: "Inicio", href: "/", icon: "home" },
  { label: "Mapas", href: "/maps", icon: "map" },
  { label: "Buscar", href: "/search", icon: "search" },
  { label: "Feed", href: "/feed", icon: "rss" },
  { label: "Perfil", href: "/profile/me", icon: "user" },
];
