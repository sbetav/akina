import SideBar from "@/components/dashboard/sidebar";
import { requireUser } from "@/lib/dal";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const user = await requireUser();
  return (
    <div className="flex h-svh w-full">
      <SideBar user={user} />
      <main className="w-full flex-1 overflow-auto">
        <div className="bg-bg mx-auto flex min-h-full w-full flex-col p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
