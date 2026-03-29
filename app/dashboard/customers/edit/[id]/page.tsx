import BackButton from "@/components/back-button";
import CustomerForm from "@/components/dashboard/customers/customer-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { requireUser } from "@/lib/dal";
import { CustomerService } from "@/lib/elysia/modules/customers/service";
import { FactusService } from "@/lib/elysia/modules/factus/service";
import { notFound } from "next/navigation";
import { FC } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const user = await requireUser();

  let customer;
  try {
    customer = await CustomerService.get(user.id, id);
  } catch {
    notFound();
  }

  let municipalities: Awaited<
    ReturnType<typeof FactusService.getMunicipalities>
  > = [];
  try {
    municipalities = await FactusService.getMunicipalities(user.id);
  } catch {
    // Fallback to empty — the form still works, user just can't pick a municipality
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton href="/dashboard/customers" />
          <PageHeaderTitle>Editar cliente</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Actualiza los datos del cliente
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <CustomerForm
        municipalities={municipalities}
        selectedCustomer={customer}
      />
    </div>
  );
};

export default Page;
