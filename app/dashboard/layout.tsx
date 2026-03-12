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
        <div className="bg-bg mx-auto flex min-h-full w-full max-w-[1500px] flex-col p-6 lg:px-12 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
