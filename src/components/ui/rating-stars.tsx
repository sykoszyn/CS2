import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function RatingStars({
  value,
  count,
  size = 16,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < rounded ? "fill-warning text-warning" : "fill-transparent text-border-strong"}
          />
        ))}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-foreground-muted">({count})</span>
      )}
    </div>
  );
}
