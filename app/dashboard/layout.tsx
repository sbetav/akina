import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardTour from "@/components/dashboard/dashboard-tour";
import SideBar from "@/components/dashboard/sidebar";
import { CredentialsContextProvider } from "@/contexts/credentials-context";
import { FactusService } from "@/elysia/modules/factus/service";
import { requireUser } from "@/lib/dal";
import { getQueryClient } from "@/lib/query-client";
import { CREDENTIALS_QUERY_KEY } from "@/lib/query-keys";

interface LayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
      <CredentialsContextProvider>
        <div className="flex h-svh w-full">
          <DashboardTour />
          <SideBar user={user} />
          <main className="w-full flex-1 overflow-auto pt-16 lg:pt-0">
            <div className="bg-bg mx-auto flex min-h-full w-full max-w-[1500px] flex-col p-6 lg:px-12 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </CredentialsContextProvider>
    </HydrationBoundary>
  );
};

export default Layout;
