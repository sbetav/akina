import { MailCheckIcon } from "lucide-react";
import type { FC } from "react";
import AuthFormCard from "@/components/auth/auth-form-card";
import EmailOtpForm from "@/components/auth/email-otp-form";
import BackButton from "@/components/back-button";

const Page: FC = () => {
  return (
    <AuthFormCard
      icon={<MailCheckIcon />}
      heading="Verifica tu correo"
      description={
        <>
          Enviamos un código de 6 dígitos a
          <span className="text-foreground mt-1 block text-xs font-semibold">
            s****o@gmail.com
          </span>
        </>
      }
      footer={
        <BackButton label="Volver al inicio" mode="redirect" href="/login" />
      }
    >
      <EmailOtpForm />
    </AuthFormCard>
  );
};

export default Page;
