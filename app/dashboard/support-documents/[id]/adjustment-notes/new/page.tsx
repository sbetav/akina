import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { ViewSupportDocumentData } from "factus-js";
import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import AdjustmentNoteForm from "@/components/dashboard/adjustment-notes/adjustment-note-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { NotFoundError } from "@/elysia/errors";
import { FactusService } from "@/elysia/modules/factus/service";
import { SupportDocumentService } from "@/elysia/modules/support-documents/service";
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

  let document: ViewSupportDocumentData;
  try {
    document = await SupportDocumentService.getFromFactus(user.id, id);
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
          <BackButton
            mode="redirect"
            href={`/dashboard/support-documents/${id}`}
          />
          <PageHeaderTitle>Nueva nota de ajuste</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Crea una nota de ajuste para el documento soporte{" "}
            {document.support_document.number}
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdjustmentNoteForm
          supportDocumentId={id}
          supportDocumentFactusId={document.support_document.id}
          document={document}
        />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
