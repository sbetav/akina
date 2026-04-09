import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { FC } from "react";
import InvoicesTable from "@/components/dashboard/invoices/invoices-table";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { InvoiceService } from "@/elysia/modules/invoices/service";
import { requireUser } from "@/lib/dal";
import { getQueryClient } from "@/lib/query-client";
import { DEFAULT_INVOICES_LIMIT, INVOICES_QUERY_KEY } from "@/lib/query-keys";

const Page: FC = async () => {
  const user = await requireUser();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [
      ...INVOICES_QUERY_KEY,
      { search: "", page: 1, limit: DEFAULT_INVOICES_LIMIT },
    ],
    queryFn: () =>
      InvoiceService.list(user.id, {
        page: 1,
        limit: DEFAULT_INVOICES_LIMIT,
      }),
  });

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Facturas</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Gestión de facturas electrónicas
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <InvoicesTable />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
