import type { Metadata } from "next";
import type { FC, ReactNode } from "react";
import { AppLogo } from "@/components/ui/app-logo";

interface LayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
