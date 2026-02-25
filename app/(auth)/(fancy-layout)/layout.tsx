import BackButton from "@/components/back-button";
import Silk from "@/components/backgrounds/silk";
import { AppLogo } from "@/components/ui/app-logo";
import Container from "@/components/ui/container";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-dvh w-full items-center divide-x">
      {/* FORM COLUMN */}
      <Container className="flex h-full w-full shrink-0 flex-col items-start gap-8 overflow-y-auto py-10 md:py-14 lg:px-14 xl:max-w-xl">
        <BackButton mode="redirect" href="/" />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-8 xl:max-w-none">
          <AppLogo />
          {children}
        </div>
      </Container>

      {/* IMAGE COLUMN */}
      <section className="bg-primary/20 relative hidden h-full flex-1 xl:block">
        <Silk
          speed={6.1}
          scale={1.1}
          color="var(--primary)"
          noiseIntensity={1.2}
          rotation={2.9}
        />
        {/* BG OVERLAY */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_100%)] backdrop-brightness-50 backdrop-saturate-90" />
        {/* TEXT */}
        <div className="absolute right-26 bottom-26 z-11 flex max-w-[400px] flex-col items-end font-sans text-4xl font-semibold">
          <AppLogo size={32} />
          <p className="mt-4 text-right tracking-tight">
            El sistema <span className="text-primary underline">POS</span> ideal
            para tu negocio
          </p>
          <span className="text-muted-foreground mt-6 text-xs">
            AKINA POS &copy; {new Date().getFullYear()}
          </span>
        </div>
      </section>
    </div>
  );
};

export default Layout;
