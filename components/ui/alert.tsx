import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-2.5 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        success:
          "text-success border-success/20 bg-success/10 *:data-[slot=alert-description]:text-success/90 [&>svg]:text-current",
        info: "text-info border-info/20 bg-info/10 *:data-[slot=alert-description]:text-info/90 [&>svg]:text-current",
        warning:
          "text-warning border-warning/20 bg-warning/10 *:data-[slot=alert-description]:text-warning/90 [&>svg]:text-current",
        destructive:
          "text-destructive border-destructive/20 bg-destructive/10 *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const variantIcons: Partial<Record<AlertVariant, React.ReactNode>> = {
  success: <CircleCheckIcon className="size-4 shrink-0" />,
  destructive: <CircleXIcon className="size-4 shrink-0" />,
  warning: <TriangleAlertIcon className="size-4 shrink-0" />,
  info: <InfoIcon className="size-4 shrink-0" />,
};

function Alert({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const defaultIcon = variant ? variantIcons[variant] : null;

  return (
    <div className="bg-background" data-slot="alert" role="alert">
      <div className={cn(alertVariants({ variant }), className)} {...props}>
        {defaultIcon}
        {children}
      </div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
