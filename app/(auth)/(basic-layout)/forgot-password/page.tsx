import AuthFormCard from "@/components/auth/auth-form-card";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import BackButton from "@/components/back-button";
import { KeyRoundIcon } from "lucide-react";
import { FC } from "react";

const Page: FC = () => {
  return (
    <AuthFormCard
      icon={<KeyRoundIcon />}
      heading="Recupera tu contraseña"
      description="Enviaremos un enlace de recuperación a tu correo electrónico"
      footer={
        <BackButton label="Volver al inicio" mode="redirect" href="/login" />
      }
    >
      <ForgotPasswordForm />
    </AuthFormCard>
  );
};

export default Page;
