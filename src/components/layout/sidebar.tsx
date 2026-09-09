"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/lib/site-config";
import { iconMap } from "@/components/layout/icon-map";
import { cn } from "@/lib/utils/cn";
import { Heart, Bookmark, Settings } from "lucide-react";
import type { ProfileRow } from "@/types/database";

export function Sidebar({ profile }: { profile: ProfileRow | null }) {
  const pathname = usePathname();
  const isStaff = profile?.role === "admin" || profile?.role === "moderator";

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background-elevated/40 lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand font-display text-sm font-bold text-brand-foreground">
          C2
        </span>
        <span className="font-display text-lg font-bold tracking-wide">CS2 Academy</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {primaryNav.map((item) => {
          const Icon = iconMap[item.icon];
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-muted text-brand"
                  : "text-foreground-muted hover:bg-background-card hover:text-foreground",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-4 border-t border-border pt-4">
          <Link
            href="/favorites"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-background-card hover:text-foreground"
          >
            <Heart size={18} />
            Favoritos
          </Link>
          <Link
            href="/collections"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-background-card hover:text-foreground"
          >
            <Bookmark size={18} />
            Colecciones
          </Link>
        </div>
      </nav>

      {(!profile || isStaff) && (
        <div className="border-t border-border p-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground-subtle hover:bg-background-card hover:text-foreground"
          >
            <Settings size={18} />
            Admin
          </Link>
        </div>
      )}
    </aside>
  );
}
