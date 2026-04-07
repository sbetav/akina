import BackButton from "@/components/back-button";
import CustomerForm from "@/components/dashboard/customers/customer-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { FactusService } from "@/elysia/modules/factus/service";
import { requireUser } from "@/lib/dal";

const Page = async () => {
  const user = await requireUser();

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
          <BackButton mode="redirect" href="/dashboard/customers" />
          <PageHeaderTitle>Nuevo cliente</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Ingresa los datos del cliente
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <CustomerForm municipalities={municipalities} />
    </div>
  );
};

export default Page;
