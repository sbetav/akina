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
import {
  BriefcaseBusinessIcon,
  ChevronDownIcon,
  FileDigitIcon,
  KeyIcon,
  LockIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, ReactNode, useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const links = [
    {
      href: "/dashboard/settings",
      label: "Tu Cuenta",
      icon: UserIcon,
    },
    {
      href: "/dashboard/settings/factus",
      label: "Conexión a Factus",
      icon: KeyIcon,
    },
    {
      href: "/dashboard/settings/company",
      label: "Datos de la empresa",
      icon: BriefcaseBusinessIcon,
    },
    {
      href: "/dashboard/settings/numbering-ranges",
      label: "Rangos de numeración",
      icon: FileDigitIcon,
    },
    {
      href: "/dashboard/settings/security",
      label: "Seguridad",
      icon: LockIcon,
    },
  ];

  const activeLink = links.find((link) => {
    const isSettings = link.href === "/dashboard/settings";
    return isSettings ? pathname === link.href : pathname.startsWith(link.href);
  });

  const ActiveIcon = activeLink?.icon;

  return (
    <>
      {/* Backdrop — closes nav when clicking outside, fades in/out */}
      <div
        onClick={() => setIsNavOpen(false)}
        className={cn(
          "fixed inset-0 z-20 brightness-50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile settings nav bar — fixed below the dashboard header, lg:hidden */}
      <div className="border-border bg-sidebar fixed top-16 right-0 left-0 z-30 lg:hidden">
        {/* Trigger row */}
        <button
          type="button"
          onClick={() => setIsNavOpen((prev) => !prev)}
          className="flex h-12 w-full cursor-pointer items-center justify-between border-b px-6"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium">
            {ActiveIcon && (
              <ActiveIcon className="text-muted-foreground size-4" />
            )}
            {activeLink?.label ?? "Configuración"}
          </span>
          <div className="flex size-8 items-center justify-center">
            <ChevronDownIcon
              className={cn(
                "text-muted-foreground size-4 transition-transform duration-300",
                isNavOpen && "rotate-180",
              )}
            />
          </div>
        </button>

        {/* Expand panel — grid-rows trick for smooth height animation */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            isNavOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-b px-3 py-2">
              {links.map((link, index) => {
                const Icon = link.icon;
                const isSettings = link.href === "/dashboard/settings";
                const isActive = isSettings
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    type="button"
                    key={index}
                    href={link.href}
                    onClick={() => setIsNavOpen(false)}
                    className={cn(
                      "hover:bg-accent hover:text-foreground text-muted-foreground focus-effect flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-all outline-none!",
                      {
                        "text-primary! bg-accent": isActive,
                      },
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-full w-full flex-1 flex-col gap-7 pt-12 lg:pt-0">
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
          {/* Desktop sidebar */}
          <aside className="bg-popover/50 hidden h-fit w-full max-w-64 border p-1 lg:block">
            <div className="space-y-1">
              {links.map((link, index) => {
                const Icon = link.icon;
                const isSettings = link.href === "/dashboard/settings";
                const isActive = isSettings
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={index}
                    href={link.href}
                    onClick={() => setIsNavOpen(false)}
                    className={cn(
                      "hover:bg-accent hover:text-foreground text-muted-foreground focus-effect relative flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-xs font-medium transition-all",
                      {
                        "bg-accent text-primary!": isActive,
                      },
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </aside>
          <DashboardCard className="flex min-h-0 flex-1">
            {children}
          </DashboardCard>
        </div>
      </div>
    </>
  );
};

export default Layout;
