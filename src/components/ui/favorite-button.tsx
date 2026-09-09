"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/favorites/actions";
import { cn } from "@/lib/utils/cn";
import type { ContentTypeEnum } from "@/types/database";

export function FavoriteButton({
  contentType,
  contentId,
  isLoggedIn,
  initialFavorited,
  size = "md",
}: {
  contentType: ContentTypeEnum;
  contentId: string;
  isLoggedIn: boolean;
  initialFavorited: boolean;
  size?: "sm" | "md";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=${pathname}`);
      return;
    }

    const was = favorited;
    setFavorited(!was);

    startTransition(async () => {
      const result = await toggleFavoriteAction(contentType, contentId, was, pathname);
      if (result.status === "error") setFavorited(was);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      className={cn(
        "flex items-center gap-1.5 rounded-md border font-medium transition-colors",
        size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm",
        favorited
          ? "border-brand/40 bg-brand-muted text-brand"
          : "border-border text-foreground-muted hover:text-foreground",
      )}
    >
      <Bookmark size={size === "sm" ? 12 : 14} className={favorited ? "fill-brand" : ""} />
      {favorited ? "Guardado" : "Guardar"}
    </button>
  );
}
