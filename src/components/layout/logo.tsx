import { cn } from "@/lib/utils/cn";

const SIZES = {
  sm: { badge: "h-8 w-8 text-sm rounded-md", text: "text-lg" },
  md: { badge: "h-10 w-10 text-base rounded-lg", text: "text-2xl" },
  lg: { badge: "h-16 w-16 text-2xl rounded-2xl", text: "text-4xl sm:text-5xl" },
} as const;

/** The brand mark: the orange "S" badge + "Smoke"/"AR" two-tone wordmark, shared by the header and the home hero. */
export function Logo({
  size = "sm",
  iconOnly = false,
  className,
}: {
  size?: keyof typeof SIZES;
  iconOnly?: boolean;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-gradient-to-br from-brand to-brand/80 font-display font-bold text-brand-foreground shadow-sm shadow-brand/20",
          s.badge,
        )}
        aria-hidden="true"
      >
        S
      </span>
      {!iconOnly && (
        <span className={cn("font-display font-bold tracking-wide", s.text)}>
          Smoke<span className="text-brand">AR</span>
        </span>
      )}
    </span>
  );
}
