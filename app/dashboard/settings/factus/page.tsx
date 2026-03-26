import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import CredentialsList from "@/components/dashboard/settings/factus/credentials-list";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/dal";
import { FactusService } from "@/lib/elysia/modules/factus/service";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const user = await requireUser();

  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery({
    queryKey: ["factus", "credentials"],
    queryFn: async () => {
      const items = await FactusService.listCredentials(user.id);
      return { items };
    },
  });

  const initialActiveId =
    data.items.find((c) => c.isActive)?.id ?? "akina-sandbox";

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Conexión a Factus</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            &#47;&#47; Conecta Akina con Factus y comienza a emitir documentos
            electrónicos
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link
            href="/dashboard/settings/factus/new-credential"
            className={buttonVariants({})}
          >
            <PlusIcon /> Nueva credencial
          </Link>
        </PageHeaderActions>
      </PageHeader>

      <Separator />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CredentialsList initialActiveId={initialActiveId} />
      </HydrationBoundary>
    </div>
  );
}
