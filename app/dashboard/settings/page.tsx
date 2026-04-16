import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { FC } from "react";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import ProfileForm from "@/components/dashboard/settings/profile/profile-form";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth/server";

const Page: FC = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const { user } = session;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Tu cuenta</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            Actualiza tu información de perfil y datos personales.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <Separator />

      <ProfileForm user={user} />
    </div>
  );
};

export default Page;
