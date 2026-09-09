import { Home, Map, Target, Shield, Swords, Rss, Search, User, type LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/site-config";

export const iconMap: Record<NavItem["icon"], LucideIcon> = {
  home: Home,
  map: Map,
  target: Target,
  shield: Shield,
  swords: Swords,
  rss: Rss,
  search: Search,
  user: User,
};
