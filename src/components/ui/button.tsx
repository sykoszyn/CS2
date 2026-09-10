import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-foreground hover:bg-brand/90",
        secondary:
          "bg-background-elevated text-foreground border border-border hover:bg-background-card",
        ghost: "text-foreground-muted hover:text-foreground hover:bg-background-elevated",
        outline: "border border-border-strong text-foreground hover:bg-background-elevated",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  /** Routes that must never get a locale prefix (e.g. /auth/steam) — renders a plain <a> instead of the locale-aware Link. */
  unlocalized?: boolean;
}

export function Button({ className, variant, size, href, unlocalized, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    if (unlocalized) {
      return (
        <a href={href} className={classes}>
          {props.children as React.ReactNode}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {props.children as React.ReactNode}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}
