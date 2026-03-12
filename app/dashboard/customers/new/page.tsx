"use client";

import BackButton from "@/components/back-button";
import CustomerForm from "@/components/dashboard/customers/customer-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { FC } from "react";

const Page: FC = () => {
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
      <CustomerForm
        onSubmit={(data) => {
          console.log(data);
        }}
      />
    </div>
  );
};

export default Page;
