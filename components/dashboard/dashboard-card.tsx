import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

interface DashboardCardProps {
  children?: ReactNode;
  className?: string;
}

const DashboardCard: FC<DashboardCardProps> = ({ children, className }) => {
  return (
    <div className={cn("bg-card border px-6 py-5 lg:px-8 lg:py-7", className)}>
      {children}
    </div>
  );
};

export default DashboardCard;
