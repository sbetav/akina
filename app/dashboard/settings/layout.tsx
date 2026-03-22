"use client";

import BackButton from "@/components/back-button";
import DashboardCard from "@/components/dashboard/dashboard-card";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";
import { useRouter } from "@bprogress/next";
import {
  BlocksIcon,
  BriefcaseBusinessIcon,
  LockIcon,
  UserIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    {
      href: "/dashboard/settings",
      label: "Cuenta",
      icon: UserIcon,
    },
    {
      href: "/dashboard/settings/integration",
      label: "Integración",
      icon: BlocksIcon,
    },
    {
      href: "/dashboard/settings/company",
      label: "Empresa",
      icon: BriefcaseBusinessIcon,
    },
    {
      href: "/dashboard/settings/security",
      label: "Seguridad",
      icon: LockIcon,
    },
  ];

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-8">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href="/dashboard" />
          <PageHeaderTitle>Configuración</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Gestiona tu cuenta, credenciales y preferencias
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <div className="flex min-h-full flex-1 gap-8">
        <aside className="bg-popover/50 h-fit w-full max-w-64 border p-1">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isSettings = link.href === "/dashboard/settings";
                const isActive = isSettings
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <button
                    type="button"
                    aria-label={`Ir a ${link.label}`}
                    key={link.href}
                    onClick={() => {
                      router.push(link.href);
                    }}
                    className={cn(
                      "hover:bg-accent hover:text-foreground text-muted-foreground relative flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-xs font-medium transition-all",
                      {
                        "bg-accent text-primary!": isActive,
                      },
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
        <DashboardCard className="flex min-h-0 flex-1">
          {children}
        </DashboardCard>
      </div>
    </div>
  );
};

export default Layout;
