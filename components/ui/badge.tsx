import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-garden-100 text-garden-800",
        planted: "bg-emerald-100 text-emerald-800",
        growing: "bg-green-100 text-green-800",
        harvesting: "bg-amber-100 text-amber-800",
        wishlist: "bg-soil-100 text-soil-700",
        done: "bg-stone-100 text-stone-600",
        full: "bg-yellow-100 text-yellow-800",
        partial: "bg-blue-100 text-blue-800",
        shade: "bg-indigo-100 text-indigo-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
