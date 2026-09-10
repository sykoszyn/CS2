"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Heart, Bookmark, Settings, Home, Map, Target, Rss, Shield, Users, Swords } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils/cn";
import type { ProfileRow } from "@/types/database";

type Entry = { key: string; href: string; icon: typeof Home };

const discover: Entry[] = [
  { key: "home", href: "/", icon: Home },
  { key: "maps", href: "/maps", icon: Map },
  { key: "lineups", href: "/lineups", icon: Target },
];
const community: Entry[] = [
  { key: "guides", href: "/guides", icon: Shield },
  { key: "boosts", href: "/boosts", icon: Users },
  { key: "plays", href: "/plays", icon: Swords },
  { key: "feed", href: "/feed", icon: Rss },
];
const you: Entry[] = [
  { key: "favorites", href: "/favorites", icon: Heart },
  { key: "collections", href: "/collections", icon: Bookmark },
];

export function Sidebar({ profile }: { profile: ProfileRow | null }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isStaff = profile?.role === "admin" || profile?.role === "moderator";

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  function renderGroup(items: Entry[]) {
    return items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "border-brand bg-brand-muted text-brand"
              : "border-transparent text-foreground-muted hover:border-border-strong hover:bg-background-card hover:text-foreground",
          )}
        >
          <Icon size={17} className={cn(active ? "text-brand" : "text-foreground-subtle group-hover:text-foreground")} />
          {t(item.key)}
        </Link>
      );
    });
  }

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background-elevated/60 lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3 scrollbar-thin">
        <div className="space-y-0.5">{renderGroup(discover)}</div>

        <div>
          <p className="text-eyebrow px-3 pb-1.5">{t("groupCommunity")}</p>
          <div className="space-y-0.5">{renderGroup(community)}</div>
        </div>

        <div>
          <p className="text-eyebrow px-3 pb-1.5">{t("groupYou")}</p>
          <div className="space-y-0.5">{renderGroup(you)}</div>
        </div>
      </nav>

      {(!profile || isStaff) && (
        <div className="border-t border-border p-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground-subtle hover:bg-background-card hover:text-foreground"
          >
            <Settings size={17} />
            {t("admin")}
          </Link>
        </div>
      )}
    </aside>
  );
}
