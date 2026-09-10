"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { mobileNav } from "@/lib/site-config";
import { iconMap } from "@/components/layout/icon-map";
import { cn } from "@/lib/utils/cn";
import type { ProfileRow } from "@/types/database";

export function BottomNav({ profile }: { profile: ProfileRow | null }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-background-elevated/95 backdrop-blur lg:hidden">
      {mobileNav.map((item) => {
        const Icon = iconMap[item.icon];
        const href = item.href === "/profile/me" && profile ? `/profile/${profile.username}` : item.href;
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
              active ? "text-brand" : "text-foreground-muted",
            )}
          >
            <Icon size={20} />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
