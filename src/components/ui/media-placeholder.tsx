import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Placeholder for real map/lineup imagery. The DB stores real `image_url` /
 * `thumbnail_url` values (Supabase Storage or CDN); this component renders
 * only when no asset has been uploaded yet, so the UI never shows a broken
 * <img>.
 */
export function MediaPlaceholder({
  label,
  className,
  seed = 0,
}: {
  label?: string;
  className?: string;
  seed?: number;
}) {
  const gradients = [
    "from-brand/30 via-background-elevated to-background",
    "from-accent/25 via-background-elevated to-background",
    "from-ct/25 via-background-elevated to-background",
    "from-t/25 via-background-elevated to-background",
  ];
  const gradient = gradients[seed % gradients.length];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className,
      )}
    >
      <ImageIcon className="text-foreground-subtle/50" size={28} />
      {label && (
        <span className="absolute bottom-2 left-2 font-display text-xs font-semibold uppercase tracking-wide text-foreground/70">
          {label}
        </span>
      )}
    </div>
  );
}
