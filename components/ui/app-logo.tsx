import type { FC } from "react";

interface AppLogoProps {
  size?: number;
  showLabel?: boolean;
  label?: string;
  letter?: string;
  bgColor?: string;
  textColor?: string;
}

const AppLogo: FC<AppLogoProps> = ({
  size = 36,
  showLabel = true,
  label = "AKINA",
  letter = "A",
  bgColor = "var(--primary)",
  textColor = "var(--primary-foreground)",
}) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Logo ${letter}`}
      >
        <rect width={size} height={size} fill={bgColor} />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill={textColor}
          fontSize={size * 0.55}
          fontWeight="700"
          className="font-sans select-none"
        >
          {letter}
        </text>
      </svg>
      {showLabel && (
        <span
          className="mt-px font-sans leading-none font-semibold tracking-wide"
          style={{ fontSize: size * 0.6 }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export { AppLogo };
