import { AppLogo } from "@/components/ui/app-logo";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-8">
      <AppLogo />
      {children}
      <span className="text-foreground/60 text-xs">
        AKINA &copy; {new Date().getFullYear()}
      </span>
    </div>
  );
};

export default Layout;
