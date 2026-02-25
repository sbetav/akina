import LoginForm from "@/components/auth/login-form";
import BackButton from "@/components/back-button";
import Silk from "@/components/backgrounds/silk";
import { AppLogo } from "@/components/ui/app-logo";
import { buttonVariants } from "@/components/ui/button";
import Container from "@/components/ui/container";
import Link from "next/link";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="flex w-full items-center divide-x">
      {/* FORM COLUMN */}
      <Container className="flex min-h-dvh w-full shrink-0 flex-col items-start py-12 xl:max-w-xl 2xl:max-w-2xl">
        <BackButton />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-8">
          <AppLogo />
          <LoginForm />
          <div className="mt-2 flex w-full items-center justify-center">
            <p className="text-muted-foreground text-xs uppercase">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/register"
                className={buttonVariants({ variant: "link" })}
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </Container>

      {/* IMAGE COLUMN */}
      <section className="bg-primary/20 relative hidden h-dvh flex-1 xl:block">
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

export default Page;
