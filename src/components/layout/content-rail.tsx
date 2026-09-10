import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

/**
 * Horizontal, snap-scrolling content section — the replacement for the old
 * uniform `<Section>` grid. Used for anything editorial: trending, map
 * discovery, popular content. Children scroll instead of wrapping, so a
 * rail can hold differently-sized cards without breaking the row.
 */
export function ContentRail({
  eyebrow,
  title,
  href,
  hrefLabel,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-3 px-4 lg:px-6">
        <div>
          <p className="text-eyebrow">{eyebrow}</p>
          <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
        </div>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground-muted hover:text-brand"
          >
            {hrefLabel}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="scroll-rail px-4 pb-1 lg:px-6">{children}</div>
    </section>
  );
}
