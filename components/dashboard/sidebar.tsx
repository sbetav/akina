"use client";

import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/utils";
import type { User } from "better-auth";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { useState } from "react";

import {
  ChevronDownIcon,
  HeadsetIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
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
      href: "/dashboard/customers",
      label: "Clientes",
      icon: UsersIcon,
    },
  ];

  const { logout, isPending } = useLogout();

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
        <div className="space-y-16">
          {/* Desktop-only logo row */}
          <div className="hidden px-6 lg:flex">
            <AppLogo />
          </div>
          <div className="flex flex-col gap-4">
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
                      "hover:bg-accent hover:text-foreground text-muted-foreground relative flex w-full cursor-pointer items-center gap-2.5 px-6 py-2.5 text-sm font-medium transition-all before:absolute before:top-0 before:left-0 before:h-full before:w-[3px] before:bg-transparent before:transition-all",
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
                <HeadsetIcon />
                Soporte
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitHubIcon />
                Github
              </DropdownMenuItem>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsOpen(false)}
                    >
                      <SettingsIcon />
                      Configuración
                    </Link>
                  }
                />
              </DropdownMenuGroup>
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
