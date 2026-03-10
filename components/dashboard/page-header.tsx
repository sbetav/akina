import { cn } from "@/lib/utils";

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header"
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    />
  );
}

function PageHeaderContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-content"
      className={cn("space-y-1.5", className)}
      {...props}
    />
  );
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="page-header-title"
      className={cn(
        "font-sans text-4xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("text-muted-foreground text-sm uppercase", className)}
      {...props}
    />
  );
}

function PageHeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
};
