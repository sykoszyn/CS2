"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "@/lib/likes/actions";
import { cn } from "@/lib/utils/cn";
import type { ContentTypeEnum } from "@/types/database";

export function LikeButton({
  contentType,
  contentId,
  isLoggedIn,
  initialLiked,
  initialCount,
  size = "md",
}: {
  contentType: ContentTypeEnum;
  contentId: string;
  isLoggedIn: boolean;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md";
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=${pathname}`);
      return;
    }

    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => c + (wasLiked ? -1 : 1));

    startTransition(async () => {
      const result = await toggleLikeAction(contentType, contentId, wasLiked, pathname);
      if (result.status === "error") {
        setLiked(wasLiked);
        setCount((c) => c + (wasLiked ? 1 : -1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-1.5 rounded-md border font-medium transition-colors",
        size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm",
        liked
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-border text-foreground-muted hover:text-foreground",
      )}
    >
      <Heart size={size === "sm" ? 12 : 14} className={liked ? "fill-danger" : ""} />
      {count}
    </button>
  );
}
