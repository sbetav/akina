import { notFound } from "next/navigation";
import type { FC } from "react";
import BackButton from "@/components/back-button";
import CustomerForm from "@/components/dashboard/customers/customer-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import {
  type CustomerDetailResult,
  CustomerService,
} from "@/elysia/modules/customers/service";
import { requireUser } from "@/lib/dal";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const user = await requireUser();

  let customer: CustomerDetailResult;
  try {
    customer = await CustomerService.get(user.id, id);
  } catch {
    notFound();
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
      <CustomerForm selectedCustomer={customer} />
    </div>
  );
};

export default Page;
