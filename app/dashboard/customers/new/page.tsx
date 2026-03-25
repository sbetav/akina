"use client";

import BackButton from "@/components/back-button";
import CustomerForm from "@/components/dashboard/customers/customer-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { api } from "@/lib/elysia/eden";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["factus", "municipalities"],
    queryFn: async () => {
      const res = await api.factus.municipalities.get();
      if (res.error) throw new Error("Error al cargar municipios");
      return res.data.data;
    },
  });

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
      <CustomerForm
        municipalities={data ?? []}
        isLoadingMunicipalities={isLoading}
      />
    </div>
  );
};

export default Page;
