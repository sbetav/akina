import BackButton from "@/components/back-button";
import ProviderForm from "@/components/dashboard/providers/provider-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";

const Page = () => {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href="/dashboard/providers" />
          <PageHeaderTitle>Nuevo proveedor</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Ingresa los datos del proveedor
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <ProviderForm />
    </div>
  );
};

export default Page;
