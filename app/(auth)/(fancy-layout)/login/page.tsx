import Link from "next/link";
import type { FC } from "react";
import LoginForm from "@/components/auth/login-form";
import { buttonVariants } from "@/components/ui/button";

const Page: FC = () => {
  return (
    <>
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
    </>
  );
};

export default Page;
