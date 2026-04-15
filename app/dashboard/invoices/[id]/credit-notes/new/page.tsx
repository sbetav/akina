import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { ViewBillData } from "factus-js";
import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import CreditNoteForm from "@/components/dashboard/credit-notes/credit-note-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { NotFoundError } from "@/elysia/errors";
import { FactusService } from "@/elysia/modules/factus/service";
import { InvoiceService } from "@/elysia/modules/invoices/service";
import { requireUser } from "@/lib/dal";
import { getQueryClient } from "@/lib/query-client";
import { NUMBERING_RANGES_CATALOG_QUERY_KEY } from "@/lib/query-keys";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  const user = await requireUser();
  const queryClient = getQueryClient();

  let invoice: ViewBillData;
  try {
    invoice = await InvoiceService.getFromFactus(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  await queryClient.prefetchQuery({
    queryKey: [...NUMBERING_RANGES_CATALOG_QUERY_KEY],
    queryFn: () => FactusService.listAllNumberingRanges(user.id),
  });

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href={`/dashboard/invoices/${id}`} />
          <PageHeaderTitle>Nueva nota crédito</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Crea una nota crédito para la factura{" "}
            {invoice.bill.number}
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CreditNoteForm invoiceId={id} invoice={invoice} />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
