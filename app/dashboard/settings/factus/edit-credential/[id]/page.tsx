import { notFound } from "next/navigation";
import type { FC } from "react";
import BackButton from "@/components/back-button";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import CredentialsForm from "@/components/dashboard/settings/factus/credentials-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { requireUser } from "@/lib/dal";
import {
  type CredentialDetailResult,
  FactusService,
} from "@/lib/elysia/modules/factus/service";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const user = await requireUser();

  let credential: CredentialDetailResult;
  try {
    credential = await FactusService.getCredential(user.id, id);
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <BackButton href="/dashboard/settings/factus" />
          <PageHeaderTitle>
            Editar credenciales {credential.name}
          </PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            &#47;&#47; Actualiza la información de tus credenciales
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      {!credential.isValid && (
        <Alert variant="destructive">
          <AlertTitle>Credenciales inválidas</AlertTitle>
          <AlertDescription>
            No se pudo conectar con Factus usando estas credenciales. Verifica
            los datos e intenta nuevamente.
          </AlertDescription>
        </Alert>
      )}

      <CredentialsForm selectedCredential={credential} />
    </div>
  );
};

export default Page;
