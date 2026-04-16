import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive/50 aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input/80 outline-border relative inline-flex shrink-0 cursor-pointer items-center border bg-transparent shadow-xs outline transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 aria-invalid:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-[size=default]:h-6 data-[size=default]:w-10",
        "data-[size=sm]:h-5 data-[size=sm]:w-8",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "absolute top-1/2 -translate-y-1/2",
          "bg-background data-checked:bg-primary-foreground data-unchecked:bg-muted-foreground",
          "pointer-events-none transition-transform",

          // default: inner width = 44-2 = 42px, thumb 16px, gap 4px
          "group-data-[size=default]/switch:size-4",
          "group-data-[size=default]/switch:left-[4px]",
          "group-data-[size=default]/switch:data-checked:translate-x-[15px]",
          "group-data-[size=default]/switch:data-unchecked:translate-x-0",

          // sm: inner width = 32-2 = 30px, thumb 12px, gap 3px
          "group-data-[size=sm]/switch:size-3",
          "group-data-[size=sm]/switch:left-[3px]",
          "group-data-[size=sm]/switch:data-checked:translate-x-[12px]",
          "group-data-[size=sm]/switch:data-unchecked:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
