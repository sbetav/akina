import AuthFormCard from "@/components/auth/auth-form-card";
import BackButton from "@/components/back-button";
import { UnlinkIcon } from "lucide-react";
import { FC } from "react";

const Page: FC = () => {
  return (
    <AuthFormCard
      icon={<UnlinkIcon />}
      heading="El enlace no es válido"
      description="Oops, parece que este enlace ya expiró o no es válido."
    >
      <BackButton label="Volver al inicio" mode="redirect" href="/login" />
    </AuthFormCard>
  );
};

export default Page;
