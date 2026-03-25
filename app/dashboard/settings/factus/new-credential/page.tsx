"use client";

import BackButton from "@/components/back-button";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import CredentialsForm from "@/components/dashboard/settings/factus/credentials-form";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <BackButton href="/dashboard/settings/factus" />
          <PageHeaderTitle>Nueva credencial</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            &#47;&#47; Agrega una nueva credencial para emitir documentos
            electrónicos
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <CredentialsForm />
    </div>
  );
};

export default Page;
