"use client";

import type { FC } from "react";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import ChangePasswordForm from "@/components/dashboard/settings/security/change-password-form";
import SessionsList from "@/components/dashboard/settings/security/sessions-list";
import { Separator } from "@/components/ui/separator";

const Page: FC = () => {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Seguridad</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            Administra tu contraseña, autenticación de dos factores y sesiones
            activas
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <Separator />
      <ChangePasswordForm />
      <Separator className="my-4" />
      <SessionsList />
    </div>
  );
};

export default Page;
