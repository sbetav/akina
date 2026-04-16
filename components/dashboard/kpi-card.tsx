import type { CSSProperties, FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  /** Tailwind color class applied to the left accent border, e.g. "border-primary" */
  accentClass?: string;
  /** Small secondary label shown below the value */
  subLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const KpiCard: FC<KpiCardProps> = ({
  label,
  value,
  icon,
  accentClass = "border-primary",
  subLabel,
  className,
  style,
}) => {
  return (
    <div
      className={cn(
        "bg-card relative flex flex-col gap-3 overflow-hidden border border-l-2 px-5 py-5",
        accentClass,
        className,
      )}
      style={style}
    >
      {/* Icon + label row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {label}
        </span>
        <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
      </div>

      {/* Value */}
      <div className="text-foreground font-mono text-2xl leading-none font-semibold tracking-tight tabular-nums lg:text-3xl">
        {value}
      </div>

      {/* Sub label */}
      {subLabel && <p className="text-muted-foreground text-xs">{subLabel}</p>}
    </div>
  );
};

export default KpiCard;
