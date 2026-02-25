import RegisterForm from "@/components/auth/register-form";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";

const Page: FC = () => {
  return (
    <>
      <RegisterForm />
      <div className="mt-2 flex w-full items-center justify-center">
        <p className="text-muted-foreground text-xs uppercase">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className={buttonVariants({ variant: "link" })}>
            Inicia Sesión
          </Link>
        </p>
      </div>
    </>
  );
};

export default Page;
