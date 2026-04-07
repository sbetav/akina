import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-destructive/40 inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 bg-destructive/20 focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border bg-background/60 text-muted-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        warning:
          "text-warning focus-visible:ring-warning/20 bg-warning/15 focus-visible:ring-warning/40 [a]:hover:bg-warning/20",
        info: "text-info focus-visible:ring-info/20 bg-info/15 focus-visible:ring-info/40 [a]:hover:bg-info/20",
        teal: "bg-teal-500/15 text-teal-700 focus-visible:ring-teal-500/20 focus-visible:ring-teal-500/40 dark:text-teal-300 [a]:hover:bg-teal-500/20",
        cyan: "bg-cyan-500/15 text-cyan-700 focus-visible:ring-cyan-500/20 focus-visible:ring-cyan-500/40 dark:text-cyan-300 [a]:hover:bg-cyan-500/20",
        indigo:
          "bg-indigo-500/15 text-indigo-700 focus-visible:ring-indigo-500/20 focus-visible:ring-indigo-500/40 dark:text-indigo-300 [a]:hover:bg-indigo-500/20",
        violet:
          "bg-violet-500/15 text-violet-700 focus-visible:ring-violet-500/20 focus-visible:ring-violet-500/40 dark:text-violet-300 [a]:hover:bg-violet-500/20",
        purple:
          "bg-purple-500/15 text-purple-700 focus-visible:ring-purple-500/20 focus-visible:ring-purple-500/40 dark:text-purple-300 [a]:hover:bg-purple-500/20",
        fuchsia:
          "bg-fuchsia-500/15 text-fuchsia-700 focus-visible:ring-fuchsia-500/20 focus-visible:ring-fuchsia-500/40 dark:text-fuchsia-300 [a]:hover:bg-fuchsia-500/20",
      },
      size: {
        default: "h-6 px-2 py-0.5 text-xs",
        sm: "h-4.5 px-1.5 py-0 pt-px text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type BadgeProps = Omit<useRender.ComponentProps<"span">, "variant" | "size"> &
  VariantProps<typeof badgeVariants>;

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  });
}

export type { BadgeProps };
export { Badge, badgeVariants };
