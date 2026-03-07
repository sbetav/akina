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
        <div className="bg-bg min-h-full w-full p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
