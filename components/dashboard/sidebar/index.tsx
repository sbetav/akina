"use client";

import type { User } from "better-auth";
import {
  FileTextIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PackageIcon,
  ReceiptIcon,
  TruckIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { useState } from "react";
import { AppLogo } from "@/components/ui/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CredentialsDropdownMenu from "./credentials-dropdown-menu";
import ProfileDropdownMenu from "./profile-dropdown-menu";

interface SideBarProps {
  user: User;
}

const SideBar: FC<SideBarProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const pathname = usePathname();
  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      href: "/dashboard/invoices",
      label: "Facturas",
      icon: ReceiptIcon,
    },
    {
      href: "/dashboard/support-documents",
      label: "Documentos soporte",
      icon: FileTextIcon,
    },
    {
      href: "/dashboard/customers",
      label: "Clientes",
      icon: UsersIcon,
    },
    {
      href: "/dashboard/providers",
      label: "Proveedores",
      icon: TruckIcon,
    },
    {
      href: "/dashboard/products",
      label: "Productos",
      icon: PackageIcon,
    },
  ];

  return (
    <>
      {/* Mobile header — visible only below lg breakpoint */}
      <header className="border-border bg-sidebar fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b px-6 lg:hidden">
        <AppLogo size={28} />
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          {isOpen ? <XIcon /> : <MenuIcon />}
        </Button>
      </header>

      {/* Sidebar drawer */}
      <aside
        className={cn(
          "border-border bg-sidebar fixed top-16 left-0 z-50 flex h-[calc(100dvh-4rem)] w-full flex-col justify-between py-6 pb-4 transition duration-300 ease-in-out lg:relative lg:top-0 lg:z-auto lg:h-dvh lg:max-w-[320px] lg:translate-x-0 lg:border-r lg:py-8 lg:pb-6 lg:transition-none",
          {
            "-translate-x-full": !isOpen,
          },
        )}
      >
        <div className="space-y-12">
          <div className="flex w-full flex-col gap-4 px-4">
            <div className="hidden items-center gap-3 lg:flex">
              <AppLogo size={32} />
            </div>

            <CredentialsDropdownMenu onNavigate={() => setIsOpen(false)} />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-muted-foreground/70 px-6 text-xs font-medium uppercase">
              &#47;&#47; Menú
            </span>
            <div className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isDashboard = link.href === "/dashboard";
                const isActive = isDashboard
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    href={link.href}
                    aria-label={`Ir a ${link.label}`}
                    key={link.href}
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className={cn(
                      "hover:bg-accent hover:text-foreground text-muted-foreground focus-effect relative flex w-full cursor-pointer items-center gap-2.5 px-6 py-2.5 text-sm font-medium transition-all outline-none before:absolute before:top-0 before:left-0 before:h-full before:w-[3px] before:bg-transparent before:transition-all",
                      {
                        "bg-primary/10! text-primary! before:bg-primary!":
                          isActive,
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

        <ProfileDropdownMenu user={user} onNavigate={() => setIsOpen(false)} />
      </aside>
    </>
  );
};

export default SideBar;
