import Container from "@/components/ui/container";
import { cn } from "@/lib/utils";
import type { FC, ReactNode } from "react";

interface AuthFormCardProps {
  icon: ReactNode;
  heading: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const AuthFormCard: FC<AuthFormCardProps> = ({
  icon,
  heading,
  description,
  children,
  footer,
  className,
}) => {
  return (
    <Container className="w-full">
      <article
        className={cn(
          "bg-card xs:px-10 mx-auto flex w-full max-w-md flex-col gap-8 border px-5 py-10 pb-11",
          className,
        )}
      >
        <div className="flex w-full flex-col items-center justify-center text-center">
          <div className="text-primary bg-primary/15 ring-primary/10 mb-5 rounded-full p-3 ring-4 [&_svg]:size-7">
            {icon}
          </div>
          <p className="mb-2 text-sm font-bold uppercase">{heading}</p>
          <div className="text-muted-foreground text-xs text-pretty">
            {description}
          </div>
        </div>
        {children}
        {footer}
      </article>
    </Container>
  );
};

export default AuthFormCard;
