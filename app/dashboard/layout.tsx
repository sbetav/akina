import SideBar from "@/components/dashboard/sidebar";
import { CredentialActivationProvider } from "@/contexts/credential-activation-context";
import { requireUser } from "@/lib/dal";
import { FactusService } from "@/lib/elysia/modules/factus/service";
import { getQueryClient } from "@/lib/query-client";
import { CREDENTIALS_QUERY_KEY } from "@/lib/query-keys";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const user = await requireUser();

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [...CREDENTIALS_QUERY_KEY],
    queryFn: async () => {
      const items = await FactusService.listCredentials(user.id);
      return { items };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CredentialActivationProvider>
        <div className="flex h-svh w-full">
          <SideBar user={user} />
          <main className="w-full flex-1 overflow-auto pt-16 lg:pt-0">
            <div className="bg-bg mx-auto flex min-h-full w-full max-w-[1500px] flex-col p-6 lg:px-12 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </CredentialActivationProvider>
    </HydrationBoundary>
  );
};

export default Layout;
