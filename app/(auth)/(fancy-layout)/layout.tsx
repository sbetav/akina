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
      <section className="bg-primary/5 relative hidden h-full flex-1 xl:block">
        <Silk
          brightness={0.45}
          vignetteStrength={0.85}
          vignetteSoftness={0.9}
        />

        {/* TEXT */}
        <div className="absolute right-26 bottom-26 z-11 flex max-w-[400px] flex-col items-end gap-5 font-sans text-4xl font-semibold">
          <AppLogo size={32} />
          <p className="text-right tracking-tight">
            Facturación <span className="text-primary">electrónica</span> sin
            complicaciones
          </p>
          <span className="text-foreground/60 text-xs">
            AKINA &copy; {new Date().getFullYear()}
          </span>
        </div>
      </section>
    </div>
  );
};

export default Layout;
