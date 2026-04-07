import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-skeleton-shimmer", className)}
      style={{
        background: `linear-gradient(115deg,
            var(--muted) 0%,
            var(--muted) 30%,

            color-mix(in oklch, var(--muted) 98%, var(--muted-foreground)) 40%,
            color-mix(in oklch, var(--muted) 94%, var(--muted-foreground)) 50%,
            color-mix(in oklch, var(--muted) 98%, var(--muted-foreground)) 60%,

            var(--muted) 70%,
            var(--muted) 100%)`,
        backgroundSize: "250% 120%",
      }}
      {...props}
    />
  );
}

export { Skeleton };
