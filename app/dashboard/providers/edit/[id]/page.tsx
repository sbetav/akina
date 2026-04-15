import { notFound } from "next/navigation";
import type { FC } from "react";
import BackButton from "@/components/back-button";
import ProviderForm from "@/components/dashboard/providers/provider-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import {
  type ProviderDetailResult,
  ProviderService,
} from "@/elysia/modules/providers/service";
import { requireUser } from "@/lib/dal";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const user = await requireUser();

  let provider: ProviderDetailResult;
  try {
    provider = await ProviderService.get(user.id, id);
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton href="/dashboard/providers" />
          <PageHeaderTitle>Editar proveedor</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Actualiza los datos del proveedor
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <ProviderForm selectedProvider={provider} />
    </div>
  );
};

export default Page;
