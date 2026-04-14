import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/40 aria-invalid:border-destructive/50 group/button inline-flex shrink-0 cursor-pointer items-center justify-center border bg-clip-padding text-xs font-medium whitespace-nowrap uppercase transition-all outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",

        "default-subtle": "bg-primary/10 text-primary border-primary/20",

        outline:
          "border-border bg-input! text-foreground/90 aria-expanded:bg-muted aria-expanded:text-foreground shadow-xs",

        secondary:
          "bg-secondary border-border text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",

        ghost:
          "aria-expanded:bg-muted/50 aria-expanded:text-foreground border-transparent",

        destructive:
          "bg-destructive/20 focus-visible:ring-destructive/40 text-destructive focus-visible:border-destructive/40 border-transparent",

        link: "text-primary h-auto! border-transparent p-0! underline-offset-4 hover:opacity-80",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        variant !== "link" && "hover:brightness-85 active:translate-y-px",
        className,
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
