"use client";

import { useLogout } from "@/hooks/use-logout";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { User } from "better-auth";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { useState } from "react";

import {
  ChevronDownIcon,
  CreditCardIcon,
  FilePlusIcon,
  HeadsetIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import GitHubIcon from "../icons/github-icon";
import { AppLogo } from "../ui/app-logo";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Spinner } from "../ui/spinner";

interface SideBarProps {
  user: User;
}

const SideBar: FC<SideBarProps> = ({ user }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
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
      href: "/dashboard/new-invoice",
      label: "Nueva factura",
      icon: FilePlusIcon,
    },

    {
      href: "/dashboard/clients",
      label: "Clientes",
      icon: UsersIcon,
    },
    {
      href: "/dashboard/products",
      label: "Productos",
      icon: PackageIcon,
    },
    {
      href: "/dashboard/history",
      label: "Historial",
      icon: HistoryIcon,
    },
  ];

  const { logout, isPending } = useLogout();

  return (
    <>
      {isMobile && (
        <Button
          variant="outline"
          size="icon-sm"
          className="bg-bg absolute top-6 right-6 z-40"
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </Button>
      )}
      <aside
        className={cn(
          "border-border bg-sidebar z-50 flex h-dvh w-full max-w-[320px] flex-col justify-between py-6 transition duration-700 ease-in-out md:border-r md:py-8 md:transition-none",
          {
            "fixed top-0 left-0 max-w-none": isMobile,
            "-translate-x-full": isMobile && !isOpen,
          },
        )}
      >
        <div className="space-y-16">
          <div className="flex items-center justify-between px-6">
            <AppLogo />
            {isMobile && (
              <Button variant="outline" size="icon-sm" onClick={toggleSidebar}>
                <XIcon />
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground px-6 text-xs font-medium uppercase">
              // Menú
            </span>
            <div className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      if (isMobile) {
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "hover:bg-accent hover:text-foreground text-muted-foreground relative flex items-center gap-2.5 rounded-lg px-6 py-2.5 text-sm font-medium transition",
                      {
                        "bg-primary/10! text-primary!": isActive,
                      },
                    )}
                  >
                    {isActive && (
                      <div className="bg-primary absolute top-0 left-0 h-full w-[3px]"></div>
                    )}
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="group data-popup-open:bg-accent hover:bg-accent relative mx-4 flex cursor-pointer items-center gap-3 px-2.5 py-2 transition">
                <Avatar size="lg">
                  <AvatarFallback className="text-lg">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left text-xs">
                  <p>{user.name}</p>
                  <span className="text-muted-foreground line-clamp-1 block">
                    {user.email}
                  </span>
                </div>
                <ChevronDownIcon className="absolute right-3 size-4 transition-transform group-data-popup-open:rotate-180" />
              </button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuGroup className="p-2 text-xs">
              <p>{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Facturación
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HeadsetIcon />
                Soporte
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitHubIcon />
                Github
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={logout}
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className="text-muted-foreground!" />
              ) : (
                <LogOutIcon />
              )}
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
    </>
  );
};

export default SideBar;
