"use client";

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
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 border text-sm before:absolute before:top-0 before:left-0 before:h-full before:w-[3px] before:bg-current/90 before:content-[''] has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-2.5 [&>svg]:size-4 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground before:bg-border",
        success:
          "text-success border-success/20 bg-success/10 *:data-[slot=alert-description]:text-success/90 [&>svg]:text-current",
        info: "text-info border-info/20 bg-info/10 *:data-[slot=alert-description]:text-info/90 [&>svg]:text-current",
        warning:
          "text-warning border-warning/20 bg-warning/10 *:data-[slot=alert-description]:text-warning/90 [&>svg]:text-current",
        destructive:
          "text-destructive border-destructive/20 bg-destructive/10 *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
      },
      size: {
        default: "px-4 py-3 [&>svg]:translate-y-0.5",
        sm: "px-3 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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

const AlertSizeContext = React.createContext<"default" | "sm">("default");

function Alert({
  className,
  variant,
  size = "default",
  children,
  showIcon = true,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    showIcon?: boolean;
  }) {
  const defaultIcon = variant ? variantIcons[variant] : null;

  return (
    <AlertSizeContext.Provider value={size ?? "default"}>
      <div className="bg-background" data-slot="alert" role="alert">
        <div
          className={cn(alertVariants({ variant, size }), className)}
          {...props}
        >
          {showIcon && defaultIcon}
          {children}
        </div>
      </div>
    </AlertSizeContext.Provider>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(AlertSizeContext);

  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-medium tracking-tight",
        size === "sm" && "text-xs font-normal",
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
        "text-foreground/60! col-start-2 grid justify-items-start gap-1 text-xs font-extralight [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("col-start-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
