import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-background-elevated text-foreground-muted border border-border",
        brand: "bg-brand-muted text-brand border border-brand/30",
        success: "bg-success/10 text-success border border-success/30",
        danger: "bg-danger/10 text-danger border border-danger/30",
        ct: "bg-ct/10 text-ct border border-ct/30",
        t: "bg-t/10 text-t border border-t/30",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
