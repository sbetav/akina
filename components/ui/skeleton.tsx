import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-skeleton-shimmer", className)}
      style={{
        background: `linear-gradient(115deg,
            var(--muted) 0%,
            var(--muted) 20%,
            color-mix(in oklch, var(--muted) 99%, var(--muted-foreground)) 35%,
            color-mix(in oklch, var(--muted) 95%, var(--muted-foreground)) 50%,
            color-mix(in oklch, var(--muted) 99%, var(--muted-foreground)) 65%,
            var(--muted) 80%,
            var(--muted) 100%)`,
        backgroundSize: "300% 100%",
      }}
      {...props}
    />
  );
}

export { Skeleton };
