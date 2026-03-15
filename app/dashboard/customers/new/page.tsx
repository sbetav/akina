import BackButton from "@/components/back-button";
import CustomerForm from "@/components/dashboard/customers/customer-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { getMunicipalitiesAction } from "../actions";

const Page = async () => {
  const municipalities = await getMunicipalitiesAction();

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href="/dashboard/customers" />
          <PageHeaderTitle>Nuevo cliente</PageHeaderTitle>
          <PageHeaderDescription>
            // Ingresa los datos del cliente
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <CustomerForm municipalities={municipalities} />
    </div>
  );
};

export default Page;
