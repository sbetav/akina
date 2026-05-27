import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FC } from "react";

interface AppLogoProps {
  size?: number;
  showLabel?: boolean;
  labelClassName?: string;
}

const AppLogo: FC<AppLogoProps> = ({
  size = 36,
  showLabel = true,
  labelClassName,
}) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={APP_NAME}
      >
        <rect width={size} height={size} fill="var(--primary)" />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="var(--primary-foreground)"
          fontSize={size * 0.55}
          fontWeight="700"
          className="font-sans select-none"
        >
          {APP_NAME[0]}
        </text>
      </svg>
      {showLabel && (
        <span
          className={cn(
            "mt-px font-sans leading-none font-semibold tracking-wide uppercase",
            labelClassName,
          )}
          style={{ fontSize: size * 0.6 }}
        >
          {APP_NAME}
        </span>
      )}
    </div>
  );
};

export { AppLogo };
