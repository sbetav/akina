import { requireUser } from "@/lib/dal";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const user = await requireUser();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}</p>
      {children}
    </div>
  );
};

export default Layout;
