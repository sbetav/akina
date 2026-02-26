import AuthFormCard from "@/components/auth/auth-form-card";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { ShieldCheckIcon } from "lucide-react";
import { FC } from "react";

const Page: FC = () => {
  return (
    <AuthFormCard
      icon={<ShieldCheckIcon />}
      heading="Crea tu nueva contraseña"
      description="Ingresa y confirma tu nueva contraseña para recuperar el acceso a tu cuenta"
    >
      <ResetPasswordForm />
    </AuthFormCard>
  );
};

export default Page;
