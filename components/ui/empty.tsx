import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function Empty({
  className,
  fillSpace,
  ...props
}: React.ComponentProps<"div"> & { fillSpace?: boolean }) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "xs:p-8 flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 border-dashed p-4 text-center sm:p-12",
        {
          "bg-card/20 flex min-h-0 flex-1 items-center justify-center border border-dashed":
            fillSpace,
        },
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-muted-foreground/80 xs:size-16 xs:[&_svg:not([class*='size-'])]:size-6 size-14 border [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  if (variant !== "icon") {
    return (
      <div
        data-slot="empty-media"
        data-variant={variant}
        className={cn(emptyMediaVariants({ variant }), className)}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="empty-media-wrapper"
      className={cn(
        "xs:size-16 relative mb-2 size-14",
        // Back-left card
        "before:bg-muted before:border-border before:absolute before:inset-0 before:border before:content-['']",
        "before:origin-bottom-left before:-translate-x-1 before:scale-[0.84] before:-rotate-10",
        // Back-right card
        "after:bg-muted after:border-border after:absolute after:inset-0 after:border after:content-['']",
        "after:origin-bottom-right after:translate-x-1 after:scale-[0.84] after:rotate-10",
      )}
    >
      <div
        data-slot="empty-media"
        data-variant={variant}
        className={cn(
          "relative z-10",
          emptyMediaVariants({ variant }),
          className,
        )}
        {...props}
      />
    </div>
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn(
        "font-sans font-medium tracking-tight sm:text-xl",
        className,
      )}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-xs [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full min-w-0 flex-col items-center gap-4 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
};
