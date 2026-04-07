import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

const EllipsisIcon = (
  props: SVGProps<SVGSVGElement> & { direction?: "horizontal" | "vertical" },
) => (
  <svg
    aria-label="Ellipsis"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="butt"
    strokeLinejoin="miter"
    className={cn({
      "rotate-90": props.direction === "horizontal",
    })}
    {...props}
  >
    <rect x="11" y="4" width="2" height="2" />
    <rect x="11" y="11" width="2" height="2" />
    <rect x="11" y="18" width="2" height="2" />
  </svg>
);

export default EllipsisIcon;
