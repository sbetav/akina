import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import SupportDocumentsTable from "@/components/dashboard/support-documents/support-documents-table";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { SupportDocumentService } from "@/elysia/modules/support-documents/service";
import { requireUser } from "@/lib/dal";
import { getQueryClient } from "@/lib/query-client";
import {
  DEFAULT_SUPPORT_DOCUMENTS_LIMIT,
  SUPPORT_DOCUMENTS_QUERY_KEY,
} from "@/lib/query-keys";

const Page: FC = async () => {
  const user = await requireUser();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [
      ...SUPPORT_DOCUMENTS_QUERY_KEY,
      { search: "", page: 1, limit: DEFAULT_SUPPORT_DOCUMENTS_LIMIT },
    ],
    queryFn: () =>
      SupportDocumentService.list(user.id, {
        page: 1,
        limit: DEFAULT_SUPPORT_DOCUMENTS_LIMIT,
      }),
  });

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Documentos soporte</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Gestión de documentos soporte electrónicos
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link
            href="/dashboard/support-documents/new"
            className={buttonVariants({ size: "lg" })}
          >
            <PlusIcon />
            Nuevo documento soporte
          </Link>
        </PageHeaderActions>
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <SupportDocumentsTable />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
