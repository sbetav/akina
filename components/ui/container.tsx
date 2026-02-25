import { cn } from "@/lib/utils";
import type { FC } from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Container: FC<ContainerProps> = ({ children, className, id }) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12",
        className,
      )}
      id={id}
    >
      {children}
    </div>
  );
};

export default Container;
