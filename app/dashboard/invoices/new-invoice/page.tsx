import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import BackButton from "@/components/back-button";
import InvoiceForm from "@/components/dashboard/invoices/invoice-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { FactusService } from "@/elysia/modules/factus/service";
import { requireUser } from "@/lib/dal";
import { getQueryClient } from "@/lib/query-client";
import {
  MUNICIPALITIES_QUERY_KEY,
  NUMBERING_RANGES_CATALOG_QUERY_KEY,
  TRIBUTES_QUERY_KEY,
} from "@/lib/query-keys";

const Page = async () => {
  const user = await requireUser();
  const queryClient = getQueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: [...MUNICIPALITIES_QUERY_KEY],
      queryFn: () => FactusService.getMunicipalities(user.id, ""),
    }),
    queryClient.prefetchQuery({
      queryKey: [...TRIBUTES_QUERY_KEY],
      queryFn: () => FactusService.getTributes(user.id),
    }),
    queryClient.prefetchQuery({
      queryKey: [...NUMBERING_RANGES_CATALOG_QUERY_KEY],
      queryFn: () => FactusService.listAllNumberingRanges(user.id),
    }),
  ]);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href="/dashboard/invoices" />
          <PageHeaderTitle>Nueva factura</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Crea una factura electrónica
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <InvoiceForm />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
