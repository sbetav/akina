"use client";

import type { User } from "better-auth";
import {
  ChevronDownIcon,
  HeadsetIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import GitHubIcon from "@/components/icons/github-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/hooks/auth/use-logout";

interface ProfileDropdownMenuProps {
  user: User;
  onNavigate?: () => void;
}

const ProfileDropdownMenu: FC<ProfileDropdownMenuProps> = ({
  user,
  onNavigate,
}) => {
  const { logout, isPending } = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="group data-popup-open:bg-accent hover:bg-accent focus-effect relative mx-4 flex cursor-pointer items-center gap-3 px-2.5 py-2 transition"
          >
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
                <Link href="/dashboard/settings" onClick={onNavigate}>
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
  );
};

export default ProfileDropdownMenu;
