import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { FC } from "react";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import CompanyForm from "@/components/dashboard/settings/company/company-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FactusService } from "@/elysia/modules/factus/service";
import { requireUser } from "@/lib/dal";
import { getQueryClient } from "@/lib/query-client";
import { COMPANY_QUERY_KEY } from "@/lib/query-keys";

const Page: FC = async () => {
  const user = await requireUser();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [...COMPANY_QUERY_KEY],
    queryFn: async () => {
      return await FactusService.getCompany(user.id);
    },
  });

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Datos de la empresa</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            Datos de tu empresa tal como aparecen en los documentos electrónicos
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <Alert variant="warning">
        <AlertTitle>Información</AlertTitle>
        <AlertDescription>
          Estos datos están vinculados a tus credenciales de Factus activas. Por
          el momento no se puede modificar desde Akina.
        </AlertDescription>
      </Alert>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CompanyForm />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
